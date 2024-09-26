class Door {

    constructor(x, y, num, date, numberAlign, values) {

        this.x = x;
        this.y = y;
        this.num = num;
        this.date = date;

        this.values = values;
        this.doorSize = values.doorSize;
        this.palette = values.palette;

        this.numberOffset = int(random(4));
        this.numberOffset = numberAlign;
        this.flashOffset = random(360);

        this.xPos = (x-2) * this.values.doorSpacingX;
        this.yPos = (y-2) * this.values.doorSpacingY - 15;
        // if (y == 4) this.yPos += 19;
        // if (y == 4 && x == 2) this.yPos += 14+8.5;

        if (y == 5) {
            this.yPos -= 15;
            if (x == 0) {
                this.xPos += 3;
                this.yPos += 3;
                this.presentColours = [this.palette.dark, this.palette.light];
            } else if (x == 1) {
                this.xPos += 10;
                this.yPos -= 5;
                this.presentColours = [this.palette.gold, this.palette.black];
            } else if (x == 2) {
                this.xPos += 95;
                this.yPos -= 7;
                this.presentColours = [this.palette.mid, this.palette.black];
            } else if (x == 3) {
                this.xPos += 45;
                this.yPos += 3;
                this.presentColours = [this.palette.dark, this.palette.gold];
            } else if (x == 4) {
                this.xPos -= 3;
                this.yPos -= 5;
                this.presentColours = [this.palette.gold, this.palette.light];
            }
            this.present = true;
            this.doorZoom = 17.5;
            this.doorSize = 40;
        } else {
            this.present = false;
            this.doorZoom = 10;
        }

        this.hovering = false;
        this.clicked = false;
        this.opened = getItem(date);

        this.readyDate = this.date > 25 ? 25 : this.date;
        this.ready = this.readyDate <= daysToReveal;
        // this.ready = true; // delete this later
    }

    update() {

        this.ready = this.readyDate <= daysToReveal; // debug

        if (!this.ready) return;

        if (!this.clicked) this.checkHover();
    }

    checkHover() {

        this.hovering = false;

        let xPos = this.xPos;
        let yPos = this.yPos;
        let w = this.doorSize/2;
        let h = this.doorSize/2;
        if (this.y == 4 && this.x == 2) {
            yPos -= 8;
            w += 5;
            h += 12;
        }

        if ((mouseX-width/2 > xPos-w && mouseX-width/2 < xPos+w) && (mouseY-height/2 > yPos-h && mouseY-height/2 < yPos+h)) this.hovering = true;

        if (this.y == 4) {

            let distance = dist(mouseX-width/2, mouseY-height/2, xPos, yPos-h);

            if (distance < w) this.hovering = true;
        }
    }

    checkClick() {

        if (!this.hovering) return;

        if (!this.clicked) {

            this.hovering = false;
            this.clicked = true;
            homepage.enteringDoor = true;
            homepage.currentDoor = this;
            homepage.maxZoom = this.doorZoom;
            today = this.date-1;
            if (!this.opened) {
                this.opened = true;
                storeItem(this.date.toString(), true);
            }
        }
    }

    display() {

        push();

        angleMode(DEGREES);

        translate(this.xPos*homepage.zoom, this.yPos*homepage.zoom);

        if (this.present) {

            this.displayPresent();

        } else {

            let lightColour = this.palette.black;

            // if (!this.opened && this.ready) {
            //     let amount = sin((frameCount+this.flashOffset)*5);
            //     amount = map(amount, -1, 1, 0, 1);
            //     lightColour = lerpColor(color("#FFFFFF"), color("#FFE2AD"), amount);
            // }
            // else
            if (this.ready) lightColour = this.palette.light;

            // this.displayDetail(lightColour);

            rectMode(CORNERS);
            noStroke();

            // if (this.y == 4 && this.x == 2) {

            //     this.displayFrontDoor(lightColour);

            // } else {

                let quarter = this.values.doorSize*homepage.zoom/2;
                let weight = homepage.windowFrameStrokeWeight*homepage.zoom;
                let quarterish = quarter-weight/2;
                strokeWeight(weight);
                stroke(this.palette.gold);
                fill(lightColour);
                rect(-quarterish, -quarterish, quarterish, quarterish);
                line(-quarterish, 0, quarterish, 0);
                line(0, -quarterish, 0, quarterish);
                noStroke();
            // }

            this.displayNumber();
        }

        pop();
    }

    displayPresent() {

        if (!this.ready) return;

        let zoom = homepage.zoom;

        let glowColour = this.presentColours[0];

        if (!this.opened) {
            let sourceColour = this.presentColours[0];
            let colour = color(0);
            colour.setRed(red(sourceColour));
            colour.setGreen(green(sourceColour));
            colour.setBlue(blue(sourceColour));
            let amount = sin((frameCount+this.flashOffset)*5);
            amount = map(amount, -1, 1, 0.7, 1);
            colour.setAlpha(amount*255);
            glowColour = colour;
        }

        push();
        angleMode(DEGREES);
        if (this.hovering) rotate(sin(frameCount*6)*5);
        rectMode(CENTER);
        stroke(this.presentColours[1]);
        strokeWeight(3*zoom);
        noFill();

        for (let i = -1; i <= 1; i+=2) {
            push();
            translate(-7*i*zoom, -23*zoom);
            rotate(15*i);
            ellipse(0, 0, 14*zoom, 5*zoom);
            pop();
        }

        noStroke();
        fill(255);
        rect(0, 0, 40*zoom);
        fill(glowColour);
        rect(0, 0, 40*zoom);
        fill(this.presentColours[1]);
        rect(0, 0, 6*zoom, 40*zoom);
        pop();
    }

    displayFrontDoor(lightColour) {

        let zoom = homepage.zoom;

        let frameWeight = this.values.frameWeight*zoom;
        let w = 80*zoom-frameWeight;
        let h = 100*zoom-frameWeight;

        push();
        translate(0, -8.5*zoom);
        rectMode(CENTER);
        strokeWeight(frameWeight);
        fill(lightColour);
        stroke(this.palette.gold);
        ellipse(0, -w/2-7*zoom-frameWeight/2, w);
        line(-w/2, -w/2-7*zoom-frameWeight*1.5, w/2, -w/2-7*zoom-frameWeight*1.5);
        fill(this.palette.gold);
        stroke(this.palette.black);
        rect(-w/4, 0, w/2, h);
        rect(w/4, 0, w/2, h);
        line(-7*zoom, 4*zoom, -7*zoom, 13*zoom);
        line(7*zoom, 4*zoom, 7*zoom, 13*zoom);
        pop();
    }

    displayDetail(lightColour) {

        let zoom = homepage.zoom;
        let doorSize = this.values.doorSize;
        let doorSizeZoom = doorSize*zoom;
        let halfDoorZoom = doorSizeZoom/2;
        let frameWeight = this.values.frameWeight*zoom;

        if (this.y == 4 && this.x == 2) {

            // do nothing

        } else if (this.y == 0) {

            push();
            noStroke();
            fill(this.palette.dark);
            ellipse(0, -halfDoorZoom+frameWeight/2, doorSizeZoom);
            pop();

        } else if (this.y >= 1 && this.y <= 3) {

            push();
            noStroke();
            fill(this.palette.black);
            rectMode(CENTER);
            rect(0, (doorSize/2+5)*zoom, 76*zoom, 10*zoom);
            let h = 16 * zoom;
            let w = 6 * zoom;
            translate(0, -halfDoorZoom);
            quad(-halfDoorZoom, 0, halfDoorZoom, 0, halfDoorZoom+w, -h, -halfDoorZoom-w, -h);
            pop();

        } else if (this.y == 4) {

            push();
            stroke(this.palette.gold);
            strokeWeight(frameWeight);
            fill(lightColour);
            ellipse(0, -halfDoorZoom+frameWeight/2, doorSizeZoom-frameWeight);
            line(0, -halfDoorZoom, 0, -doorSizeZoom+frameWeight);
            noStroke();
            fill(this.palette.black);
            rectMode(CENTER);
            rect(0, (doorSize/2+5)*zoom, 76*zoom, 10*zoom);
            pop();
        }
    }

    displayNumber() {

        if (!this.ready) return;

        let sourceColours = [this.palette.black, this.palette.dark];
        let textColours = [];

        for (let i = 0; i < sourceColours.length; i++) {

            let colour = color(0);
            colour.setRed(red(sourceColours[i]));
            colour.setGreen(green(sourceColours[i]));
            colour.setBlue(blue(sourceColours[i]));
            colour.setAlpha(homepage.doorDateAlpha*255);
            textColours.push(colour);
        }

        let zoom = homepage.zoom;
        let quarter = this.values.doorSize*zoom/4 - 1.5;

        push();

        if (this.y == 4 && this.x == 2) translate(0, -76*zoom);
        else if (this.numberOffset == 0) translate(quarter, -quarter);
        else if (this.numberOffset == 1) translate(quarter, quarter);
        else if (this.numberOffset == 2) translate(-quarter, quarter);
        else if (this.numberOffset == 3) translate(-quarter, -quarter);

        if (this.hovering) {
            angleMode(DEGREES);
            rotate(sin(frameCount*6)*10);
            textSize(25);
            stroke(textColours[0]);
            fill(textColours[0]);
        } else {
            textSize(18);
            stroke(textColours[1]);
            fill(textColours[1]);
        }

        translate(0, -2);
        textAlign(CENTER, CENTER);
        strokeWeight(1);
        textFont(fonts.redressed);
        text(this.date == 1 ? "X" : this.date, 0, 0);

        pop();
    }
}