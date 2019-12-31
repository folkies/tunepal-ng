import { Component } from '@angular/core';
import { AudioContext } from 'angular-audio-context';
import { IAudioBuffer, IAudioBufferSourceNode } from 'standardized-audio-context';
import { HttpClient } from '@angular/common/http';
import Transcriber from 'src/app/transcription/Transcriber';

@Component({
    selector: 'my-decode',
    templateUrl: './DecodeComponent.html'
})
export class DecodeComponent {
    signalPlayer: IAudioBufferSourceNode<AudioContext>;
    signal: Float32Array;

    constructor(private _audioContext: AudioContext,
        private httpClient: HttpClient) {
    }

    public async decode(): Promise<void> {
        if (this._audioContext.state === 'suspended') {
            await this._audioContext.resume();
        }

        const buffer = await this.httpClient.get('/assets/happy-birthday.wav', { responseType: 'arraybuffer' }).toPromise();

        this._audioContext.decodeAudioData(buffer,
            audio => this.onAudioDecoded(audio),
            () => console.log('Decode error'));

    }

    private onAudioDecoded(audio: IAudioBuffer): void {
        console.log('Decoding');
        console.log(`numChannels: ${audio.numberOfChannels}, duration: ${audio.duration}`);

        this.transcribe(audio);
    }

    private play(audio: IAudioBuffer): void {
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
    
    private transcribe(audio: IAudioBuffer): void {
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
}