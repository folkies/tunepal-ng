export default class Tunebook {
    id: number;
    fullName: string;
    shortName: string;
    url: string;
    extra: string;
    count: number;

    constructor(rawTunebook: any) {
        this.id = rawTunebook.id;
        this.fullName = rawTunebook.fullName;
        this.shortName = rawTunebook.shortName;
        this.url = rawTunebook.url;
        this.extra = rawTunebook.extra;
        this.count = rawTunebook.count
    }

    get logoUrl() {
        return `https://tunepal.org/test/tunepal/source_icons/s${this.id}.png`;
    }
}