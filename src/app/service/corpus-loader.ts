import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NormalizedTune } from '../models/normalized-tune';
import { TuneMatcher } from './tune-matcher';

@Injectable()
export class CorpusLoader {

    constructor(private httpClient: HttpClient) {
    }

    async loadCorpus(): Promise<NormalizedTune[]> {
        return this.httpClient.get<NormalizedTune[]>('assets/indexed-tunes.json')
            .toPromise()
    }
}