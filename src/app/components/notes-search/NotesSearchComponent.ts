import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { RawTune } from 'src/app/models/RawTune';
import Tune from 'src/app/models/Tune';
import Config, { _Config } from '../../Config';


@Component({
    selector: 'notes-search',
    templateUrl: './NotesSearchComponent.html'
})
export class NotesSearchComponent implements OnInit {
    tunes: Tune[];
    private config: _Config;

    constructor(
        private route: ActivatedRoute,
        private httpClient: HttpClient
    ) {
        this.config = Config;
    }

    ngOnInit(): void {
        this.route.paramMap.subscribe(map => this.consumeNotes(map));
    }

    private async consumeNotes(map: ParamMap): Promise<void> {
        const notes = map.get('notes');
        const response = await this.httpClient.get<RawTune[]>(
            `${this.config.ApiDomain}/api/mattSearch`,
            {
                params: {
                    q: notes
                }
            }).toPromise();
        this.tunes = response.map(t => new Tune(t));
    }

}
