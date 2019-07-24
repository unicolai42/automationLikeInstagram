const {google} = require('googleapis')
const {promisify} = require("es6-promisify")

const getMailsId = async (auth, obj) => {
  let error
  const gmail = google.gmail({version: 'v1', auth})
  const req = {
    userId: 'me',
    q: "<security@mail.instagram.com>"
  }
  const res = await promisify(gmail.users.messages.list)(req).catch( async (err) => {
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
  else
      return res.data.messages
}

module.exports = getMailsId