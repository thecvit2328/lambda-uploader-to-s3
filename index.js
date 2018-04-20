'use strict'
var http = require('http')
var AWS = require('aws-sdk')

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

  let response = {}

  if (!data.fileName || !data.fullName) {
    callback(null, {
      result: 0,
      message: 'Sorry, Unable to upload your profile image.'
    })
  } else {
    var s3 = new AWS.S3()
    var params = {
      Bucket: 's3-bucket-name',
      Key: 'fileName.jpg',
      Body: data.fileName.content
    }

    s3.upload(params, function(err, data) {
      if (!err) {
        //console.log(JSON.stringify(data))
        response = {
          filePath: data.Location,
          name: data.fullName
        }
        callback(null, data.Location)
      } else {
        callback(null, {
          result: 0,
          message: 'Sorry, Unable to upload your profile image.'
        })
      }
    })
  }
}
