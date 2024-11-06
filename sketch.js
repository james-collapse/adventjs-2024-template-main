let debugOn = true; // make sure this is set to false before uploading
let profilerOn = false; // make sure this is set to false before uploading

let _perfTimer = 0;
let _frameTimer = 0;

let today = 0;

let days = [];
let daysToReveal;

let assets = {};

let homepage;
let body, controlsText, creditsText, backButton;
let canvas;
let noLoopCanvas;

let fonts = {};

let seedGenerator;
let testSeed;

function setup() {

    canvas = createCanvas(600, 600);
    canvas.parent("canvas-wrapper");
    noLoopCanvas = createGraphics(width, height);

    seedGenerator = new Random(random(0, 100000));

    resetModes();

    body = select("body");
    controlsText = select("#controls");
    creditsText = select("#credits");
    backButton = select("#back-button");

    backButton.mousePressed(backButtonPressed);

    bodyColours = {
        unhover: color("#111"),
        hover: color("#969696"),
        current: color("#111"),
        step: 0,
        duration: 20,
    };

    createDays();
    daysToReveal = getDaysToReveal();
    if (debugOn) daysToReveal = 3;

    homepage = new Homepage();
    changeDay(0);
}

function draw() {

    if (!homepage.visible || (homepage.visible && homepage.doorOpen)) {

        if (days[today].loop) {

            if(profilerOn){_frameTimer = Date.now();}

            push();
            days[today].update();
            pop();

            if(profilerOn){_reportFrame()}

            resetModes();
        } else if (homepage.enteringDoor || homepage.exitingDoor) {
            image(noLoopCanvas, 0, 0, width, height);
        }
    }

    if (homepage.visible) {
        homepage.update();
        homepage.display();
        resetModes();
    }
}

function getDaysToReveal() {

    let todayDate = new Date();
    let startDate = new Date("2024-12-01");
    if (debugOn) todayDate = startDate; // debug delete later
    let timeSinceStart = (todayDate.getTime()+1) - startDate.getTime();
    timeSinceStart /= 24 * 60 * 60 * 1000;
    timeSinceStart = ceil(timeSinceStart);

    return timeSinceStart;
}

function createDays() {

    // for (let i = 0; i < 30; i++) {
    for (let i = 0; i < 3; i++) {
        let n = i+1;
        if (n == 1) {
            n = "X";
        }
        push();
        eval("days.push(new Day"+ n +"())");
        pop();
    }
}

function changeDay(date) {

    today = date;

    clear();

    resetModes();
    resetSeeds();

    push();
    days[today].prerun();
    pop();

    if (!days[today].loop) {
        push();
        days[today].update();
        pop();
        noLoopCanvas.image(canvas, 0, 0, width, height);
    }

    homepage.skippedFrame = false;
}

function resetModes() {

    colorMode(HSB, 360, 100, 100);
    colorMode(HSL, 360, 100, 100);
    colorMode(RGB, 255);
    ellipseMode(CENTER);
    rectMode(CORNER);
    blendMode(BLEND);
    imageMode(CORNER);
    angleMode(RADIANS);
    textureMode(IMAGE);
}

function resetSeeds(){
    testSeed = seedGenerator.next();
    randomSeed(testSeed);
    noiseSeed(seedGenerator.next());
}

function cleanupOnExit() {

    days[today].cleanup();
    updateInfo(-1);
    cursor();
    pixelDensity(displayDensity());
}

function _resetTimer(){
    _perfTimer = Date.now();
}

function _reportTimerElapsed(){
    console.log("Elapsed: "+str(Date.now()-_perfTimer));
}

function _reportFrame(){
    let _dif = Date.now() - _frameTimer;
    if(_dif > 33){
        console.warn("Frame: "+str(_dif)+"ms (under 30fps)");
    }
    else{
        console.log("Frame: "+str(_dif)+"ms");
    }
}

function setupGrammar(grammarSource) {

    let grammar = tracery.createGrammar(grammarSource);
    grammar.addModifiers(tracery.baseEngModifiers);

    return grammar;
}

function getText(grammar) {

    return grammar.flatten("#origin#");
}

//RNG Correction
function Random(seed) {
    this._seed = seed % 2147483647;
    if (this._seed <= 0) this._seed += 2147483646;
}

//Returns a pseudo-random value between 1 and 2^32 - 2.
Random.prototype.next = function () {
    return this._seed = this._seed * 16807 % 2147483647;
}

// Returns a pseudo-random floating point number in range [0, 1).
Random.prototype.nextFloat = function (opt_minOrMax, opt_max) {
    // We know that result of next() will be 1 to 2147483646 (inclusive).
    return (this.next() - 1) / 2147483646;
}

function updateInfo(day) {

    if (day == -1) {
        controlsText.html("");
        creditsText.html("");
    } else {
        controlsText.html(day.controls);
        creditsText.html(day.credits);
    }
}

function backButtonPressed() {

    if (!homepage.visible) {
        homepage.visible = true;
        homepage.exitingDoor = true;
        backButton.style("display", "none");
    }
}

function mousePressed() {

    if (homepage.visible) homepage.checkDoorClick();
    else {
        push();
        days[today].mousePressed();
        pop();
    }
}

function mouseReleased() {

    if (mouseX < 0 || mouseX > width || mouseY < 0 || mouseY > height) return;
    if (!homepage.visible) {
        push();
        days[today].mouseReleased();
        pop();
    }
}

function keyPressed() {

    if (!homepage.visible || (homepage.visible && homepage.doorOpen)) {
        push();
        days[today].keyPressed();
        pop();
    } else if (debugOn) {
        //
    }
}

function keyReleased() {

    if (!homepage.visible || (homepage.visible && homepage.doorOpen)) {
        push();
        days[today].keyReleased();
        pop();
    }
}