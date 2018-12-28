// Claims:
//
// Yo, lazybot is @soasme's personal slackbot.
// It's only made for ^ his purpose.
// No pull request or issue should be made, though you can fork the repo for your own purpose.
// The project is under MIT license.
//
// EOF

var SlackBot = require('slackbots');
var Twit = require('twit');

// Add a bot https://my.slack.com/services/new/bot and put the token
// Set env: https://devcenter.heroku.com/articles/config-vars
var bot = new SlackBot({
    token: process.env.SLACK_TOKEN || '',
    name: process.env.SLACK_BOTNAME || 'lazybot',
});

// load twitters
var twitters = {};

// load @techshack twitter credentials
var techshackCred = process.env.TWITTER_CREDENTIALS_TECHSHACK;
if (techshackCred === null || techshackCred === undefined) {
  console.error("env TWITTER_CREDENTIALS_TECHSHACK not found.")
  process.exit(1);
}
try {
  // https://github.com/ttezel/twit
  twitters.techshack = new Twit(
    // https://stackoverflow.com/questions/5726729/how-to-parse-json-using-node-js
    JSON.parse(
      // https://stackoverflow.com/questions/6182315/how-to-do-base64-encoding-in-node-js
      Buffer.from(techshackCred, 'base64').toString('ascii')
    )
  );
} catch (err) {
  console.error("unable to load env TWITTER_CREDENTIALS_TECHSHACK: " + err.toString());
  process.exit(1);
}

// entry point.
// all ingoing events https://api.slack.com/rtm
var onMessage = function(data) {
  if (data.type == 'message' && data.subtype === undefined) {
    var channel = data.channel;
    var messagePromise = reply(data);

    // do not need to handle those patterns we don't know.
    if (messagePromise == null) {
      return;
    }

    messagePromise.then(function(message) {
      if (message === null) {
        // do not need to handle those invalid messages.
        return;
      }

      // send out message.
      bot.postMessage(channel, message);
    })
  } else {
    // do not need to handle none-message.
  }
};

// reply ongoing messages.
// it serves as routing function for all replying routines.
var reply = function(data) {
  // This command is for testing if the bot is alive.
  if (/^ping$/.test(data.text)) {
    return "pong";
  }

  if (/^tweet @.*:.*/.test(data.text)) {
    return sendTweet(data);
  }

  return null;
}

var sendTweet = function(data) {
  var match = data.text.match(/@([^:]+):(.+)/);

  // I don't know the meaning of the text.
  if (!match) {
    return null;
  }

  var username = match[1];
  var tweet = match[2].trim();

  // It cannot send tweet to a user that not configured.
  if (!twitters[username]) {
    return null;
  }

  return twitters[username].post('statuses/update', {status: tweet}, function(err, data, response) {
    if (err) {
      return err.toString();
    }

    return 'done';
  })
}

// entry point
// https://stackoverflow.com/questions/4981891/node-js-equivalent-of-pythons-if-name-main
if (!module.parent) {
  // this is the main module.
  bot.on('message', onMessage);
} else {
  // https://www.sitepoint.com/understanding-module-exports-exports-node-js/
  module.exports = {
    reply: reply,
  }
}
