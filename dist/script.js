import allGames from './games.js';

const games = allGames.games;

let game = null;

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
})

function getBundleUrl() {
    return $("#bundle_url").val();
}

function setGame() {
    if(!game) return;

    $("#game").show();
    $("#title").text(game.title);
    $("#cover").attr("src", game.cover);
    $("#shorttext").text(game.short_text);
    $("#store").attr("href", game.url);

    let bundleUrl = getBundleUrl();
    if(bundleUrl) {
        bundleUrl += "?search=" + encodeURIComponent(game.title);
        $("#download").attr('href', bundleUrl);
        $("#download_container").show();
    }
}

function getRandomGame() {
    const i = Math.floor(Math.random() * games.length);
    game = games[i];
}