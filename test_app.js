// https://mochajs.org/
var assert = require('chai').assert;
// https://sinonjs.org/
var sinon = require('sinon');

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

describe('textize', () => {
  // textize: simply <url>
  assert.equal(app.textize('hello<https://wow>'), 'hello https://wow');
  assert.equal(app.textize('hello <https://wow>'), 'hello https://wow');
})

describe('sendTweet', () => {
  app.reply({
    text: 'tweet @techshack: this is a test.'
  }).then(function(message) {
    assert.equal(message, 'Error: Invalid or expired token.')
  })

  app.reply({
    text: 'tweet @unknown: this is a test.'
  }).then(function(message) {
    assert.equal(message, 'Error: env TWITTER_CREDENTIALS_UNKNOWN not found.')
  })
})
