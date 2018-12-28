# soasme-lazybot

## Init

```
$ yarn install
$ export SLACK_TOKEN=xxxxxxxx
$ node app.js
```

## Deploy

```
$ git push origin master
$ heroku scale -a soasme-lazybot web=0 worker=1
```

## Test

```
$ ./node_modules/.bin/mocha test_app.js
```
