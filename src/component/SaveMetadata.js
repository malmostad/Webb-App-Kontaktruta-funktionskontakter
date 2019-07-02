define(function(require) {
	'use strict';

	var
		_ = require('underscore'),
		Component = require('Component'),
		webappURLTemplate = require('/template/saveMetadata');

	return Component.extend({
		template: webappURLTemplate,

		filterState: function(state) {
			return _.extend({}, {
				webappURL: state.webappURL
			});
		}
	});
});