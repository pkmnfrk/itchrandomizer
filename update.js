const https = require('https');
const fs = require('fs');
const JSONL = require('json-literal');

const url = 'https://itch.io/bundle/520/games.json';

https.get(url, res => {
    let json = '';

    res.on('data', data => {
        json += data;
    })

    res.on('end', () => {
        json = json.replace(decodeURIComponent("%e2%80%a8"), ''); // the source json has a weird character that breaks things
        json = JSON.parse(json);
        json = JSONL.stringify(json);
        let js = `// sourced from ${url}\r\n\r\nconst games = ${json};\r\n\r\n export default games;`;
        fs.writeFileSync('games.js', js);
    });
})