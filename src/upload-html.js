const puppeteer = require('puppeteer');

module.exports = async function uploadHtml(html) {
    const browser = await puppeteer.launch({
        headless: false,
        ignoreHTTPSErrors: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();

    try {
        // Log in to DCP
        await page.goto('https://hutson.dealercustomerportal.com/Login');
        await page.waitFor(1000);
        await page.waitForSelector(
            '#p_lt_zonecontent_LogonForm_Login1_UserName'
        );
        await page.type(
            '#p_lt_zonecontent_LogonForm_Login1_UserName',
            process.env.DCP_USER
        );
        await page.type(
            '#p_lt_zonecontent_LogonForm_Login1_Password',
            process.env.DCP_PWD
        );
        await page.waitFor(500);
        await page.click('#p_lt_zonecontent_LogonForm_Login1_LoginButton');

        // Navigate to specials 
        await page.waitForSelector('a[title="Specials Manager"]');
        await page.click('a[title="Specials Manager"]');

        // Change editor to HTML source view
        await page.waitForSelector('#cke_13');
        await page.click('#cke_13');

        // Enter HTML into textarea
        await page.waitForSelector('#cke_1_contents textarea');
        await page.evaluate(html => {
            document.querySelector('#cke_1_contents textarea').value = html;
        }, html)

        await page.waitFor(500);

        // Save
        await page.click('input[type=submit]');
        await page.waitFor(3000);
    } catch (error) {
        console.log(error);
        await browser.close();
        process.exit(1);
    }

    return;
}