import { Injectable } from '@angular/core';
import { Remote, wrap } from 'comlink';
import { ITranscriber } from './Transcription';

@Injectable()
export class TranscriberProvider {

    private instance: Remote<ITranscriber>; 

    transcriber(): Remote<ITranscriber> {
        if (! this.instance) {
            const worker =  new Worker('./Transcriber.worker', { type: 'module' });
            this.instance = wrap<ITranscriber>(worker);
        }
        return this.instance;
    } 
}