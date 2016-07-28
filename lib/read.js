var _ = require('underscore');
var util = require('util');
var messages = require('elasticio-node').messages;
var debug = require('debug')('csv');
var request = require('request');

function processRead(msg, cfg) {
  var csvURL = cfg.url;
  var that = this;

  console.log('Incoming message is %j', msg);
  console.log('url is %s', csvURL);
  if (!csvURL || csvURL.length == 0) {
    // Now let's check for the attachment
    if (msg && msg.attachments && Object.keys(msg.attachments).length > 0) {
      var key = Object.keys(msg.attachments)[0];
      console.log('Found attachment key=%s attachment=%j', key, msg.attachments[key]);
      csvURL = msg.attachments[key].url;
    } else {
      console.error('URL of the CSV is missing');
      that.emit('error', 'URL of the CSV is missing');
      return that.emit('end');
    }
  }

  console.log('Sending GET request to url=%s', csvURL);
  request(csvURL, function (error, response, body) {
      console.log('Have got response status=%s headers=%j', response.statusCode, response.headers);
      console.log('Response is:\n--------\n%j\n--------', response);

      if (response.statusCode != 200) {
        that.emit('error', 'Unexpected response code code=' + response.statusCode);
        throw Error('Unexpected response code code=' + response.statusCode);
      }
      else
      {
        that.emit('data', messages.newMessageWithBody({'csv': body}));
      }
      that.emit('end');
    });
}

exports.process = processRead;
