const puppeteer = require('puppeteer')
const manageError = require('./functionsGlobal/manageError')


const test = async () => {

    const browser = await puppeteer.launch({headless: false, args: ['--no-sandbox', '--disable-setuid-sandbox']})
    const page = await browser.newPage()
    await page.setViewport({ width: 1280, height: 800 })

    const a = 'a'
    const b = 'b'

    const test = await page.evaluate(async (a, b) => {
        return [a, b]
    }, a, b).catch( async (err) => manageError(browser, err))

    console.log(test)
}

test()