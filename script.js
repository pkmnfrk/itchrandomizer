import allGames from './games.js';

const platforms = {
    windows: "Windows",
    osx: "OS X",
    linux: "Linux",
    other: "Other (pdf, image, etc)"
}

let games = null;

let game = null;



filterGames();

$(() => {
    $("#randomGame").click(e => {
        getRandomGame();
        setGame();
    });
    $("#bundle_url").val(localStorage.bundle_url);
    $("#bundle_url").on('change', () => {
        localStorage.bundle_url = getBundleUrl();
        setGame();
    });
    $("#windows,#osx,#linux,#other").on('change', () => {
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
    if($("#windows")[0].checked && game.platforms && game.platforms.indexOf("windows") !== -1) return true;
    if($("#osx")[0].checked && game.platforms && game.platforms.indexOf("osx") !== -1) return true;
    if($("#linux")[0].checked && game.platforms && game.platforms.indexOf("linux") !== -1) return true;
    if($("#other")[0].checked && !game.platforms) return true;
    return false;
}