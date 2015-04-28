var jwtHook = require('./lib/app.js');

module.exports = function (sails) {
		jwtHook.adaptSails(sails);

    return {
	    defaults: {
	    	jwt: {
		    	requireAccountActivation: false,
		    	token_secret: 'Our biggest secret',
		    	sendAccountActivationEmail: function (res, user, link){
		    		sails.log.info('An email must be sent to this email: ', user.email, ' with this activation link: ', link);
		    		return res.json(200, { success: 'Email has been sent to user!' });
		    	}
	    	}
	    },

      initialize: function(cb) {
      	jwtHook.init(sails);

        return cb();
      }      
    };
};