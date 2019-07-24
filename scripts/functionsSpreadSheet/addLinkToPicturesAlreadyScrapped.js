const {google} = require('googleapis')
const {promisify} = require("es6-promisify")
const request = require('request')

const addLinkToPicturesAlreadyScrapped = async (auth, obj) => {
    let error
    const sheets = google.sheets({version: 'v4', auth});
    const req = {
        spreadsheetId: obj.crypted.spreadSheetId,
        range: 'picturesAlreadyScrapped',
        valueInputOption: 'USER_ENTERED',
        insertDataOption: 'INSERT_ROWS',
        includeValuesInResponse: true,
        resource: {
        values: [obj.picture]
        },
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
    console.log(`${obj.crypted.login} --> ${obj.picture[1]} add to linksAlreadyScrapped sheet`)
    return error
}

module.exports = addLinkToPicturesAlreadyScrapped