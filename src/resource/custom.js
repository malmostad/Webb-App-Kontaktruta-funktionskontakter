(function (jq) {

    'use strict';

    svDocReady(function () {

        var inputs = jq('aside.contact-us input, aside.contact-us select, aside.contact-us textarea');

        jq.each(inputs, function (i, e) {

            var input = jq(e);

            input.attr('aria-invalid', e.validity.valid);
            input.on('change', function (e) {
                this.attr('aria-invalid', e.validity.valid);
            });

            /*
            input.on('invalid', function (e) {

                var target = jq(e.target);
                //describedById = target.attr('aria-describedby'),
                //describedByElem = jq('#' + describedById);

                target.attr('aria-invalid', 'true');
            });
            */

        });
    });

}(jQuery));