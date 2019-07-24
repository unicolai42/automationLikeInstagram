const catchErr = require('../functionsGlobal/catchErr')

const signIn = async (browser, page, crypted) => {
    if (await catchErr(browser, crypted, page.waitForSelector('input._2hvTZ')))
        return

    if (await catchErr(browser, crypted, page.waitForSelector('.izU2O a')))
        return

    await page.waitFor(2000)

    await page.click('.izU2O a')

    await page.waitFor(3000)

    const inputs = await page.$$('input')

    const username = await inputs[0]
    const password = await inputs[1]

    await username.type(crypted.login, {delay: 100})

    await password.type(crypted.pwd, {delay: 100})

    await page.click('button.L3NKy')
}

module.exports = signIn