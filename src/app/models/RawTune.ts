export interface RawTune {
    title: string;
    x: number;
    id: number;
    tunepalid: string;
    source: string;
    sourceId: number;
    keySignature: string;
    confidence: number;
    ed: number;
    tuneType?: string;
    altTitle?: string;
    notation?: string;
}