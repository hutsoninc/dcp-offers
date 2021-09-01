const puppeteer = require('puppeteer');
const clipboardy = require('clipboardy');

module.exports = async function uploadHtml(html) {
    const browser = await puppeteer.launch({
        headless: false,
        ignoreHTTPSErrors: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();

    clipboardy.writeSync(html);

    console.log('Copied HTML to clipboard');

    try {
        // Log in to DCP
        await page.goto('https://hutson.dealercustomerportal.com/Login');
        await page.waitFor(1000);
        await page.waitForSelector('#Input_Email');
        await page.type('#Input_Email', process.env.DCP_USER);
        await page.type('#Input_Password', process.env.DCP_PWD);
        await page.waitFor(500);
        await page.click('button[type=submit]');

        // Navigate to specials
        await page.waitForSelector('a[title="Homepage Manager"]');
        await page.click('a[title="Homepage Manager"]');

        await page.waitFor(2000);

        // Set up helper functions in window
        await page.evaluate(() => {
            window.clickSourceButton = function(i) {
                document
                    .querySelectorAll('button[title="Source Code"]')
                    .forEach((el, index) => {
                        if (index === i) {
                            el.click();
                        }
                    });
            };

            window.clickSaveButton = function(i) {
                document
                    .querySelectorAll('input[value=Update]')
                    .forEach((el, index) => {
                        if (i === index) {
                            el.click();
                        }
                    });
            };
        });

        // Change first editor to HTML source view
        await page.evaluate(() => {
            window.clickSourceButton(0);
        });

        await page.waitFor(1000);

        // Enter HTML into textarea
        await page.evaluate(html => {
            const el = document.querySelector('[data-id=ui-tinymce-1]');
            if (el) {
                el.value = html;
            }
        }, html);

        await page.waitFor(500);

        // Save
        await page.evaluate(() => {
            window.clickSaveButton(0);
        });

        await page.waitFor(2000);

        // Change second editor to HTML source view
        await page.evaluate(() => {
            window.clickSourceButton(1);
        });

        await page.waitFor(1000);

        // Enter HTML into textarea
        await page.evaluate(html => {
            const el = document.querySelector('[data-id=ui-tinymce-2]');
            if (el) {
                el.value = html;
            }
        }, html);

        await page.waitFor(500);

        // Save
        await page.evaluate(() => {
            window.clickSaveButton(1);
        });

        await page.waitFor(30000);
    } catch (error) {
        console.log(error);
        await browser.close();
        process.exit(1);
    }

    return;
};
