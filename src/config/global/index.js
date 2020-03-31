(function () {
    const
        router = require('router'),

        logUtil = require('LogUtil');

    router.get('/', (req, res) => {

        const
            globalAppData = require('globalAppData'),
            restAPITUrl = globalAppData.get('restApiURL');

        res.render({});
    });
})();