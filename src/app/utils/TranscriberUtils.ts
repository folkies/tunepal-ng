class _TranscriberUtils {
    calcFrameSize(sampleRate: number): number {
        const idealFrameSize = sampleRate / 10;
        const prev = this.prevPow2(idealFrameSize);
        const next = prev * 2;
        return next - idealFrameSize < prev - idealFrameSize ? next : prev;
    }

    prevPow2(v: number): number {
        return Math.pow(2, Math.floor(Math.log(v) / Math.log(2)));
    }
}

const TranscriberUtils = new _TranscriberUtils();
export default TranscriberUtils;
