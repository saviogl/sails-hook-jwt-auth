module.exports.routes = {
	'post /login' : 'AuthController.login',
	'post /signup' : 'AuthController.signup',
	'get /activate/:token' : 'AuthController.activate'
};