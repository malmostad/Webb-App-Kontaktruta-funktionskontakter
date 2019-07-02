define(function(require) {

	'use strict';

	function validatePhoneNr(value) {
		var re = /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/g;

		return re.test(value);
	}

	function validateEmail(value) {
		var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

		return re.test(value);
	}

	return {
		validParams: function(params) {

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
	};
});