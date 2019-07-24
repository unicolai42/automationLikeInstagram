const actionGmail = require('../functionsGmail/connection')
const getMailsId = require('../functionsGmail/getMailsId')
const getInstaCodeVerification = require('../functionsGmail/getInstaCodeVerification')
const catchErr = require('../functionsGlobal/catchErr')

const bypassSecurity = async (browser, page, crypted) => {
    if (await catchErr(browser, crypted, page.waitForSelector('._5f5mN.jIbKX.KUBKM.yZn4P')))
        return
    await page.click('._5f5mN.jIbKX.KUBKM.yZn4P')
    await page.waitFor(5000)
    const listMailsId = await actionGmail({crypted: crypted}, getMailsId)
    if (!listMailsId)
        await page.waitFor(15000)


    const code = await actionGmail({crypted: crypted, idMail: listMailsId[0].id}, getInstaCodeVerification)

    console.log(`${crypted.login} --> Get code`)

    await page.type('._281Ls.zyHYP', code, {delay: 100})
    await page.click('._5f5mN.jIbKX.KUBKM.yZn4P')
    await page.waitFor(5000)
}

module.exports = bypassSecurity