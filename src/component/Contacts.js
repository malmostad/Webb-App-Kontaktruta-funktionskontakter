define(function (require) {
    'use strict';

    var
        _ = require('underscore'),
        ListComponent = require('ListComponent');

    return ListComponent.extend({

        tagName: 'div',

        childProperty: 'contacts',

        childComponentPath: 'Contact',

        onRendered: function () {

            this.$('.g-recaptcha').each(function (k, v) {
                jQuery(this).attr('id', 'captcha' + k);
                jQuery(this).closest('form').addClass('formcaptcha' + k);
            });

        },

        filterState: function (state) {
            return _.extend({}, {
                contacts: state.contacts,
                recaptchaSiteKey: state.recaptchaSiteKey,
                currentURL: state.currentURL,
                isIntranat: state.isIntranat
            });
        }
    });
});