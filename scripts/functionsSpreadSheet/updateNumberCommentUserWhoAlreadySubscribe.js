const request = require('request')
const {promisify} = require("es6-promisify")
const {google} = require('googleapis')
const delay = require('../functionsGlobal/delay')


const updateNumberCommentUserWhoAlreadySubscribe = async (auth, obj) => {
  let error
  const nbComment = parseInt(obj.userChecked[4], 10) + 1
  const sheets = google.sheets({version: 'v4', auth})
  const req = {
    spreadsheetId: obj.crypted.spreadSheetId,
    range: `usersAlreadyScrapped!E${obj.userCheckedId + 1}`,
    valueInputOption: 'USER_ENTERED',
    includeValuesInResponse: true,
    resource: {
      values: [[nbComment]]
    }
  }
  await delay(3000)
  const res = await promisify(sheets.spreadsheets.values.update)(req).catch( async (err) => {
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
  return error
}

module.exports = updateNumberCommentUserWhoAlreadySubscribe