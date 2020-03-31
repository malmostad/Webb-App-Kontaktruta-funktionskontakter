var contactList = [],
    typeOfContactValue = 'personContakt';

// Checkboxoptions for choosing what to use for a contact
var checkboxOptions = [{
    name: "Titel",
    value: "title"
},
{
    name: "E-post",
    value: "mail"
},
{
    name: "Dölj 'Skriv till oss'",
    value: "hideWriteToUs"
},
{
    name: "Fast telefon",
    value: "telephone"
},
{
    name: "Telefontider",
    value: "telephoneHours"
},
{
    name: "Mobil",
    value: "mobile"
},
{
    name: "Fax",
    value: "fax"
},
{
    name: "Postadress",
    value: "postalAddress"
},
{
    name: "Besöksadress",
    value: "visitingAddress"
},
{
    name: "Besökstider",
    value: "visitingHours"
},
{
    name: "Hemsida",
    value: "homepage"
}
];


$(function () {

    'use strict';

    var searchField,
        addContact,
        selectContact,
        contactOptions,
        hiddenContactDataElem,
        addedContacts;

    // Sitevision overide, populates elements with data when configuration is loaded
    window.setValues = function (values) {

        var contacts = values.contactListData,
            legacyMetadata;

        if (!contacts || contacts.length < 1) {

            $.ajax({
                url: getUrlForLegacyMetadata(),
                method: 'GET',
                async: false,
                dataType: 'json',
                success: function (data) {
                    legacyMetadata = data;
                }
            });

            if (legacyMetadata && legacyMetadata.contactListData) {
                contacts = legacyMetadata.contactListData;
            }
        }

        if (contacts && contacts.length > 0) {

            hiddenContactDataElem.value = JSON.stringify(contacts);

            contacts.map(function (contact) {
                contactList.push(contact);
                updateContactList();
            });
        }

        //window._setVsalues(values);
    };

    // Sitevision overide, add config setting
    function addValue(values, name, value) {
        var currentValue = values[name];
        if (currentValue) {
            if (value != null) {
                if (!Array.isArray(currentValue)) {
                    values[name] = [currentValue];
                }
                values[name].push(value);
            }
        } else {
            values[name] = value;
        }
        return values;
    }

    // Sitevision overide, retrieves values from elements that will be sent to the serve
    window.getValues = function () {

        var values = {};

        if (hiddenContactDataElem) {
            values = addValue(values, hiddenContactDataElem.name, hiddenContactDataElem.value);
        }

        // Save values to metadata for "Kontaktruta"
        saveMetadata(values);

        return values;
    };

    function getUrlForLegacyMetadata() {

        var contentFrame = parent.document.getElementById('content-frame'),
            getMetadataURL = contentFrame.contentWindow['getMetadataURL'];

        return getMetadataURL;
    }

    function saveMetadata(aValues) {
        var contentFrame = parent.document.getElementById('content-frame'),
            saveMetadataURL = contentFrame.contentWindow['webappURL'];

        $.ajax({
            url: saveMetadataURL,
            method: 'POST',
            dataType: 'json',
            data: {
                contactListData: aValues.contactListData,
                metadataDef: choosenMetadataDef
            }

        });
    }

    // Local user object cache
    function userCache(anKey, aValue) {

        if (aValue === null) {
            return sessionStorage.getItem(anKey);
        }

        if (sessionStorage.getItem(anKey) === null) {
            sessionStorage.setItem(anKey, JSON.stringify(aValue));
        }
    }

    function clearContactOptions() {
        contactOptions.children().remove();
        addContact.prop("disabled", true);
    }

    function cleanOutput(anUserAttributeValue) {

        if (anUserAttributeValue) {
            return anUserAttributeValue;
        }

        return '';
    }

    function getAttributeValue(anOptionValue, aContact, anType) {

        var returnValue = '';

        if (anOptionValue === 'title') {

            if (parseInt(anType) === 1) {
                returnValue = cleanOutput(aContact.title);
            } else {
                returnValue = cleanOutput(aContact.name);
            }

        } else if (anOptionValue === 'mail') {

            returnValue = cleanOutput(aContact.email);

        } else if (anOptionValue === 'telephone') {

            returnValue = cleanOutput(aContact.phone);

        } else if (anOptionValue === 'telephoneHours') {

            returnValue = cleanOutput(aContact.phone_hours);

        } else if (anOptionValue === 'mobile') {

            returnValue = cleanOutput(aContact.cell_phone);

        } else if (anOptionValue === 'fax') {

            returnValue = cleanOutput(aContact.fax);

        } else if (anOptionValue === 'postalAddress') {

            returnValue = cleanOutput(aContact.address) + ', ' + cleanOutput(aContact.postal_code) + ' ' + cleanOutput(aContact.zip_code) + ' ' + cleanOutput(aContact.postal_town);

        } else if (anOptionValue === 'visitingAddress') {

            if (aContact.visiting) {
                returnValue = cleanOutput(aContact.visiting.address);
            }

        } else if (anOptionValue === 'visitingHours') {

            if (aContact.visiting) {

                returnValue = cleanOutput(aContact.visiting.hours);
            }

        } else if (anOptionValue === 'homepage') {

            returnValue = cleanOutput(aContact.homepage);

        }

        return returnValue;
    }

    function editCheckboxes(anContact, responseData) {

        var editActionDiv, editAttributeContainer, div, textInput, input, label, id, label2, contactValue, backendUserObj;


        $('#editContact').off('change', 'input.regular-checkbox');

        backendUserObj = responseData;
        editActionDiv = $('#editContact');
        editActionDiv.empty();
        editActionDiv.append('<h3 class="panel-title">Redigera kontakt</h3>');

        editAttributeContainer = $('<div class="form-group"></div>');
        textInput = $('<input class="form-control" type="text" disabled value="' + anContact.cn + '" />');
        div = $('<div></div>');

        div.append(textInput);
        editAttributeContainer.append(div);

        checkboxOptions.map(function (option) {

            var optionValue = option.value;
            id = "contact-option-" + optionValue;

            div = $("<div class='styled-checkbox'></div>");
            input = $("<input class='regular-checkbox' type='checkbox'>").attr("name", optionValue).attr("id", id);
            if (anContact.attributes.indexOf(optionValue) > -1) {
                input.attr('checked', 'checked');
            }

            input.on('change', function (e) {

                var changedSettings = $("#editContact input[type=checkbox]:checked"),
                    changeInputs = [];

                changedSettings.map(function (item) {
                    changeInputs.push($(this).prop("name"));
                });

                anContact.attributes = changeInputs;
                updateHiddenData();
            });

            label = $("<label class='checkbox-label' tabindex='0'></label>").attr("for", id);
            label2 = $("<label class='checkbox-label'></label>").attr("for", id).text(option.name);
            contactValue = $('<div class="contactAttributeValue">' + getAttributeValue(optionValue, backendUserObj, anContact.type) + '</div>');

            div.append(input, label, label2, contactValue);
            editAttributeContainer.append(div);
        });

        editActionDiv.append(editAttributeContainer);
        editActionDiv.append($('<button id="closeEditAttribute">Tillbaka</button>'));

    }

    function renderCheckboxes(contact, anType) {

        var label, label2, input, div, id, inputContactType, contactValue;

        addContact.prop("disabled", false);
        div = $("<div class='form-group'></div>");
        label = $("<label>Namn</label>");
        if (typeOfContactValue === 'personContakt') {
            input = $("<input class='form-control' type='text' id='contact-name' readonly>").attr("name", "name").val(contact.first_name + ' ' + contact.last_name);
        } else {
            input = $("<input class='form-control' type='text' id='contact-name' readonly>").attr("name", "name").val(contact.name);
        }

        div.append(label, input);
        contactOptions.append(div);

        div = $("<div style='display: none;'></div>");

        input = $("<input type='text' id='contact-id' readonly>").attr("name", "id").val(contact.id);
        inputContactType = $("<input type='text' id='contact-type' readonly>").attr("name", "type").val(anType);
        div.append(input);
        div.append(inputContactType);
        contactOptions.append(div);

        checkboxOptions.map(function (option) {
            id = "contact-option-" + option.value;

            div = $("<div class='styled-checkbox'></div>");
            input = $("<input class='regular-checkbox' type='checkbox'>").attr("name", option.value).attr("id", id);
            label = $("<label class='checkbox-label' tabindex='0'></label>").attr("for", id);
            label2 = $("<label class='checkbox-label'></label>").attr("for", id).text(option.name);
            contactValue = $('<div class="contactAttributeValue">' + getAttributeValue(option.value, contact, anType) + '</div>');

            div.append(input, label, label2, contactValue);
            contactOptions.append(div);
        });
    }

    function renderContacts(anUserObj) {
        var selectField = $("#select-contact");
        selectField.children().remove();

        anUserObj.map(function (item) {
            var listItem;

            if (typeOfContactValue === 'personContakt') {
                listItem = $("<li class='contact-list-item'></li>").text(item.first_name + ' ' + item.last_name).data("value", item);
            } else {
                listItem = $("<li class='contact-list-item'></li>").text(item.name).data("value", item);
            }

            userCache(item.id, item);

            selectField.append(listItem);
            $("#searchbox-wrapper .text-list-container").show();
        });
    }

    function getContact(anUserId, anUserType) {

        var group_contacts_url = resAPIURL + "group_contacts/",
            employees_url = resAPIURL + "employees/";

        if (typeOfContactValue === 'personContakt') {

            $.get(employees_url + encodeURIComponent(anUserId)).done(function (data) {
                renderCheckboxes(data, anUserType);
            }).fail(function () {
                alert("Fail");
                return [];
            });

        } else {

            $.get(group_contacts_url + encodeURIComponent(anUserId)).done(function (data) {
                renderCheckboxes(data, anUserType);
            }).fail(function () {
                alert("Fail");
                return [];
            });
        }
    }

    function updateContactOptions(anUserId, anUserType) {
        contactOptions.children().remove();
        getContact(anUserId, anUserType);
    }

    function getContacts(value) {

        var group_contacts_url = resAPIURL + "group_contacts/",
            employees_url = resAPIURL + "employees/";

        if (value.length < 3) {
            $("#searchbox-wrapper .text-list-container").hide();
            return;
        }

        if (typeOfContactValue === 'personContakt') {
            $.get(employees_url + "search/" + encodeURIComponent(value)).done(function (data) {
                renderContacts(data);
            }).fail(function (xhr, status, error) {
                alert("Something went wrong! Message: " + error);
                renderContacts([]);
            });
        } else {
            $.get(group_contacts_url + "search/" + encodeURIComponent(value)).done(function (data) {
                renderContacts(data);
            }).fail(function (xhr, status, error) {
                alert("Something went wrong! Message: " + error);
                renderContacts([]);
            });
        }
    }

    function updateHiddenData() {

        hiddenContactDataElem.value = JSON.stringify(contactList);

    }

    function deleteContact(id) {
        var index = contactList.findIndex(function (el) {
            return el.dn === id;
        });

        contactList.splice(index, 1);

        updateContactList();
        updateHiddenData();
    }

    function editAction(anContactIndex) {

        var contactPerson = contactList[anContactIndex],
            group_contacts_url = resAPIURL + "group_contacts/",
            employees_url = resAPIURL + "employees/";;

        if (parseInt(contactPerson.type) === 1) {
            $.get(employees_url + encodeURIComponent(contactPerson.dn)).done(function (data) {
                editCheckboxes(contactPerson, data);
            }).fail(function () {
                alert("Fail");
            });

        } else {

            $.get(group_contacts_url + encodeURIComponent(contactPerson.dn)).done(function (data) {
                editCheckboxes(contactPerson, data);
            }).fail(function () {
                alert("Fail");
            });
        }
    }

    function updateContactList() {

        addedContacts.children().remove();
        contactList.map(function (item) {

            var listItem = $("<li></li>").text(item.cn).data("value", item),
                div = $("<div></div>"),
                removeBtn = $('<i><span class="glyphicons remove-2"></span></i>'),
                editBtn = $('<i><span class="glyphicons edit"></span></i>'),
                moveBtn = $('<i style="display: none;"><span class="glyphicons move"></span></i>');

            removeBtn.click(function () {
                deleteContact(item.dn);
            });

            div.append(editBtn, removeBtn, moveBtn);
            listItem.append(div);
            addedContacts.append(listItem);
        });
    }

    $(window).on('load', function () {

        var oldIndex = -1,
            newIndex = -1;

        searchField = $("#search-field");
        addContact = $("#addContact");
        selectContact = $("#select-contact");
        contactOptions = $("#contact-options");
        addedContacts = $("#added-contacts");
        hiddenContactDataElem = document.querySelector('textarea.addedContactsAsString');

        $('input[name="typeOfContact"]').on('change', function (e) {

            typeOfContactValue = this.value;
        });

        function arraymove(arr, fromIndex, toIndex) {
            var element = arr[fromIndex];
            arr.splice(fromIndex, 1);
            arr.splice(toIndex, 0, element);
        }

        $('#editContact').on('click', '#closeEditAttribute', function (e) {
            $('#editContact').toggle();
            $('#addNewContactPanel').toggle();
        });

        $('.panel-default').on('click', '#added-contacts span.edit', function (e) {
            var editContactContainer = $(e.target).closest('li'),
                contactIndex = editContactContainer.index();

            if ($('.editableContact').length > 0) {
                $('.editableContact').removeClass('editableContact');
            } else {
                $('#editContact').toggle();
                $('#addNewContactPanel').toggle();
            }

            editContactContainer.addClass('editableContact');
            editAction(contactIndex);
        });

        // Make sortable contacts
        $('#added-contacts').sortable({
            containment: "parent",
            placeholder: "sortable-placeholder",
            cursor: "move",
            items: "li",
            start: function (event, ui) {
                oldIndex = ui.item.index();
            },
            stop: function (event, ui) {

                newIndex = ui.item.index();
                newIndex = -1;
                oldIndex = -1;

            },
            update: function (event, ui) {
                newIndex = ui.item.index();
                if (newIndex !== -1 && oldIndex !== -1) {
                    arraymove(contactList, oldIndex, newIndex);
                    updateHiddenData();
                }
            }
        });

        addContact.on('click', function (e) {

            var values = {},
                contactName = $("#contact-name").val(),
                contactId = $("#contact-id").val(),
                contactType = $("#contact-type").val(),
                settingName, settings = [],
                selectedSettings = $("#contact-options input[type=checkbox]:checked");

            // Bad values key because importing data from legacy portlet
            values["cn"] = contactName; // name
            values["dn"] = parseInt(contactId); // ID

            selectedSettings.map(function (item) {
                settingName = $(this).prop("name");
                settings.push(settingName);
            });

            values['district'] = '';
            values["type"] = contactType;
            values["attributes"] = settings; // settings
            contactList.push(values);
            updateContactList();
            updateHiddenData();

        });

        searchField.on('keyup', function (event) {
            clearContactOptions();
            getContacts(this.value);
        });

        selectContact.on('click', 'li', function () {
            var userObj = $(this).data('value');

            if (typeOfContactValue === 'personContakt') {
                userObj.type = 1;
            } else {
                userObj.type = 2;
            }

            if (!userObj) {
                return;
            }

            userCache(userObj.id, userObj);

            updateContactOptions(userObj.id, userObj.type);
            $("#searchbox-wrapper .text-list-container").hide();
        });
    });

}());