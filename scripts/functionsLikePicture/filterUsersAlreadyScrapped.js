const actionGoogleSheet = require('../functionsSpreadSheet/connection')
const getUsersAlreadyScrapped = require('../functionsSpreadSheet/getUsersAlreadyScrapped')
const asyncForEach = require('../functionsGlobal/asyncForEach')


const filterUsersAlreadyScrapped = async (browser, crypted, usersWhoLikedPicture, pictureToScrap) => {
    const usersAlreadyScrapped = await actionGoogleSheet({browser: browser, crypted: crypted}, getUsersAlreadyScrapped)
    if (usersAlreadyScrapped === 'err')
        return 'err'
    
    let usersWhoNeverLikedPicture = []
    let usersWhoAlreadyLikedPicture = []
    
    const res = await asyncForEach(usersWhoLikedPicture, async (userWhoLikedPicture, i, array) => {
        const userCheckedId = await usersAlreadyScrapped.findIndex((userAlreadyScrapped) => {
            return userWhoLikedPicture === userAlreadyScrapped[2]
        })
  
        if (userCheckedId !== -1) {
            console.log(usersAlreadyScrapped[userCheckedId][3], pictureToScrap)
            if (usersAlreadyScrapped[userCheckedId][3] !== pictureToScrap)
                usersWhoAlreadyLikedPicture.push({userChecked: usersAlreadyScrapped[userCheckedId], userCheckedId: userCheckedId})   
        }
        else
            usersWhoNeverLikedPicture.push(userWhoLikedPicture)
    })
    if (res)
        return 'err'
    else 
        return [usersWhoNeverLikedPicture, usersWhoAlreadyLikedPicture]
}

module.exports = filterUsersAlreadyScrapped