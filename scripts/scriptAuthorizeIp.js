const puppeteer = require('puppeteer')

const catchErr = require('./functionsGlobal/catchErr')
const scriptLikePicture = require('./scriptLikePicture')
const {proxyIdCrypted, lauralazio75Crypted, kefcesCrypted, michmichmochiCrypted, ugonicolaiCrypted, alicehrmtteCrypted} = require('../cryptedData')


const scriptAuthorizeIp = async (crypted) => {
    const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']})
    const page = await browser.newPage()
    await page.setViewport({ width: 1280, height: 800 })

    if (await catchErr(browser, crypted, page.goto('https://www.iplocation.net/', {waitUntil: 'domcontentloaded'})))
        return

    let ip = await page.$eval('div > p > span', e => e.innerText)

    ip += '\n'
    console.log(ip, 'ip')

    if (await catchErr(browser, crypted, page.goto('http://vip.squidproxies.com/login.php', {waitUntil: 'domcontentloaded'})))
        return

    if (await catchErr(browser, crypted, await page.type('input#user', crypted.login, {delay: 100})))
        return

    if (await catchErr(browser, crypted, await page.type('input#password', crypted.pwd, {delay: 100})))
        return

    if (await catchErr(browser, crypted, page.click('#x')))
        return 

    if (await catchErr(browser, crypted, page.goto('http://vip.squidproxies.com/index.php?action=authips', {waitUntil: 'domcontentloaded'})))
        return
        
    if (await catchErr(browser, crypted, page.click('.bcont a')))
        return 

    if (await catchErr(browser, crypted, await page.type('textarea', ip, {delay: 100})))
        return

    if (await catchErr(browser, crypted, page.click('input')))
        return 

    await page.waitFor(60000)

    await browser.close()

    // scriptLikePicture(lauralazio75Crypted)
    // scriptLikePicture(kefcesCrypted)        
    // scriptLikePicture(michmichmochiCrypted)
    // scriptLikePicture(ugonicolaiCrypted)
    // scriptLikePicture(alicehrmtteCrypted)
}

// module.exports = scriptGetAnalytics
scriptAuthorizeIp(proxyIdCrypted)