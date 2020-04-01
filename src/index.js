require('dotenv').config();
const fs = require('fs');
const path = require('path');
const fetch = require('isomorphic-fetch');
const handlebars = require('handlebars');
const inlineCss = require('inline-css');
const { delay, xmlToJson } = require('./utils');
const uploadHtml = require('./upload-html');

const freeShippingHtml = fs.readFileSync(
    path.join(__dirname, './templates/free-shipping.html'),
    'utf8'
);

const promoTemplateSource = fs.readFileSync(
    path.join(__dirname, './templates/promo.hbs'),
    'utf8'
);
const promoTemplate = handlebars.compile(promoTemplateSource);
const style = fs.readFileSync(
    path.join(__dirname, './templates/style.html'),
    'utf8'
);

async function main() {
    let data;
    try {
        console.log('Fetching offers RSS feed...');
        const offersXmlData = await fetch(
            'https://www.hutsoninc.com/offers-rss.xml',
            {
                method: 'GET',
            }
        ).then(res => res.text());
        data = await xmlToJson(offersXmlData);
    } catch (err) {
        console.log('Error fetching rss feed');
        console.log(err);
    }

    data = JSON.parse(data);

    let items = data.rss.channel[0].item;

    // Filter out by category
    let outputArr = [];

    items.forEach(item => {
        if (item.category.indexOf('parts') >= 0) {
            outputArr.push(item);
        }
    });

    // Sort by end date
    outputArr.sort((a, b) => {
        if (a.endDate < b.endDate) return -1;
        if (a.endDate > b.endDate) return 1;
        return null;
    });

    // Stringify HTML
    let html = '';

    // Add free shipping section
    html += freeShippingHtml;

    // Add offers
    outputArr.forEach(item => {
        let result = promoTemplate(item);
        html += result;
    });

    // Add global styles
    html += style;

    const inlinedHtml = await inlineCss(html, {
        preserveMediaQueries: true,
        url: '/',
    });

    // Upload
    console.log('Uploading to DCP...');
    await uploadHtml(inlinedHtml);

    await delay(60000);

    console.log('Done.');
    process.exit(0);
}

main();
