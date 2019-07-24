const request = require('request')

const manageError = async (browser, crypted, err) => {
    console.log(`=== ${crypted.login} --> ERROR === return - ${err} ✗`)
    const url = `https://hooks.slack.com/services/${crypted.slackChannel}`;
    const text = `===ERROR=== return - ${err} ✗`
    request.post(
    {
        headers : { 'Content-type' : 'application/json' },
        url,
        form : {payload: JSON.stringify({ text } )}
    },
    (error, res, body) => console.log(`${crypted.login} --> Slack answer: ${error} ${body}`)
    )
    browser.close()
}

module.exports = manageError