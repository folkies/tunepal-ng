export class Utils {

    static makeArray(start = 0, end = 10, step = 1): number[] {
        let array = [];
        for (let i = start; i <= end; i += step) {
            array.push(i);
        }
        return array;
    }

    static defineProperty(className: string, ...names: string[]) {
        for (let name of names) {
            Object.defineProperty(className, name, {
                get: function () { return this[`_${name}`]; },
                set: function (value) { this[`_${name}`] = value; },
            });
        }
    }

    static createEnum(names: string[]) {
        let enumClass = {};
        for (let i = 0; i < names.length; i++) {
            enumClass[names[i]] = i + 1;
        }
        return enumClass;
    }

    static joinSet(set: Set<string>): string {
        let s = '';
        let i = 0;
        for (const item of set) {
            if (i != 0) s += ',';
            s += item;
            i++;
        }
        return s;
    }
}


