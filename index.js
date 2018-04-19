// see also: https://www.npmjs.com/package/parse-multipart
var multipart = require('parse-multipart')

// "exports.handler" must match the entrypoint defined in the lambda Config.
exports.handler = function(event, context, callback) {
  var bodyBuffer = new Buffer(event['body-json'].toString(), 'base64')
  var boundary = multipart.getBoundary(event.params.header['content-type'])

  var parts = multipart.Parse(bodyBuffer, boundary)

  callback(null, { result: 'SUCCESS', files: parts })
}
