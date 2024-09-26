// Made by Rianna Suen - interactive example

function day3Preload() {

    assets.day3SnowmanFace = loadImage("../assets/day3/snowman-face.png");
}

class Day3 extends Day {

    constructor () {

        super();
        this.loop = true;
        this.controls = "WASD or ARROW KEYS to move";
        this.credits = "Made by Rianna Suen";

        this.mapSize = width*2;
        this.player = new this.Player(this.mapSize);

        this.trailCanvas = createGraphics(this.mapSize, this.mapSize);

        this.cameraX = 0;
        this.cameraY = 0;

        this.snowColliders = [];
        this.setupSnowColliders();

        this.colours = {
            snow: "#fff",
            grass: "#5B9554",
        };
    }

    setupSnowColliders() {

        let density = 50;
        let padding = this.mapSize/density;

        for (let i = 1; i < density; i++) {
            for (let j = 1; j < density; j++) {
                let x = padding*i;
                let y = padding*j;
                this.snowColliders.push(new this.SnowCollider(x, y, padding));
            }
        }
    }

    prerun() {

        this.trailCanvas.clear();

        this.player.reset();

        this.cameraX = 0;
        this.cameraY = 0;

        for (let i = 0; i < this.snowColliders.length; i++) {
            this.snowColliders[i].reset();
        }
    }

    update() {

        this.player.update();
        this.moveCamera();

        for (let i = 0; i < this.snowColliders.length; i++) {
            this.snowColliders[i].collide(this.player);
        }

        this.display();
    }

    display() {

        background(this.colours.snow);
        this.displayTrail();
        this.displayPlayer();
    }

    displayTrail() {

        this.trailCanvas.noStroke();
        this.trailCanvas.fill(this.colours.grass);
        this.trailCanvas.ellipse(this.player.x, this.player.y, this.player.radius*2);

        image(this.trailCanvas, width/2-this.player.x+this.cameraX, height/2-this.player.y+this.cameraY, this.mapSize, this.mapSize);
    }

    displayPlayer() {

        noStroke();
        fill(this.colours.snow);
        ellipse(width/2+this.cameraX, height/2+this.cameraY, this.player.radius*2);

        if (this.player.radius > 25) {

            push();

            translate(width/2+this.cameraX, height/2+this.cameraY);
            translate(0, sin(frameCount*0.05)*2);
            rotate(sin(frameCount*0.03)*0.05);
            imageMode(CENTER);
            image(assets.day3SnowmanFace, 0, 0, 40, 40);

            pop();
        }
    }

    moveCamera() {

        if (this.player.x < width/2) {
            this.cameraX = this.player.x-width/2;
        }
        if (this.player.x > this.mapSize-width/2) {
            this.cameraX = width/2-this.mapSize+this.player.x;
        }
        if (this.player.y < height/2) {
            this.cameraY = this.player.y-height/2;
        }
        if (this.player.y > this.mapSize-height/2) {
            this.cameraY = height/2-this.mapSize+this.player.y;
        }
    }

    Player = class {

        constructor(mapSize) {

            this.mapSize = mapSize;

            this.reset(mapSize);
        }

        reset() {

            this.x = this.mapSize/2;
            this.y = this.mapSize/2;
            this.velX = 0;
            this.velY = 0;
            this.radius = 10;
        }

        update() {

            this.move();
        }

        move() {

            let friction = 0.93;

            this.velX *= friction;
            this.velY *= friction;

            this.x += this.velX;
            this.y += this.velY;

            if (this.x > this.mapSize-this.radius) this.x = this.mapSize-this.radius;
            if (this.x < this.radius) this.x = this.radius;
            if (this.y > this.mapSize-this.radius) this.y = this.mapSize-this.radius;
            if (this.y < this.radius) this.y = this.radius;

            if (!keyIsPressed) return;

            let speed = 0.3;

            let pressingLeft = keyIsDown(LEFT_ARROW) || keyIsDown(65);
            let pressingRight = keyIsDown(RIGHT_ARROW) || keyIsDown(68);
            let pressingUp = keyIsDown(UP_ARROW) || keyIsDown(87);
            let pressingDown = keyIsDown(DOWN_ARROW) || keyIsDown(83);

            if (pressingLeft && pressingRight) {
                // do nothing
            } else if (pressingLeft) {
                this.velX -= speed;
            } else if (pressingRight) {
                this.velX += speed;
            }

            if (pressingUp && pressingDown) {
                // do nothing
            } else if (pressingUp) {
                this.velY -= speed;
            } else if (pressingDown) {
                this.velY += speed;
            }
        }
    }

    SnowCollider = class {

        constructor(x, y, radius) {

            this.x = x;
            this.y = y;
            this.radius = radius/2;

            this.reset();
        }

        reset() {

            this.collided = false;
        }

        collide(player) {

            if (this.collided) return;

            let distance = dist(this.x, this.y, player.x, player.y);
            let radii = this.radius + player.radius;

            if (distance < radii) {
                this.collided = true;
                player.radius += 0.1;
            }
        }
    }
}