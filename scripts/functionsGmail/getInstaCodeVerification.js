const {google} = require('googleapis')
const {promisify} = require("es6-promisify")
const request = require('request')


const getInstaCodeVerification = async (auth, obj) => {
    let error
    const gmail = google.gmail({version: 'v1', auth})
    const req = {
        userId: 'me',
        id: obj.idMail
    }
    const res = await promisify(gmail.users.messages.get)(req).catch( async (err) => {
        console.log(`=== ${obj.crypted.login} --> ERROR === return - ${err} ✗`)
        const url = `https://hooks.slack.com/services/${obj.crypted.slackChannel}`
        const text = `===ERROR=== return - ${err} ✗`
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
    else {
        let code = res.data.snippet
        code = code.match(/\d{6}/g)[0]
        return code
    }
}

module.exports = getInstaCodeVerification