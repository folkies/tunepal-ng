export default class SearchParams {

    private params: string[];

    constructor() {
        this.params = [];
        const query = location.search.substring(1);
        const fragments = query.split('&');
        for (const fragment of fragments) {
            const pair = fragment.split('=');
            this.params[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
        }
    }

    has(key: string) {
        return typeof this.params[key] === 'undefined';
    }

    get(key: string) {
        return this.params[key];
    }
}
