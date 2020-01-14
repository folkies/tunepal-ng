import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { RawTune } from 'src/app/models/RawTune';
import Tune from 'src/app/models/Tune';
import Config, { _Config } from '../../config';
import { TuneMatcherProvider } from 'src/app/service/tune-matcher-provider';
import { IndexedTune } from 'src/app/models/IndexedTune';


@Component({
    selector: 'notes-search',
    templateUrl: './NotesSearchComponent.html'
})
export class NotesSearchComponent implements OnInit {
    tunes: Tune[];
    private config: _Config;

    constructor(
        private route: ActivatedRoute,
        private httpClient: HttpClient,
        private tuneMatcherProvider: TuneMatcherProvider
    ) {
        this.config = Config;
    }

    ngOnInit(): void {
        this.route.paramMap.subscribe(map => this.consumeNotesNew(map));
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

    private async consumeNotesNew(map: ParamMap): Promise<void> {
        const notes = map.get('notes');
        const tuneMatcher = await this.tuneMatcherProvider.tuneMatcher();
        const indexedTunes = tuneMatcher.findBestMatches(notes);
        this.tunes = indexedTunes.map(t => this.toTune(t));
    }

    private toTune(indexedTune: IndexedTune): Tune {
        return new Tune({
            confidence: Math.round(indexedTune.confidence * 1000) / 10,
            ed: indexedTune.ed,
            id: 0,
            tunepalid: indexedTune.tune,
            keySignature: '',
            source: '',
            sourceId: 0,
            title: indexedTune.name,
            x: 1
        });
    }
}