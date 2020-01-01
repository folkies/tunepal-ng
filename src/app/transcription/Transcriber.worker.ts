import { DoWork, ObservableWorker } from 'observable-webworker';
import Transcriber, { TranscriptionResult } from './Transcriber';
import { TranscriptionRequest, TranscriptionResponse, ITranscriber, PushResult, TranscriptionInitParams } from './Transcription';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as Comlink from 'comlink';

@ObservableWorker()
export class TranscriberWorker implements DoWork<TranscriptionRequest, TranscriptionResponse> {
    private _transcriber: Transcriber;
    private _signal: Float32Array[];
    private _currNumSamples: number;

    private output$: Observable<TranscriptionResponse>;

    work(input$: Observable<TranscriptionRequest>): Observable<TranscriptionResponse> {
        this.output$ = input$.pipe(
            map(message => this.onMessage(message))
        );
        return this.output$;
    }

    onMessage(data: TranscriptionRequest): TranscriptionResponse {
        let msg = data.msg || {};
        let result = 'success';
        let resultMsg: any;

        switch (data.cmd) {
            case 'init':
                msg.onProgress = progress => this._onProgress(progress);
                this._transcriber = new Transcriber(msg);
                this._resetSignal();
                break;
            case 'resetSignal':
                this._resetSignal();
                break;
            case 'getSignal':
                resultMsg = this._transcriber.signal;
                break;
            case 'pushSignal':
                resultMsg = this._pushSignal(msg);
                break;
            case 'transcribe':
                let signal = typeof msg.signal !== 'undefined' ? msg.signal : this._mergeSignal();
                let midi = typeof msg.midi !== 'undefined' ? msg.midi : false;

                let transcription = this._transcriber.transcribe(signal, midi);

                resultMsg = {
                    transcription: transcription,
                    sampleRate: this._transcriber.outputSampleRate,
                    numSamples: this._transcriber.numOutputSamples,
                };
                break;
            case 'close':
                //self._close();
                break;
        }

        return {
            id: data.id,
            cmd: data.cmd,
            result: result,
            msg: resultMsg,
        };
    }

    _onProgress(progress) {
        // this.output$.next({
        //     cmd: 'onProgress',
        //     msg: progress,
        // });
    }

    _resetSignal() {
        this._signal = [];
        this._currNumSamples = 0;
    }

    _pushSignal(signal: Float32Array) {
        this._signal.push(signal);
        this._currNumSamples += signal.length;

        let largest = Number.MIN_VALUE;

        for (let sample of signal) {
            if (sample > largest) largest = sample;
        }

        return {
            amplitude: largest,
            timeRecorded: this._currNumSamples / this._transcriber.inputSampleRate,
            isBufferFull: this._currNumSamples >= this._transcriber.numInputSamples,
        };
    }

    _mergeSignal() {
        let length = this._transcriber.numInputSamples;
        let signal = new Float32Array(length);
        let currNumSamples = 0;

        for (let buffer of this._signal) {
            let newNumSamples = currNumSamples + buffer.length;

            if (newNumSamples <= length) {
                signal.set(buffer, currNumSamples);
            }
            else {
                signal.set(buffer.subarray(0, length - currNumSamples), currNumSamples);
            }

            currNumSamples = newNumSamples;
        }

        return signal;
    }
}


export class TranscriberImpl implements ITranscriber {
    private _transcriber: Transcriber;
    private _signal: Float32Array[];
    private _currNumSamples: number;

    initialize(initParams: TranscriptionInitParams): void {
        this._transcriber = new Transcriber(initParams);
        this._resetSignal();
    }    
    
    private _resetSignal() {
        this._signal = [];
        this._currNumSamples = 0;
    }
    
    private mergeSignal() {
        let length = this._transcriber.numInputSamples;
        let signal = new Float32Array(length);
        let currNumSamples = 0;

        for (let buffer of this._signal) {
            let newNumSamples = currNumSamples + buffer.length;

            if (newNumSamples <= length) {
                signal.set(buffer, currNumSamples);
            }
            else {
                signal.set(buffer.subarray(0, length - currNumSamples), currNumSamples);
            }

            currNumSamples = newNumSamples;
        }

        return signal;
    }

    transcribe(signal?: Float32Array, midi: boolean = false): TranscriptionResult {
        let theSignal = signal ? signal : this.mergeSignal();

        let transcription = this._transcriber.transcribe(theSignal, midi);
        console.log(`Worker: transcription: ${transcription}`);

        const resultMsg = {
            transcription: transcription,
            sampleRate: this._transcriber.outputSampleRate,
            numSamples: this._transcriber.numOutputSamples,
        };


        return resultMsg;
    }

    pushSignal(signal: Float32Array): PushResult {
        this._signal.push(signal);
        this._currNumSamples += signal.length;

        let largest = Number.MIN_VALUE;

        for (let sample of signal) {
            if (sample > largest) largest = sample;
        }

        return {
            amplitude: largest,
            timeRecorded: this._currNumSamples / this._transcriber.inputSampleRate,
            isBufferFull: this._currNumSamples >= this._transcriber.numInputSamples,
        };
    }

}


const transcriber = new TranscriberImpl();

Comlink.expose(transcriber);