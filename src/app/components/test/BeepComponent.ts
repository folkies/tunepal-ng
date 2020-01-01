import { Component } from '@angular/core';
import { AudioContext } from 'angular-audio-context';

@Component({
    selector: 'my-beep',
    templateUrl: './BeepComponent.html'
})
export class BeepComponent {

    constructor(private _audioContext: AudioContext) {
    }

    public async beep(): Promise<void> {
        if (this._audioContext.state === 'suspended') {
            await this._audioContext.resume();
        }

        const oscillatorNode = this._audioContext.createOscillator();

        oscillatorNode.onended = () => oscillatorNode.disconnect();
        oscillatorNode.connect(this._audioContext.destination);

        oscillatorNode.start();
        oscillatorNode.stop(this._audioContext.currentTime + 0.5);
    }
}