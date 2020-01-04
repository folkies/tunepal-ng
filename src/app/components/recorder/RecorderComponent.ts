import { Component, ElementRef, ViewChild, AfterViewInit, NgZone } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Recorder } from 'src/app/pages/record/Recorder';
import Renderer from 'src/app/pages/record/Renderer';
import { TranscriptionResult } from 'src/app/transcription/Transcription';
import Config, { _Config } from '../../Config';


@Component({
    selector: 'recorder',
    templateUrl: './RecorderComponent.html'
})
export class RecorderComponent implements AfterViewInit {
    @ViewChild('canvas', { static: false })
    canvas: ElementRef;

    config: _Config;
    private _canvas: HTMLCanvasElement;
    private _container: HTMLElement;
    private renderer: Renderer;
    private _requestId: number;

    constructor(private recorder: Recorder, private router: Router, private zone: NgZone) {
        this.config = Config;
        this.recorder = recorder;
        this.recorder.onTranscribed = result => this.onTranscribed(result);
        this._requestId = window.requestAnimationFrame(() => this._update());

        router.events
            .pipe(filter(evt => evt instanceof NavigationStart))
            .subscribe(event => {
                window.cancelAnimationFrame(this._requestId);
                this.recorder.close();
            });
    }

    ngAfterViewInit(): void {
        this._canvas = this.canvas.nativeElement as HTMLCanvasElement;
        this._container = this._canvas.parentElement;
        this.renderer = new Renderer(this.config, this.recorder, this._canvas, this._container);
    }

    _update() {
        this.renderer.draw();
        this._requestId = window.requestAnimationFrame(() => this._update());
    }

    onTranscribed(result: TranscriptionResult) {
        this.zone.run(() =>
            this.router.navigate([`/notesSearch/${result.transcription}`]));
    }
}
