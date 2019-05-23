require('dotenv').config();
const fs = require('fs');
const path = require('path');
const fetch = require('isomorphic-fetch');
const handlebars = require('handlebars');
const { xmlToJson } = require('./utils');
const uploadHtml = require('./upload-html');

const source = fs.readFileSync(path.join(__dirname, './templates/html.hbs'), 'utf8');
const template = handlebars.compile(source);
const style = fs.readFileSync(path.join(__dirname, './templates/style.html'), 'utf8');

async function main() {
    let data;
    try {
        console.log('Fetching offers RSS feed...')
        const offersXmlData = await fetch('https://www.hutsoninc.com/offers-rss.xml', {
            method: 'GET'
        }).then(res => res.text());
        data = await xmlToJson(offersXmlData);
    } catch (err) {
        console.log('Error fetching rss feed');
        console.log(err);
    }

    data = JSON.parse(data);

    let items = data.rss.channel[0].item;

    let output = '';

    items.forEach(item => {
        if (item.category.indexOf('parts') >= 0) {
            let result = template(item);
            output += result;
        }
    });

    output += style;

    console.log('Uploading to DCP...');
    await uploadHtml(output);

    console.log('Done.');
    process.exit(0);
}

main();