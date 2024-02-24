let frameBuffer;
let frameSize = 300;
let frameSpan = 16;
let totalFrames = frameSpan*frameSpan;

let wedgeBuffer;
let numWedges = 8;

let showFPS = false;

function setup (){
  pixelDensity(1);
  createCanvas();
  colorMode(HSB, 1, 1, 1);
  frameRate(30); //lock the frameRate so its more uniform across devices
  
  frameBuffer = createGraphics(frameSize*frameSpan, frameSize*frameSpan);
  frameBuffer.colorMode(HSB, 1, 1, 1);
  
  wedgeBuffer = createGraphics(1, 1);
  
  windowResized();
}

let init = () => {
  
}

let renderFrame = (idx) => {
  let cx = idx%frameSpan;
  let cy = floor(idx/frameSpan);
  
  let fc = frameCount*1.5;
  
  frameBuffer.push();
  frameBuffer.translate(cx*frameSize, cy*frameSize);
  frameBuffer.blendMode(BLEND);
  frameBuffer.noStroke();
  frameBuffer.fill(0);
  frameBuffer.rect(0, 0, frameSize, frameSize);
  
  frameBuffer.blendMode(ADD);
  frameBuffer.noFill();
  frameBuffer.translate(frameSize/2, frameSize/2);
  frameBuffer.strokeWeight(2);
  frameBuffer.scale(.7);
  frameBuffer.rotate(fc/100);
  
  for (let i = 0; i < 100; i++){
    let amt = i/100;
    frameBuffer.stroke((amt*0.5 + .3 + fc/2000)%1, 1, 1, .1);
    frameBuffer.rotate(PI/50*sin(fc/200));
    let ew = (100-i)*2*sin(fc/75);
    let eh = (100-i)*2*cos(fc/125);
    frameBuffer.rect(-i + sin(fc/150)*i - ew/2, -i-eh/2, i*2 + ew, i*2+eh);
  }
  frameBuffer.pop();
}

let renderWedge = (fc) => {
  let [w, h] = [wedgeBuffer.width, wedgeBuffer.height];
  let d =  h/4;
  let d2 = h/2;
  wedgeBuffer.background(0);
  
  //offset order
  let order = [0, 3, 4, 5, 1, 8, 9, 6, 7, 2];
  
  //[x, y] flip if x != 0
  let renderPoints = [
    [0.0, -0.5],
    [0.0, -1.0],
    [0.4, -1.6],
    [0.0, -2.2],
    [0.7, -2.3],
    [0.9, -3.0],
    [0.0, -2.9],
  ];

  wedgeBuffer.fill(128, 128);
  wedgeBuffer.push();
  wedgeBuffer.translate(w/2, h);
  wedgeBuffer.blendMode(ADD);
  let idx = 0;
  for (let p of renderPoints){
    let f = (g) => {
      wedgeBuffer.push();
      g();
      wedgeBuffer.translate(p[0]*d, p[1]*d);
      let i = order[idx];
      let frameIdx = (fc+floor(i*totalFrames/10)+1)%totalFrames;
      let x = (frameIdx%frameSpan)*frameSize;
      let y = floor(frameIdx/frameSpan)*frameSize;
      wedgeBuffer.image(frameBuffer, -d2/2, -d2/2, d2, d2, x, y, frameSize, frameSize);
      
      wedgeBuffer.pop();
      idx++;
    }

    f(() => {}); //normal
    if (p[0] != 0) f(() => {wedgeBuffer.scale(-1, 1)}) //flippped

  }
  wedgeBuffer.pop();
}

function draw(){
  let fc = floor(frameCount);
  renderFrame(fc%totalFrames);
  background(0);
  
  push();
  blendMode(ADD);
  renderWedge(fc);
  
  translate(width/2, height/2);
  rotate(frameCount/250);
  for (let i = 0; i < numWedges; i++){
    push();
    rotate(i*TAU/numWedges);
    if (!mouseIsPressed && i%2 == 0) scale(-1, 1);
    translate(-wedgeBuffer.width/2, -wedgeBuffer.height);
    translate(0, 10);
    image(wedgeBuffer, 0, 0);
    pop();
  }
  pop();
  
  if (showFPS){
    fill(1);
    text(frameRate(), 20, 20);
  }
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
  
  let a = PI/numWedges;
  let s = 1.1;
  let h = s*min(width, height)/2;
  let w = s*tan(a)*h*2;
  
  wedgeBuffer.resizeCanvas(w, h);
  
  init();
}