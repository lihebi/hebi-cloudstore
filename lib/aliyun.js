var crypto = require('crypto');
var request = require('request');
var fs = require('fs');
var mimetypes = require('mime');
var path = require('path');
var Step = require('step');

function Aliyun (options) {
  this.accessId = options.accessId;
  this.accessKey = options.accessKey;
  this.host = "oss-cn-hangzhou.aliyuncs.com";
};

/**
 * get the Authorization header
 *
 * "Authorization: OSS " + AccessId + ":" + base64(hmac-sha1(METHOD + "\n"
 * + CONTENT-MD5 + "\n"
 * + CONTENT-TYPE + "\n"
 * + DATE + "\n"
 * + CanonicalizedOSSHeaders
 * + Resource))
 */
Aliyun.prototype.getSign = function (method, contentType, contentMd5, date, resource) {
  var params = [
  method,
  contentType || '',
  contentMd5 || '',
  date,
  resource
  ];
  var basicString = crypto.createHmac('sha1', this.accessKey);
  basicString.update(params.join('\n'));
  //console.log(this.getSign2(method, contentType, contentMd5, date, null, resource));
  return 'OSS ' + this.accessId + ':' + basicString.digest('base64');
}
Aliyun.prototype.getSign2 = function (method, contentType, contentMd5, date, metas, resource) {
  var params = [
    method,
    contentType || '',
    contentMd5 || '',
    date
  ];

  // sort the metas
  if (metas) {
    var metaSorted = Object.keys(metas).sort();
    for(var i = 0, len = metaSorted.length; i < len; i++) {
      var k = metaSorted[i];
      params.push(k.toLowerCase() + ':' + metas[k]);
    }
  }

  params.push(resource);

  var basicString = crypto.createHmac('sha1', this.accessKey);

  basicString.update(params.join('\n'));
  return 'OSS ' + this.accessId + ':' + basicString.digest('base64');
};

Aliyun.prototype.getResource = function(params) {
  return '/'+params.bucket+'/'+params.object;
}

Aliyun.prototype.getUrl = function(params) {
  return 'http://'+params.bucket+'.'+this.host+'/'+params.object;
}

Aliyun.prototype.fillHeaders = function(headers, method, params) {
  var date = new Date().toGMTString();
  headers.Date = date;
  var resource = this.getResource(params);
  headers['Authorization'] = this.getSign(method
                      , headers['content-Md5']
                      , headers['content-type']
                      , date
                      , resource
                      );
}

Aliyun.prototype.getHeaders = function (method, params, cb) {
  var headers = {};
  var _this = this;
  headers['content-type'] = mimetypes.lookup(path.extname(params.srcFile));
  Step(
    function loadFile() {
      fs.stat(params.srcFile, this.parallel());
      fs.readFile(params.srcFile, this.parallel());
    },
    function fillLocalFileData(error, stat, fileData) {
      if(error) {
        return;
      }
      headers['content-Length'] = stat.size;
      var md5 = crypto.createHash('md5');
      md5.update(fileData);
      headers['content-Md5'] = md5.digest('base64');
      _this.fillHeaders(headers, method, params);
      cb(headers);
    }
  );
}

Aliyun.prototype.doRequest = function (method, params) {
  var options = {};
  options.method = method;
  options.url = this.getUrl(params);
  this.getHeaders(method, params, function(headers) {
    options.headers = headers;
    options.timeout = 300000000;
    var req = request(options, function(err, response, body) {
      console.log(options);
      console.log(body);
    });

    var rstream = fs.createReadStream('a.txt');
    rstream.pipe(req);
    req.on('end', function(){});
  });
};


Aliyun.prototype.putObject = function (bucket, object, srcFile) {
  if (!bucket || !object || !srcFile) {
    throw new Error('error arguments!');
  }

  var method = 'PUT';
  var params = {
    bucket: bucket
    , object: object
    , srcFile: srcFile
  };

  this.doRequest(method, params);
};


module.exports= Aliyun;
