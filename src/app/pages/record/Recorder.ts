import { Injectable } from '@angular/core';
import { Remote } from 'comlink';
import { TranscriberProvider } from 'src/app/transcription/TranscriberProvider';
import { ITranscriber, PushResult, TranscriptionInitParams, TranscriptionResult } from 'src/app/transcription/Transcription';
import Config, { _Config } from '../../Config';

@Injectable()
export class Recorder {
    private config: _Config;
    private _status: Status;
    private _audioContext: AudioContext;
    private _amplitude: number;
    private _timeRecorded: number;
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

    constructor(private transcriberProvider: TranscriberProvider) {
        this.config = Config;
        this._transcriber = this.transcriberProvider.transcriber();

        this._status = Status.STOPPED;
    }

    onTranscribed(result: TranscriptionResult): void {
    }

    async initAudio(): Promise<void> {
        const _AudioContext = window['AudioContext'] || window['webkitAudioContext'];
        this._audioContext = new _AudioContext();

        if (this._audioContext.state === 'suspended') {
            await this._audioContext.resume();
        }

        try {
            this._stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            if (this._stream) {
                this._status = Status.INIT_SUCCEEDED;
                const bufferSize = 4096;

                this._input = this._audioContext.createMediaStreamSource(this._stream);
                this._processor = this._audioContext.createScriptProcessor(bufferSize, 1, 1);
            
                this._processor.onaudioprocess = e => this._update(e);
            
                this._input.connect(this._processor);
                this._processor.connect(this._audioContext.destination);
        
            }
        }
        catch (err) {
            this._status = Status.INIT_FAILED;
        }
    }

    close() {
        //this._transcriber._close();
    }

    start() {
        if (!this._stream) return;

        let initParams: TranscriptionInitParams = {
            inputSampleRate: this._audioContext.sampleRate,
            sampleTime: this.sampleTime,
            blankTime: this.blankTime,
            fundamental: this.fundamental,
            enableSampleRateConversion: this.enableSampleRateConversion,
        };

        this._transcriber.initialize(initParams)
            .then(() => this._status = Status.RECORDING);
    }

    stop() {
        this._status = Status.STOPPED;
        this._amplitude = 0;
        this._timeRecorded = 0;
        this._stream && this._stream.getTracks().forEach(t => t.stop());
    }

    destroy() {
        this.stop();
        this._stream = null;
    }

    async _update(e: AudioProcessingEvent): Promise<void> {
        if (this._status != Status.RECORDING) {
            return;
        };

        let audio = e.inputBuffer;
        let signalBuffer = audio.getChannelData(0);

        const msg = await this._transcriber.pushSignal(signalBuffer)
        this._amplitude = msg.amplitude;
        this._timeRecorded = msg.timeRecorded;

        if (msg.isBufferFull) {
            await this._analyzeSignal(msg);
        }
    }

    async _analyzeSignal(msg: PushResult): Promise<void> {
        this.stop();
        this._status = Status.ANALYZING;

        const result = await this._transcriber.transcribe();
        this._status = Status.ANALYSIS_SUCCEEDED;
        this.onTranscribed(result);
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
