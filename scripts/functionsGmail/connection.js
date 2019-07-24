const fs = require('fs')
const readline = require('readline')
const {google} = require('googleapis')

const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly']

const connectionGmail = async (obj, callback) => {
  const credentials = await fs.readFileSync(obj.crypted.credentialsGmailPath)
  return authorize(JSON.parse(credentials), obj, callback)
}

const authorize = async (credentials, obj, callback) => {
  const {client_secret, client_id, redirect_uris} = credentials.installed
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0])

  if(!fs.existsSync(obj.crypted.tokenGmailPath)) {
    return await getNewToken(oAuth2Client, obj, callback)
  }
  else {
    const token = await fs.readFileSync(obj.crypted.tokenGmailPath)
    oAuth2Client.setCredentials(JSON.parse(token))
    return callback(oAuth2Client, obj)
  }
}

const getNewToken = (oAuth2Client, obj, callback) => {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  })

  console.log(`${obj.crypted.login} --> Authorize this app by visiting this url: ${authUrl}`)

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token)

      fs.writeFile(obj.crypted.tokenGmailPath, JSON.stringify(token), (err) => {
        if (err) return console.error(err)
        console.log(`${obj.crypted.login} --> Token stored to' ${obj.crypted.tokenGmailPath}`)
      })
      callback(oAuth2Client)
    })
  })
}

module.exports = connectionGmail