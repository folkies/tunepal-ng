export function edSubString(pattern: string, text: string, prev: number[], curr: number[]): number[] {
    const pLength = pattern.length;
    const tLength = text.length;
    let difference = 0;

    if (pLength === 0) {
        return undefined;
    }
    if (tLength === 0) {
        return undefined;
    }

    for (let i = 0; i < tLength + 1; i++) {
        prev[i] = 0;
    }

    const ZETT = 'Z'.charCodeAt(0);
    for (let i = 1; i <= pLength; i++) {
        curr[0] = i;
        const sc = pattern.charCodeAt(i - 1);
        for (let j = 1; j <= tLength; j++) {
            const v = prev[j - 1];
            if ((text.charCodeAt(j - 1) !== sc) && sc !== ZETT) {
                difference = 1;
            }
            else {
                difference = 0;
            }
            const a = prev[j] + 1;
            const b = curr[j - 1] + 1;
            const c = v + difference;
            let min = (a < b) ? a : b;
            if (c < min) {
                min = c;
            }
            curr[j] = min;
        }
        const tmp = curr;
        curr = prev;
        prev = tmp;
    }
    return prev;
}

export function minEdSubString(pattern: string, text: string, d: number[][]): number {
    const lastRow: number[] = edSubString(pattern, text, d[0], d[1]);
    let min = Number.MAX_SAFE_INTEGER;
    const tLength = text.length;
    for (let i = 0; i < tLength + 1; i++) {
        let c = lastRow[i];
        if (c < min) {
            min = c;
        }
    }
    return min;
}


export function edSubStringInt(pattern: string, text: string): Int32Array {
    const pLength = pattern.length;
    const tLength = text.length;
    let difference = 0;

    if (pLength === 0) {
        return undefined;
    }
    if (tLength === 0) {
        return undefined;
    }

    let prev = new Int32Array(tLength + 1);
    let curr = new Int32Array(tLength + 1);
    prev.fill(0);

    const ZETT = 'Z'.charCodeAt(0);
    for (let i = 1; i <= pLength; i++) {
        curr[0] = i;
        const sc = pattern.charCodeAt(i - 1);
        for (let j = 1; j <= tLength; j++) {
            const v = prev[j - 1];
            if ((text.charCodeAt(j - 1) !== sc) && sc !== ZETT) {
                difference = 1;
            }
            else {
                difference = 0;
            }
            const a = prev[j] + 1;
            const b = curr[j - 1] + 1;
            const c = v + difference;
            let min = (a < b) ? a : b;
            if (c < min) {
                min = c;
            }
            curr[j] = min;
        }
        [prev, curr] = [curr, prev];        
    }
    return prev;
}

export function minEdSubStringInt(pattern: string, text: string): number {
    const lastRow: Int32Array = edSubStringInt(pattern, text);
    let min = Number.MAX_SAFE_INTEGER;
    const tLength = text.length;
    for (let i = 0; i < tLength + 1; i++) {
        let c = lastRow[i];
        if (c < min) {
            min = c;
        }
    }
    return min;
}
