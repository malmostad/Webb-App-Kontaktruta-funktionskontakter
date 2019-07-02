define(function(require) {

	'use strict';

	var _ = require('underscore');

	var reducer = function(state, action) {
		switch (action.type) {
			case 'SET_LAYOUT':
				return _.extend({}, state, {
					layout: action.layout
				});
			default:
				return state;
		}
	}

	return reducer;
});