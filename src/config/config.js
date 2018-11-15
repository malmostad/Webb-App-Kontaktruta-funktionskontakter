//Set to true to use fakedata
var locally = false;

// The restApp location and endpoints
var api = window.location.origin + "/rest-api/kontaktruta/";
var group_contacts_url = api + "group_contacts/";
var employees_url = api + "employees/";

var contactList = [];

// Checkboxoptions for choosing what to use for a contact
var checkboxOptions = [
    { name: "Titel", value: "title"},
    { name: "E-post", value: "email" }, 
    { name: "Fast telefon", value: "phone" }, 
    { name: "Telefontider", value: "phone_hours" }, 
    { name: "Mobil", value: "cell_phone" }, 
    { name: "Fax", value: "fax" },    
    { name: "Postadress", value: "address"},    
    { name: "Besöksadress", value: "visiting" },
    { name: "Besökstider", value: "visiting_hours" },
    { name: "Hemsida", value: "homepage" }
];

//Saving and setting the config data
(function ($) {
    // retrieve values that will be sent to the server
    window.getValues = function () {
        var values = { "contacts": [] },

        // Sitevision default functionality, can be removed, though saving becomes unstable without it.
        inputs = document.querySelectorAll('input');

         inputs.forEach(function(input) {
            var name = input.name;

            if (name) {
               var inputValue = input.value;
               values[name] = inputValue;
            }
         });
        // End      

        if (contactList.length > 0) {
            values.contacts = contactList;
        }

        return values;
    };
    // populate inputs when configuration is loaded
    window.setValues = function (values) {
        contactList = values["contacts"] ? values["contacts"] : [];

        renderContactList();
    };
}(jQuery));


$(function () {
    initialize();
});

// Initialization
function initialize() {

    var searchField = $("#search-field");
    var addContact = $("#addContact");

    addContact.click(function () {

        var values = {};
        var contactName = $("#contact-name").val();
        var contactId = $("#contact-id").val();

        values["name"] = contactName;
        values["id"] = parseInt(contactId);

        var selectedSettings = $("#contact-options input[type=checkbox]:checked");

        var settingName, settings = [];

        selectedSettings.map(function (item) {
            settingName = $(this).prop("name");
            settings.push(settingName);
        })

        values["settings"] = settings;
        contactList.push(values);
        renderContactList();
    })

    searchField.keyup(function (event) {
        clearContactOptions();
        getContacts(this.value);
    });


    $("#select-contact").on("click", "li", function () {
        var data = $(this).data("value");

        if (!data) {
            return;
        }
        updateContactOptions(data.id);
        $("#searchbox-wrapper .text-list-container").hide();
    })
}

// Methods
function renderContacts(newData) {
    var selectField = $("#select-contact");
    selectField.children().remove();
    newData.map(function (item) {
        var listItem = $("<li class='contact-list-item'></li>").text(item.name).data("value", item);

        selectField.append(listItem);
        $("#searchbox-wrapper .text-list-container").show();
    })
}


function renderContactList() {
    var addedContacts = $("#added-contacts");

    addedContacts.children().remove();
    contactList.map(function (item) {

        var listItem = $("<li></li>").text(item.name).data("value", item);

        var div = $("<div></div>");
        var removeBtn = $('<i><span class="glyphicons remove-2"></span></i>');
        var editBtn = $('<i style="display: none;"><span class="glyphicons edit"></span></i>');
        var moveBtn = $('<i style="display: none;"><span class="glyphicons move"></span></i>');

        removeBtn.click(function () {
            deleteContact(item.id);
        });

        div.append(removeBtn, editBtn, moveBtn);
        listItem.append(div);

        addedContacts.append(listItem)
    })
}

function updateContactOptions(contactId) {
    var contactOptions = $("#contact-options");

    contactOptions.children().remove();
    getContact(contactId);
}

function renderCheckboxes(contact) {
    var contactOptions = $("#contact-options");
    $("#addContact").prop("disabled", false);    

    var label, label2, input, div, id;

    div = $("<div class='form-group'></div>");
    label = $("<label>Namn</label>")
    input = $("<input class='form-control' type='text' id='contact-name' readonly>").attr("name", "name").val(contact.name);
    div.append(label, input);
    contactOptions.append(div);

    div = $("<div style='display: none;'></div>");

    input = $("<input type='text' id='contact-id' readonly>").attr("name", "id").val(contact.id);
    div.append(input);
    contactOptions.append(div);


    checkboxOptions.map(function (option) {
        id = "contact-option-" + option.value;

        div = $("<div class='styled-checkbox'></div>");
        input = $("<input class='regular-checkbox' type='checkbox'>").attr("name", option.value).attr("id", id);
        label = $("<label class='checkbox-label' tabindex='0'></label>").attr("for", id);
        label2 = $("<label class='checkbox-label'></label>").attr("for", id).text(option.name);

        div.append(input, label, label2);
        contactOptions.append(div);
    });
}

function clearContactOptions() {
    $("#contact-options").children().remove();
    $("#addContact").prop("disabled", true);
}

function getContacts(value) {
    if (value.length < 3) {
        $("#searchbox-wrapper .text-list-container").hide();
        return;
    };

    if (!locally) {
        $.get(group_contacts_url + "search/" + encodeURIComponent(value)).done(function (data) {
            renderContacts(data);
        }).fail(function () {
            alert("Something went wrong!")
            renderContacts([]);
        });
    } else {
        //Fake data, for testing
        renderContacts(getFakeContacts(value))
    }
}

function getContact(value) {

    if (!locally) {
        $.get(group_contacts_url + encodeURIComponent(value)).done(function (data) {
            renderCheckboxes(data);
        }).fail(function () {
            alert("Fail");
            return [];
        });
    }
    else {
        //Fake data, for testing
        renderCheckboxes(getFakeContact(value));
    }
}

function deleteContact(id) {
    var index = contactList.findIndex(function (el) {
        return el.id === id;
    })
    contactList.splice(index, 1);

    renderContactList();
};



// Data and function for local development
function getFakeContacts(value) {
    var regex = new RegExp(value, "ig");

    return fakeContacts().filter(function (item) {
        return regex.test(item.name);
    });
};

function getFakeContact(value) {
    return fakeContact().find(function (item) {
        return item.id === value;
    });
}

function fakeContacts() {
    return [{
        "id": 1899,
        "name": "Test"
    }];
};


function fakeContact() {   

    return [
        { "id": 1899, "name": "Test", "email": "", "phone": "040-364 07 00", "phone_hours": "", "cell_phone": null, "fax": "040-334 07 16", "address": "Something 184", "zip_code": "233 75 Tst", "postal_town": null, "homepage": "", "created_at": "2014-12-03T10:36:40.000+01:00", "updated_at": "2018-10-10T16:34:14.073+02:00", "visiting": { "address": "Ett ställe 184C", "zip_code": "", "postal_town": null, "district": null, "geo_position": { "x": null, "y": null }, "hours": "" } },
        
    ];
};