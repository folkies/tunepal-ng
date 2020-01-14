import { AfterViewInit, Component, ElementRef, NgZone, ViewChild } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Recorder } from 'src/app/pages/record/recorder';
import Renderer from 'src/app/pages/record/renderer';
import { TranscriptionResult } from 'src/app/transcription/transcription';
import Config, { _Config } from '../../config';


@Component({
    selector: 'recorder',
    templateUrl: './RecorderComponent.html'
})
export class RecorderComponent implements AfterViewInit {

    @ViewChild('canvas', { static: false })
    canvas: ElementRef<HTMLCanvasElement>;

    config: _Config;
    private _container: HTMLElement;
    private renderer: Renderer;
    private _requestId: number;

    constructor(private recorder: Recorder, private router: Router, private zone: NgZone) {
        this.config = Config;
        this.recorder = recorder;
        this.recorder.onTranscribed = result => this.onTranscribed(result);
        this._requestId = zone.runOutsideAngular(() => window.requestAnimationFrame(() => this._update()));

        router.events
            .subscribe(event => {
                if (event instanceof NavigationEnd) {
                    const url = (event as NavigationEnd).url;
                    if (url.endsWith('record')) {
                        this._requestId = zone.runOutsideAngular(() => window.requestAnimationFrame(() => this._update()));
                    }
                }
            });
    }

    ngAfterViewInit(): void {
        this._container = this.canvas.nativeElement.parentElement;
        this.renderer = new Renderer(this.config, this.recorder, this.canvas.nativeElement, this._container);
    }

    _update() {
        this.renderer.draw();
        this._requestId = window.requestAnimationFrame(() => this._update());
    }

    onTranscribed(result: TranscriptionResult) {
        console.log(`Transcription: ${result.transcription}`);
        if (! result.transcription) {
            return;
        }
        this.zone.run(() => {
            window.cancelAnimationFrame(this._requestId);
            this.recorder.close();

            this.router.navigate([`/notesSearch/${result.transcription}`])
        });
    }
}
