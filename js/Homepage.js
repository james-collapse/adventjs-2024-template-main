class Homepage {

    constructor() {

        this.palette = {
            white: color("#FFFFFF"),
            light: color("#E4E4E4"),
            gold: color("#C9C9C9"),
            mid: color("#B7B7B7"),
            dark: color("#8D8D8D"),
            black: color("#585858"),
        };

        this.windowFrameStrokeWeight = 4;

        this.doorSize = 60;
        this.doorSpacingX = 37 + 67.5;
        this.doorSpacingY = 47 + 67.5;

        this.values = {
            palette: this.palette,
            doorSize: this.doorSize,
            doorSpacingX: this.doorSpacingX,
            doorSpacingY: this.doorSpacingY,
            frameWeight: this.windowFrameStrokeWeight,
        };

        this.doorOrder = [
            1, 9, 21, 15, 4,
            16, 13, 23, 8, 18,
            20, 7, 22, 3, 12,
            24, 6, 2, 11, 14,
            10, 19, 25, 17, 5,
            26, 27, 28, 29, 30,
        ];
        this.doorNumberAlign = [
            1, 3, 1, 3, 1,
            0, 2, 1, 0, 2,
            3, 2, 3, 3, 2,
            0, 1, 0, 2, 0,
            2, 3, 0, 0, 3,
            0, 0, 0, 0, 0,
        ];
        this.doors = [];

        for (let i = 0; i < this.doorOrder.length; i++) {

            this.doors.push(new Door(i%5, int(i/5), i, this.doorOrder[i], this.doorNumberAlign[i], this.values));
        }

        this.originX = 0;
        this.originY = 0;
        this.cameraX = 0;
        this.cameraY = 0;
        this.zoom = 1;
        // this.zoom = 0.8; // logo zoom level
        this.minZoom = 1;
        this.maxZoom = width/this.doorSize;

        this.visible = true;
        this.currentDoor = -1;
        this.enteringDoor = false;
        this.exitingDoor = false;
        this.doorOpen = false;

        this.doorDateAlpha = 1;

        this.openAmount = 0;

        this.threeD = createGraphics(width, height, WEBGL);
        this.twoDWindow = this.create2DWindow();
        this.twoDFrontDoor = this.create2DFrontDoor();
        this.twoDPresents = [];
        for (let i = 0; i < 5; i++) this.twoDPresents.push(this.create2DPresent(i));
        this.treeMask = this.createTreeMask();
        this.treeTinselA = this.createTreeTinsel();
        this.treeTinselB = this.createTreeTinsel();
        this.snow = this.setupSnow();

        this.defaultOpenOnX(); // comment out outside of template
    }

    defaultOpenOnX() {

        this.currentDoor = this.doors[0];
        this.currentDoor.hovering = 1;
        this.currentDoor.openAmount = 1;

        this.cameraX = this.currentDoor.xPos;
        this.cameraY = this.currentDoor.yPos;
        this.doorDateAlpha = 0;

        this.zoom = this.maxZoom;
        this.doorOpen = true;
        this.openAmount = 1;
        this.enteringDoor = false;
        this.visible = false;
        backButton.style("display", "inline");

        today = 0;
        updateInfo(days[0]);
    }

    create2DWindow() {

        let twoD = createGraphics(width, height);
        let weight = this.windowFrameStrokeWeight*this.maxZoom;

        twoD.strokeWeight(weight);
        twoD.stroke(this.palette.gold);
        twoD.fill(this.palette.light);
        twoD.rectMode(CENTER);
        twoD.rect(width/4*3+weight/4, height/2, width/2-weight/2, height-weight);
        twoD.line(width/2, height/2, width, height/2);

        return twoD;
    }

    create2DFrontDoor() {

        let h = height*2;
        let twoD = createGraphics(width, h);
        let weight = this.windowFrameStrokeWeight*this.maxZoom;

        twoD.noStroke();
        twoD.background(this.palette.gold);
        twoD.strokeWeight(weight);
        twoD.stroke(this.palette.black);
        twoD.line(width, 0, width, h);
        twoD.line(width-7*this.maxZoom, h/2-4.5*this.maxZoom, width-7*this.maxZoom, h/2+4.5*this.maxZoom);

        return twoD;
    }

    create2DPresent(i) {

        let palette;

        if (i == 0) palette = [this.palette.dark, this.palette.light];
        else if (i == 1) palette = [this.palette.gold, this.palette.black];
        else if (i == 2) palette = [this.palette.mid, this.palette.black];
        else if (i == 3) palette = [this.palette.dark, this.palette.gold];
        else if (i == 4) palette = [this.palette.gold, this.palette.light];

        let h = height*2;
        let twoD = createGraphics(width, h);
        let weight = 6*17.5;

        twoD.noStroke();
        twoD.background(palette[0]);
        twoD.strokeWeight(weight);
        twoD.stroke(palette[1]);
        twoD.line(width, 0, width, h);

        return twoD;
    }

    createTreeMask() {

        let layer = createGraphics(160*this.maxZoom, 295*this.maxZoom);

        layer.push();
        layer.translate(160*this.maxZoom/2, 0);
        for (let i = 2; i < 6; i++) {
            let w2 = 32*i*this.maxZoom;
            let h2 = 35*i*this.maxZoom;
            layer.triangle(-w2/2, h2, 0, 0, w2/2, h2);
            layer.translate(0, 10*i*this.maxZoom);
        }

        layer.pop();

        return layer;
    }

    createTreeTinsel() {

        let layer = createGraphics(160*this.maxZoom, 295*this.maxZoom);
        layer.translate(layer.width/2, 0);

        layer.background(this.palette.black);
        layer.noFill();

        let colour1 = this.palette.mid;
        let colour2 = this.palette.dark;

        if (daysToReveal < 3) colour2 = color(0, 0);
        if (daysToReveal < 7) colour1 = color(0, 0);

        let num = 8;
        for (let i = num-1; i >= 1; i--) {

            let weight = i%2 == 1 ? 160 : 80;
            layer.strokeWeight(weight);
            let colour = i%2 == 1 ? colour1 : colour2;
            layer.stroke(colour);
            layer.ellipse(random(-layer.width/14*i, layer.width/14*i), 0, layer.height*2/num*(i+0.4));
        }

        let maskedTinsel = layer.get();
        maskedTinsel.mask(this.treeMask);
        layer.clear();
        layer.image(maskedTinsel, -layer.width/2, 0, layer.width, layer.height);

        layer.noStroke();

        colour1 = this.palette.light;
        colour2 = this.palette.gold;

        if (daysToReveal < 10) colour2 = color(0, 0);
        if (daysToReveal < 15) colour1 = color(0, 0);

        for (let i = 1; i < 10; i++) {
            let n = int(i*0.6+0.5);
            let w = -130*n;
            let x = w;
            let rand = random([0, 1]);
            let rand2 = random([0, 1]);
            for (let j = 0; j <= n; j++) {
                layer.push();
                layer.translate(x, layer.height/10*i-10);
                let offset = 45;
                layer.translate(random(-offset, offset), random(-offset, offset));
                let colour = (j+rand)%2 == 0 ? colour1 : colour2;
                layer.fill(colour);
                layer.ellipse(0, 0, 130);
                x -= (w*2)/n;
                layer.pop();
            }
        }

        return layer;
    }

    setupSnow() {

        let snow = [];

        for (let i = 0; i < 600; i++) {
            snow.push(new this.Snow(1, this.palette.white));
        }

        return snow;
    }

    update() {

        if (this.enteringDoor) this.enterDoor();
        else if (this.exitingDoor) this.exitDoor();

        if (this.enteringDoor || this.exitingDoor) return;

        for (let i = 0; i < this.doors.length; i++) {
            this.doors[i].update();
        }
    }

    checkDoorClick() {

        if (this.enteringDoor || this.exitingDoor) return;

        for (let i = 0; i < this.doors.length; i++) {
            this.doors[i].checkClick();
        }
    }

    enterDoor() {

        let door = this.currentDoor;
        let d = deltaTime/17;

        // if (d > 10) return;

        if (this.doorDateAlpha > 0) {

            this.cameraX = lerp(this.cameraX, door.xPos, 0.1*d);
            this.cameraY = lerp(this.cameraY, door.yPos, 0.1*d);
            this.doorDateAlpha = lerp(this.doorDateAlpha, 0, 0.1*d);

            if (this.doorDateAlpha < 0.01) {
                this.cameraX = door.xPos;
                this.cameraY = door.yPos;
                this.doorDateAlpha = 0;
            }

        } else if (this.doorDateAlpha == 0 && this.maxZoom - this.zoom > 0) {

            this.zoom = lerp(this.zoom, this.maxZoom, 0.1*d);
            if (this.maxZoom - this.zoom < 0.01) {

                this.zoom = this.maxZoom;

                changeDay(door.date-1);
                this.doorOpen = true;
                updateInfo(days[door.date-1]);
            }

        } else if (this.maxZoom == this.zoom) {

            if (!this.skippedFrame) {
                this.skippedFrame = true;
                return;
            }

            this.openAmount = lerp(this.openAmount, 1, 0.1*d);
            if (this.openAmount > 0.99) {
                this.openAmount = 1;
                this.enteringDoor = false;
                this.visible = false;
                backButton.style("display", "inline");
            }
        }
    }

    exitDoor() {

        let door = this.currentDoor;
        let d = deltaTime/17;

        if (this.openAmount != 0) {

            this.openAmount = lerp(this.openAmount, 0, 0.1*d);
            if (this.openAmount < 0.001) {
                this.openAmount = 0;
                this.doorOpen = false;
                cleanupOnExit();
            }

        } else if (this.openAmount == 0 && this.zoom-this.minZoom > 0) {

            this.zoom = lerp(this.zoom, this.minZoom, 0.1*d);
            if (this.zoom - this.minZoom < 0.01) this.zoom = this.minZoom;

        } else if (this.zoom == this.minZoom) {

            this.cameraX = lerp(this.cameraX, this.originX, 0.1*d);
            this.cameraY = lerp(this.cameraY, this.originY, 0.1*d);
            this.doorDateAlpha = lerp(this.doorDateAlpha, 1, 0.1*d);

            if (this.doorDateAlpha > 0.999) {

                this.cameraX = this.originX;
                this.cameraY = this.originY;
                this.doorDateAlpha = 1;

                door.clicked = false;
                this.exitingDoor = false;
                this.currentDoor = -1;
            }
        }
    }

    display() {

        push();

        translate(width/2, height/2);
        translate(-this.cameraX*homepage.zoom, -this.cameraY*homepage.zoom);
        if (this.zoom != this.maxZoom) this.displayHouse();

        if (this.openAmount == 0) {
            for (let i = 0; i < this.doors.length; i++) {
                this.doors[i].display();
            }
        }

        pop();

        if (this.openAmount > 0) this.display3DWindows(this.openAmount);
    }

    displayHouse() {

        let zoom = this.zoom;

        push();
        rectMode(CENTER);
        noStroke();

        background(this.palette.gold);
        this.displaySnow();

        if (daysToReveal < 9) fill(this.palette.mid);
        else fill(this.palette.white);
        rect(0, 316*zoom+450*zoom, width*zoom*2, 68*zoom+1000*zoom);

        fill(this.palette.dark);
        rect(0, 0, 600*this.zoom, 620*this.zoom);

        pop();
    }

    displaySnow() {

        push();

        let snowPercent = (daysToReveal-1)/25;
        snowPercent = constrain(snowPercent, 0, 1);

        for (let i = 0; i < this.snow.length*snowPercent; i++) {
            this.snow[i].display(this.zoom);
        }

        pop();
    }

    display3DWindows(openAmount) {

        let source = this.twoDWindow;
        if (today+1 > 25) source = this.twoDPresents[today-25];
        else if (today+1 == 25) source = this.twoDFrontDoor;

        angleMode(DEGREES);
        imageMode(CENTER);

        this.threeD.push();
        this.threeD.angleMode(DEGREES);
        this.threeD.clear();
        this.threeD.noStroke();
        this.threeD.texture(source);
        this.threeD.rotateY(openAmount*90);
        if (today+1 == 25) this.threeD.plane(width, height*2);
        else this.threeD.plane(width, height);
        this.threeD.pop();

        push();
        translate(width/2, height/2);
        image(this.threeD, -width/2, 0);
        translate(width/2, 0);
        rotate(180);
        image(this.threeD, 0, 0);
        pop();
    }

    Snow = class {

        constructor(zoom, colour) {

            this.padding = 250;
            this.x = random(-this.padding, width+this.padding);
            this.y = random(-this.padding, height);
            this.radius = random(3, 6)*zoom;
            this.colour = colour;
        }

        display(zoom) {

            this.x += random(-0.5, 1);
            this.y += random(0.5, 1.5);

            if (this.x > width+this.padding) this.x = -this.padding;
            if (this.x < -this.padding) this.x = width+this.padding;
            if (this.y > height) this.y = -this.padding;

            noStroke();
            fill(this.colour);
            ellipse((this.x-width/2)*zoom, (this.y-height/2)*zoom, this.radius);
        }
    }
}