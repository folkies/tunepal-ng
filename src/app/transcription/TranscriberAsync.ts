import { TranscriptionResult } from './Transcriber';

// This is a promise wrapper of TranscriberWorker
const WorkerPath = 'scripts/transcription/TranscriberWorker.js';

export default class TranscriberAsync {
    private _worker: Worker;
    private _callbacks: any[];
    private _nextId = 0;
    onProgress = (x: number) => { };

    constructor() {
        this._worker = new Worker(WorkerPath);
        this._worker.addEventListener('message', e => this._onMessage(e));
    }

    initAsync(params) {
        return this._postMessageAsync({
            cmd: 'init',
            msg: params,
        });
    }

    resetSignalAsync() {
        return this._postMessageAsync({
            cmd: 'resetSignal',
        });
    }

    getSignalAsync(): Promise<Float32Array> {
        return this._postMessageAsync({
            cmd: 'getSignal',
        });
    }

    pushSignalAsync(signal) {
        return this._postMessageAsync({
            cmd: 'pushSignal',
            msg: signal,
        });
    }

    transcribeAsync(params?): Promise<TranscriptionResult> {
        return this._postMessageAsync({
            cmd: 'transcribe',
            msg: params,
        });
    }

    close() {
        return this._postMessageAsync({
            cmd: 'close',
        });
    }

    _postMessageAsync(msg): Promise<any> {
        return new Promise((resolve, reject) => {
            let id = this._nextId++;
            this._callbacks[id] = { resolve: resolve, reject: reject };

            msg.id = id;
            this._worker.postMessage(msg);
        });
    }

    _onMessage(e) {
        const data = e.data;

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
