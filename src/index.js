const { xmlToJson } = require('./utils');
const fetch = require('isomorphic-fetch');
const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');

const source = fs.readFileSync(path.join(__dirname, './templates/html.hbs'), 'utf8');
const template = handlebars.compile(source);
const style = fs.readFileSync(path.join(__dirname, './templates/style.html'), 'utf8');

async function main() {
    let data;
    try {
        const offersXmlData = await fetch('https://5ce5787b3259e78e74b25a12--hutson.netlify.com/offers-rss.xml', {
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

    // fs.writeFileSync(path.join(__dirname, './out.html'), output);
}

main();