import fs from 'fs';
import { IndexedTune } from '../models/IndexedTune';
import { TuneMatcher } from "./tune-matcher";

describe('TuneMatcher', () => {
    let d : number[][] = [];

    const MAX = 1000;
    for (let i = 0; i < MAX; i++) {
        const row: number[] = [];
        for (let j= 0; j < MAX; j++) {
            row.push(0);
        }
        d.push(row);
    }
    
    test('should match tune', () => {
        console.log('loading JSON');
        const json = fs.readFileSync('src/assets/indexed-tunes.json', 'utf8');
        console.log('loaded JSON');
        const tunes: IndexedTune[] = JSON.parse(json);
        console.log('parsed JSON');
        const matcher = new TuneMatcher();
        matcher.indexedTunes = tunes;

        const matches = matcher.findBestMatches('CEGFGEDDCDDDADDFAAFADFAAAFFGAGDGEDCDEGGFGAFDDFEDDCEBBCCEDCEFGEDCDDDEDFAAFADFAEAFGADGEDD');
        matches.forEach(match => console.log(`${match.ed} ${match.name}`));
    });
});