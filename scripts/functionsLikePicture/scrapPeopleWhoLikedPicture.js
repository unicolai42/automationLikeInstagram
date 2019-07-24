const catchErr = require('../functionsGlobal/catchErr')
const manageError = require('../functionsGlobal/manageError')


const scrapPeopleWhoLikedPicture = async (browser, page, crypted, pictureToScrap) => {
    if (await catchErr(browser, crypted, page.goto(pictureToScrap, {waitUntil: 'domcontentloaded'})))
        return

    if (await catchErr(browser, crypted, page.waitForSelector('a.zV_Nj')))
        return

    await page.click('a.zV_Nj') 

    await page.waitFor(2000)

    if (await catchErr(browser, crypted, page.waitForSelector('.pbNvD .Igw0E div')))
        return

    const usersWhoLikePicture = await page.evaluate(async div => {
        let usersWhoLikePicture = []
        let scroll = -1
        function timeout(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }

        while (document.querySelector(div).scrollTop !== scroll) {
            scroll = document.querySelector(div).scrollTop
            const listUsersToScrap = document.querySelectorAll('.pbNvD .Igw0E div > div > .Igw0E.HVWg4 a:not([class])')
            for (let i = 0; i < listUsersToScrap.length; i++) {
                const userCheckedId = await usersWhoLikePicture.findIndex((userWhoLikePicture) => {
                    return userWhoLikePicture === listUsersToScrap[i].href;
                })

                if (userCheckedId === -1)
                    usersWhoLikePicture.push(listUsersToScrap[i].href)
            }

            document.querySelector(div).scrollTop += 300                                                         
            await timeout(500)
            document.querySelector(div).scrollTop -= 10;
            await timeout(500)
            document.querySelector(div).scrollTop += 300;
            await timeout(500)
        }
        if (!usersWhoLikePicture)
            return 'err'

        return usersWhoLikePicture
    }, '.pbNvD .Igw0E div').catch( async (err) => manageError(browser, crypted, err))

    if (!usersWhoLikePicture)
        return 'err'
    return usersWhoLikePicture
}

module.exports = scrapPeopleWhoLikedPicture