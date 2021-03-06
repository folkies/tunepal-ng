import { Config } from '../config';
import { TunebookManager } from './TunebookManager';
import { Tunebook } from './Tunebook';
import { RawTune } from './RawTune';

export class Tune {
    title: string;
    titleEncoded: string;
    altTitle: string;
    x: any;
    id: any;
    tunepalId: any;
    tunepalIdEncoded: string;
    tunepalIdDoubleEncoded: string;
    tunebook: Tunebook;
    tuneType: any;
    keySignature: any;
    confidence: any;
    ed: any;
    notation: string;

    constructor(rawTune: RawTune) {
        if (rawTune.title) {
            const tmp = rawTune.title.replace(/, The$/, '');
            this.title = tmp.length === rawTune.title.length ? tmp : `The ${tmp}`;
            this.title = Tune._convertSpecialChars(this.title);
            this.titleEncoded = encodeURIComponent(this.title);
        }

        if (rawTune.altTitle) {
            const tmp = rawTune.altTitle.replace(/, The$/, '');
            this.altTitle = tmp.length === rawTune.altTitle.length ? tmp : `The ${tmp}`;
            this.altTitle = Tune._convertSpecialChars(this.altTitle);
        }

        this.x = rawTune.x;
        this.id = rawTune.id;
        this.tunepalId = rawTune.tunepalid;
        this.tunepalIdEncoded = encodeURIComponent(this.tunepalId);
        this.tunepalIdDoubleEncoded = encodeURIComponent(this.tunepalIdEncoded);
        this.tunebook = TunebookManager.getById(rawTune.sourceId);
        this.tuneType = rawTune.tuneType;
        this.keySignature = rawTune.keySignature;
        this.confidence = rawTune.confidence;
        this.ed = rawTune.ed;
        this.notation = Tune._convertSpecialChars(rawTune.notation);
    }

    abcForPlayback() {
        var speed = Config.playbackSpeed;
        var transpose = Config.transpose;
        var lines = this.notation.split(/\r?\n/);

        var abc = lines[0] + "\n";

        var midiNoteLength = Math.floor(30.0 + (speed / 9.0) * 300.0);
        abc += "%%MIDI transpose " + transpose + "\n";
        abc += "Q:1/4 = " + midiNoteLength + "\n";
        for (var i = 1; i < lines.length; i++) {
            abc += lines[i] + "\n";
        }
        return abc;
    }

    static _convertSpecialChars(text: string): string {
        if (!text) {
            return text;
        }

        const specialChars = [
            ['À', /\{?(\\`A|&Agrave;|\\u00c0)\}?/g],
            ['à', /\{?(\\`a|&agrave;|\\u00e0)\}?/g],
            ['È', /\{?(\\`E|&Egrave;|\\u00c8)\}?/g],
            ['è', /\{?(\\`e|&egrave;|\\u00e8)\}?/g],
            ['Ì', /\{?(\\`I|&Igrave;|\\u00cc)\}?/g],
            ['ì', /\{?(\\`i|&igrave;|\\u00ec)\}?/g],
            ['Ò', /\{?(\\`O|&Ograve;|\\u00d2)\}?/g],
            ['ò', /\{?(\\`o|&ograve;|\\u00f2)\}?/g],
            ['Ù', /\{?(\\`U|&Ugrave;|\\u00d9)\}?/g],
            ['ù', /\{?(\\`u|&ugrave;|\\u00f9)\}?/g],
            ['Á', /\{?(\\'A|&Aacute;|\\u00c1)\}?/g],
            ['á', /\{?(\\'a|&aacute;|\\u00e1)\}?/g],
            ['É', /\{?(\\'E|&Eacute;|\\u00c9)\}?/g],
            ['é', /\{?(\\'e|&eacute;|\\u00e9)\}?/g],
            ['Í', /\{?(\\'I|&Iacute;|\\u00cd)\}?/g],
            ['í', /\{?(\\'i|&iacute;|\\u00ed)\}?/g],
            ['Ó', /\{?(\\'O|&Oacute;|\\u00d3)\}?/g],
            ['ó', /\{?(\\'o|&oacute;|\\u00f3)\}?/g],
            ['Ú', /\{?(\\'U|&Uacute;|\\u00da)\}?/g],
            ['ú', /\{?(\\'u|&uacute;|\\u00fa)\}?/g],
            ['Ý', /\{?(\\'Y|&Yacute;|\\u00dd)\}?/g],
            ['ý', /\{?(\\'y|&yacute;|\\u00fd)\}?/g],
            ['Â', /\{?(\\\^A|&Acirc;|\\u00c2)\}?/g],
            ['â', /\{?(\\\^a|&acirc;|\\u00e2)\}?/g],
            ['Ê', /\{?(\\\^E|&Ecirc;|\\u00ca)\}?/g],
            ['ê', /\{?(\\\^e|&ecirc;|\\u00ea)\}?/g],
            ['Î', /\{?(\\\^I|&Icirc;|\\u00ce)\}?/g],
            ['î', /\{?(\\\^i|&icirc;|\\u00ee)\}?/g],
            ['Ô', /\{?(\\\^O|&Ocirc;|\\u00d4)\}?/g],
            ['ô', /\{?(\\\^o|&ocirc;|\\u00f4)\}?/g],
            ['Û', /\{?(\\\^U|&Ucirc;|\\u00db)\}?/g],
            ['û', /\{?(\\\^u|&ucirc;|\\u00fb)\}?/g],
            ['Ŷ', /\{?(\\\^Y|&Ycirc;|\\u0176)\}?/g],
            ['ŷ', /\{?(\\\^y|&ycirc;|\\u0177)\}?/g],
            ['Ã', /\{?(\\~A|&Atilde;|\\u00c3)\}?/g],
            ['ã', /\{?(\\~a|&atilde;|\\u00e3)\}?/g],
            ['Ñ', /\{?(\\~N|&Ntilde;|\\u00d1)\}?/g],
            ['ñ', /\{?(\\~n|&ntilde;|\\u00f1)\}?/g],
            ['Õ', /\{?(\\~O|&Otilde;|\\u00d5)\}?/g],
            ['õ', /\{?(\\~o|&otilde;|\\u00f5)\}?/g],
            ['Ä', /\{?(\\"A|&Auml;|\\u00c4)\}?/g],
            ['ä', /\{?(\\"a|&auml;|\\u00e4)\}?/g],
            ['Ë', /\{?(\\"E|&Euml;|\\u00cb)\}?/g],
            ['ë', /\{?(\\"e|&euml;|\\u00eb)\}?/g],
            ['Ï', /\{?(\\"I|&Iuml;|\\u00cf)\}?/g],
            ['ï', /\{?(\\"i|&iuml;|\\u00ef)\}?/g],
            ['Ö', /\{?(\\"O|&Ouml;|\\u00d6)\}?/g],
            ['ö', /\{?(\\"o|&ouml;|\\u00f6)\}?/g],
            ['Ü', /\{?(\\"U|&Uuml;|\\u00dc)\}?/g],
            ['ü', /\{?(\\"u|&uuml;|\\u00fc)\}?/g],
            ['Ÿ', /\{?(\\"Y|&Yuml;|\\u0178)\}?/g],
            ['ÿ', /\{?(\\"y|&yuml;|\\u00ff)\}?/g],
            ['Ç', /\{?(\\cC|&Ccedil;|\\u00c7)\}?/g],
            ['ç', /\{?(\\cc|&ccedil;|\\u00e7)\}?/g],
            ['Å', /\{?(\\AA|&Aring;|\\u00c5)\}?/g],
            ['å', /\{?(\\aa|&aring;|\\u00e5)\}?/g],
            ['Ø', /\{?(\\\/O|&Oslash;|\\u00d8)\}?/g],
            ['ø', /\{?(\\\/o|&oslash;|\\u00f8)\}?/g],
            ['Ă', /\{?(\\uA|&Abreve;|\\u0102)\}?/g],
            ['ă', /\{?(\\ua|&abreve;|\\u0103)\}?/g],
            ['Ĕ', /\{?(\\uE|\\u0114)\}?/g],
            ['ĕ', /\{?(\\ue|\\u0115)\}?/g],
            ['Š', /\{?(\\vS|&Scaron;|\\u0160)\}?/g],
            ['š', /\{?(\\vs|&scaron;|\\u0161)\}?/g],
            ['Ž', /\{?(\\vZ|&Zcaron;|\\u017d)\}?/g],
            ['ž', /\{?(\\vz|&zcaron;|\\u017e)\}?/g],
            ['Ő', /\{?(\\HO|\\u0150)\}?/g],
            ['ő', /\{?(\\Ho|\\u0151)\}?/g],
            ['Ű', /\{?(\\HU|\\u0170)\}?/g],
            ['ű', /\{?(\\Hu|\\u0171)\}?/g],
            ['Æ', /\{?(\\AE|&AElig;|\\u00c6)\}?/g],
            ['æ', /\{?(\\ae|&aelig;|\\u00e6)\}?/g],
            ['Œ', /\{?(\\OE|&OElig;|\\u0152)\}?/g],
            ['œ', /\{?(\\oe|&oelig;|\\u0153)\}?/g],
            ['ß', /\{?(\\ss|&szlig;|\\u00df)\}?/g],
            ['Ð', /\{?(\\DH|&ETH;|\\u00d0)\}?/g],
            ['ð', /\{?(\\dh|&eth;|\\u00f0)\}?/g],
            ['Þ', /\{?(\\TH|&THORN;|\\u00de)\}?/g],
            ['þ', /\{?(\\th|&thorn;|\\u00fe)\}?/g],
        ];

        for (const specialChar of specialChars) {
            text = text.replace(specialChar[1], specialChar[0] as string);
        }

        return text;
    }
}

//TODO: automated front-end testing
if (Config.isTesting) {
    (function testConvertSpecialChars() {
        const a = Tune._convertSpecialChars('{\\aa} \\aa &aring; \\u00e5 \\`A \\\'A \\^A \\~A \\"A \\cC \\/O {\\uA}');
        const b = 'å å å å À Á Â Ã Ä Ç Ø Ă';
        console.assert(a === b, a, '!==', b);
    })();
}
