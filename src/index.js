// Used for local development
var local = true;

(function () {
    'use strict';

    var
        router = require('router'),
        appData = require('appData'),
        utils = require("Utils"),        
        requester = require('JsonRequester'),
        mailModule = require("/module/server/mailModule"),
        baseURL = 'https://minsidatest.malmo.se/api/v1/',
        endURL = 'app_token=[Insert_token]&app_secret=[insert_secret_key]';
        



    router.get('/', function (req, res) {

        var contactList = appData.get("contacts");
        var contacts = [];

        if (contactList) {
            contactList.map(function (item) {

                //for testing
                if (local) {
                    var contactPerson = getFakeContact(item.id);
                    contacts.push({ id: item.id, settings: item.settings, data: contactPerson });

                } else {
                    var url = baseURL + 'group_contacts/' + JSON.stringify(item.id) + '?' + endURL;
                    requester.get(url).done(function (data) {
                        contacts.push({ id: item.id, settings: item.settings, data: data });
                    }).fail(function (e) {
                    });
                }
            });
        }

        res.render('/', {
            contacts: contacts
        });
    });

    router.post("/sendmail", function (req, res) {

        var params = req.params;     

        var catchpaResponse = mailModule.validateCatchpa(params.catchpa);

        // TODO handle catchpa errors
        if(!catchpaResponse) {
            return res.status(400).send("Invalid catchpa");
        }

        // Validate params
        if (!validParams(params)) {
            return res.status(400).send("Bad input");
        }

        // Get the mailbuilder
        // TODO, add the mail template
        var mailUtil = utils.getMailUtil();
        var mailBuilder = mailUtil.getMailBuilder();

        mailBuilder.setSubject(params.subject);
        mailBuilder.setTextMessage(params.message);
        mailBuilder.addRecipient(params.to);

        var sent = mailBuilder.build().send();

        sent ? res.status(200).json({message: "Success"}) : res.status(500).send("Internal server error");
    });
}());

function validParams(params) {

    if (!params.name) {
        return false;
    }
    if (!validateEmail(params.email)) {
        return false;
    }
    if (!validatePhoneNr(params.phone)) {
        return false;
    }
    if (!params.subject) {
        return false;
    }
    if (!params.message) {
        return false;
    }
    if (!params.to) {
        return false;
    }
    return true;
}

function validatePhoneNr(value) {
    var re = /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/g;

    return re.test(value);
}

function validateEmail(value) {
    var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

    return re.test(value);
}

function getFakeContact(value) {
    return fakeContact().find(function (item) {
        return item.id === value;
    });
}

function fakeContact() {

    return [
        { "id": 1899, "name": "Test", "email": "", "phone": "040-364 07 00", "phone_hours": "", "cell_phone": null, "fax": "040-334 07 16", "address": "Something 184", "zip_code": "233 75 Tst", "postal_town": null, "homepage": "", "created_at": "2014-12-03T10:36:40.000+01:00", "updated_at": "2018-10-10T16:34:14.073+02:00", "visiting": { "address": "Ett ställe 184C", "zip_code": "", "postal_town": null, "district": null, "geo_position": { "x": null, "y": null }, "hours": "" } },
        
    ];
};