const functions = require('firebase-functions');
const _ = require('lodash');
const utils = require('../services/utils');
const axios = require('axios');
const md5 = require('md5');

function flattenLinks(links) {
  return links.reduce((links, link) => (links[link.rel || link.name] = link, links), {});
};

module.exports = function (e) {
  var env = require('../services/environment');
  var mcRoot = env.mailchimp.root;
  var apiKey = env.mailchimp.apiKey;
  var headers = { headers: { Authorization: `Basic ${apiKey}` } };
  var account = e.data.val();  

  if (!account || account.addedToEmailList) return Promise.resolve();

  var accountRef = e.data.adminRef.root.child(utils.replaceWildcard(env.model.user.read.account, 'uid', account.uid));
  var emailHash = md5(account.email.toLowerCase());

  axios.get(mcRoot, headers)
    .then(res => flattenLinks(res.data._links))
    .then(function (links) {
      return axios.get(links.lists.href, headers);
    })
    .then(function (res) {
      var list = res.data.lists.find(list => list.name.match(/Timer/));
      return flattenLinks(list._links);
    })
    .then(function (links) {
      return axios.get(`${links.members.href}/${emailHash}`, headers)
        .catch(function () {
          var nameParts = account.displayName.split(' ');
          var firstName = nameParts.shift();
          var lastName = nameParts.join(' ');
          var member = {
            email_address: account.email,
            email_type: 'html',
            status: 'pending',
            merge_fields: {
              FNAME: firstName,
              LNAME: lastName,
            },
            interests: {}
          };
          return axios.post(links.members.href, member, headers);
        });
    })
    .then(function () {
      return accountRef.update({
        addedToEmailList: true
      });
    })
    .then(function () {
      return e.data.ref.remove();
    });
};