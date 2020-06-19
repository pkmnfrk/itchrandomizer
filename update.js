const https = require('https');
const fs = require('fs');
const JSONL = require('json-literal');
const jsBeautify = require('js-beautify').js;

const url = 'https://itch.io/bundle/520/games.json';

https.get(url, res => {
    let json = '';

    res.on('data', data => {
        json += data;
    })

    res.on('end', () => {
        json = json.replace(decodeURIComponent("%e2%80%a8"), ''); // the source json has a weird character that breaks things
        bundle = JSON.parse(json);
        bundle.games = bundle.games.map(g => {
            delete g.price;
            delete g.bundle_game;
            return g;
        })
        json = JSONL.stringify(bundle, null, 2);
        let js = `// sourced from ${url}\r\n\r\nconst games = ${json};\r\n\r\n export default games;`;
        js = jsBeautify(js);
        fs.writeFileSync('games.js', js);
    });
})