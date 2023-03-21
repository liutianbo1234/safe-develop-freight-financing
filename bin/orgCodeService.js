const axios = require('axios');

function orgCodeService(path, cache, logger, ttl) {
    return async function (orgCode, success, fail) {
        return axios.post(`${path}`, {
            "orgCode": `${orgCode}`
        }).then(function (response) {
            logger.info(`response.data: ${response.data}`);
            if (response.data && 'SUCCESS' === response.data.code) {
                cache.set(orgCode, response.data.data.mainUrl, ttl);
                return success(response.data.data.mainUrl);
            } else {
                return fail(response);
            }
        }).catch(function (error) {
            return fail(error);
        });
    }
}

module.exports = orgCodeService;