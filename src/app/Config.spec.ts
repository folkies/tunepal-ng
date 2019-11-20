import Config from './Config';

describe('Config', () => {
    test('should have dynamic properties', () => {
        expect(Config.playbackSpeed).toEqual(5);
        expect(Config.sampleTime).toEqual(12);
    })
})