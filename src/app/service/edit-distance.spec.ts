import { minEdSubString } from "./edit-distance";

describe('Edit distance', () => {
    let d: number[][] = [];

    const MAX = 1000;
    for (let i = 0; i < 2; i++) {
        const row: number[] = [];
        for (let j = 0; j < MAX; j++) {
            row.push(0);
        }
        d.push(row);
    }

    test('should get edit distance 1', () => {
        expect(minEdSubString("alter", "altar", d)).toBe(1);
    });

    test('should get edit distance 2', () => {
        expect(minEdSubString("Jagd", "Tatter Jack Walsh", d)).toBe(2);
    });

    test('should get edit distance 3', () => {
        expect(minEdSubString("CEGFGEDDCDDDADDFAAFADFAAAFFGAGDGEDCDEGGFGAFDDFEDDCEBBCCEDCEFGEDCDDDEDFAAFADFAEAFGADGEDD", "FFFDEDCABCDEDCAGFGADDEFGAFDGFEDCABCDEDCAGFGADCDDEFFFDEDCABCDEDCAGFGADDEFGAFDGFEDCABCDEDCAGFGADCDDADFAAFADFAAAFGGGGEDCDEFGGGAFDGFEDCABCDEDCAGFGADCDDADFAAFADFAAAFGGGGEDCDEFGGGAFDGFEDCABCDEDCAGFGADCDDAADCDDE", d)).toBe(24);
    });
});