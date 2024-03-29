class _BlobUtils {
    dataURLToBlob(dataURL: string): Blob {
        const BASE64_MARKER = ';base64,';

        if (dataURL.indexOf(BASE64_MARKER) == -1) {
            // percent encoded
            const parts = dataURL.split(',');
            const contentType = parts[0].split(':')[1];
            const raw = parts[1];
            const numPercent = (raw.match(/%/g) || []).length;
            const length = raw.length - numPercent * 2;
            const uInt8Array = new Uint8Array(length);

            for (let i = 0, j = 0; i < raw.length; j++) {
                if (raw[i] === '%') {
                    const code = raw.substr(i + 1, 2);
                    uInt8Array[j] = parseInt(code, 16);
                    i += 3;
                }
                else {
                    uInt8Array[j] = raw.charCodeAt(i);
                    i++;
                }
            }

            return new Blob([uInt8Array], { type: contentType });
        }
        else {
            // base64 encoded
            const parts = dataURL.split(BASE64_MARKER);
            const contentType = parts[0].split(':')[1];
            const raw = window.atob(parts[1]);
            const rawLength = raw.length;

            const uInt8Array = new Uint8Array(rawLength);

            for (let i = 0; i < rawLength; ++i) {
                uInt8Array[i] = raw.charCodeAt(i);
            }

            return new Blob([uInt8Array], { type: contentType });
        }
    }
}

const BlobUtils = new _BlobUtils();
export default BlobUtils;
