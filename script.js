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
const classifications = {
    game: 'Video Games',
    physical_game: 'Physical Games',
    assets: 'Assets',
    book: 'Books',
    comic: 'Comics',
    soundtrack: 'Soundtracks',
    tool: 'Tools',
    other: 'Other',
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
    createPlatforms();
    createClassifications();

    $("#bundle_url").val(settings.bundleUrl);

    $("#randomGame").click(e => {
        getRandomGame();
        setGame();
    });
    $("#bundle_url").on('change', () => {
        settings.bundleUrl = getBundleUrl();
        saveSettings(settings);
        setGame();
    });
    $("#ignore").on('click', function() {
        toggleIgnore();
    });
    $("#ignoreFilter").on('change', function() {
        settings.ignoreFilter = this.checked;
        saveSettings(settings);
        filterGames();
    });
    $("#resetIgnored").on('click', function() {
        if(!confirm('Are you sure you want to clear your ignored item list?')) return;

        settings.played = [];
        saveSettings(settings);
        filterGames();
        setGame();
    });
    $(window).on('keypress', function(e) {
        switch(e.code) {
            case "KeyI":
                toggleIgnore();
                e.preventDefault();
                break;
            case "Space":
                getRandomGame();
                setGame();
                e.preventDefault();
                break;
        }
    })

    getRandomGame();
    setGame();
})

function toggleIgnore() {
    if(!game) return;
    if(settings.played.indexOf(game.id) !== -1) {
        settings.played.splice(settings.played.indexOf(game.id), 1);
    }
    else {
        settings.played.push(game.id);
    }
    saveSettings(settings);
    filterGames();
    setGame();
}

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
    let newGame;
    do {
        const i = Math.floor(Math.random() * games.length);
        newGame = games[i];
    } while(games.length > 1 && game === newGame);

    game = newGame;
}

function platform(game) {
    if(game.platforms) {
        return game.platforms.map(p => platforms[p]).join(', ');
    }
    return platforms.other;
}

function matchesFilter(game) {
    if(settings.ignoreFilter && settings.played.indexOf(game.id) !== -1) return false;
    let platformFilter = false;
    let classFilter = false;

    for(let platform of Object.keys(platforms).filter(p => settings[`plat_${p}`])) {
        if(platform === "other") {
            if(!game.platforms) platformFilter = true;
        }
        else {
            if(game.platforms && game.platforms.indexOf(platform) !== -1) platformFilter = true;
        }
    }
    for(let classification of Object.keys(classifications).filter(c => settings[`clas_${c}`])) {
        if(game.classification === classification) classFilter = true;
    }

    return platformFilter && classFilter;
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
    if(settings.clas_game === "undefined") {
        if(typeof settings.android === "undefined")
            settings.android = true;
        if(typeof settings.web === "undefined")
            settings.web = true;

        for(let platform in platforms) {
            if(settings[platform]) {
                settings[`plat_${platform}`] = true;
            }
            delete settings[platform];
        }

        for(let classification in classifications) {
            settings[`clas_${classification}`] = true;
        }
    }
    if(typeof settings.ignoreFilter === "undefined") {
        settings.ignoreFilter = true;
    }
}

function defaultSettings() {
    let ret = {
        bundleUrl: "",
        played: [],
    };
    for(let platform in platforms) {
        ret[`plat_${platform}`] = true;
    }
    for(let classification in classifications) {
        ret[`clas_${classification}`] = true;
    }
    return ret;
}

function createPlatforms() {
    for(let platform in platforms) {
        let id = `plat_${platform}`;
        let box = createCheckbox(id, platforms[platform]);
        $("#platforms_container").append(box);
        $("input", box)[0].checked = settings[id];
        $("input", box).on('change', function() {
            settings[id] = this.checked;
            saveSettings(settings);
            filterGames();
        });

    }
}

function createClassifications() {
    for(let classification in classifications) {
        let id = `clas_${classification}`;
        let box = createCheckbox(id, classifications[classification]);
        $("#classifications_container").append(box);
        $("input", box)[0].checked = settings[id];
        $("input", box).on('change', function() {
            settings[id] = this.checked;
            saveSettings(settings);
            filterGames();
        });
    }
}


function createCheckbox(id, text) {
    let div = document.createElement('li');
    div.className = 'form-check form-check-inline';
    let input = document.createElement('input');
    input.className = 'form-check-input';
    input.checked = true;
    input.id = id;
    input.type = 'checkbox';
    let label = document.createElement('label');
    label.htmlFor = id;
    label.className = 'form-check-label';
    label.innerText = text;
    div.appendChild(input);
    div.appendChild(label);
    return div;
}