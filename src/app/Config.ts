import Fundamentals from './models/Fundamentals';
import MidiInstruments from './models/MidiInstruments';
import TimeSignatures from './models/TimeSignatures';
import TranscriberFrameSizes from './models/TranscriberFrameSizes';
import { TunebookManager, _TunebookManager } from './models/TunebookManager';
import Utils from './utils/Utils';
import LocalStorage from './utils/LocalStorageUtils';

class _Config {
  Fundamentals: string[];
  MidiInstruments: string[];
  TimeSignatures: object;
  TranscriberFrameSizes: string[];
  tunebooks: _TunebookManager;
  CountdownTime: number[];
  PlaybackSpeed: number[];
  Transpose: number[];
  ApiDomain: string;
  EuropeanaApiDomain: string;
  EuropeanaPortalDomain: string;
  EuropeanaApiKey: string;
  Properties: Property[];
  audioContext: AudioContext;
  isTesting: boolean;
  playbackSpeed: number;
  transpose: number;

  private _settings: object;
  private defaults: object;
  
  constructor() {
    this.Fundamentals = Fundamentals;
    this.MidiInstruments = MidiInstruments;
    this.TimeSignatures = TimeSignatures;
    this.TranscriberFrameSizes = TranscriberFrameSizes;
    this.tunebooks = TunebookManager;

    this.CountdownTime = Utils.makeArray(0, 10);
    this.PlaybackSpeed = Utils.makeArray(1, 10);
    this.Transpose = Utils.makeArray(-12, 12);
    // this.ApiDomain = 'https://cors-anywhere.herokuapp.com/https://tunepal.org/tunepal2';
    this.ApiDomain = 'https://tunepal.org/tunepal2';
    // this.ApiDomain = '/tunepal2';
    this.EuropeanaApiDomain = 'https://www.europeana.eu/api/v2';
    this.EuropeanaPortalDomain = 'https://www.europeana.eu/portal/search.html';
    this.EuropeanaApiKey = 'QNbCgzoWb';

    this.Properties = Properties;

    this.audioContext = new window.AudioContext();

    this.isTesting = false;

    this._createProperties();
  }

  _createProperties() {
    this._settings = [];
    this.defaults = [];

    for (let property of this.Properties) {
      this.defaults[property.name] = property.default;

      let storedValue = LocalStorage.getItem(property.name);

      if (storedValue == null) {
        storedValue = property.default;
        LocalStorage.setItem(property.name, storedValue);
      }

      this._settings[property.name] = storedValue;

      Object.defineProperty(this, property.name, {
        get: () => this._settings[property.name],
        set: value => {
          if (property.validate != null) {
            let result = property.validate(value);
            if (!result.success) return;
            value = result.value;
          }

          this._settings[property.name] = value;
          LocalStorage.setItem(property.name, value);
        },
      });
    }
  }
}

interface Property {
  name: string;
  default: any;
  validate?: (value: any) => any;
}

let Properties: Property[] = [
  {name: 'blankTime', default: 2},
  {name: 'chords', default: MidiInstruments[0]},
  {name: 'countdownTime', default: 3},
  {name: 'enableSampleRateConversion', default: false},
  {name: 'fundamental', default: 'D'},
  {name: 'melody', default: MidiInstruments[0]},
  {name: 'playbackSpeed', default: 5},
  {name: 'sampleTime', default: 12},
  {name: 'timeSigs', default: 'all'},
  {name: 'transcriberFrameSize', default: TranscriberFrameSizes[0]},
  {name: 'transpose', default: 0},
];

let Config = new _Config();

export default Config;
