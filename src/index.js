// Used for local development
var LOCAL_DEVELOPMENT = false,

    // Force HTTP
    FORCE_HTTP = false;

(function () {
    'use strict';

    var
        router = require('router'),
        appData = require('appData'),
        forceHTTPAppData = appData.get('forceHTTP'),
        i18n = require('i18n'),
        portletContextUtil = require('PortletContextUtil'),
        propertyUtil = require('PropertyUtil'),
        currentPage = portletContextUtil.getCurrentPage(),
        currentPortlet = portletContextUtil.getCurrentPortlet(),
        requester = require('JsonRequester'),
        logUtil = require('LogUtil'),
        mailModule = require("/module/server/mailModule"),
        validateModule = require("/module/server/validateModule"),
        group_contacts_url,
        employees_url;

    function createSaveMetadataURL() {
        var localURL = '/';

        try {
            localURL = localURL + currentPage.getIdentifier() + '.html?sv.' +
                currentPortlet.getIdentifier() + '.route=%2FsaveMetadata&sv.target=' + currentPortlet.getIdentifier();
        } catch (e) {

        }

        return localURL;
    }

    function createGetMetadataURL() {
        var localURL = '/';

        try {
            localURL = localURL + currentPage.getIdentifier() + '.html?sv.' +
                currentPortlet.getIdentifier() + '.route=%2FgetMetadata&sv.target=' + currentPortlet.getIdentifier();
        } catch (e) {

        }

        return localURL;
    }

    function getMetadataDefName() {

        var defName = appData.get('metadef'),
            session = require('Session');

        if (!defName || defName === '') {
            return 'kontaktrutastadsomradenV4_3';
        }

        return propertyUtil.getString(session.getNodeByIdentifier(defName), 'name', '');
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

        var contactList = appData.get("contactListData"),
            restAPIURL = appData.get('restApiURL'),
            reCaptchaSiteKey = appData.get('recaptchaSiteKey'),
            legacyMetadata = getLegacyMetadata(),
            isOnline = require('VersionUtil').getCurrentVersion() === 1,
            currentURL = propertyUtil.getString(currentPage, 'URI', ''),
            contacts = [],
            contactListAsJSON,
            isIntranat = checkIsIntranat();

        FORCE_HTTP = forceHTTPAppData;

        if (!contactList) {
            contactList = JSON.stringify(legacyMetadata.contactListData);
        }

        group_contacts_url = restAPIURL + "group_contacts/";
        //group_contacts_url = 'http://komin.test.malmo.se/rest-api/KontaktrutaRestAPI/group_contacts/';
        employees_url = restAPIURL + "employees/";
        //employees_url = "http://komin.test.malmo.se/rest-api/KontaktrutaRestAPI/employees/";

		/*
		if (appData.get("localDevelopmentData")) {
			LOCAL_DEVELOPMENT = true;
        }
        */

        try {
            contactListAsJSON = JSON.parse(contactList);
        } catch (e) {
            logUtil.error('Could not parse portlet data: ' + e);
        }

        if (contactListAsJSON) {
            contactListAsJSON.map(function (item) {

                if (LOCAL_DEVELOPMENT) {
                    var contactPerson = getFakeContact(item.id);

                    contacts.push({
                        id: item.dn,
                        settings: item.attributes,
                        type: item.type,
                        data: data,
                        district: item.district || ''
                    });

                } else {

                    if (FORCE_HTTP) {
                        forceHTTP();
                    }

                    if (item.type === 1 || item.type === '1') {

                        try {

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

                        } catch (e) {

                        }

                    } else {

                        try {

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

                        } catch (e) {

                        }
                    }
                }

            });
        }

        res.render('/', {
            contacts: contacts,
            webappURL: createSaveMetadataURL(),
            getMetadataURL: createGetMetadataURL(),
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
            session = require('Session'),
            contactListData = JSON.parse(req.params.contactListData),
            //localDevelopmentData = req.params.localDevelopmentData,
            metadataDefNode = session.getNodeByIdentifier(req.params.metadataDef),
            metadatadef = propertyUtil.getString(metadataDefNode, 'name', ''),
            valueToSave = {};

        valueToSave.contactListData = contactListData;
        //valueToSave.localDevelopmentData = localDevelopmentData;
        valueToSave.metadatadef = metadatadef;

        try {
            metadataUtil.setMetadataPropertyValue(currentPage, metadatadef, JSON.stringify(valueToSave));
            logUtil.error('[Kontaktruta] Values saved');
        } catch (e) {
            logUtil.error('[Kontaktruta]  Could not save metadata values: ' + e);
        }
    });

    router.post("/sendmail", function (req, res) {

        var params = req.params,
            options = {
                data: {
                    secret: appData.get('recaptchaSecretKey'),
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

function getFakeContact(value) {
    return fakeContact().find(function (item) {
        return item.id === value;
    });
}

function fakeContact() {

    return [{
        "id": 1899,
        "name": "Test",
        "email": "",
        "phone": "040-364 07 00",
        "phone_hours": "",
        "cell_phone": null,
        "fax": "040-334 07 16",
        "address": "Something 184",
        "zip_code": "233 75 Tst",
        "postal_town": null,
        "homepage": "",
        "created_at": "2014-12-03T10:36:40.000+01:00",
        "updated_at": "2018-10-10T16:34:14.073+02:00",
        "visiting": {
            "address": "Ett ställe 184C",
            "zip_code": "",
            "postal_town": null,
            "district": null,
            "geo_position": {
                "x": null,
                "y": null
            },
            "hours": ""
        }
    },

    {
        "id": 1891,
        "name": "Anders",
        "email": "anders.israelsson@afconsult.com",
        "phone": "040-364 07 00",
        "phone_hours": "",
        "cell_phone": null,
        "fax": "040-334 07 16",
        "address": "Something 184",
        "zip_code": "233 75 Tst",
        "postal_town": null,
        "homepage": "",
        "created_at": "2014-12-03T10:36:40.000+01:00",
        "updated_at": "2018-10-10T16:34:14.073+02:00",
        "visiting": {
            "address": "Ett ställe 184C",
            "zip_code": "",
            "postal_town": null,
            "district": null,
            "geo_position": {
                "x": null,
                "y": null
            },
            "hours": ""
        }
    },

    ];
};