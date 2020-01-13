import { IndexedTune } from '../models/IndexedTune';
import { minEdSubString } from './edit-distance';

export class TuneMatcher {
    indexedTunes: IndexedTune[];
    d : number[][] = [];

    constructor() {

        const MAX = 1000;
        for (let i = 0; i < 2; i++) {
            const row: number[] = [];
            for (let j= 0; j < MAX; j++) {
                row.push(0);
            }
            this.d.push(row);
        }    
    }

    findBestMatches(query: string): IndexedTune[] {
        let numTunes = 0;
        let results = [];
        for (let tune of this.indexedTunes) {
            tune.ed = minEdSubString(query, tune.normalized, this.d);
            results.push(tune);
            numTunes++;
            if (numTunes % 1000 === 0) {
                console.log(`${numTunes} tunes`);
            }
        }
        results.sort((left, right) => left.ed - right.ed);
        return results.slice(0, 10);
    }
    
}