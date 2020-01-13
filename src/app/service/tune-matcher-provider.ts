import { Injectable } from '@angular/core';
import { TuneMatcher } from './tune-matcher';
import { CorpusLoader } from './corpus-loader';

@Injectable()
export class TuneMatcherProvider {

    private instance: TuneMatcher;

    constructor(private corpusLoader: CorpusLoader) {
    }

    async tuneMatcher(): Promise<TuneMatcher> {
        if (!this.instance) {
            const indexedTunes = await this.corpusLoader.loadCorpus();
            const matcher = new TuneMatcher();
            matcher.indexedTunes = indexedTunes;
            this.instance = matcher;
        }
        return this.instance;
    }
}