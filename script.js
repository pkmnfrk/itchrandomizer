import allGames from './games.js';

const platforms = {
    windows: "Windows",
    osx: "OS X",
    linux: "Linux",
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
    $("#windows,#osx,#linux,#other").on('change', function() {
        settings[this.id] = this.checked;
        saveSettings(settings);
        filterGames();
    });
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
    if(settings.windows && game.platforms && game.platforms.indexOf("windows") !== -1) return true;
    if(settings.osx && game.platforms && game.platforms.indexOf("osx") !== -1) return true;
    if(settings.linux && game.platforms && game.platforms.indexOf("linux") !== -1) return true;
    if(settings.other && !game.platforms) return true;
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
