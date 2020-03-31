(function () {

    'use strict';

    var
        FORCE_HTTP = false, // Force HTTP

        router = require('router'),
        appData = require('appData'),
        i18n = require('i18n'),
        portletContextUtil = require('PortletContextUtil'),
        propertyUtil = require('PropertyUtil'),
        currentPage = portletContextUtil.getCurrentPage(),
        requester = require('Requester'),
        mailModule = require("/module/server/mailModule"),
        validateModule = require("/module/server/validateModule"),

        group_contacts_url,
        employees_url,

        logUtil = require('LogUtil');

    function getMetadataDefName() {

        var
            globalAppData = require('globalAppData'),
            def = globalAppData.getNode('metadef');

        if (!def) {
            return 'kontaktrutastadsomradenV4_3';
        }

        return def.getName();

    }

    function forceHTTP() {
        group_contacts_url = group_contacts_url.replace('https', 'http');
        employees_url = employees_url.replace('https', 'http');
    }

    function checkIsIntranat() {

        // Check if webapp renders on Malmos intranät 'Komin'

        var resourceLocatorUtil = require('ResourceLocatorUtil'),
            sitePage = resourceLocatorUtil.getSite(),
            hostname = propertyUtil.getString(sitePage, 'hostname', '');

        return (hostname.toLowerCase().indexOf('komin') > -1);
    }

    function getLegacyMetadata() {

        var metadataDef = getMetadataDefName(),
            metadataValue = propertyUtil.getString(currentPage, metadataDef, ''),
            newObject = {},
            metaJSON;

        try {
            metaJSON = JSON.parse(metadataValue);
        } catch (e) {
            metaJSON = [];
        }

        newObject.contactListData = metaJSON;
        newObject.localDevelopmentData = 'false';
        newObject.metadatadef = metadataDef;

        return newObject;
    }

    router.get('/', function (req, res) {

        var
            contactList = appData.get("contactListData"),
            globalAppData = require('globalAppData'),
            legacyMetadata = getLegacyMetadata(),
            isOnline = require('VersionUtil').getCurrentVersion() === 1,
            currentURL = propertyUtil.getString(currentPage, 'URI', ''),
            contacts = [],
            contactListAsJSON,
            isIntranat = checkIsIntranat(),

            reCaptchaSiteKey = globalAppData.get('recaptchaSiteKey'),
            forceHTTPAppData = globalAppData.get('forceHTTP'),
            restAPIURL = globalAppData.get('restApiURL');

        FORCE_HTTP = forceHTTPAppData;

        if (!contactList) {
            contactList = legacyMetadata.contactListData;

            if (contactList.contactListData) {
                contactList = contactList.contactListData;
            }

            contactList = JSON.stringify(contactList);
        }

        group_contacts_url = restAPIURL + "group_contacts/";
        //group_contacts_url = 'http://komin.test.malmo.se/rest-api/KontaktrutaRestAPI/group_contacts/';
        employees_url = restAPIURL + "employees/";
        //employees_url = "http://komin.test.malmo.se/rest-api/KontaktrutaRestAPI/employees/";

        try {
            contactListAsJSON = JSON.parse(contactList);
        } catch (e) {
            logUtil.error('Could not parse portlet data: ' + e);
        }

        if (contactListAsJSON) {
            contactListAsJSON.map(function (item) {

                if (FORCE_HTTP) {
                    forceHTTP();
                }

                if (item.type === 1 || item.type === '1') {

                    requester.get(employees_url + item.dn).done(function (data) {
                        contacts.push({
                            id: item.dn,
                            settings: item.attributes,
                            type: item.type,
                            data: data,
                            district: item.district || ''
                        });

                    }).fail(function (e) {

                        logUtil.error('Error requesting employees url: ' + e);

                    });

                } else {

                    requester.get(group_contacts_url + item.dn).done(function (data) {
                        contacts.push({
                            id: item.dn,
                            settings: item.attributes,
                            type: item.type,
                            data: data,
                            district: item.district || ''
                        });

                    }).fail(function (e) {

                        logUtil.error('Error requesting groups url: ' + e);

                    });
                }
            });
        }

        res.render('/', {
            contacts: contacts,
            reCaptchaSiteKey: reCaptchaSiteKey,
            isOnline: isOnline,
            currentURL: currentURL,
            isIntranat: isIntranat
        });
    });

    router.get('/getMetadata', function (req, res) {

        var legacyMetadata;

        try {

            legacyMetadata = getLegacyMetadata();
            res.status(200).json(legacyMetadata);

        } catch (e) {
            res.status(500).send("Internal server error");
        }
    });

    router.post('/saveMetadata', function (req, res) {

        var metadataUtil = require('MetadataUtil'),
            contactListData = JSON.parse(req.params.contactListData),
            metadatadef = getMetadataDefName(),
            valueToSave = {},
            success = true;

        valueToSave.contactListData = contactListData;
        valueToSave.metadatadef = metadatadef;

        try {
            metadataUtil.setMetadataPropertyValue(currentPage, metadatadef, JSON.stringify(valueToSave));
            logUtil.error('[Kontaktruta] Values saved');
        } catch (e) {
            success = false;
            logUtil.error('[Kontaktruta]  Could not save metadata values: ' + e);
        }

        res.json({
            success: success
        });
    });

    router.post("/sendmail", function (req, res) {

        var
            globalAppData = require('globalAppData'),
            reCaptchaSecretKey = globalAppData.get('recaptchaSecretKey'),
            params = req.params,
            options = {
                data: {
                    secret: reCaptchaSecretKey,
                    response: params.catchpa
                }
            };

        // Is user a robot? (reCatchpa)
        requester.post("https://www.google.com/recaptcha/api/siteverify", options)
            .done(function (response) {

                if (response.success === true) {

                    // Validate params
                    if (!validateModule.validParams(params)) {
                        return res.status(400).send("Bad input");
                    }

                    mailModule.sendMail(params) ? res.status(200).json({
                        message: "Success"
                    }) : res.status(500).send("Internal server error");

                } else {

                    logUtil.error('[Kontaktruta] Could not send contact mail because not passing Captcha filter');
                    return res.status(400).send(i18n.get('captchaError'));

                }
            })
            .fail(function (response) {
                logUtil.error('[Kontaktruta] Could not send contact mail because not passing Captcha filter');
            });
    });

}());