define(function (require) {
    'use strict';

    var
        _ = require('underscore'),
        Component = require('Component'),
        template = require('/template/main');

    return Component.extend({

        template: template,

        filterState: function (state) {
            return _.extend({}, {
                contacts: state.contacts,
                webappURL: state.webappURL,
                reCaptchaSiteKey: state.reCaptchaSiteKey,
                isOnline: state.isOnline,
                currentURL: state.currentURL,
                isIntranat: state.isIntranat
            });
        }
    });
});