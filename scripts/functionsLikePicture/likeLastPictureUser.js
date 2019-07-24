const dateFormat = require('dateformat')

const catchErr = require('../functionsGlobal/catchErr')
const delay = require('../functionsGlobal/delay')
const getRandomInt = require('../functionsGlobal/getRandomInt')
const actionGoogleSheet = require('../functionsSpreadSheet/connection')
const addUserToUsersAlreadyScrapped = require('../functionsSpreadSheet/addUserToUsersAlreadyScrapped')

const likeLastPictureUser = async (browser, page, crypted, userWhoLikedPicture, pictureToScrap) => {
    if (await catchErr(browser, crypted, page.goto(userWhoLikedPicture, {waitUntil: 'domcontentloaded'})))
        return

    if (await catchErr(browser, crypted, page.waitForSelector('h1')))
        return

    const userName = await page.$eval('h1', e => e.innerText)
    let userFollowers = await page.$$eval('.-nal3 .g47SY', e => e[1].title)
    userFollowers = userFollowers.replace(',', '')
    let today = new Date()
    today = dateFormat(today, "shortDate")

    let userInfo = [userName, userFollowers, userWhoLikedPicture, pictureToScrap, today, 1]

    if (await page.$('._9AhH0')) {
        userInfo.push('public')
        await page.click('._9AhH0')

        if (await catchErr(browser, crypted, page.waitForSelector('.fr66n .dCJp8.afkep._0mzm-')))
            return
        await page.waitFor(500)

        if (await page.$('.fr66n .dCJp8.afkep._0mzm- .glyphsSpriteHeart__outline__24__grey_9')) {
            await page.waitFor(500)
            await page.click('.fr66n .dCJp8.afkep._0mzm-')
            const timeWait = getRandomInt(12000, 50000)
            console.log(`=== ${crypted.login} --> Wait ${timeWait} before last like`)
            await page.waitFor(timeWait)
        }
    }
    else
        userInfo.push('private')


    const res = await actionGoogleSheet({browser: browser, crypted: crypted, userInfo: [userInfo]}, addUserToUsersAlreadyScrapped)
    if (res === 'err')
        return 'err'
}

module.exports = likeLastPictureUser