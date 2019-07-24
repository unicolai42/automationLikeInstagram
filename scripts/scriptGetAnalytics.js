const actionGoogleSheet = require('./functionsSpreadSheet/connection')
const getPicturesAlreadyScrapped = require('./functionsSpreadSheet/getPicturesAlreadyScrapped')
const getUsersAlreadyScrapped = require('./functionsSpreadSheet/getUsersAlreadyScrapped')
const getNotifications = require('./functionsSpreadSheet/getNotifications')
const asyncForEach = require('./functionsGlobal/asyncForEach')
const updatePicturesAlreadyScrapped = require('./functionsSpreadSheet/updatePicturesAlreadyScrapped')
const {testCrypted, kefcesCrypted, michmichmochiCrypted} = require('../cryptedData')


const scriptGetAnalytics = async (crypted) => {
    const picturesAlreadyScrapped = await actionGoogleSheet({crypted: crypted}, getPicturesAlreadyScrapped)
    if (picturesAlreadyScrapped === 'err')
        return 'err'
    
    console.log(picturesAlreadyScrapped, 'picturesAlreadyScrapped')

    const usersAlreadyScrapped = await actionGoogleSheet({crypted: crypted}, getUsersAlreadyScrapped)
    if (usersAlreadyScrapped === 'err')
        return 'err'

    const notifications = await actionGoogleSheet({crypted: crypted}, getNotifications)
    if (notifications === 'err')
        return 'err'

    const res = await asyncForEach(picturesAlreadyScrapped, async (picture, i, array) => {
        const usersFromPicture = usersAlreadyScrapped.filter(user => user[3] === picture[1])
        console.log(usersFromPicture.length, 'usersFromPicture')
        const notificationsFromPicture = notifications.filter(notif => notif[5] === picture[1])
        console.log(notificationsFromPicture.length, 'notificationsFromPicture')

        if (await actionGoogleSheet({crypted: crypted, index: i+1, conversionDatas: [usersFromPicture.length, notificationsFromPicture.length]}, updatePicturesAlreadyScrapped) === 'err')
            return 'err'
    })
    if (res === 'err')
        return 'err' 
}

module.exports = scriptGetAnalytics
// scriptGetAnalytics(kefcesCrypted)