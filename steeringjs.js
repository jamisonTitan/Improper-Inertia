const SCALE = 900, TOTALPOINTS = 5;

const points = [];
const fruits = [];
const doors = [];
const bgRects = [];

let p;
let up, down, left, right;
let fleeRadius = 50;
let bg = 70;
let opacity = 200;
let trail = false;
let fruitsCollected = 0;
let paused = false;

function setup() {
  let sound = new Audio("\Sungazer - Dream of Mahjong2.mp3");
  sound.loop = true;
  sound.play();
  let doorSound = new Audio("\doorSound.mp3");
    let collectedSound = new Audio("fruitCollectedSound.mp3");

  let canvas = createCanvas(SCALE * 1.6, SCALE);
  canvas.parent('sketch-holder');
  background(bg);

  const bgRect = function(x,y, width, height) {
      this.x = x;
      this.y = y;
      this.opacityMod = 0.0;
      this.width = width;
      this.height = height;
  }

  const Player = function(x, y, speed) {
    this.x = x,
    this.y = y,
    this.speed = speed;
  };

  p = new Player(SCALE * 1.6 / 2,SCALE / 2, 12);

const Door = function(x,y,bg) {
  this.x = x;
  this.y = y;
  this.bg = bg;
}

Door.prototype.show = function() {
  fill(255);
  strokeWeight(2);
  stroke(0);
  rect(this.x, this.y, 30,30);
}

Door.prototype.update = function() {
    if(p.x < this.x + 30 && p.x > this.x && p.y > this.y && p.y < this.y + 30){
        background((random() * 50) + 50);
        doorSound.play();
        if(Math.random() <= 0.5){
          if(trail === true){trail = false;}else{trail = true;}
        }
        let tempx, tempy;
        points.forEach(point => {
          tempx = p.x + (Math.random() * 200) - 100; tempy =  p.y + (Math.random() * 200) - 100;
          point.target = new p5.Vector(tempx, tempy);
          point.pos.x = tempx + random(10);
          point.pos.y = tempy + random(10);
        });
        fruits.splice(0,fruits.length);
        doors.splice(0,doors.length);
        bgRects.splice(0,bgRects.length);
        p.loadWorld();

    }
}

const Point = function(x, y) {
      this.pos = new p5.Vector(x, y),
      this.target = new p5.Vector(x, y),
      this.vel = new p5.Vector(),
      this.acc = new p5.Vector(),
      this.r = 8,
      this.maxspeed = 10,
      this.maxforce = 0.3,
      this.r = Math.random() * 125,
      this.g = Math.random() * 125,
      this.b = Math.random() * 125;
  };

  const Fruit = function(x, y){
    this.x = x;
    this.y = y;
  }

  Fruit.prototype.show = function() {
    stroke(0);
    fill(Math.random() * 200, Math.random() * 100, Math.random() * 80);
    ellipse(this.x,this.y,20,20);
  }

  Fruit.prototype.update = function() {
    if(p.x < this.x + 10 && p.x > this.x -10 && p.y > this.y - 10 && p.y < this.y + 10){
      for(let i =0; i < fruits.length; i++){
        if(fruits[i].x === this.x){
          fruits.splice(i, 1);
          collectedSound.play();
          fruitsCollected += 1;
          fleeRadius += 10;
          p.speed += 3;
        }
      }
    }
  }

  Player.prototype.addPoint = function() {
    let tempx = Math.random() * 1000, tempy = Math.random() * 1000;
     if(Math.random() <= 0.5){ tempx *= -1; tempy *= -1;}
     points.push(new Point((this.x + tempx), (this.y + tempy) ));
  }

  Player.prototype.addBgRect = function() {
    let tempx = Math.random() * 500, tempy = Math.random() * 500;
    let temph = 50 +(Math.random() * 50), tempw = 50 +(Math.random() * 50);
     if(Math.random() <= 0.5){ tempx *= -1; tempy *= -1;}
     bgRects.push(new bgRect((this.x + tempx), (this.y + tempy), tempw, temph));
  }

  Player.prototype.loadWorld = function() {

      let tempx, tempy, doorx, doory;
      for(let i = 0;i < 15; i++){
        tempx = (Math.random() * 3000) - 1500; tempy = (Math.random() * 3000) - 1500;
              fruits.push(new Fruit(this.x + tempx,this.y + tempy));
      }

      for(let i = 0; i < 5; i++){
        doorx = (Math.random() * 3000) - 1500; doory = (Math.random() * 3000) - 1500;
        doors.push(new Door(doorx, doory, random(100)));
      }
          bg = (random() * 50) + 50;
    }


    p.loadWorld();

  Point.prototype.arrive = function(target) {
    let desired = p5.Vector.sub(target, this.pos);
    let d = desired.mag();
    let speed = this.maxspeed;
    if (d < 50) {
      speed = map(d ,0 , 50, 0, this.maxspeed);
    }

    desired.setMag(speed);
    let steer = p5.Vector.sub(desired, this.vel);
    steer.limit(this.maxforce);
    return steer;
  }

  Point.prototype.flee = function(target) {
    let desired = p5.Vector.sub(target, this.pos);
    let d = desired.mag();
    if(d < fleeRadius){
    desired.setMag(this.maxspeed);
    desired.mult(-2);
    let steer = p5.Vector.sub(desired, this.vel);
    steer.limit(this.maxforce);
    return steer;
    }else{
      return new p5.Vector(0,0);
    }
  }

  Point.prototype.update = function() {
    this.pos.add(this.vel);
    this.vel.add(this.acc);
    this.acc.mult(0);
    //console.log("x" + this.pos.x);

    if(dist(this.pos.x,this.pos.y, p.x, p.y ) < fleeRadius / 10){
      // remove this object from points
      for(let i = 0;i < points.length; i++){
        if(points[i].pos.x === this.pos.x){
          points.splice(i, 1);
        }
      }
    }

    //console.log(indexOf(this));
  }

  Point.prototype.behaviors = function() {
    let arrive = this.arrive(this.target);
    this.applyForce(arrive);

    let mouse = createVector(p.x, p.y);
    let flee = this.flee(mouse);
    this.applyForce(flee);
  }

  Point.prototype.applyForce = function(f) {
    this.acc.add(f);
  }

  Point.prototype.show = function() {
    stroke(255);
    strokeWeight(0.06);
    if(trail){
      stroke(0);
      strokeWeight(1);
      if(Math.random() > 0.5){
      noStroke()
      }
    }
    fill(this.r,this.g,this.b,opacity + p.speed / 2);
    if(trail){ellipse(this.pos.x,this.pos.y,this.vel.x * 3 + 15,this.vel.y * 3 + 15);} else{
      ellipse(this.pos.x,this.pos.y,this.vel.x * 5 + 30,this.vel.y * 5 + 30);
    }
  }

  let tempPoint;
  for(let i = 0;i < TOTALPOINTS;i++){
    for(let j = 0;j < TOTALPOINTS; j++){
      tempPoint = new Point((i * 30) + SCALE / 2.5 ,(j * 30) + SCALE / 2.5);
      points.push(tempPoint);
    }
  }

}
let count = 0, noiseCount = 0.0;

function draw() {


  if(points.length > 800){
    points.splice(0, points.length - 450);
  }

  count++;

  if(!trail){
    if(Math.random() <= 0.5){noiseCount += 0.006}else{noiseCount -= 0.006}

    background(noise(noiseCount) * 170);
  }
  if(count % 50 === 0){
    if(bgRects.length < 100){
    p.addBgRect();
  }
  }
  let tempNoiseMod;
  bgRects.forEach(bgrect => {
    tempNoiseMod = Math.random() ;
    if(tempNoiseMod < 0.5){bgrect.opacityMod += 0.004}else {bgrect.opacityMod += 0.004}
    fill(noise(bgrect.opacityMod) * 255);
    noStroke();
    rect(bgrect.x, bgrect.y,bgrect.width,bgrect.height);
  })

  if(count % 20 === 0){
    p.addPoint();
  }
  //push();
  //  translate(-p.x, -p.y);
if(!paused){

  points.forEach(point => {
    point.behaviors();
    point.update();
    point.show();
  });

  fruits.forEach(fruit => {
    fruit.update();
    fruit.show();
  });

  doors.forEach(door => {
    door.update();
    door.show();
  });

  //pop();
  // background(100);
  noStroke();
  fill(255);
  ellipse(p.x,p.y,15,15);
}

  textSize(30);
  fill(255);
  stroke(0);
  text("Score: " + fruitsCollected,30,30);


//key input
  window.onkeydown = function(e) {
    let code = e.keyCode ? e.keyCode : e.which;
    if (code === 38) { //up key
      up = true;
      //p.y -= p.speed;
    } else if (code === 37) { //left key
      left = true;
      //p.x -= p.speed;
    } else if (code === 40) { //down key
      down = true;
      //p.y += p.speed;
    } else if (code === 39) {//right key
      right = true;
      //p.x += p.speed;
    }
  }
  window.onkeyup = function(e) {
    let code = e.keyCode ? e.keyCode : e.which;
    if (code === 38) { //up key
      up = false;
      //p.y -= p.speed;
    } else if (code === 37) { //left key
      left = false;
      //p.x -= p.speed;
    } else if (code === 40) { //down key
      down = false;
      //p.y += p.speed;
    } else if (code === 39) {//right key
      right = false;
      //p.x += p.speed;
    }
  }

    if(up){

      points.forEach(point => {
        point.pos.y -= (Math.random() * p.speed) / 5;
        point.target.y += p.speed / 5;
       });

      fruits.forEach(fruit => {fruit.y += p.speed / 5;});
      bgRects.forEach(bgrect => {bgrect.y += p.speed / 5;});
      doors.forEach(door => {door.y += p.speed / 5;});
      //p.y -= p.speed;
    }
    if(down){

      points.forEach(point => {
        point.pos.y += (Math.random() * p.speed) / 5;
        point.target.y -= p.speed / 5;
      });

      fruits.forEach(fruit => {fruit.y -= p.speed / 5;});
      bgRects.forEach(bgrect => {bgrect.y -= p.speed / 5;});
      doors.forEach(door => {door.y -= p.speed / 5;});
      //p.y += p.speed;
    }
    if(left){

      points.forEach(point => {
        point.pos.x -= (Math.random() * p.speed) / 5;
        point.target.x += p.speed / 5;
      });

      fruits.forEach(fruit => {fruit.x += p.speed / 5;});
      bgRects.forEach(bgrect => {bgrect.x += p.speed / 5;});
      doors.forEach(door => {door.x += p.speed / 5;});
      //p.x -= p.speed;
    }
    if(right){

      points.forEach(point => {
        point.pos.x += (Math.random() * p.speed) / 50;
        point.target.x -= p.speed / 5;
      });

      fruits.forEach(fruit => {fruit.x -= p.speed / 5;});
      bgRects.forEach(bgrect => {bgrect.x -= p.speed / 5;});
      doors.forEach(door => {door.x -= p.speed / 5;});
      //p.x += p.speed;
    }


}
