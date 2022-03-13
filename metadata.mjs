import got from "got";
import fs from "fs";
import {parse} from "node-html-parser";

const blacklistedTags = [
    /5-dollars-or-less/,
    /15-dollars-or-less/,
    /featured/,
    /games$/,
    /game-assets$/,
    /tools$/,
    /free$/,
    /on-sale$/,
    /comics$/,
    /books$/,
    /soundtracks$/,
];

let cache = {};
let cacheSaveTimer = null;

try {
    const cacheText = fs.readFileSync("cache.json", "utf-8");
    cache = JSON.parse(cacheText);
} catch(e) {}

function isBlacklisted(tag) {
    for(const b of blacklistedTags) {
        if(b.test(tag)) return true;
    }
}

export async function fetchMetadata(url) {

    if(cache[url]) {
        return cache[url];
    }

    const result = {};

    try {

        const html = await got(url).text();

        const root = parse(html, {
            blockTextElements: {
                script: true,
            }
        });

        const scripts = root.querySelectorAll("script[type=\"application/ld+json\"]").map(e => JSON.parse(e.text));

        const breadcrumbList = scripts.filter(m => m["@type"] === "BreadcrumbList")[0];

        // console.log(breadcrumbList.itemListElement);

        if(breadcrumbList) {
            const tags = breadcrumbList.itemListElement.filter(t =>  !isBlacklisted(t.item["@id"]));
            result.tags = tags.map(t => t.item.name);
            result.tag_urls = tags.map(t => t.item["@id"]);
        }

        cache[url] = result;

        if(!cacheSaveTimer) {
            cacheSaveTimer = setTimeout(saveCache, 1000);
        }
    } catch(e) {
        console.error("Error fetching metadata for", url);
        console.error(e.code, e.message);
        if(e.message.indexOf("404")) {
            cache[url] = null;
        }
        return null;
    }

    return result;
}

function saveCache() {
    // not async to avoid multiple writes at once
    fs.writeFileSync("cache.json", JSON.stringify(cache, null, 4), "utf-8");
    cacheSaveTimer = null;
}
