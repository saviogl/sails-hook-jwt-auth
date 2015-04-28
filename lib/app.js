var util = require('sails-util'),
		_ = require('lodash'),
		async = require('async'),
		buildDictionary = require('sails-build-dictionary'),
		path = require('path'),
		cwd = process.cwd(),
		loadControllers = require('./sails/_loadControllers'),
		loadPolicies = require('./sails/_loadPolicies');


var self = module.exports = {
	init: function (sails){
		self.loadAndRegisterFiles(sails);
	},

	adaptSails: function (sails){
		//Adaptation needed for controllers
		if ( _.isArray(sails.config.paths.controllers) ) {
			sails.config.paths.controllers.push(path.resolve(__dirname, '../api/controllers'));
		} else {
			sails.config.paths.controllers = [sails.config.paths.controllers, path.resolve(__dirname, '../api/controllers')];
		}

		sails.modules.loadControllers = loadControllers;
  	_.bind( sails.modules.loadControllers,  sails.modules);

  	//Adaptation needed for policies
		if ( _.isArray(sails.config.paths.policies) ) {
			sails.config.paths.policies.push(path.resolve(__dirname, '../api/policies'));
		} else {
			sails.config.paths.policies = [sails.config.paths.policies, path.resolve(__dirname, '../api/policies')];
		}

		sails.modules.loadPolicies = loadPolicies;
  	_.bind( sails.modules.loadPolicies,  sails.modules);
	},

	loadAndRegisterFiles: function (sails){
		async.parallel([
			function loadAndRegisterModels(done){
	      // Get the main model files
	      buildDictionary.optional({
	        dirname   : path.resolve(__dirname, '../api/models'),
	        filter    : /^([^.]+)\.(js|coffee|litcoffee)$/,
	        replaceExpr : /^.*\//,
	        flattenDirectories: true
	      }, function (err, models) {
	        if (err) { return cb(err); }
	        // Get any supplemental files
	        buildDictionary.optional({
	          dirname   : path.resolve(__dirname, '../api/models'),
	          filter    : /(.+)\.attributes.json$/,
	          replaceExpr : /^.*\//,
	          flattenDirectories: true
	        }, function (err, supplements) {
	          if (err) { return cb(err); }

	          var finalModels = sails.util.merge(models, supplements);
			      sails.models = sails.util.merge(sails.models || {}, finalModels);

			      done();
	        });
	      });
	  	},

			function loadAndRegisterServices(done){
			  buildDictionary.optional({
			    dirname: path.resolve(__dirname, '../api/services'),
			    filter: /(.+)\.(js|coffee|litcoffee)$/,
	        depth     : 1,
	        caseSensitive : true
			  }, function (err, services){
			    if ( err ) return done(err);

		      sails.services = _.extend(sails.services || {}, services);

		      // Expose globals (if enabled)
		      if (sails.config.globals.services) {
		        _.each(services, function (service) {
		          var globalName = service.globalId || service.identity;
		          global[globalName] = service;
		        });
		      }

			    done();
			  });
			},

			function loadAndRegisterConfigs(done){
			  buildDictionary.aggregate({
			    dirname: path.resolve(__dirname, '../config'),
			    exclude: [ 'locales', 'local.js', 'local.json', 'local.coffee', 'local.litcoffee' ],
			    excludeDirs: /(locales|env)$/,
			    filter: /(.+)\.(js|json|coffee|litcoffee)$/,
			    identity: false
			  }, function (err, configs){
			    if ( err ) return done(err);

					sails.config = sails.util.merge(configs, sails.config);

			    done();
			  });
			}
  	], function afterAll(err){
  		if ( err ) sails.log.warn('sails-hook-jwt:: Error encountered trying to register files: ', err);
  	});
	}
}