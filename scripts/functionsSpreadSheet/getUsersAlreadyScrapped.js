const {google} = require('googleapis')
const {promisify} = require("es6-promisify")
const request = require('request')


const getUsersAlreadyScrapped = async (auth, obj) => {
    let error
    const sheets = google.sheets({version: 'v4', auth})
    const req = {
        auth: auth,
        spreadsheetId: obj.crypted.spreadSheetId,
        range: 'usersAlreadyScrapped',
    }
    const res = await promisify(sheets.spreadsheets.values.get)(req).catch( async (err) => {
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
    if (error)
        return error
    else if (!res.data.values)
        return []
    else
        return res.data.values
}

module.exports = getUsersAlreadyScrapped