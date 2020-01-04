import { ITranscriber, TranscriptionResult, TranscriptionInitParams } from 'src/app/transcription/Transcription';
import { _Config } from '../../Config';
import { Remote } from 'comlink';
import { Injectable } from '@angular/core';
import Config from '../../Config';

@Injectable()
export class Recorder {
    private config: _Config;
    private _status: Status;
    private _audioContext: AudioContext;
    private _amplitude: number;
    private _timeRecorded: number;
    private _bufferSize: number;
    private _processor: ScriptProcessorNode;
    private _transcriber: Remote<ITranscriber>;
    private _stream: MediaStream;
    private _input: MediaStreamAudioSourceNode;
    private _transcription: string;
    private _signal: Float32Array;

    analysisProgress: number;

    get sampleTime() { return this.config.sampleTime; }
    set sampleTime(value) { this.config.sampleTime = value; }

    get blankTime() { return this.config.blankTime; }
    set blankTime(value) { this.config.blankTime = value; }

    get fundamental() { return this.config.fundamental; }
    set fundamental(value) { this.config.fundamental = value; }

    get enableSampleRateConversion() { return this.config.enableSampleRateConversion; }
    set enableSampleRateConversion(value) { this.config.enableSampleRateConversion = value; }

    get transcriberFrameSize() { return this.config.transcriberFrameSize; }
    set transcriberFrameSize(value) { this.config.transcriberFrameSize = value; }

    get audioContext() { return this._audioContext; }
    get sampleRate() { return this._audioContext.sampleRate; }
    get amplitude() { return this._amplitude; }
    get timeRecorded() { return this._timeRecorded; }
    get transcription() { return this._transcription; }
    get progress() { return this._timeRecorded / (this.blankTime + this.sampleTime); }
    get numSamples() { return this._audioContext.sampleRate * this.sampleTime; }
    get status() { return this._status; }
    get signal() { return this._signal; }

    constructor() {
        this.config = Config;

        this._status = Status.STOPPED;

        const _AudioContext = window['AudioContext'] || window['webkitAudioContext'];
        this._audioContext = new _AudioContext();


        // this._transcriber.onProgress = progress => this.analysisProgress = progress;
    }

    onTranscribed(result: TranscriptionResult): void {

    }

    initAsync() {
        return new Promise((resolve, reject) => {
            if (this._stream) {
                this._status = Status.INIT_SUCCEEDED;
                resolve();
            }
            else if (navigator && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                this._status = Status.INIT;
                navigator.mediaDevices.getUserMedia({ audio: true })
                    .then(stream => this._onStream(stream, resolve))
                    .catch(error => this._onStreamError(error, reject));
            }
            else {
                this._status = Status.API_MISSING;
            }
        });
    }

    close() {
        //this._transcriber._close();
    }

    _onStream(stream, resolve) {
        this._stream = stream;
        this._bufferSize = 4096;

        this._input = this._audioContext.createMediaStreamSource(stream);
        this._processor = this._audioContext.createScriptProcessor(this._bufferSize, 1, 1);

        this._processor.onaudioprocess = e => this._update(e);

        this._input.connect(this._processor);
        this._processor.connect(this._audioContext.destination);

        this._status = Status.INIT_SUCCEEDED;
        resolve();
    }

    _onStreamError(error, reject) {
        this._status = Status.INIT_FAILED;
        reject(error);
    }

    start() {
        if (!this._stream) return;

        let initParams: TranscriptionInitParams = {
            inputSampleRate: this._audioContext.sampleRate,
            sampleTime: this.sampleTime,
            blankTime: this.blankTime,
            fundamental: this.fundamental,
            enableSampleRateConversion: this.enableSampleRateConversion,
            frameSize: Number.parseInt(this.transcriberFrameSize),
        };

        this._transcriber.initialize(initParams)
            .then(() => this._status = Status.RECORDING);
    }

    stop() {
        this._status = Status.STOPPED;
        this._amplitude = 0;
        this._timeRecorded = 0;
    }

    destroy() {
        this._status = Status.STOPPED;
        this._stream && this._stream.getTracks().forEach(t => t.stop());
        this._stream = null;
    }

    _update(e) {
        if (this._status != Status.RECORDING) {
            return;
        };

        let audio = e.inputBuffer;
        let signalBuffer = audio.getChannelData(0);

        this._transcriber.pushSignal(signalBuffer)
            .then(msg => this._analyzeSignal(msg));
    }

    _analyzeSignal(msg) {
        this._amplitude = msg.amplitude;
        this._timeRecorded = msg.timeRecorded;

        if (!msg.isBufferFull) return;

        this.stop();
        this._status = Status.ANALYZING;

        this._transcriber.transcribe()
            .then(result => {
                this._status = Status.ANALYSIS_SUCCEEDED;
                this.onTranscribed(result);
            })
            .then(signal => {
                // this._signal = signal.result;
            });
    }
}

export enum Status {
    STOPPED = 'STOPPED',
    INIT = 'INIT',
    INIT_SUCCEEDED = 'INIT_SUCCEEDED',
    INIT_FAILED = 'INIT_FAILED',
    RECORDING = 'RECORDING',
    ANALYZING = 'ANALYZING',
    ANALYSIS_SUCCEEDED = 'ANALYSIS_SUCCEEDED',
    API_MISSING = 'API_MISSING',
};
