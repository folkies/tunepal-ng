import Config from '../../Config';
import { Recorder, Status } from './Recorder';
import { _Config } from '../../Config';
const LogoPath = 'assets/images/recording_logo.png';

interface Point {
    x: number;
    y: number;
}

export default class Renderer {
    config: _Config;
    recorder: any;
    private _canvas: HTMLCanvasElement;
    private _container: HTMLElement;
    private _logo: HTMLImageElement;
    private _canvasContext: CanvasRenderingContext2D;
    private _timer: number;

    _timeLeft: number;
    _diameter: number;
    _logoWidth: number;
    _logoHeight: number;
    _ringInnerRadius: number;
    _ringMinWidth: number;
    _ringMaxWidth: number;
    _progressWidth: number;
    _progressRadius: number;
    _logoCenter: Point;
    _statusTop: Point;
    _logoTopLeft: Point;

    get countdownTime() { return this.config.countdownTime; }
    set countdownTime(value) { this.config.countdownTime = value; }

    constructor(config: _Config, recorder: Recorder, canvas: HTMLCanvasElement, container: HTMLElement) {
        this.config = config;
        this.recorder = recorder;
        this._canvas = canvas;
        this._container = container;

        this._logo = new Image();
        this._logo.addEventListener('load', () => this._updateMetrics());
        this._logo.src = LogoPath;

        this._canvas.addEventListener('click', () => this._recordClicked());

        this._canvasContext = this._canvas.getContext('2d');
    }

    _recordClicked() {
        if (this._timeLeft > 0) {
            this._timeLeft = 0;
            this.recorder.stop();
            clearInterval(this._timer);
            return;
        }

        switch (this.recorder.status) {
            case Status.STOPPED:
            case Status.ANALYSIS_SUCCEEDED:
                this.recorder.initAudio()
                    .then(() => this._startCountingDown());
                break;
            case Status.RECORDING:
                this.recorder.stop();
                break;
        }
    }

    _startCountingDown() {
        this._timeLeft = this.countdownTime;

        if (this._timeLeft <= 0) {
            this.recorder.start();
        }
        else {
            this._timer = window.setInterval(() => this._countdown(), 1000);
        }

        if (Config.fundamental !== Config.defaults.fundamental) {
            const toast = `Warning! Using a fundamental of <span class="highlight-toast">${Config.fundamental}</span> for transcription.`;
            // Materialize.toast(toast, 3000);
        }
    }

    _countdown() {
        this._timeLeft -= 1;
        if (this._timeLeft <= 0) {
            clearInterval(this._timer);
            this.recorder.start();
        }
    }

    draw() {
        this._updateCanvasSize();

        this._canvasContext.save();
        this._canvasContext.clearRect(0, 0, this._canvas.width, this._canvas.height);

        this._drawLogo();
        this._drawAmplitude();
        this._drawProgress();
        this._drawStatus();

        this._canvasContext.restore();
    }

    _updateCanvasSize() {
        const width = this._container.offsetWidth;
        const height = this._container.offsetHeight;

        this._diameter = width < height ? width : height;

        if (this._canvas.width != this._diameter || this._canvas.height != this._diameter) {
            this._canvas.width = this._diameter;
            this._canvas.height = this._diameter;

            this._updateMetrics();
        }
    }

    _updateMetrics() {
        this._logoCenter = {
            x: this._diameter * 0.5,
            y: this._diameter * 0.4,
        };

        // logo
        const logoRadius = this._diameter * 0.3;
        this._logoWidth = logoRadius * 2;
        this._logoHeight = this._logoWidth * this._logo.height / this._logo.width;
        this._logoTopLeft = {
            x: this._logoCenter.x - this._logoWidth / 2,
            y: this._logoCenter.y - this._logoHeight / 2,
        };

        // amplitude ring
        this._ringInnerRadius = this._diameter * 0.32;
        this._ringMinWidth = this._diameter * 0.03;
        this._ringMaxWidth = this._diameter * 0.06;

        // progress
        const progressOuterRadius = this._ringInnerRadius;
        this._progressWidth = this._diameter * 0.015;
        this._progressRadius = progressOuterRadius - this._progressWidth / 2;

        // status
        this._statusTop = {
            x: this._logoCenter.x,
            y: this._logoCenter.y + this._ringInnerRadius + this._ringMaxWidth + this._diameter * 0.09,
        };
    }

    _drawLogo() {
        this._canvasContext.drawImage(this._logo,
            this._logoTopLeft.x, this._logoTopLeft.y,
            this._logoWidth, this._logoHeight);
    }

    _drawAmplitude() {
        let width = this._ringMinWidth;
        let rate = this.recorder.amplitude;

        if (rate) {
            if (rate > 1) rate = 1;
            if (rate < 0) rate = 0;
            width += (this._ringMaxWidth - this._ringMinWidth) * rate;
        }

        const radius = this._ringInnerRadius + width / 2;

        this._canvasContext.beginPath();
        this._canvasContext.arc(this._logoCenter.x, this._logoCenter.y,
            radius, 0, 2 * Math.PI);
        this._canvasContext.lineWidth = width;
        this._canvasContext.strokeStyle = 'rgb(176, 210, 13)';
        this._canvasContext.stroke();
    }

    _drawProgress() {
        if (this.recorder.progress > 0) {
            const angle = 2 * Math.PI * this.recorder.progress;
            const startingAngle = Math.PI / -2;
            const endingAngle = startingAngle + angle;

            this._canvasContext.beginPath();
            this._canvasContext.arc(this._logoCenter.x, this._logoCenter.y,
                this._progressRadius, startingAngle, endingAngle);
            this._canvasContext.lineWidth = this._progressWidth;
            this._canvasContext.strokeStyle = 'rgba(255, 255, 255, 0.9)';
            this._canvasContext.stroke();
        }
    }

    _drawStatus() {
        let status = this._timeLeft > 0
            ? `RECORDING IN ${this._timeLeft} SEC...`
            : this._getRecorderStatusText();

        this._drawStatusMultiLine(status.split('\n'))
    }

    _drawStatusMultiLine(statusTexts) {
        this._canvasContext.font = (statusTexts.length == 1 && statusTexts[0].length <= 27) ? '3vh Roboto' : '2vh Roboto';
        this._canvasContext.textBaseline = 'top';
        this._canvasContext.textAlign = 'center';
        this._canvasContext.fillStyle = 'white';

        for (let i = 0; i < statusTexts.length; i++) {
            const lineHeight = 25;
            this._canvasContext.fillText(statusTexts[i], this._statusTop.x, this._statusTop.y + lineHeight * i);
        }
    }

    _getRecorderStatusText() {
        switch (this.recorder.status) {
            case Status.STOPPED:
                return 'TAP TO RECORD';
            case Status.INIT:
                return 'ACCESSING THE MICROPHONE...';
            case Status.INIT_SUCCEEDED:
                return 'SUCCEEDED';
            case Status.INIT_FAILED:
                return 'ERROR: PLEASE ALLOW MICROPHONE ACCESS!';
            case Status.RECORDING:
                return 'RECORDING... (TAP TO STOP)';
            case Status.ANALYZING:
                return `ANALYZING... (${(this.recorder.analysisProgress * 100).toFixed(2)} %)`;
            case Status.ANALYSIS_SUCCEEDED:
                return 'SUCCEEDED';
            case Status.API_MISSING:
                return 'ERROR: MICROPHONE NOT WORKING.\nPLEASE UPGRADE OR SWITCH BROWSER!';
        }
    }
}
