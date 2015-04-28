# sails-hook-jwt-auth
Hook that provides jwt authentication sails-compatible scheme, such as policies, routes, controllers, services.

# Installation
Within a Sails App structure:

```javascript
npm install --save sails-hook-jwt-auth
```

# Service
This module globally expose a service which integrates with the jsonwebtoken (https://github.com/auth0/node-jsonwebtoken) and provide the interface to apply the jwt specification (http://self-issued.info/docs/draft-ietf-oauth-json-web-token.html).

```javascript
var jwt = require('jsonwebtoken');

module.exports.issueToken = function(payload, options) {
  var token = jwt.sign(payload, process.env.TOKEN_SECRET || sails.config.jwt.token_secret, options);
  return token;
};

module.exports.verifyToken = function(token, callback) {
  return jwt.verify(token, process.env.TOKEN_SECRET || sails.config.jwt.token_secret, {}, callback);
};
```

# Policy
The `authToken.js` policy is just like any other Sails policy and can be applied as such. It's responsible for parsing the token from the incoming request and validating it's state.

```javascript
module.exports = function(req, res, next) {
  var token;

  if ( req.headers && req.headers.authorization ) {
    var parts = req.headers.authorization.split(' ');
    if ( parts.length == 2 ) {
      var scheme = parts[0],
        credentials = parts[1];

      if ( /^Bearer$/i.test(scheme) ) {
        token = credentials;
      }
    } else {
      return res.json( 401, { err: { status: 'danger', message: res.i18n('auth.policy.wrongFormat') }});
    }
  } else if ( req.param('token') ) {
    token = req.param('token');
    // We delete the token from param to not mess with blueprints
    delete req.query.token;
  } else {
    return res.json( 401, { err: { status: 'danger', message: res.i18n('auth.policy.noAuthorizationHeaderFound') }});
  }

  TokenAuth.verifyToken(token, function(err, decodedToken) {
    if ( err ) return res.json( 401, { err: { status: 'danger', message: res.i18n('auth.policy.invalidToken'), detail: err }});

    req.token = token.sub;

    next();
  });
};
```

Use it as you would use any other sails policy:

```javascript
module.exports.policies = {
	...
  'UserController': ['authToken'],
  ...
};
```

# Model
This hook sets up a basic `User` model with some defaults attributes required to implement the jwt authentication
scheme.

```javascript
var bcrypt = require('bcrypt');
module.exports = {

  attributes: {
  	email: {
  		type: 'email',
  		required: true,
  		unique: true
  	},

  	password: {
  		type: 'string'
  	},

    active: {
      type: 'boolean',
      defaultsTo: true
    },

    isPasswordValid: function (password, cb) {
      bcrypt.compare(password, this.password, cb);
    }
  }
};

```

The `User` model can be extended with any property you want by defining it in your own Sails project.

# Routes
These are the routes provided by this hook:

```javascript
module.exports.routes = {
	'post /login' : 'AuthController.login',
	'post /signup' : 'AuthController.signup',
	'get /activate/:token' : 'AuthController.activate'
};
```

## Login
The POST request to this route `/login` must be sent with these body parameters:

```javascript
{
	email: 'email@test.com',
	password: 'test123'
}
```

## Signup
The POST request to this route `/signup` must be sent with these body parameters:

```javascript
{
	email: 'email@test.com',
	password: 'test123',
	confirmPassword: 'test123',
}
```

### Account Activation
This feature is off by default and to enable it you must override the `requireAccountActivation` configuration and implement the function `sendAccountActivationEmail`:

```javascript
module.exports.jwt = {
	requireAccountActivation: true,
	sendAccountActivationEmail: function (res, user, link){
		sails.log.info('An email must be sent to this email: ', user.email, ' with this activation link: ', link);
		return res.json(200, { success: 'Email has been sent to user!' });
	}
} 
```