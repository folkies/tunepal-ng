import { Config } from './config';

describe('Config', () => {
    test('should have dynamic properties', () => {
        expect(Config.playbackSpeed).toEqual(5);
        expect(Config.sampleTime).toEqual(12);
    })
})