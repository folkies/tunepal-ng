import { Injectable } from '@angular/core';
import * as Comlink from 'comlink';
import { ITranscriber } from './Transcription';

@Injectable()
export class TranscriberProvider {

    private instance: Comlink.Remote<ITranscriber>; 

    transcriber(): Comlink.Remote<ITranscriber> {
        if (! this.instance) {
            const worker =  new Worker('./Transcriber.worker', { type: 'module' });
            this.instance = Comlink.wrap<ITranscriber>(worker);
        }
        return this.instance;
    } 
}