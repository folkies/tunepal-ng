class _LocalStorageUtils {
    getItem(key: string): any {
        let value = localStorage.getItem(key);
        return value && JSON.parse(value);
    }

    setItem(key: string, value: any): void {
        localStorage.setItem(key, JSON.stringify((value)));
    }
}

const LocalStorageUtils = new _LocalStorageUtils();

export default LocalStorageUtils;
