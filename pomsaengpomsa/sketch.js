// 게임 상태 상수
const STATE_START = 0;
const STATE_POSE_MATCH = 1;
const STATE_WALL_APPROACH = 2;

let currentState = STATE_START;

// 게임 오브젝트
let ragdoll;
let poseManager;
let uiManager;
let wallGame;

// 텍스처
let grassTexture;
let brickTexture;

//화면 객체
let popup;

function preload() {
  grassTexture = loadImage('assets/grass.jpeg');
  brickTexture = loadImage('assets/brick.jpg');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  // 래그돌 생성 (화면 중앙)
  ragdoll = new Ragdoll(width / 2, height / 2);
  
  // 포즈 매니저
  poseManager = new PoseManager();
  
  // UI 매니저
  uiManager = new UIManager();
  
  // 벽 게임 모드
  wallGame = new WallGame(brickTexture);

  popup = new Popup();
}

function draw() {
  if (currentState === STATE_START) {
    drawStartScreen();
    popup.display();
  } else if (currentState === STATE_POSE_MATCH) {
    runPoseMatchGame();
  } else if (currentState === STATE_WALL_APPROACH) {
    wallGame.update();
    wallGame.draw();
    drawBackButton();
  }
}

function drawStartScreen() {
  background(20, 20, 30);
  
  // 장식용 배경 패턴 (간단한 격자)
  stroke(50);
  strokeWeight(1);
  for (let x = 0; x < width; x += 40) {
    line(x, 0, x, height);
  }
  for (let y = 0; y < height; y += 40) {
    line(0, y, width, y);
  }
  
  // 타이틀
  textAlign(CENTER, CENTER);
  
  // 그림자 효과
  fill(0, 0, 0, 100);
  textSize(60);
  text("폼생폼사", width/2 + 4, height/4 + 4);
  
  // 메인 텍스트
  fill(255, 220, 100);
  text("폼생폼사", width/2, height/4);
  
  fill(200);
  textSize(24);
  text("- Perfect Pose -", width/2, height/4 + 60);
  
  // 버튼 그리기 함수
  drawMenuButton("포즈 맞추기", width/2, height/2, 100, 200, 255);
  drawMenuButton("벽 다가오기", width/2, height/2 + 80, 255, 150, 150);
  drawMenuButton("게임 설명", width/2, height/2 + 160, 100, 255, 200);
  infoButton("i", 50, 50, 25, 100,100,100);
}

function drawMenuButton(label, x, y, r, g, b) {
  let btnW = 240;
  let btnH = 60;
  let isHover = mouseX > x - btnW/2 && mouseX < x + btnW/2 && 
                mouseY > y - btnH/2 && mouseY < y + btnH/2;
  
  push();
  translate(x, y);
  
  //팝업 활성화인 경우 호버 효과 끄기
  if (isHover && !popup.isActive()) {
    // 호버 시 크기 확대 (translate를 사용해 중심 기준 확대)
    scale(1.1);
    fill(r + 30, g + 30, b + 30);
    stroke(255);
    strokeWeight(2);
    cursor(HAND);
  } else {
    fill(r, g, b);
    noStroke();
    if (!popup.isActive()) cursor(ARROW);
  }
  
  // 그림자 (호버되지 않았을 때만 표시하거나, 항상 표시하되 위치 조정)
  // 여기서는 단순화를 위해 그림자는 생략하거나 scale 이전에 그릴 수 있음
  // 하지만 이미 translate된 상태이므로, 그림자는 별도로 처리하지 않고 스타일만 변경
  
  rectMode(CENTER);
  rect(0, 0, btnW, btnH, 15);
  
  fill(30);
  noStroke();
  textSize(20);
  textStyle(BOLD);
  // 텍스트 정렬
  textAlign(CENTER, CENTER);
  text(label, 0, 0);
  textStyle(NORMAL);
  
  pop();
}

function infoButton(label, x, y, cr, r,g,b) {
  let isHover = dist(mouseX, mouseY, x, y) < cr;
  
  push();
  translate(x, y);

  if (isHover && !popup.isActive()) {
    scale(1.1);
    fill(r + 30, g + 30, b + 30);
    stroke(255,200);
    strokeWeight(2);
    cursor(HAND);
  } else {
    fill(r,g,b);
    noStroke();
    if (!popup.isActive()) cursor(ARROW);
  }

  rectMode(CORNER);
  circle(0, 0, cr * 2);

  fill(30);
  noStroke();
  textSize(24);
  textStyle(BOLD);

  textAlign(CENTER, CENTER);
  text(label, 0, 0);
  textStyle(NORMAL);

  pop();
}


function runPoseMatchGame() {
  background(30);
  
  // 목표 포즈 표시 (왼쪽)
  poseManager.drawTarget(width * 0.2, height / 2);
  
  // 래그돌 그리기
  ragdoll.draw();
  
  // 점수 계산 (관절 위치 기반)
  let score = poseManager.calculateMatch(ragdoll.joints, ragdoll.angles);
  uiManager.update(score);
  
  // UI 그리기
  uiManager.draw(poseManager);
  
  drawBackButton();
}

function drawBackButton() {
  push();
  let btnX = 10;
  let btnY = 10;
  let btnW = 80;
  let btnH = 30;
  
  // 호버 효과
  if ((mouseX > btnX && mouseX < btnX + btnW && 
      mouseY > btnY && mouseY < btnY + btnH) && !popup.isActive()) {
      fill(80);
      stroke(255);
      cursor(HAND);
  } else {
      fill(50);
      stroke(200);
      if (!popup.isActive()) cursor(ARROW);
  }
  
  strokeWeight(1);
  rectMode(CORNER);
  rect(btnX, btnY, btnW, btnH, 5);
  
  fill(255);
  noStroke();
  textSize(14);
  textAlign(CENTER, CENTER);
  text("뒤로가기", btnX + btnW/2, btnY + btnH/2);
  pop();
}

// 마우스 이벤트
function mousePressed() {
  if (popup.handleClick()) { // 팝업이 켜져있으면 뒷배경 선택 차단
    return;
  }

  if (currentState === STATE_START) {
    let btnW = 240;
    let btnH = 60;
    let centerX = width/2;
    let btn1Y = height/2;
    let btn2Y = height/2 + 80;
    let btn3Y = height/2 + 160;
    let infoBtnDist = dist(mouseX, mouseY, 50, 50) < 25;
    
    // 버튼 클릭 확인
    if (mouseX > centerX - btnW/2 && mouseX < centerX + btnW/2) {
      if (mouseY > btn1Y - btnH/2 && mouseY < btn1Y + btnH/2) {
        currentState = STATE_POSE_MATCH;
      } else if (mouseY > btn2Y - btnH/2 && mouseY < btn2Y + btnH/2) {
        currentState = STATE_WALL_APPROACH;
      } else if (mouseY > btn3Y - btnH/2 && mouseY < btn3Y + btnH/2) {
        popup.open("게임 설명",
          "-마우스 조작-\n" +
          "캐릭터의 관절(작은 원)을 잡고 마우스로 드래그하여 포즈를 만듭니다.\n" +
          "-카메라 인식-\n" +
          "카메라로 몸의 움직임을 인식하여 캐릭터를 움직입니다.\n\n" +
          "1. 포즈 맞추기 모드\n" +
          "목표 포즈와 캐릭터 포즈의 일치율을 높여 점수를 얻으세요\n" +
          "2. 벽 다가오기 모드\n" +
          "다가오는 벽의 구멍에 캐릭터를 맞춰 통과하세요\n"
        );
      }
    }
    if (infoBtnDist) {
      popup.open("INFORMATION",
        "Developer\n" +
        "숭실대학교 디지털미디어학과 25학번 김동민, 이가영, 임소연\n"
      );
    }
  } else {
    // 뒤로가기 버튼 (좌상단)
    if (mouseX > 10 && mouseX < 90 && mouseY > 10 && mouseY < 40) {
      currentState = STATE_START;
      // Reset game states if needed
      if (ragdoll) ragdoll.reset();
      if (wallGame) wallGame.createNewWall();
      return;
    }
    
    if (currentState === STATE_POSE_MATCH || currentState === STATE_WALL_APPROACH) {
      ragdoll.startDrag(mouseX, mouseY);
    }
  }
}

function mouseDragged() {
  if (popup.isActive()) return;

  if (currentState === STATE_POSE_MATCH || currentState === STATE_WALL_APPROACH) {
    ragdoll.drag(mouseX, mouseY);
  }
}

function mouseReleased() {
  if (popup.isActive()) return;
  
  if (currentState === STATE_POSE_MATCH || currentState === STATE_WALL_APPROACH) {
    ragdoll.stopDrag();
  }
}

// 창 크기 변경 이벤트
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  // 래그돌 위치를 새로운 화면 중앙으로 업데이트
  if (ragdoll) {
    ragdoll.setPosition(width / 2, height / 2);
  }
}

// 키보드 이벤트
function keyPressed() {
  if (popup.isActive()) return;

  if (currentState === STATE_POSE_MATCH) {
    // 스페이스바: 래그돌 리셋
    if (key === ' ') {
      ragdoll.reset();
    }
    
    // N키: 다음 포즈
    if (key === 'n' || key === 'N') {
      poseManager.nextPose();
      ragdoll.reset();
    }
  }
}
