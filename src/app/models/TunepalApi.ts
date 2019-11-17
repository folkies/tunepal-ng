import Config from '../Config';
import Tune from './Tune';
import Cache from '../utils/CacheUtils';

class _TunepalApi {
    constructor() {
    }

    fetchTuneAsync($http, tunepalIdEncoded: string) {
        return new Promise((resolve, reject) => {
            const url = `${Config.ApiDomain}/api/Tunes/${tunepalIdEncoded}`;

            $http.get(url)
                .success(rawTune => {
                    const tune = new Tune(rawTune);
                    Cache.tune = tune;
                    resolve(tune);
                });
        });
    }
}

const TunepalApi = new _TunepalApi();

export default TunepalApi;
