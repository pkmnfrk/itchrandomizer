import allGames from './games.js';

//console.log(allGames.games.length);


let allPlatforms = {};
for(let game of allGames.games) {
    if(!game.platforms) continue;
   
    for(let platform of game.platforms) {
        if(!allPlatforms[platform]) {
            allPlatforms[platform] = 0;
        }
        allPlatforms[platform]++;
    }
}

const platforms = {
    windows: "Windows",
    osx: "OS X",
    linux: "Linux",
    android: "Android",
    web: "Web",
    other: "Other (pdf, image, etc)"
}

let games = null;

let game = null;

let settings = loadSettings();

if(!settings) {
    //sanity check
    settings = defaultSettings();
    saveSettings(settings);
}

filterGames();

$(() => {
    $("#bundle_url").val(settings.bundleUrl);
    $("#windows")[0].checked = settings.windows;
    $("#osx")[0].checked = settings.osx;
    $("#linux")[0].checked = settings.linux;
    $("#android")[0].checked = settings.android;
    $("#web")[0].checked = settings.web;
    $("#other")[0].checked = settings.other;

    $("#randomGame").click(e => {
        getRandomGame();
        setGame();
    });
    $("#bundle_url").on('change', () => {
        settings.bundleUrl = getBundleUrl();
        saveSettings(settings);
        setGame();
    });
    $('#' + Object.keys(allPlatforms).join(",#") + ',#other').on('change', function() {
        settings[this.id] = this.checked;
        saveSettings(settings);
        filterGames();
    });
    $("#ignore").on('click', function() {
        if(!game) return;
        if(settings.played.indexOf(game.id) !== -1) {
            settings.played.splice(settings.played.indexOf(game.id), 1);
        }
        else {
            settings.played.push(game.id);
        }
        saveSettings(settings);
        setGame();
        filterGames();
    });
    $("#ignoreFilter").on('change', function() {
        settings.ignoreFilter = this.checked;
        saveSettings(settings);
        filterGames();
    })
    $("#resetIgnored").on('click', function() {
        if(!confirm('Are you sure you want to clear your ignored item list?')) return;

        settings.played = [];
        saveSettings(settings);
        filterGames();
        setGame();
    })
})

function getBundleUrl() {
    return $("#bundle_url").val();
}

function setGame() {
    if(!game) return;

    $("#game").show();
    $("#title").text(game.title || "no title provided");
    $("#cover").attr("src", game.cover || "https://placekitten.com/300/240");
    $("#shorttext").text(game.short_text || "");
    $("#store").attr("href", game.url || "");
    $("#author").attr("href", game.user.url || "");
    $("#author").text(game.user.name || "");
    $("#platforms").text(platform(game));
    
    if(settings.played.indexOf(game.id) !== -1) {
        $("#ignore").removeClass('btn-secondary').addClass('btn-success').text("Ignored");
    }
    else {
        $("#ignore").removeClass('btn-success').addClass('btn-secondary').text("Ignore");
    }

    let bundleUrl = getBundleUrl();
    if(bundleUrl) {
        bundleUrl += "?search=" + encodeURIComponent(game.title);
        $("#download").attr('href', bundleUrl);
        $("#download_container").show();
    }
}

function filterGames() {
    games = allGames.games.filter(matchesFilter);
    $("#numgames").text(games.length);
}

function getRandomGame() {
    const i = Math.floor(Math.random() * games.length);
    game = games[i];
}

function platform(game) {
    if(game.platforms) {
        return game.platforms.map(p => platforms[p]).join(', ');
    }
    return platforms.other;
}

function matchesFilter(game) {
    if(settings.ignoreFilter && settings.played.indexOf(game.id) !== -1) return false;
    if(settings.windows && game.platforms && game.platforms.indexOf("windows") !== -1) return true;
    if(settings.osx && game.platforms && game.platforms.indexOf("osx") !== -1) return true;
    if(settings.linux && game.platforms && game.platforms.indexOf("linux") !== -1) return true;
    if(settings.android && game.platforms && game.platforms.indexOf("android") !== -1) return true;
    if(settings.web && game.platforms && game.platforms.indexOf("web") !== -1) return true;
    if(settings.other && (!game.platforms || !game.platforms.length)) return true;
    return false;
}

function loadSettings() {
    var settings = localStorage.itchRandomizerSettings;
    if(settings) {
        settings = JSON.parse(settings);
        migrateSettings(settings);
        saveSettings(settings);
        return settings;
    }

    settings = localStorage.bundle_url;
    if(settings) {
        settings = {
            ...defaultSettings(),
            bundleUrl: settings
        };
        delete localStorage.bundle_url;
        saveSettings(settings);
        return settings;
    }

    return defaultSettings();
}

function saveSettings(settings) {
    settings = JSON.stringify(settings);
    localStorage.itchRandomizerSettings = settings;
}

function migrateSettings(settings) {
    if(!settings.played) {
        settings.played = [];
    }
    if(typeof settings.android === "undefined")
        settings.android = true;
    if(typeof settings.web === "undefined")
        settings.web = true;
}

function defaultSettings() {
    return {
        bundleUrl: "",
        windows: true,
        osx: true,
        linux: true,
        other: true,
        played: [],
    };
}
