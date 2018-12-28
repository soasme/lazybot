var SlackBot = require('slackbots');

// Add a bot https://my.slack.com/services/new/bot and put the token
// Set env: https://devcenter.heroku.com/articles/config-vars
var bot = new SlackBot({
    token: process.env.SLACK_TOKEN || '',
    name: process.env.SLACK_BOTNAME || 'lazybot',
});

// main logic
var reply = function(data) {
  // This command is for testing if the bot is alive.
  if (/^ping$/.test(data.text)) {
    return "pong";
  }

  return null;
}

// all ingoing events https://api.slack.com/rtm
bot.on('message', function(data) {
  if (data.type == 'message' && data.subtype === undefined) {
    var channel = data.channel;
    var message = reply(data);

    // do not need to handle those patterns we don't know.
    if (message == null) {
      return;
    }

    bot.postMessage(channel, message);
  } else {
    // do not need to handle none-message.
  }
});


