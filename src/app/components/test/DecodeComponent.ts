import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Remote } from 'comlink';
import Transcriber from 'src/app/transcription/transcriber';
import { TranscriberProvider } from 'src/app/transcription/transcriber-provider';
import { ITranscriber, PushResult } from 'src/app/transcription/transcription';

enum Status {
    STOPPED = 'STOPPED',
    INIT = 'INIT',
    INIT_SUCCEEDED = 'INIT_SUCCEEDED',
    INIT_FAILED = 'INIT_FAILED',
    RECORDING = 'RECORDING',
    ANALYZING = 'ANALYZING',
    ANALYSIS_SUCCEEDED = 'ANALYSIS_SUCCEEDED',
    API_MISSING = 'API_MISSING',
};

@Component({
    selector: 'my-decode',
    templateUrl: './DecodeComponent.html'
})
export class DecodeComponent {
    signalPlayer: AudioBufferSourceNode;
    signal: Float32Array;
    private _audioContext: AudioContext;
    private status: Status;
    private stream: MediaStream;
    private input: MediaStreamAudioSourceNode;
    private processor: ScriptProcessorNode;
    private transcriber: Remote<ITranscriber>;

    constructor(
        private transcriberProvider: TranscriberProvider,
        private httpClient: HttpClient) {
            this.status = Status.STOPPED;
            this.transcriber = this.transcriberProvider.transcriber();
    }

    public async decode(): Promise<void> {
        const _AudioContext = window['AudioContext'] || window['webkitAudioContext'];
        this._audioContext = new _AudioContext();
        if (this._audioContext.state === 'suspended') {
            await this._audioContext.resume();
        }

        const buffer = await this.httpClient.get('/assets/happy-birthday.wav', { responseType: 'arraybuffer' }).toPromise();

        this._audioContext.decodeAudioData(buffer,
            audio => this.onAudioDecoded(audio),
            () => console.log('Decode error'));
    }

    public async record(): Promise<void> {
        const _AudioContext = window['AudioContext'] || window['webkitAudioContext'];
        this._audioContext = new _AudioContext();
        if (this._audioContext.state === 'suspended') {
            await this._audioContext.resume();
        }
        this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (this.stream) {
            this.status = Status.INIT_SUCCEEDED;
        }
        const initParams = {
            inputSampleRate: this._audioContext.sampleRate,
            sampleTime: 3,
            fundamental: 'D',
            enableSampleRateConversion: false,
            blankTime: 0
          };
        this.transcriber.initialize(initParams);
        this.status = Status.RECORDING;  

        const bufferSize = 4096;

        this.input = this._audioContext.createMediaStreamSource(this.stream);
        this.processor = this._audioContext.createScriptProcessor(bufferSize, 1, 1);
    
        this.processor.onaudioprocess = e => this._update(e);
    
        this.input.connect(this.processor);
        this.processor.connect(this._audioContext.destination);
    }

    private _update(e: AudioProcessingEvent) {
        if (this.status !== Status.RECORDING) {
            return;
        };        
        const audio = e.inputBuffer;
        const signalBuffer = audio.getChannelData(0);
    
        this.transcriber.pushSignal(signalBuffer)
           .then(msg => this._analyzeSignal(msg));    
    }

    private stop(): void {
        this.status = Status.STOPPED;
        this.processor.disconnect(this._audioContext.destination);
        this.input.disconnect(this.processor);
        this.stream.getTracks().forEach(t => t.stop());
    }

    async _analyzeSignal(msg: PushResult): Promise<void> {    
        if (!msg.isBufferFull) {
            return;
        }

        this.stop();
        this.status = Status.ANALYZING;

        const response = await this.transcriber.transcribe();
        console.log(`Result: ${response.transcription}`);
      }
    

    private onAudioDecoded(audio: AudioBuffer): void {
        console.log('Decoding');
        console.log(`numChannels: ${audio.numberOfChannels}, duration: ${audio.duration}`);

        this.transcribeComlink(audio);
    }

    private play(audio: AudioBuffer): void {
        if (this.signalPlayer) {
            console.log('Stopping');
            this.signalPlayer.stop(0);
            this.signalPlayer = null;
        }
        else {
            console.log('Playing');
            this.signalPlayer = this._audioContext.createBufferSource();
            this.signalPlayer.buffer = audio;
            this.signalPlayer.connect(this._audioContext.destination);
            this.signalPlayer.onended = () => this.signalPlayer = null;
            this.signalPlayer.start(0, 0, audio.duration);
        }
    }
    
    private transcribe(audio: AudioBuffer): void {
        this.signal = audio.getChannelData(0);
        const initParams = {
            inputSampleRate: audio.sampleRate,
            sampleTime: audio.duration,
            fundamental: 'D',
            enableSampleRateConversion: false,
            blankTime: 0
          };
      
        const transcriber = new Transcriber(initParams);
        const result = transcriber.transcribe(this.signal, false);
        console.log(`Result: ${result}`);
    }

    private async transcribeComlink(audio: AudioBuffer): Promise<void> {
        this.signal = audio.getChannelData(0);
        const initParams = {
            inputSampleRate: audio.sampleRate,
            sampleTime: audio.duration,
            fundamental: 'D',
            enableSampleRateConversion: false,
            blankTime: 0
          };

        await this.transcriber.initialize(initParams);
        const result = await this.transcriber.transcribe(this.signal, false);
        console.log(`Result: ${result.transcription}`);
    }
}