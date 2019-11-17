import Utils from '../utils/Utils';

const RANGE = 0.1;
const RATIO = 1.05946309436;
const RATIO_SQUARED = RATIO * RATIO;
const ABC_NOTE_RANGE = 33;
const MIDI_NOTE_RANGE = 87;
const MIDI_OFFSET = 21;

const NOTE_NAMES = [
    'D', 'E', 'F', 'G', 'A', 'B', 'C', 'C',
    'D', 'E', 'F', 'G', 'A', 'B', 'C', 'C',
    'D', 'E', 'F', 'G', 'A', 'B', 'C', 'C',
    'D', 'E', 'F', 'G', 'A', 'B', 'C', 'C', 'D'
];

const FUNDAMENTAL_FREQUENCIES = {
    Bb: 233.08,
    B: 246.94,
    C: 261.63,
    D: 293.66,
    Eb: 311.13,
    F: 349.23,
    G: 392.00
};

enum PitchModel {
    FLUTE,
    WHISTLE
};

export default class PitchSpeller {
    private _fundamental: string;
    private _fundamentalFrequency: number;
    private _pitchModel: PitchModel;
    private _knownFrequencies: number[];
    private _midiNotes: number[];

    get fundamental() { return this._fundamental; }
    set fundamental(value) {
        this._fundamental = value;
        this._fundamentalFrequency = FUNDAMENTAL_FREQUENCIES[value];
    }

    constructor(fundamental = 'D', mode = 'major') {
        this.fundamental = fundamental;

        this._pitchModel = PitchModel.FLUTE;
        this._knownFrequencies = new Array(ABC_NOTE_RANGE);
        this._midiNotes = new Array(MIDI_NOTE_RANGE);

        this._makeScale(mode);
        this._makeMidiNotes();
    }

    _makeScale(mode) {
        // W - W - H - W - W - H - H - H
        let majorKeyIntervals = [1, 2, 4, 5];

        if (mode == 'major') {
            if (this._pitchModel == PitchModel.FLUTE) {
                this._knownFrequencies[0] = this._fundamentalFrequency / Math.pow(RATIO, 12);
            }
            else {
                // Use the whistle pitch model
                this._knownFrequencies[0] = this._fundamentalFrequency;
            }

            // W - W - H - W - W - W - H
            for (let i = 1; i < this._knownFrequencies.length; i++) {
                if (PitchSpeller._isWholeToneInterval(i, majorKeyIntervals)) {
                    this._knownFrequencies[i] = this._knownFrequencies[i - 1] * RATIO_SQUARED;
                }
                else {
                    this._knownFrequencies[i] = this._knownFrequencies[i - 1] * RATIO;
                }
            }
        }
    }

    static _isWholeToneInterval(n: number, intervals: number[]): boolean {
        n %= 8;
        return intervals.some(interval => interval == n);
    }

    _makeMidiNotes(): void {
        this._midiNotes[0] = 27.5;

        for (let i = 1; i < this._midiNotes.length; i++) {
            this._midiNotes[i] = this._midiNotes[i - 1] * RATIO;
        }
    }

    spellFrequency(frequency: number): string {
        let minIndex = 0;
        let minDiff = Number.MAX_VALUE;

        if (frequency < this._knownFrequencies[0] || frequency > this._knownFrequencies.slice(-1)[0]) {
            return 'Z';
        }

        for (let i = 0; i < this._knownFrequencies.length; i++) {
            let difference = Math.abs(frequency - this._knownFrequencies[i]);
            if (difference < minDiff) {
                minIndex = i;
                minDiff = difference;
            }
        }

        return NOTE_NAMES[minIndex];
    }

    spellFrequencyAsMidi(frequency: number): string {
        let minIndex = 0;
        let minDiff = Number.MAX_VALUE;

        if (frequency < this._midiNotes[0] || frequency > this._midiNotes.slice(-1)[0]) {
            return 'Z';
        }

        for (let i = 0; i < this._midiNotes.length; i++) {
            let difference = Math.abs(frequency - this._midiNotes[i]);
            if (difference < minDiff) {
                minIndex = i;
                minDiff = difference;
            }
        }

        minIndex += MIDI_OFFSET;
        return minIndex.toString();
    }
}


