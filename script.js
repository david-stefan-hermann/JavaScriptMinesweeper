
// game logic
let fieldHeight;
let fieldWidth;
let tilesY;
let tilesX;

let numberOfMines;

let mineArray;

let tileSize = 60;

function getDimensions() {
    // get size of mine field
    fieldHeight = document.getElementById("mine-field").clientHeight;
    fieldWidth = document.getElementById("mine-field").clientWidth;
    tilesY = Math.floor(fieldHeight / tileSize);
    tilesX = Math.floor(fieldWidth / tileSize);
    document.getElementById("inner-mine-field").style.height = tilesY * tileSize;
    document.getElementById("inner-mine-field").style.width = tilesX * tileSize;

    numberOfMines = Math.floor((tilesX * tilesY) / difficulty);
}

function initializeList() {
    let returnArray = [];
    for (let i = 0; i < tilesY; i++) {
        let row = [];
        for (let j = 0; j < tilesX; j++) {
            row.push(0);
        }
        returnArray.push(row);
    }
    mineArray = returnArray;
}

function calculateMinePositions(i, j) {
    console.log(">>>>>" + numberOfMines);
    
    for(let i = 0; i < numberOfMines; i++) {
        let randomX = Math.floor(Math.random() * tilesX);
        let randomY = Math.floor(Math.random() * tilesY);
        
        mineArray[randomY][randomX] = -1;
        // console.log("mine: " + i + "/" + numberOfMines + ": " + randomY + ", " + randomX);
        // console.log("arr x, y: " + mineArray[0].length + " " + mineArray.length + ", x, y: " + randomX + " " + randomY);
    }

    // clear adjacent tiles of mines
    for (let y = i - 1; y <= i + 1; y++) {
        for (let x = j - 1; x <= j + 1; x++) {
            if ((y >= 0 && x >= 0) && (y < tilesY && x < tilesX)) {
                // position is valid
                if (mineArray[y][x] == -1) {numberOfMines--;}

                mineArray[y][x] = 0;
            }
        }
    }
    console.log(">>>>>" + numberOfMines);
    minesInitialized = true;
}

function getActualMineNumber() {
    numberOfMines = 0;
    for (let i = 0; i < tilesY; i++) {
        // loop rows
        for (let j = 0; j < tilesX; j++) {
            // loop tiles in row
            if (mineArray[i][j] == -1) {
               numberOfMines++;
            }
        }
    }

    console.log(">>>>>>" + numberOfMines);
}

function calculateDistances() {
    for (let i = 0; i < tilesY; i++) {
        // loop rows
        for (let j = 0; j < tilesX; j++) {
            // loop tiles in row
            if (mineArray[i][j] != -1) {
                // field is not a mine
                //console.log(">> " + i + "-" + j + " not a mine (" + mineArray[i][j] + ")");
                let mineCount = 0;
                //console.log("checking..")
                // check surrounding
                for (let y = i - 1; y <= i + 1; y++) {
                    //console.log("check " + y);
                    for (let x = j - 1; x <= j + 1; x++) {
                        //console.log("check " + x);
                        if((y >= 0 && x >= 0) && (y < tilesY && x < tilesX)) {
                            // position is valid
                            if(mineArray[y][x] == -1) {
                                // checked field is a mine
                                mineCount++;
                            }
                        }
                    }
                }
                // mines are counted
                mineArray[i][j] = mineCount;
            }
        }
    }
}

// Drawing
function drawTiles() {
    let tempMineField = "";
    for (let i = 0; i < tilesY; i++) {
        // columns
        tempMineField += "<div class='mf-row'>";
        for (let j = 0; j < tilesX; j++) {
            //rows

            let value = mineArray[i][j];
            
            let extraClass = "";
            if (value == -1)
                extraClass = "mf--1";

            tempMineField += "<div id='mf-field-" + i + "-" + j + "' class='mf-field " + extraClass + "' onclick='callUncoverTile(" + i + ", " + j + ")' oncontextmenu='event.preventDefault();'>" + " " + "</div>";
        }
        tempMineField += "</div>";
    }

    // append fields
    document.getElementById("inner-mine-field").innerHTML = tempMineField;
}

function callUncoverTile(y, x) {
    if(currentState == "gameover") {
        return;
    }
    if(!minesInitialized) {
        // mine array empty
        calculateMinePositions(y, x);
        getActualMineNumber();
        calculateDistances();
    }
    playSound(sounds.tap);

    uncoverTile(y, x);
}

function uncoverTile(y, x) {
    // index out of bounds
    if(y < 0 || x < 0 || x >= tilesX || y >= tilesY) {
        return;
    }

    let value = mineArray[y][x];

    // already checked
    if(value == 9) {
        return;
    }

    let elem = document.getElementById("mf-field-" + y + "-" + x);

    // skip if flag
    if (elem.classList.contains("mf-flag")) {
        return;
    }

    // uncover this tile
    if(value != 0 && value != -1) {
        elem.innerHTML = value;
    }
    elem.classList.add("hide-pseudo");
    elem.onclick = null;
    uncoveredTiles.add((10000 * (y+1)) + x);

    // check for mine
    if(mineArray[y][x] == -1) {
        // uncovered mine
        gameOver(y, x);
        return;
    } else {
        // check if won
        checkWin();
    }

    if(value == 0) {
        mineArray[y][x] = 9;
        // uncover adjacent fields
        uncoverTile(y - 1, x - 1);
        uncoverTile(y - 1, x);
        uncoverTile(y - 1, x + 1);

        uncoverTile(y, x - 1);
        uncoverTile(y, x + 1);

        uncoverTile(y + 1, x - 1);
        uncoverTile(y + 1, x);
        uncoverTile(y + 1, x + 1);
        return;
    }
}

function setFlag(elem) {
    // flag    
    console.log("setting flag");
    if(elem.classList.contains("mf-flag")) {
        // remove flag
        elem.classList.remove("mf-flag");
    } else {
        elem.classList.add("mf-flag");
    }
    return;
}

async function uncoverMines(y = -1, x = -1) {
    if(y != -1 && x != -1) {
        let elem = document.getElementById("mf-field-" + y + "-" + x);
        elem.classList.add("hide-pseudo");
        elem.style.backgroundImage = "url(" + uncoveredMineTexture + ")";
    }

    let minePositions = [];

    // get mines
    for (let i = 0; i < tilesY; i++) {
        for (let j = 0; j < tilesX; j++) {
            if((mineArray[i][j] == -1) && (i!=y || j!=x)) {
                minePositions.push([i, j]);
            }
        }
    }

    // uncover mines
    let shuffledMinePositions = minePositions.sort((a, b) => 0.5 - Math.random());

    let texture = 0;
    let sleepTime = 100;

    for (let i = 0; i < shuffledMinePositions.length; i++) {
        if (currentState == "playing") {
            // abort uncovering
            return;
        }

        let elem = document.getElementById("mf-field-" + shuffledMinePositions[i][0] + "-" + shuffledMinePositions[i][1]);
        elem.classList.add("hide-pseudo");
        
        elem.style.backgroundImage = "url(" + mineTextures[texture] + ")";
        texture ++;

        if(texture >= mineTextures.length) {
            texture = 0;
        }

        
        if(sleepTime <= 30) { sleepTime == 30; }
        if(i % 3 == 0) {
            playSound(sounds.food);
            await sleep(sleepTime);
        }
        sleepTime--;
    }
}

let uncoveredTiles = new Set();
function checkWin() {
    //console.log("ut: " + uncoveredTiles.size + " / " + ((tilesX * tilesY) - numberOfMines));
    
    if(uncoveredTiles.size == ((tilesX * tilesY) - numberOfMines)) {
        console.log("win!");
        currentState = "win";
        uncoverMines();
    }
}

// Starting game
let minesInitialized = false;
function newGame() {
    currentState = "gameover";
    uncoveredTiles = new Set();
    // hide menu
    if(showMenu)
        toggleMenu();

    minesInitialized = false;
    currentState = "playing";
    playSound(sounds.music, true);

    
    getDimensions();
    initializeList();
    drawTiles();
}

function gameOver(y, x) {

    currentState = "gameover";
    playSound(sounds.go_music, true);
    console.log("game over!");

    uncoverMines(y, x);
}

let showNgMenu = false;
function chooseDifficulty() {

    let ngMenu = document.getElementById("ng-menu");

    playSound(sounds.pause);

    showNgMenu = !showNgMenu;

    if(showNgMenu) {
        document.getElementById("state-message").innerHTML = gameStateMessage[currentState];
        ngMenu.classList.remove("hide-elem");
        
        return;
    }

    ngMenu.classList.add("hide-elem");
}






//#region New Game Menu


let difficultyButtons = document.getElementsByClassName("difficulty-button");

function disableButtons () {
    Array.prototype.forEach.call(difficultyButtons, e => {
        e.classList.remove("button-active");
    });
}

Array.prototype.forEach.call(difficultyButtons, e => {
    e.addEventListener("click", e => {
        difficulty = e.target.value;
        if(e.target.classList.contains("button-active")) {
            // do something
            return;
        } else {
            disableButtons();
            e.target.classList.add("button-active");
        }
        console.log("difficulty: " + difficulty);
    });
});

// set normal difficulty as default
let difficulty = 5;
document.getElementById("difficulty-2").classList.add("button-active");

//#endregion

//#region UI and other


// "mines"
const mineTextures = [
    "img/icons8-atomic-bomb-96.png",
    "img/icons8-bomb-96.png",
    "img/icons8-dynamite-96.png",
    "img/icons8-grenade-96.png",
    "img/icons8-incendiary-grenade-96.png",
    "img/icons8-missile-96.png",
    "img/icons8-missile-base-96.png",
    "img/icons8-naval-mine-96.png",
    "img/icons8-radioactive-96.png",
    "img/icons8-power-plant-96.png",
]

const uncoveredMineTexture = "img/icons8-mushroom-cloud-96.png";


// sounds
const sounds = {
    newgame: new Audio("music/mixkit-new-game.wav"),
    food: new Audio("music/mixkit-food.wav"),
    gameover: new Audio("music/mixkit-game-over.wav"),
    pause: new Audio("music/mixkit-pause.wav"),
    tap: new Audio("music/mixkit-food.wav"),
    music: new Audio("music/2019-12-09_-_Retro_Forest_-_David_Fesliyan.mp3"),
    menu_music: new Audio("music/2019-01-02_-_8_Bit_Menu_-_David_Renda_-_FesliyanStudios.com.mp3"),
    go_music: new Audio("music/Slower-Tempo-2020-03-22_-_8_Bit_Surf_-_FesliyanStudios.com_-_David_Renda.mp3"),
}

// 0: playing, 1: gameover, 2: win
let currentState = "";

const gameStateMessage = {
    playing: "still in game..",
    gameover: "you've lost.",
    win: "You Won!",
    justloaded: "Start a game!"
}

let volume = 0.5;
let musicVolume = volume * 0.5;
let currentMusicVolume = musicVolume;

let currentMusic;

function playSound(sound, loop=false, mult=1) {
    let thisVolume = currentMusicVolume;
    if(!loop) {
        // not playing music
        if(soundsMuted) {
            return;
        }
        thisVolume = volume;
    }
    const s = sound.cloneNode(true);
    s.volume = thisVolume * mult;
    if (thisVolume >= 1.5) { thisVolume = 1; }
    if (loop) { 
        // playing music
        s.loop = true;
        if(currentMusic) {
            currentMusic.pause();
            currentMusic.remove();
        }
        currentMusic = s;
    }
    s.play();
}

let showMenu = false;
function toggleMenu() {

    playSound(sounds.pause);
    console.log(showMenu);
    showMenu = !showMenu;

    if(showMenu) {
        soundToPlay = sounds.menu_music;
        document.getElementById("state-message").innerHTML = gameStateMessage[currentState];
        document.getElementById("menu").classList.remove("hide-elem");
        if(currentState != "gameover") { playSound(sounds.menu_music, true); }
        return;
    }
    
    if(currentState == "playing") { playSound(sounds.music, true); }

    document.getElementById("menu").classList.add("hide-elem");
}

// add event listener to sound muting
let soundsMuted = false;
document.getElementById("mute-sounds").addEventListener("click", (e) => {
    soundsMuted = !soundsMuted;
    playSound(sounds.tap);

    if(soundsMuted) {
        e.target.classList.remove("button-active");
        return;
    }
    e.target.classList.add("button-active");
});

// add event listener to music muting
let musicMuted = false;
document.getElementById("mute-music").addEventListener("click", (e) => {
    musicMuted = !musicMuted;
    playSound(sounds.tap);

    updateMusicVolume();

    if(musicMuted) {
        e.target.classList.remove("button-active");
        return;
    }
    e.target.classList.add("button-active");
});

function updateMusicVolume() {
    if(musicMuted) {
        currentMusicVolume = 0;
        currentMusic.volume = 0;
        return;
    }
    currentMusicVolume = musicVolume;
    currentMusic.volume = currentMusicVolume;
}

// add event listener to control menu by keys
document.addEventListener("keyup", (e) => {
    console.log(e.code);
    switch (e.code) {
        case "Escape":
        case "Space":
        case "KeyP":
            toggleMenu();
            break;
    }
});

document.getElementById("interaction-overlay").addEventListener("click", (e) => {
    document.getElementById("interaction-overlay").classList.add("hide-elem");
    currentState = "justloaded";
    newGame();
});

// close button of menu
document.getElementById("menu-name").addEventListener("click", () => {
    toggleMenu();
});

// close button of new game menu
document.getElementById("ng-menu-name").addEventListener("click", () => {
    chooseDifficulty();
});

Array.prototype.forEach.call(document.getElementsByClassName("inner-menu"), e => {
    e.addEventListener("click", e => {
        e.stopPropagation();
    });
});

// close menus on screen click
function hideMenu(m) {
    if(m == "mn") {
        // hide menu
        toggleMenu();
        return;
    }
    // hide ng menu
    chooseDifficulty();
}

/*
let clickCounter = 0;
document.addEventListener("click", e => {
    if(!showMenu) {
        return;
    }
    clickCounter++;
    
    if(clickCounter > 1) {
        showNgMenu = false;
        chooseDifficulty();
        toggleMenu();
        
    }

});
document.getElementById("inner-menu").addEventListener("click", e => {
    e.stopPropagation();
    return;
});
*/

let lastMouseButton = 0;
document.addEventListener("mouseup", (e) => {
    lastMouseButton = e.button;
    console.log(lastMouseButton);
    if(lastMouseButton == 2) {
        // right click detected
        setFlag(document.elementFromPoint(e.clientX, e.clientY));
    }
});

// from https://codepen.io/eleviven/pen/eYmwzLp
let onlongtouch = false;
let timer = false;
let duration = 800;

let target;

function touchStart(e){
    target = e;
    if (!timer) {
        timer = setTimeout(onlongtouch, duration);
    }
}

function touchEnd(){
    if (timer) {
        clearTimeout(timer)
        timer = false;
    }
}

onlongtouch = function(){
    setFlag(target.target);
    console.log("long touch " + target);
}

document.getElementById("inner-mine-field").addEventListener("touchstart", touchStart);
document.getElementById("inner-mine-field").addEventListener("touchend", touchEnd);

//#endregion

// from: https://stackoverflow.com/a/39914235
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

