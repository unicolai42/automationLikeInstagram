const request = require('request')
const {promisify} = require("es6-promisify")
const {google} = require('googleapis');


const clearFirstLinkToPicturesToScrap = async (auth, obj) => {
    let error
    const sheets = google.sheets({version: 'v4', auth})
    const req = {
      auth: auth,
      spreadsheetId: obj.crypted.spreadSheetId,
      resource: {
        "requests": 
        [
          {
            "deleteRange": 
            {
              "range": 
              {
                "sheetId": obj.crypted.gidPicturesToScrap,
                "startRowIndex": 0,
                "endRowIndex": 1
              },
              "shiftDimension": "ROWS"
            }
          }
        ]
      }
    }

    await promisify(sheets.spreadsheets.batchUpdate)(req).catch( async (err) => {
      console.log(`=== ${obj.crypted.login} --> ERROR === return - ${err} ✗`)
      const url = `https://hooks.slack.com/services/${obj.crypted.slackChannel}`
      const text = `===ERROR=== return - ${err} ✗`;
      request.post({
            headers : { 'Content-type' : 'application/json' },
            url,
            form : {payload: JSON.stringify({ text } )}
        },
        (error, res, body) => console.log(`${obj.crypted.login} --> Slack answer: ${error} ${body} ${res.statusCode}`)
      )
      if (obj.browser)
        await obj.browser.close()
      error = 'err'
    })
    console.log(`${obj.crypted.login} --> ${obj.link} has been deleted from linksToScrap`)
    return error
}

module.exports = clearFirstLinkToPicturesToScrap