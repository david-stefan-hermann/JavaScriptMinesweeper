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
    if(currentState == gameStates.gameover) {
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
    // no flag if menu active
    if(isMenuActive()) { return; }

    // no flag if not playing
    if(currentState != gameStates.playing) { return; }
    
    // no flag if element not a tile
    if(!elem.classList.contains("mf-field")) { return; }

    // set flag
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
        if (currentState == gameStates.playing) {
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
    
    // show game over / win screen
    showMenu(1);
}


//#region Game Progression ( new game, game over, win )

// Starting game
let minesInitialized = false;
function newGame() {
    if(!hasJustBeenLoaded) {
        playSound(sounds.new_game);
    }
    currentState = gameStates.gameover;

    setVolume();
    hideMenus(true);
        
    minesInitialized = false;
    currentState = gameStates.playing;
    uncoveredTiles = new Set();
    
    playSound(sounds.music, true);

    getDimensions();
    initializeList();
    drawTiles();
}

function gameOver(y, x) {
    currentState = gameStates.gameover;
    playSound(sounds.go_music, true);
    uncoverMines(y, x);
}

let uncoveredTiles;
function checkWin() {
    if(uncoveredTiles.size == ((tilesX * tilesY) - numberOfMines)) {
        currentState = gameStates.win;
        uncoverMines();
    }
}

//#endregion

// ------------------------------------------------- UI Menu Stuff

//#region difficulty selection

// set normal difficulty as default
let difficulty = 5;
document.getElementById("difficulty-2").classList.add("button-active");

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

//#endregion

//#region menu closing

// menu elements: 0: settings, 1: ng, 2: info, 3 game over
const menus = document.getElementsByClassName("menu");

// add eventlistener for closing menus on screen click
Array.prototype.forEach.call(menus, m => {
    m.addEventListener("click", () => hideMenus());
});

// close menuss
function hideMenus(calledFromShowMenus = false) {
    if(!calledFromShowMenus) {
        // if closed by user
        // play hide menu sound
        playSound(sounds.menu_exit);
        

        if(currentState == gameStates.playing) {
            playSound(sounds.music, true);
            console.log("rupt");

        }
    } 
    Array.prototype.forEach.call(menus, m => {
        m.classList.add("hide-elem");
    });
}

// get close buttons of menus
const menus_close_button = document.getElementsByClassName("menu-name");

// add eventlistener for closing menus on closing button
Array.prototype.forEach.call(menus_close_button, m => {
    m.addEventListener("click", () => hideMenus());
});

// block menu closing when clicking on menu
Array.prototype.forEach.call(document.getElementsByClassName("inner-menu"), e => {
    e.addEventListener("click", e => {
        e.stopPropagation();
    });
});

//#endregion

//#region menu opening

// get menu buttons in header
const menu_buttons = document.getElementsByClassName("header-button");

// add eventlistener for showing menu
Array.prototype.forEach.call(menu_buttons, (m, i) => {
    m.addEventListener("click", () => showMenu(i));
});

// show menu
function showMenu(menu) {
    hideMenus(true);
    updateMenuContent();
    
    menus[menu].classList.remove("hide-elem");
    
    // play pause sound
    playSound(sounds.menu_open);

    if(currentState == gameStates.playing) {
        // play menu music
        playSound(sounds.menu_music, true);
    }
}

//#endregion

//#region menu key control

// add event listener to control menu by keys
document.addEventListener("keyup", (e) => {
    console.log(e.code);
    switch (e.code) {
        case "Escape":
        case "KeyP":
            if (isMenuActive()) {
                // if any menu is active
                hideMenus();
                return;
            }
            showMenu(0);
            break;
    }
});

//#endregion

//#region menu state report

// return if any menu is active when no parameters set
function isMenuActive(menu = -1) {
    let anyMenuActive = false;    // assume that no menu is active 
    if(menu < 0) {
        // check for any active menu
        Array.prototype.forEach.call(menus, m => {
            if(!m.classList.contains("hide-elem")) {
                anyMenuActive = true;   // one menu is active
            }
        });
        return anyMenuActive;
    }
    return !menus[menu].classList.contains("hide-elem");
}

//#endregion

//#region menu updating

let hasJustBeenLoaded = false;
function updateMenuContent() {
    let tempState = currentState;
    if (hasJustBeenLoaded) {
        tempState = gameStates.justloaded;
        hasJustBeenLoaded = false;
    }
    document.getElementById("state-message").innerHTML = gameStateMessage[tempState];
    document.getElementById("ng-button").innerHTML = newGameButtonMessage[tempState];
}

//#endregion

//#region play after first click on site

document.getElementById("interaction-overlay").addEventListener("click", async () => {
    document.getElementById("interaction-overlay").classList.add("hide-elem");
    currentState = gameStates.justloaded;
    hasJustBeenLoaded = true;
    newGame();
    await sleep(100);
    showMenu(1);
});

//#endregion

// -------------------------------------------------


//#region sound

const sounds = {
    newgame: new Audio("music/mixkit-new-game.wav"),
    food: new Audio("music/mixkit-food.wav"),
    gameover: new Audio("music/mixkit-game-over.wav"),
    menu_open: new Audio("music/mixkit-pause.wav"),
    menu_exit: new Audio("music/mixkit-pause-deeper.wav"),
    tap: new Audio("music/mixkit-food.wav"),
    music: new Audio("music/2019-12-09_-_Retro_Forest_-_David_Fesliyan.mp3"),
    menu_music: new Audio("music/2019-01-02_-_8_Bit_Menu_-_David_Renda_-_FesliyanStudios.com.mp3"),
    go_sound: new Audio("music/pixabay-videogame-death-sound-43894.mp3"),
    go_music: new Audio("music/Slower-Tempo-2020-03-22_-_8_Bit_Surf_-_FesliyanStudios.com_-_David_Renda.mp3"),
    new_game: new Audio("music/pixabay-game-start-6104.mp3"),
}

let volume = 0;
let musicVolume = 0;
let currentMusic;

let musicVolumeBeforeLeavingTab;

// get sliders
const soundSlider = document.getElementById("sounds-slider");
const musicSlider = document.getElementById("music-slider");

// change volume on slider change
soundSlider.oninput = () => { setVolume(); };
musicSlider.oninput = () => { setVolume(); };

// set volume
function setVolume() {
    volume = soundSlider.value / 100;
    musicVolume = musicSlider.value / 100;
    if(currentMusic)
        currentMusic.volume = musicVolume;
}

function playSound(sound, loop=false) {
    const s = sound.cloneNode(true);

    let thisVolume = volume;
    if (loop) {thisVolume = musicVolume;}

    if (thisVolume >= 1) { thisVolume = 1; }
    
    s.volume = thisVolume;
    
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

// set slider
function setSlider(val) {
    if(val > 100) { val = 100; }
    musicSlider.value = val;
    setVolume();
}

// mute sound when leaving tab
window.onblur = async () => {
    musicVolumeBeforeLeavingTab = musicVolume;
    if (musicVolume == 0) { return; }
    for(let v = (musicVolume * 100); v >= 0; v--) {
        setSlider(v);
        await sleep(5);
    }
}

// un-mute sound when focussing tab
window.onfocus = async () => {
    if (musicVolume == musicVolumeBeforeLeavingTab) { return; }
    for(let v = (musicVolume * 100); v < (musicVolumeBeforeLeavingTab * 100); v++) {
        console.log(v + " " + musicVolumeBeforeLeavingTab);
        setSlider(v);
        await sleep(5);
    }
}

//#endregion


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
    "img/icons8-volcano-96.png",
]

const uncoveredMineTexture = "img/icons8-mushroom-cloud-96.png";


// 0: playing, 1: gameover, 2: win, 3: just loaded website

const gameStates = {
    playing: 0,
    gameover: 1,
    win: 2,
    justloaded: 3,
}

let currentState = gameStates.justloaded;

const gameStateMessage = {
    0: "still in game..",
    1: "Game Over!",
    2: "Congrats, You Won!",
    3: "Start a game!",
}

const newGameButtonMessage = {
    0: "restart game",
    1: "try again",
    2: "go again",
    3: "click to play",
}

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
