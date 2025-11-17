let wallScale = 0.0;
let wallSpeed = 1.0 / 600.0; // (기존: 0.008)

function setup() {
  createCanvas(800, 600);
}

function draw() {
  background(135, 206, 235); 
  
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
  
  // 회색 벽 그리기
  fill(128, 128, 128);
  stroke(80, 80, 80);
  strokeWeight(2);
  rect(width / 2 - wallWidth / 2, wallY, wallWidth, wallHeight);

  // wallScale을 speed에 따라 증가시킴
  wallScale += wallSpeed;
  
  // wallScale이 1.0을 넘긴 경우 화면에 꽉찼다는 뜻. 다시 0으로 초기화
  if (wallScale > 1.0) {
    wallScale = 0.0; 
  }
}