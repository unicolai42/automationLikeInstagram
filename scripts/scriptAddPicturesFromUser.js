const puppeteer = require('puppeteer')
const dateFormat = require('dateformat')
const request = require('request')
const proxyChain = require('proxy-chain')

const catchErr = require('./functionsGlobal/catchErr')
const signIn = require('./functionsLikePicture/signIn')
const bypassSecurity = require('./functionsLikePicture/bypassSecurity')
const storeNotifications = require('./scriptStoreNotifications')
const actionGoogleSheet = require('./functionsSpreadSheet/connection')
const getPicturesToScrap = require('./functionsSpreadSheet/getPicturesToScrap')
const asyncForEach = require('./functionsGlobal/asyncForEach')
const asyncForEachUntilReturnTrue = require('./functionsGlobal/asyncForEachUntilReturnTrue')
const scrapPeopleWhoLikedPicture = require('./functionsLikePicture/scrapPeopleWhoLikedPicture')
const delay = require('./functionsGlobal/delay')
const {testCrypted, kefcesCrypted, michmichmochiCrypted, lauralazio75Crypted} = require('../cryptedData')


const scriptAddPicturesFromUser = async (crypted) => {
    let now = new Date()
    now = dateFormat(now)
    console.log('-----------------------------------------------------------------------')
    console.log(`=== ${crypted.login} --> Start ${now} ===`)


    const browser = await puppeteer.launch({headless: false, args: ['--no-sandbox', '--disable-setuid-sandbox']})
    const page = await browser.newPage()
    await page.setViewport({ width: 1280, height: 800 })


    if (await catchErr(browser, crypted, page.goto('https://www.instagram.com/', {waitUntil: 'domcontentloaded'})))
        return

    await signIn(browser, page, crypted)

    await page.waitFor(5000)

    if (await page.$('._5f5mN.jIbKX.KUBKM.yZn4P'))
        await bypassSecurity(browser, page, crypted)

    await page.waitFor(5000)

    if (await page.$('button.HoLwm'))
        if (await catchErr(browser, crypted, page.click('button.HoLwm')))
            return 

    if (await catchErr(browser, crypted, page.goto('https://www.instagram.com/ugo.nicolai', {waitUntil: 'domcontentloaded'})))
        return

        const notifsScrapped = await page.evaluate(async (div, lastNotif, usersAlreadyScrapped) => {
            let notifsScrapped = []
            let scroll = -1
            let lastNotifReached = false
            function timeout(ms) {
                return new Promise(resolve => setTimeout(resolve, ms));
            }

            while (document.querySelector(div).scrollTop !== scroll && !lastNotifReached) {
                scroll = document.querySelector(div).scrollTop
                const listNotifsToScrap = document.querySelectorAll('.PUHRj.H_sJK')
                
                for (let i = 0; i < listNotifsToScrap.length; i++) {
                    const getType = listNotifsToScrap[i].querySelector('.YFq-A').innerText
                    const name = listNotifsToScrap[i].querySelector('a.FPmhX').title
                    const link = listNotifsToScrap[i].querySelector('a.FPmhX').href
                    const type = (getType.includes('like')) ? 'like' : (getType.includes('comment')) ? 'comment' :
                    (getType.includes('follow')) ? 'follow' : 'identification'
                    const picture = (listNotifsToScrap[i].querySelector('.iTMfC > a')) ? listNotifsToScrap[i].querySelector('.iTMfC > a').href : null
                    const timeCode = listNotifsToScrap[i].querySelector('.HsXaJ').dateTime

                    if (lastNotif && lastNotif[0] === name && lastNotif[1] === link &&
                    lastNotif[2] === type && lastNotif[3] === picture && lastNotif[4] === timeCode) {
                        i = listNotifsToScrap.length
                        lastNotifReached = true
                    }
                    else {
                        let pictureFrom
                        const userFound = usersAlreadyScrapped.find(user => user[2] === link)
                        if (userFound)
                            pictureFrom = userFound[3]
                        else
                            pictureFrom = null
                        
                        if (!notifsScrapped.find(notif => notif[1] === link && notif[2] === type && notif[3] === picture && notif[4] === timeCode))
                            notifsScrapped.push([name, link, type,  picture, timeCode, pictureFrom])
                    }
                }

                document.querySelector(div).scrollTop += 300                                                         
                await timeout(500)
                document.querySelector(div).scrollTop -= 10;
                await timeout(500)
                document.querySelector(div).scrollTop += 300;
                await timeout(500)
            }
            if (!notifsScrapped)
                return 'err'

            return notifsScrapped.reverse()
        }, '.nCY9N', lastNotif, usersAlreadyScrapped).catch( async (err) => manageError(browser, crypted, err))
}

// module.exports = scriptAddPicturesFromUser
scriptAddPicturesFromUser(lauralazio75Crypted)