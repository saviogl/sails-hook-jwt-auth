/**
 * Load app controllers
 *
 * @param {Object} options
 * @param {Function} cb
 */
var async = require('async'),
		_ = require('lodash'),
		buildDictionary = require('sails-build-dictionary');

module.exports = function (cb) {
	async.reduce(sails.config.paths.controllers, {} ,function (prev, curr, callback){
	  buildDictionary.optional({
	    dirname: curr,
	    filter: /(.+)Controller\.(js|coffee|litcoffee)$/,
	    flattenDirectories: true,
	    keepDirectoryPath: true,
	    replaceExpr: /Controller/
	  }, function (err, controllers){
	  	if ( err ) callback(err);
	  	callback(null, _.merge(prev, controllers));
	  });
	}, cb);
};