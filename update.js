//const https = require('https');
const got = require("got");
const fs = require('fs');
const JSONL = require('json-literal');
const jsBeautify = require('js-beautify').js;

const urls = {
    '520': 'https://itch.io/bundle/520/games.json',
    '902': 'https://itch.io/bundle/902/games.json',
};

async function doStuff() {
    const games = {
        games: [],
        bundles: {
            "520": {
                id: "520",
                name: "Bundle for Racial Justice and Equality",
                url: "https://itch.io/b/520/bundle-for-racial-justice-and-equality",
                abbr: "RJE",
                color: "#808000",
            },
            "902": {
                id: "902",
                name: "Indie bundle for Palestinian Aid",
                url: "https://itch.io/b/902/indie-bundle-for-palestinian-aid",
                abbr: "PA",
                color: "#008000",
            }
        }
    };
    let attribution = "";

    for(const bundle_id of Object.keys(urls)) {
        attribution += `// Sourced from ${urls[bundle_id]}\r\n`;

        let json = await got(urls[bundle_id]).text();
        json = json.replace(decodeURIComponent("%e2%80%a8"), ''); // the source json has a weird character that breaks things

        const bundle = JSON.parse(json);
        bundle.games = bundle.games.map(g => {
            delete g.price;
            delete g.bundle_game;
            g.bundles = [bundle_id];
            return g;
        })

        for(const game of bundle.games) {
            let existing = games.games.filter((g) => g.id === game.id);

            if(existing.length > 1) {
                console.error("Warning, multiple games exist for id " + game.id);
            }

            if(existing.length) {
                existing[0].bundles.push(bundle_id);
            }
            else {
                games.games.push(game);
            }
        }
    }

    json = JSONL.stringify(games, null, 2);
    let js = `${attribution}\r\nconst games = ${json};\r\n\r\n export default games;`;
    js = jsBeautify(js, {
        indent_size: 4,
    });
    fs.writeFileSync('games.js', js);

    let firstBundle = 0;
    let firstExclusive = 0;
    let secondBundle = 0;
    let secondExclusive = 0;
    let bothBundles = 0;

    for(const game of games.games) {
        const first = game.bundles.indexOf("520") !== -1;
        const second = game.bundles.indexOf("902") !== -1
        if(first) {
            firstBundle += 1;
            if(!second) {
                firstExclusive += 1;
            }
        }
        if(second) {
            secondBundle += 1;
            if(!first) {
                secondExclusive += 1;
            }
        }
        if(first && second) {
            bothBundles += 1;
        }
    }

    console.log("Games in Racial bundle:", firstBundle, ", exclusive:", firstExclusive);
    console.log("Games in Palestine bundle:", secondBundle, ", exclusive:", secondExclusive);
    console.log("Games in both:", bothBundles);
}

doStuff().then(() => {
    console.log("Done");
}).catch((e) => {
    console.error(e);
})