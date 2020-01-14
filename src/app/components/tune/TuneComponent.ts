import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { RawTune } from 'src/app/models/RawTune';
import Tune from 'src/app/models/Tune';
import Config, { _Config } from '../../config';


@Component({
    selector: 'tune',
    templateUrl: './TuneComponent.html'
})
export class TuneComponent implements OnInit {
    tune: Tune;

    private config: _Config;


    constructor(
        private route: ActivatedRoute,
        private httpClient: HttpClient
    ) {
        this.config = Config;
    }

    ngOnInit(): void {
        this.route.paramMap.subscribe(map => this.consumeTunepalId(map));
    }

    private async consumeTunepalId(map: ParamMap): Promise<void> {
        const tunepalId = map.get('tunepalId');
        const response = await this.httpClient.get<RawTune>(
            `${this.config.ApiDomain}/api/Tunes/${tunepalId}`).toPromise();
        this.tune = new Tune(response);
    }

}
