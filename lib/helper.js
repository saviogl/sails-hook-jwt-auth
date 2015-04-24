/**
 * util.js
 *
 */

var _ = require('lodash');

module.exports = {
  convertWaterlineError: function (err, res) {

    var messages = [];

    if( err.invalidAttributes ) {
      _.each( err.invalidAttributes, function (invalidAttributes, field, collection){
        _.each( invalidAttributes, function (attributeDetails, i, collection){
          messages.push({
            status: 'danger',
            field: field,
            rule: attributeDetails.rule,
            message: res.i18n('auth.validation.' + attributeDetails.rule, { field:  field, value: attributeDetails.value })
          });
        });
      }); 
    }

    return res.json(401, {err: messages});
  },

  createActivationLink: function (user){
    console.log('user', user);
    var token = TokenAuth.issueToken({
      sub: user.id,
    });
    return sails.getBaseurl() + '/activate/' + token;
  }
};
