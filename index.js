const AWS = require('aws-sdk')
var s3 = new AWS.S3()

exports.handler = function(event, context, callback) {
  var boundary = event.params.header['Content-Type'].split('=')[1]
  var data = Buffer.from(event['body-json'], 'base64')
    .toString('binary')
    .split(boundary)
    .filter(item => item.match(/Content-Disposition/))
    .map(item => {
      if (item.match(/filename/)) {
        const result = {}
        result[
          item
            .match(/name="[a-zA-Z_]+([a-zA-Z0-9_]*)"/)[0]
            .split('=')[1]
            .match(/[a-zA-Z_]+([a-zA-Z0-9_]*)/)[0]
        ] = {
          type: 'file',
          filename: item
            .match(/filename="[\w-\. ]+"/)[0]
            .split('=')[1]
            .match(/[\w-\.]+/)[0],
          contentType: item
            .match(/Content-Type: .+\r\n\r\n/)[0]
            .replace(/Content-Type: /, '')
            .replace(/\r\n\r\n/, ''),
          content:
            context &&
            item
              .match(/Content-Type: .+\r\n\r\n/)[0]
              .replace(/Content-Type: /, '')
              .replace(/\r\n\r\n/, '')
              .match(/text/)
              ? item.split(/\r\n\r\n/)[1].replace(/\r\n\r\n\r\n----/, '')
              : Buffer.from(
                  item.split(/\r\n\r\n/)[1].replace(/\r\n\r\n\r\n----/, ''),
                  'binary'
                )
        }
        return result
      }
      const result = {}
      result[
        item
          .match(/name="[a-zA-Z_]+([a-zA-Z0-9_]*)"/)[0]
          .split('=')[1]
          .match(/[a-zA-Z_]+([a-zA-Z0-9_]*)/)[0]
      ] = item.split(/\r\n\r\n/)[1].split(/\r\n--/)[0]
      return result
    })
    .reduce((accumulator, current) => Object.assign(accumulator, current), {})

  let result = {}
  if (!data.upload || !data.api_token) {
    result = {
      result: 0,
      message: 'Sorry, Unable to upload your profile image.'
    }
  } else {
    ///check customer tokenId
    ///set filename
    let fileName = leftPad(randomIntInc(1, 1000), 4)
    ///upload to s3
    //data.upload
    ///update filename to udid mongoDB
  }

  callback(null, result)
}
