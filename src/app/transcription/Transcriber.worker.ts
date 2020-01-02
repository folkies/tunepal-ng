import { expose } from 'comlink';
import Transcriber, { TranscriptionResult } from './Transcriber';
import { ITranscriber, PushResult, TranscriptionInitParams } from './Transcription';

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

expose(transcriber);