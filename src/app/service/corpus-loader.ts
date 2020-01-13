import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IndexedTune } from '../models/IndexedTune';
import { TuneMatcher } from './tune-matcher';

@Injectable()
export class CorpusLoader {

    constructor(private httpClient: HttpClient) {
    }

    async loadCorpus(): Promise<IndexedTune[]> {
        return this.httpClient.get<IndexedTune[]>('assets/indexed-tunes.json')
            .toPromise()
    }
}