const puppeteer = require('puppeteer')
const dateFormat = require('dateformat')
const request = require('request')

const catchErr = require('./functionsGlobal/catchErr')
const actionGoogleSheet = require('./functionsSpreadSheet/connection')
const getNotifications = require('./functionsSpreadSheet/getNotifications')
const getUsersAlreadyScrapped = require('./functionsSpreadSheet/getUsersAlreadyScrapped')
const scrapAllNotifications = require('./functionsStoreNotifications/scrapAllNotifications')
const addNotificationsScrappedToNotifications = require('./functionsSpreadSheet/addNotificationsScrappedToNotifications')


const scriptStoreNotifications = async (browser, crypted) => {
    let page    
    
    if (browser.isConnected())
        page = await browser.newPage()

    if (browser.isConnected())
        await page.setViewport({ width: 1280, height: 800 })

    if (browser.isConnected())
        if (await catchErr(browser, crypted, page.goto('https://www.instagram.com/', {waitUntil: 'domcontentloaded'})))
            return

    if (browser.isConnected())
        await page.waitFor(5000)

    if (browser.isConnected())
        await page.waitForSelector('._0ZPOP.kIKUG')
    
    if (browser.isConnected())
        await page.click('._0ZPOP.kIKUG')

    if (browser.isConnected())
        await page.waitForSelector('.nCY9N')

    const notifsSpreadSheet = await actionGoogleSheet({browser: browser, crypted: crypted}, getNotifications)
    if (notifsSpreadSheet === 'err')
        return

    let lastNotif = notifsSpreadSheet[notifsSpreadSheet.length - 1]
    if (lastNotif && !lastNotif[3])
        lastNotif[3] = null

    const usersAlreadyScrapped = await actionGoogleSheet({browser: browser, crypted: crypted}, getUsersAlreadyScrapped)

    if (usersAlreadyScrapped === 'err')
        return

    const notifsScrapped = await scrapAllNotifications(browser, page, crypted, lastNotif, usersAlreadyScrapped)
    if (notifsScrapped === 'err' || !notifsScrapped)
        return
    console.log(notifsScrapped, `${crypted.login} --> ${notifsScrapped.length} new notifs`)

    if (notifsScrapped.length) {
        const res = await actionGoogleSheet({browser: browser, crypted: crypted, notifsScrapped: notifsScrapped}, addNotificationsScrappedToNotifications)
        if (res === 'err')
            return 'err'
    }

    if (browser.isConnected())
        await page.close()
}

module.exports = scriptStoreNotifications