const request = require('request')
const {promisify} = require("es6-promisify")
const {google} = require('googleapis')

const addNotificationsScrappedToNotifications = async (auth, obj) => {
    let error
    const sheets = google.sheets({version: 'v4', auth})
    const req = {
        spreadsheetId: obj.crypted.spreadSheetId,
        range: 'notifications',
        valueInputOption: 'USER_ENTERED',
        insertDataOption: 'INSERT_ROWS',
        includeValuesInResponse: true,
        resource: {
            values: obj.notifsScrapped
        }
    }
    await promisify(sheets.spreadsheets.values.append)(req).catch( async (err) => {
        console.log(`=== ${obj.crypted.login} --> ERROR === return - ${err} ✗`)
        const url = `https://hooks.slack.com/services/${obj.crypted.slackChannel}`
        const text = `===ERROR=== return - ${err} ✗`;
        request.post({
                headers : { 'Content-type' : 'application/json' },
                url,
                form : {payload: JSON.stringify({ text } )}
            },
            (error, res, body) => console.log(`${obj.crypted.login} --> Slack answer: ${error} ${body}`)
        )
        if (obj.browser)
            await obj.browser.close()
        error = 'err'
    })
    return error
}

module.exports = addNotificationsScrappedToNotifications