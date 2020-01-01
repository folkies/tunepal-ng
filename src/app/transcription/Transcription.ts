export interface TranscriptionRequest {
    id?: number;
    cmd: string;
    msg?: any;
}

export interface TranscriptionResponse {
    id: number;
    cmd: string;
    result: any;
    msg: any;
}