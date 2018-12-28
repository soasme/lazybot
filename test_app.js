// https://hackernoon.com/a-crash-course-on-testing-with-node-js-6c7428d3da02
var assert = require('assert');

process.env.SLACK_TOKEN = 'none';
process.env.SLACK_TOKEN = 'lazybot';
process.env.TWITTER_CREDENTIALS_TECHSHACK = Buffer.from(
  JSON.stringify({
    consumer_key: 'test',
    consumer_secret: 'test',
    access_token: 'test',
    access_token_secret: 'test',
  }),
  'ascii'
).toString('base64');

var app = require('./app');

// reply: sendTweet
assert.equal(app.reply({
  text: 'tweet @unknown: this is a test.'
}), null)

app.reply({
  text: 'tweet @techshack: this is a test.'
}).then(function(message) {
  assert.equal(message, 'done')
})
