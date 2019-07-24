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
const filterUsersAlreadyScrapped = require('./functionsLikePicture/filterUsersAlreadyScrapped')
const likeLastPictureUser = require('./functionsLikePicture/likeLastPictureUser')
const updateNumberCommentUserWhoAlreadySubscribe = require('./functionsSpreadSheet/updateNumberCommentUserWhoAlreadySubscribe')
const delay = require('./functionsGlobal/delay')
const clearFirstLinkToPicturesToScrap = require('./functionsSpreadSheet/clearFirstLinkToPicturesToScrap')
const addLinkToPicturesAlreadyScrapped = require('./functionsSpreadSheet/addLinkToPicturesAlreadyScrapped')
const scriptGetAnalytics = require('./scriptGetAnalytics')
const {testCrypted, kefcesCrypted, michmichmochiCrypted, ugonicolaiCrypted, alicehrmtteCrypted} = require('../cryptedData')


const scriptLikePicture = async (crypted) => {
    let now = new Date()
    now = dateFormat(now)
    console.log('-----------------------------------------------------------------------')
    console.log(`=== ${crypted.login} --> Start ${now} ===`)

    const oldProxyUrl = `http://${crypted.proxy}`
    const newProxyUrl = await proxyChain.anonymizeProxy(oldProxyUrl);

    const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox', `--proxy-server=${newProxyUrl}`]})
    // const browser = await puppeteer.launch({headless: false, args: ['--no-sandbox', '--disable-setuid-sandbox']})

    const page = await browser.newPage()
    await page.setViewport({ width: 1280, height: 800 })

    if (await catchErr(browser, crypted, page.goto('https://www.iplocation.net/', {waitUntil: 'domcontentloaded'})))
        return

    const ip = await page.$eval('div > p > span', e => e.innerText)

    console.log(`IP from ${crypted.login} : ${ip}`)

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

    // const storeNotificationsEvery10m = setInterval(storeNotifications, 600000, browser, crypted)

    const picturesToScrapArray = await actionGoogleSheet({browser: browser, crypted: crypted}, getPicturesToScrap)

    if (picturesToScrapArray === 'err')
        return
    else if (!picturesToScrapArray)
        await page.waitFor(15000)

    let picturesToScrap = []

    await asyncForEach(picturesToScrapArray, async (pictureToScrap, i, array) => {
        picturesToScrap.push(pictureToScrap[0])
    })

    console.log(`${picturesToScrap.length} pictures to scrap from ${crypted.login} --> ${picturesToScrap}`)

    const res = await asyncForEachUntilReturnTrue(picturesToScrap, async (pictureToScrap, i, array) => {
        const usersWhoLikedPicture = await scrapPeopleWhoLikedPicture(browser, page, crypted, pictureToScrap)

        if (usersWhoLikedPicture === 'err')
            return 'err'

        const userName = await page.$eval('a.FPmhX.notranslate.nJAzx', e => e.title)
        // let likes = await page.$eval('a.zV_Nj > span', e => e.innerText)
        // likes = likes.replace(',', '')
        const usersFiltered = await filterUsersAlreadyScrapped(browser, crypted, usersWhoLikedPicture, pictureToScrap)
        if (usersFiltered === 'err')
            return 'err'

        const usersWhoLikedPictureAndNeverScrapped = usersFiltered[0]
        const usersWhoLikedPictureAndAlreadyScrapped = usersFiltered[1]

        const res2 = asyncForEach(usersWhoLikedPictureAndAlreadyScrapped, async (user, i, array) => {
            delay(3000)
            const res = await actionGoogleSheet({browser: browser, crypted: crypted, userChecked: user.userChecked, userCheckedId: user.userCheckedId}, updateNumberCommentUserWhoAlreadySubscribe)
            if (res === 'err')
                return 'err'  

            console.log(`${crypted.login} --> ${user.userChecked[0]} commented already ${parseInt(user.userChecked[4], 10) + 1} videos. (Nb followers: ${user.userChecked[1]})`)               
        })
        if (res2 === 'err')
            return 'err' 
        

        const res = await asyncForEach(usersWhoLikedPictureAndNeverScrapped, async (userWhoLikedPicture, i, array) => {
            const res = await likeLastPictureUser(browser, page, crypted, userWhoLikedPicture, pictureToScrap)
            if (res === 'err')
                return 'err'
            console.log(`${crypted.login} --> ${i+1}/${array.length} ✓ (${userWhoLikedPicture})`)         
        })
        if (res === 'err')
            return 'err'
        
        if (await actionGoogleSheet({browser: browser, crypted: crypted, link: pictureToScrap}, clearFirstLinkToPicturesToScrap) === 'err')
            return 'err'

        const pictureScrapped = [userName, pictureToScrap, usersWhoLikedPictureAndNeverScrapped.length]
        if (await actionGoogleSheet({browser: browser, crypted: crypted, picture: pictureScrapped}, addLinkToPicturesAlreadyScrapped) === 'err')
            return 'err'

        await storeNotifications(browser, crypted)

        scriptGetAnalytics(crypted)        
    })

    if (res === 'err')
        return

    // clearInterval(storeNotificationsEvery10m)

    await setTimeout(() => {
        const url = `https://hooks.slack.com/services/${crypted.slackChannel}`
        const text = `=== Finish : No more picture to scrap for ${crypted.login} ✓`
        request.post(
        {
            headers : { 'Content-type' : 'application/json' },
            url,
            form : {payload: JSON.stringify({ text } )}
        }, (error, res, body) => console.log(`${crypted.login} --> Slack answer: ${error} ${body}`))
        browser.close()
        now = new Date()
        now = dateFormat(now)
        console.log(`=== ${crypted.login} --> Finish ${now}`)
        console.log('-----------------------------------------------------------------------')
    }, 2000)

    // if (wordsToTarget.length)
    //     console.log(wordsToTarget[0])
    // else
    //     console.log('no more words to target')

    // await asyncForEachUntilReturnTrue(wordsToTarget, async (wordToTarget, i, array) => {
    //     if (await catchErr(browser, crypted, await page.type('input.XTCLo', wordToTarget, {delay: 100})))
    //         return

    //     if (await catchErr(browser, crypted, await page.waitForSelector('a.yCE8d')))
    //         return

    //     const hrefSearchResults = await page.evaluate(() => {
    //         return Array.from(document.querySelectorAll('a.yCE8d')).map(elem => {return elem.href})
    //     })

    //     const cityId = await hrefSearchResults.findIndex((e) => {
    //         return e.includes('explore/locations')
    //     })

    //     console.log(cityId, hrefSearchResults[cityId])

    //     if (await catchErr(browser, crypted, page.goto(hrefSearchResults[cityId], {waitUntil: 'domcontentloaded'})))
    //         return
    // })
}

// module.exports = scriptLikePicture
scriptLikePicture(michmichmochiCrypted)
scriptLikePicture(ugonicolaiCrypted)
scriptLikePicture(alicehrmtteCrypted)
