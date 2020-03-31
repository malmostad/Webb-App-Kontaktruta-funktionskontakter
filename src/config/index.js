(function () {

    'use strict';

    const
        router = require('router'),
        globalAppData = require('globalAppData'),

        logUtil = require('LogUtil');

    router.get('/', (req, res) => {

        var restAPIUrl = globalAppData.get('restApiURL'),
            choosenMetadataDef = globalAppData.getNode('metadef'),
            choosenMetadataName = choosenMetadataDef.getName();

        res.render({
            restAPIUrl: restAPIUrl,
            choosenMetadataDefName: choosenMetadataName
        });
    });
})();