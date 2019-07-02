define(function(require) {
	'use strict';

	var
		_ = require('underscore'),
		Component = require('Component'),
		getMetadataURLTemplate = require('/template/getMetadata');

	return Component.extend({
		template: getMetadataURLTemplate,

		filterState: function(state) {
			return _.extend({}, {
				getMetadataURL: state.getMetadataURL
			});
		}
	});
});