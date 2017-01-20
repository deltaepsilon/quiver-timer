const functions = require('firebase-functions');

module.exports = function (e) {
  var env = require('../services/environment');
  var mandrill = require('mandrill-api/mandrill');
  var client = new mandrill.Mandrill(env.mandrill.apiKey);
  var feedback = e.data.val();

  if (!feedback) return Promise.resolve();

  var logsRef = e.data.adminRef.root.child(env.model.admin.logs.feedback).child(e.data.key);

  logsRef.set(feedback)
    .then(function () {
      return e.data.ref.remove();
    })
    .then(function () {
      return new Promise(function (resolve, reject) {
        var fromEmail = feedback.email || feedback.accountEmail || env.mandrill.sender.email;
        var message = {
          "text": feedback.text,
          "subject": "HiiT Clock Feedback Received!",
          "from_email": env.mandrill.sender.email,
          "from_name": feedback.name || env.mandrill.sender.name,
          "to": [{
            "email": env.mandrill.adminRecipient.email,
            "name": env.mandrill.adminRecipient.name,
            "type": "to"
          }],
          "headers": {
            "Reply-To": fromEmail
          }
        };
        client.messages.send({message: message}, resolve, reject);
      });
    });
};