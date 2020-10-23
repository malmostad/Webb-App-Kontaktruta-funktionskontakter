svDocReady(function () {

    'use strict';

    (function(jq){

        var validationInputs = jq('aside.contact-us [aria-invalid]');

        jq.each(validationInputs, function(i, e){
            var input = jq(e);

            input.on('focusout', function(e){
                var target = jq(e.target),
                    valid = target[0].validity.valid;

                if (valid) {
                    target.attr('aria-invalid', false);
                } else {
                    target.attr('aria-invalid', true);
                }
                
            });
        });

        /*
        var inputs = jq('aside.contact-us input, aside.contact-us select, aside.contact-us textarea');
        jq.each(inputs, function (i, e) {
            var input = jq(e);
            /--
            input.attr('aria-invalid', e.validity.valid);
            input.on('change', function (e) {
                this.attr('aria-invalid', e.validity.valid);
            });
            --/
            /--
            input.on('invalid', function (e) {
                var target = jq(e.target);
                //describedById = target.attr('aria-describedby'),
                //describedByElem = jq('#' + describedById);

                target.attr('aria-invalid', 'true');
            });
            --/
        });
        */

    }(jQuery))

});