define(function(require) {
    'use strict';
 
    var
        _ = require('underscore'),
        ListComponent = require('ListComponent');
 
    return ListComponent.extend({
 
       tagName: 'div',
 
       childProperty: 'contacts',
 
       childComponentPath: 'Contact',
       
       filterState: function(state) {
          return _.extend({}, {contacts: state.contacts});
       }
    });
 });	