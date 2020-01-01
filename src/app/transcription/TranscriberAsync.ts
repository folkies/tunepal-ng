import { TranscriptionResult } from './Transcriber';
import { TranscriptionRequest, TranscriptionResponse } from './Transcription';
import { Subject, Observable, Subscription } from 'rxjs';
import { fromWorker } from 'observable-webworker';


export class TranscriberAsync {
    private requestStream = new Subject<TranscriptionRequest>();
    private _callbacks: any[] = [];
    private _nextId = 0;
    onProgress = (x: number) => { };
    responseStream: Observable<TranscriptionResponse>;
    private subscription: Subscription;

    constructor() {
        this.responseStream = fromWorker<TranscriptionRequest, TranscriptionResponse>(this.createWorker, this.requestStream);
        this.subscription = this.responseStream.subscribe(resp => this._onMessage(resp));
    }

    private createWorker(): Worker {
        return new Worker('./Transcriber.worker', { type: 'module' });
    }


    initAsync(params): Promise<TranscriptionResponse>  {
        return this._postMessageAsync({
            cmd: 'init',
            msg: params,
        });
    }

    resetSignalAsync(): Promise<TranscriptionResponse>  {
        return this._postMessageAsync({
            cmd: 'resetSignal',
        });
    }

    getSignalAsync(): Promise<TranscriptionResponse> {
        return this._postMessageAsync({
            cmd: 'getSignal',
        });
    }

    pushSignalAsync(signal): Promise<TranscriptionResponse>  {
        return this._postMessageAsync({
            cmd: 'pushSignal',
            msg: signal,
        });
    }

    transcribeAsync(params?): Promise<any> {
        return this._postMessageAsync({
            cmd: 'transcribe',
            msg: params,
        });
    }

    _close() {
        return this._postMessageAsync({
            cmd: 'close',
        });
    }

    onDestroy(): void {
        this.requestStream.complete();
        this.subscription.unsubscribe();
    }


    _postMessageAsync(msg: TranscriptionRequest): Promise<TranscriptionResponse> {
        return new Promise((resolve, reject) => {
            let id = this._nextId++;
            this._callbacks[id] = { resolve: resolve, reject: reject };

            msg.id = id;
            this.requestStream.next(msg);
        });
    }

    _onMessage(data: TranscriptionResponse) {

        switch (data.cmd) {
            case 'onProgress':
                this.onProgress(data.msg);
                break;
            default:
                const id = data.id;

                if (data.result == 'success') {
                    this._callbacks[id].resolve(data.msg);
                }
                else {
                    this._callbacks[id].reject(data.msg);
                }

                this._callbacks[id] = null;
        }
    }
}
