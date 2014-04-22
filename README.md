# hebi-cloudstore

**Be careful to use it**
It is a very alpha version.

As you can see, I put my name before the name to indicate that
it is just a test project for the usage of my team.
So if you have any questions, please contact me directly.
I'm happy to answer any questions.

Briefly speeking,
it is a library to do operations on some cloud store,
like Aliyun, Upyun, etc on nodejs.
I'm trying to keep it breef and powerful.


# Install
`npm install hebi-cloudstore`


# Usage

```
var Aliyun = require('hebi-cloudstore').Aliyun

var aliyun = new Aliyun({
  accessId: 'YOUR ACCESS ID',
  accessKey: 'YOUR ACCESS SECRET KEY'
  })
```

## APIs

```
aliyun.putObject(bucket, object, src, cb);
```
