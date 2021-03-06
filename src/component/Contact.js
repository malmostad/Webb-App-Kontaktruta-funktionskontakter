define(function (require) {
    "use strict";

    var _ = require("underscore"),
        Component = require("Component"),
        app = require('app'),
        store = require('store'),
        template = require("/template/contact"),
        mailSent = require("/template/mailSent"),
        requester = require("requester");

    return Component.extend({
        tagName: "div",

        className: "vcard",

        getTemplate: function () {

            if (this.state.layout === 'mailSent') {
                return mailSent;
            }

            return template;
        },

        events: {
            dom: {
                "submit form": "handleSubmitButton",
                "click [data-toggle-form]": "handleToggleForm",
                "click [data-toggle-map]": "handleToggleMap"
            },
            self: {
                "state:changed": "render"
            },

            store: 'handleStoreUpdate'
        },

        handleStoreUpdate: function (newState) {
            this.setState(newState);
        },

        filterState: function (state) {

            return _.extend({}, {
                reCaptchaSiteKey: state.reCaptchaSiteKey,
                layout: state.layout,
                currentURL: state.currentURL,
                isIntranat: state.isIntranat
            });
        },

        templateFunctions: function () {
            return {
                generateId: function () {
                    return new Date().getTime() + Math.floor(Math.random() * Math.floor(1000));
                }
            };
        },

        handleSubmitButton: function (event) {

            event.preventDefault();

            if (!this.validateForm()) {
                alert("Fyll i de felaktiga fälten markerat i rött");
                return;
            }

            var formData = {
                catchpa: this.$("input[name=reCaptcha]").val(),
                name: this.$("input[name=name]").val(),
                email: this.$("input[name=email]").val(),
                phone: this.$("input[name=phone]").val(),
                subject: this.$("select[name=subject] option:selected").text(),
                message: this.$("textarea[name=message]").val(),
                currentURL: this.$("input[name=currentURL]").val(),
                to: this.state.data.email
            };

            requester.doPost({
                url: event.currentTarget.action,
                data: formData,
                context: this
            })
                .done(function (response) {

                    //alert("Mail skickat");

                    store.dispatch({
                        type: 'SET_LAYOUT',
                        layout: 'mailSent'
                    });
                })
                .fail(function (response) {
                    if (response.status === 400) {
                        alert(response.responseText);
                    } else {
                        alert("Något gick fel, var god försök igen");
                    }
                });
        },

        handleToggleForm: function (e) {

            e.preventDefault();

            var link = this.$("[data-toggle-form]");
            if (link.hasClass("active")) {
                link.removeClass("active");
                link.text("Skriv till oss")
                this.$("form").hide();
            } else {
                link.addClass("active");
                link.text("Dölj");
                this.$("form").show();
            }
        },

        handleToggleMap: function (e) {

            e.preventDefault();

            var link = this.$("[data-toggle-map]");
            if (link.hasClass("active")) {
                link.removeClass("active");
                link.text("Visa på karta")
                this.$(".contact-us-map").hide();
            } else {
                link.addClass("active");
                link.text("Dölj karta");
                this.$(".contact-us-map").show();
            }
        },

        //Validation for form
        validateForm: function () {
            var valid = true;

            var values = {
                name: this.$("input[name=name]").val(),
                email: this.$("input[name=email]").val(),
                phone: this.$("input[name=phone]").val(),
                subject: this.$("select[name=subject]").val(),
                message: this.$("textarea[name=message]").val()
            };

            var self = this;

            Object.entries(values).map(function (item) {
                if (!self.validateInput(item[0], item[1])) {
                    valid = false;
                }
            });

            return valid;
        },

        validateInput: function (key, value) {
            var valid = true;

            switch (key) {
                case "name":
                    if (!value) {
                        valid = false;
                        this.$("input[name=name]").parent().addClass("warning");
                    } else {
                        this.$("input[name=name]").parent().removeClass("warning");
                    }
                    break;
                case "email":
                    if (!this.validateEmail(value)) {
                        valid = false;
                        this.$("input[name=email]").addClass("invalid");
                    } else {
                        this.$("input[name=email]").removeClass("invalid");
                    }
                    break;
                case "phone":
                    if (!this.validatePhoneNr(value)) {
                        valid = false;
                        this.$("input[name=phone]").parent().addClass("warning");
                    } else {
                        this.$("input[name=phone]").parent().removeClass("warning");
                    }
                    break;
                case "subject":
                    if (!value) {
                        this.$("textarea[name=subject]").parent().addClass("warning");
                        valid = false;
                    } else {
                        this.$("textarea[name=subject]").parent().removeClass("warning");
                    }
                    break;
                case "message":
                    if (!value) {
                        valid = false;
                        this.$("textarea[name=message]").parent().addClass("warning");
                    } else {
                        this.$("textarea[name=message]").parent().removeClass("warning");
                    }
                    break;
                default:
                    break;
            }

            return valid;
        },

        validatePhoneNr: function (value) {
            var re = /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/g;

            return re.test(value);
        },

        validateEmail: function (value) {
            var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

            return re.test(value);
        }
    });
});