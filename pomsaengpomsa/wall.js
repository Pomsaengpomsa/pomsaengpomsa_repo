let wallScale = 0.0;
let wallSpeed = 1.0 / 600.0; // (기존: 0.008)
let myCircle;

let grassTexture;
let brickTexture;

function preload() {
  grassTexture = loadImage('assets/grass.jpeg');
  brickTexture = loadImage('assets/brick.jpg');
}

function setup() {
  createCanvas(800, 600);
  myCircle = new WallFeature(0.9, color(255, 100, 100));
}

function draw() {
  drawSkyGradient();
  
  let centerY = height / 2;
  let horizonWidthOffset = width * 0.05;
  let horizonFullWidth = horizonWidthOffset * 2;
  
  fill(34, 139, 34);
  noStroke();
  beginShape();
  vertex(width / 2 - horizonWidthOffset, centerY); 
  vertex(width / 2 + horizonWidthOffset, centerY); 
  vertex(width, height);                     
  vertex(0, height);                         
  endShape(CLOSE);

  let wallBottomY = centerY + (height - centerY) * wallScale;
  let wallWidth = map(wallBottomY, centerY, height, horizonFullWidth, width);
  let wallHeight = wallWidth * (4.0 / 6.0); // 직사각형 비율 4:6
  let wallY = wallBottomY - wallHeight;
  image(brickTexture, width / 2 - wallWidth / 2, wallY, wallWidth, wallHeight);

  let wallCenterX = width / 2;
  let wallCenterY = wallY + wallHeight / 2;
  myCircle.display(wallCenterX, wallCenterY, wallWidth, wallHeight);

  // wallScale을 speed에 따라 증가시킴
  wallScale += wallSpeed;
  
  // wallScale이 1.0을 넘긴 경우 화면에 꽉찼다는 뜻. 다시 0으로 초기화
  if (wallScale > 1.0) {
    wallScale = 0.0; 
  }
}

class WallFeature {
  
  // 생성자: 객체가 처음 만들어질 때 호출됩니다.
  constructor(relativeSize, fillColor) {
    // relativeSize: 벽의 크기에 비례한 상대적 크기 (예: 0.3)
    this.relativeSize = relativeSize; 
    this.fillColor = fillColor;
  }
  
  // display: 객체가 화면에 그려지는 방식을 정의합니다.
  // 벽의 중심 좌표(centerX, centerY)와
  // 벽의 크기(w, h)를 인자로 받습니다.
  display(centerX, centerY, w, h) {
    
    // 이 객체의 지름을 벽의 높이(h)에 비례하여 계산합니다.
    let diameter = h * this.relativeSize;
    
    // 그리기
    fill(this.fillColor);
    noStroke();
    ellipse(centerX, centerY, diameter, diameter);
  }
}

// 하늘 그라데이션 함수
function drawSkyGradient() {
  let c3 = color(135, 206, 235);
  let c2 = color(80, 150, 200);
  let c1 = color(60, 120, 180);

  for (let y = 0; y < height; y++) { 
    let inter = map(y, 0, height / 2, 0, 1);
    let c;
    if (inter < 0.5) {
      c = lerpColor(c1, c2, inter * 2);
    } else {
      c = lerpColor(c2, c3, (inter - 0.5) * 2);
    }
    stroke(c);
    line(0, y, width, y);
  }
}