define(function(require) {
    'use strict'

    var 
        requester = require("JsonRequester"),
        // Insert google reCatchpa key here
        reCatchpaKey = "switch for recatchpa key";

    return {
        validateCatchpa: function(catchpaString) {        
            var options = {
                data: {
                    secret: reCatchpaKey,
                    response: catchpaString
                }
            }    
            // Is user a robot? (reCatchpa)
            requester.post("https://www.google.com/recaptcha/api/siteverify", options)
            .done(function(response) {
                if(response.success !== true) {
                    return true
                }            
            })
            .fail(function(response) {
                return false
            });
        },

        // TODO insert mail functionality from index.js here
        sendMail: function(params) {

        }
    }
})