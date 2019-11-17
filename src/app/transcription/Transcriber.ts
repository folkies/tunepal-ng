import { DSP, FFT, WindowFunction } from 'dsp.js';
import TranscriberUtils from '../utils/TranscriberUtils';
import FuzzyHistogram from './FuzzyHistogram';
import PitchDetector from './PitchDetector';
import PitchSpeller from './PitchSpeller';

const DEFAULT_SAMPLE_RATE = 22050;
const DEFAULT_SAMPLE_TIME = 12;
const DEFAULT_BLANK_TIME = 2;
const DEFAULT_FUNDAMENTAL = 'D';
const DEFAULT_FRAME_SIZE = 'auto';
const OVERLAP = 0.75;

export interface Note {
    spelling: string;
    onset: number;
    duration?: number;
    frequency: number;
    qq?: number;
}

export default class Transcriber {
    private _inputSampleRate: number;
    private _sampleTime: number;
    private _blankTime: number;
    private _fundamental: string;
    private _enableSampleRateConversion: boolean;
    private _progress: number;
    private _interrupted: boolean;
    private _signal: Float32Array;
    private _outputSampleRate: number;
    private _numInputSamples: number;
    private _numOutputSamples: number;
    private _frameSize: any;
    private _hopSize: number;
    private _windowFunction: WindowFunction;
    private _powerSpectrum: FFT;

    private onProgress: (x: number) => object;

    get inputSampleRate() { return this._inputSampleRate; }
    get sampleTime() { return this._sampleTime; }
    get blankTime() { return this._blankTime; }
    get fundamental() { return this._fundamental; }
    get enableSampleRateConversion() { return this._enableSampleRateConversion; }
    get progress() { return this._progress; }
    get interrupted() { return this._interrupted; }
    get signal() { return this._signal; }
    get outputSampleRate() { return this._outputSampleRate; }
    get numInputSamples() { return this._numInputSamples; }
    get numOutputSamples() { return this._numOutputSamples; }

    constructor(params) {
        this._inputSampleRate = typeof params.inputSampleRate !== 'undefined'
            ? params.inputSampleRate
            : DEFAULT_SAMPLE_RATE;

        this._sampleTime = typeof params.sampleTime !== 'undefined'
            ? params.sampleTime
            : DEFAULT_SAMPLE_TIME;

        this._blankTime = typeof params.blankTime !== 'undefined'
            ? params.blankTime
            : DEFAULT_BLANK_TIME;

        this._fundamental = typeof params.fundamental !== 'undefined'
            ? params.fundamental
            : DEFAULT_FUNDAMENTAL;

        this._enableSampleRateConversion = typeof params.enableSampleRateConversion !== 'undefined'
            ? params.enableSampleRateConversion
            : false;

        this._frameSize = typeof params.frameSize !== 'undefined'
            ? params.frameSize
            : DEFAULT_FRAME_SIZE;

        this.onProgress = typeof params.onProgress !== 'undefined'
            ? params.onProgress
            : () => { };

        if (this._enableSampleRateConversion) {
            this._outputSampleRate = DEFAULT_SAMPLE_RATE;
        }
        else {
            this._outputSampleRate = this._inputSampleRate;
        }

        this._numInputSamples = this._inputSampleRate * (this._blankTime + this._sampleTime);
        this._numOutputSamples = this._outputSampleRate * (this._blankTime + this._sampleTime);

        if (this._frameSize === 'auto') {
            this._frameSize = TranscriberUtils.calcFrameSize(this._outputSampleRate);
        }

        this._hopSize = this._frameSize * (1 - OVERLAP);

        console.log('Frame size and hop size:', this._frameSize, this._hopSize);

        this._windowFunction = new WindowFunction(DSP.HANN);
        this._powerSpectrum = new FFT(this._frameSize, this._outputSampleRate);
    }

    transcribe(signal: Float32Array, midi = false): string {
        if (this._enableSampleRateConversion) {
            this._signal = this._convertSampleRate(signal);
        }
        else {
            this._signal = signal;
        }

        let speller = new PitchSpeller(this._fundamental);
        let numHops = Math.floor((this._outputSampleRate * this._sampleTime - this._frameSize) / this._hopSize) + 1;
        let notes: Note[] = [];
        let lastNote = '';
        const numBlankSamples = this._blankTime * this._outputSampleRate;

        for (let i = 0; i < numHops; i++) {
            if (this._interrupted) {
                return '';
            }

            let startAt = numBlankSamples + this._hopSize * i;
            this._progress = i / numHops;
            this.onProgress(this._progress);

            let frame = this._signal.slice(startAt, startAt + this._frameSize);

            this._windowFunction.process(frame);
            let spectrum = this._powerSpectrum.forward(frame);

            let frequency = PitchDetector.mikelsFrequency(spectrum, this._outputSampleRate, this._frameSize);

            let currentNote = midi
                ? speller.spellFrequencyAsMidi(frequency)
                : speller.spellFrequency(frequency);

            if (currentNote != lastNote) {
                lastNote = currentNote;
                let note = {
                    spelling: currentNote,
                    frequency: frequency,
                    onset: startAt / this._outputSampleRate,
                };
                notes.push(note);
            }
        }

        let transcription = this._postProcess(notes, midi);
        return transcription;
    }

    _convertSampleRate(inSignal: Float32Array): Float32Array {
        let outSignal = new Float32Array(this.numOutputSamples);
        let end = 0;

        for (let i = 0; i < outSignal.length; i++) {
            //TODO: smooth interpolation
            let begin = end;
            end = Math.floor((i + 1) * this._inputSampleRate / this._outputSampleRate);
            let sum = 0;

            for (let j = begin; j < end; j++) {
                sum += inSignal[j];
            }

            outSignal[i] = sum / (end - begin);
        }

        return outSignal;
    }

    _postProcess(notes: Note[], midi: boolean): string {
        let transcription = '';

        for (let i = 0; i < notes.length - 1; i++) {
            notes[i].duration = notes[i + 1].onset - notes[i].onset;
            if (notes[i].duration < 0) console.log(notes[i + 1].onset, notes[i].onset);
        }

        notes.slice(-1)[0].duration = this._blankTime + this._sampleTime - notes.slice(-1)[0].onset;

        let durations = new Array(notes.length);
        for (let i = 0; i < notes.length; i++) {
            durations[i] = notes[i].duration;
        }

        let quaverLength = FuzzyHistogram.calculatePeek(durations, 0.33, 0.1);

        for (let note of notes) {
            if (note.spelling == 'Z') continue;

            note.qq = Math.round(note.duration / quaverLength);

            let spelling = note.spelling;
            if (midi) spelling += ',';
            spelling = spelling.repeat(note.qq);

            transcription += spelling;
        }

        return transcription;
    }
}

