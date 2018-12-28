// Claims:
//
// Yo, lazybot is @soasme's personal slackbot.
// It's only made for ^ his purpose.
// No pull request or issue should be made, though you can fork the repo for your own purpose.
// The project is under MIT license.
//
// EOF

const VERSION = '0.1.1';

var SlackBot = require('slackbots');
var Twit = require('twit');

// Add a bot https://my.slack.com/services/new/bot and put the token
// Set env: https://devcenter.heroku.com/articles/config-vars
var bot = new SlackBot({
    token: process.env.SLACK_TOKEN || '',
    name: process.env.SLACK_BOTNAME || 'lazybot',
});

var loadTwitterClient = function(username) {
  // load twitter credentials by username
  var envName = 'TWITTER_CREDENTIALS_' + username.toUpperCase();
  var techshackCred = process.env[envName];
  var cred;

  if (techshackCred === null || techshackCred === undefined) {
    throw Error("env " + envName + " not found.");
  }

  try {
    // https://stackoverflow.com/questions/5726729/how-to-parse-json-using-node-js
    cred = JSON.parse(
      // https://stackoverflow.com/questions/6182315/how-to-do-base64-encoding-in-node-js
      Buffer.from(techshackCred, 'base64').toString('ascii')
    );
  } catch (err) {
    throw Error("unable to load env " + envName + ": " + err.toString());
  }

  // https://github.com/ttezel/twit
  return new Twit(cred);
}


// entry point.
// all ingoing events https://api.slack.com/rtm
var onMessage = function(data) {
  if (data.type == 'message' && data.subtype === undefined) {
    var channel = data.channel;
    var messagePromise = reply(data);

    // do not need to handle those patterns we don't know.
    if (messagePromise === null) {
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
    return pingPong(data);
  }

  if (/^tweet @.*:.*/.test(data.text)) {
    return sendTweet(data);
  }

  return null;
}

var pingPong = function(data) {
  if (data.text != 'ping') {
    return null;
  }

  return new Promise(function(resolve, reject) {
    resolve('pang');
  })
}

var textize = function(text) {
  // simplify <url> to url.
  text = text.replace(/( *)<(http[^>]+)>( *)/, " $2 ");
  return text.trim();
}

var sendTweet = function(data) {
  var match = data.text.match(/@([^:]+):(.+)/);

  // I don't know the meaning of the text.
  if (!match) {
    return null;
  }

  var username = match[1];
  var tweet = textize(match[2]);

  // TODO: validate tweet length.

  return new Promise(function(resolve, reject) {
    try {
      // load client and then send out the tweet.
      loadTwitterClient(username).post('statuses/update', {
        status: tweet,
      }, (err, data, response) => {
        // it should reply with done or an error message.
        resolve(err ? err.toString() : 'done')
      })
    } catch( err ) {
      // loading client or sending tweet might report error.
      resolve(err.toString())
    }
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
    textize: textize,
    loadTwitterClient: loadTwitterClient,
  }
}
