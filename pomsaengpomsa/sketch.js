// 게임 상태 상수
const STATE_START = 0;
const STATE_POSE_MATCH = 1;
const STATE_WALL_APPROACH = 2;
const STATE_CALIBRATION = 3;

let currentState = STATE_START;
let controlMode = 'MOUSE'; // 'MOUSE' 또는 'CAMERA'
let nextStateAfterCalibration = STATE_POSE_MATCH; // 캘리브레이션 후 이동할 상태

// 캔버스 크기 제한 (작은 화면 지원)
const MIN_WIDTH = 960;
const MIN_HEIGHT = 600;
const MAX_WIDTH = 1920;
const MAX_HEIGHT = 1200;
const ASPECT_RATIO = 16 / 10;

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
let nicknameInput;
let cameraController;

// 자동 진행 관련 (카메라 모드 전용)
let autoProgressTimer = 0;
let autoProgressDelay = 60; // 1초 (60프레임)
let isAutoProgressing = false;

function preload() {
  grassTexture = loadImage('assets/grass.jpeg');
  brickTexture = loadImage('assets/brick.jpg');
}

// 캠버스 크기 계산 함수
function calculateCanvasSize() {
  let canvasWidth = windowWidth;
  let canvasHeight = windowHeight;
  
  // 비율 유지
  if (canvasWidth / canvasHeight > ASPECT_RATIO) {
    canvasWidth = canvasHeight * ASPECT_RATIO;
  } else {
    canvasHeight = canvasWidth / ASPECT_RATIO;
  }
  
  // 최소/최대 크기 제한
  canvasWidth = constrain(canvasWidth, MIN_WIDTH, MAX_WIDTH);
  canvasHeight = constrain(canvasHeight, MIN_HEIGHT, MAX_HEIGHT);
  
  return { width: canvasWidth, height: canvasHeight };
}

function setup() {
  let canvasSize = calculateCanvasSize();
  createCanvas(canvasSize.width, canvasSize.height);
  
  // 닉네임 입력 필드
  nicknameInput = createInput('');
  nicknameInput.attribute('placeholder', '닉네임을 입력하세요');
  nicknameInput.style('text-align', 'center');
  nicknameInput.size(240, 40);
  nicknameInput.style('font-size', '18px');
  nicknameInput.hide();

  // 래그돌 생성 (화면 중앙)
  ragdoll = new Ragdoll(width / 2, height / 2);
  
  // 포즈 매니저
  poseManager = new PoseManager();
  
  // UI 매니저
  uiManager = new UIManager();
  
  // 벽 게임 모드
  wallGame = new WallGame(brickTexture);

  popup = new Popup();
  
  // 카메라 컨트롤러
  cameraController = new CameraController();
}

function draw() {
  if (currentState === STATE_START) {
    drawStartScreen();
    popup.display();
  } else if (currentState === STATE_CALIBRATION) {
    // 캘리브레이션 화면
    if (cameraController) {
      cameraController.drawCalibrationScreen();
      
      // 자동 캘리브레이션 체크
      if (cameraController.checkAutoCalibration()) {
        currentState = nextStateAfterCalibration; // 설정된 다음 상태로 이동
      }
    }
  } else if (currentState === STATE_POSE_MATCH) {
    runPoseMatchGame();
  } else if (currentState === STATE_WALL_APPROACH) {
    // 카메라 모드일 경우 포즈 업데이트
    if (controlMode === 'CAMERA' && cameraController && cameraController.isCalibrated) {
      const angles = cameraController.getPoseAngles();
      if (angles) {
        ragdoll.angles = angles;
        ragdoll.updateJoints();
      }
    }
    
    wallGame.update();
    wallGame.draw();
    
    // 카메라 피드 표시
    if (controlMode === 'CAMERA' && cameraController) {
      cameraController.drawVideoFeed();
    }
    
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
  
  // 닉네임 입력 필드
  if (popup.isActive()) {
    nicknameInput.hide();
  } else {
    nicknameInput.show();
  }
  nicknameInput.position(width/2 - 120, height/2 + 120);

  // 버튼 그리기 함수
  let nickname = nicknameInput.value();
  let isNicknameEmpty = nickname.trim() === '';

  if (isNicknameEmpty) {
    drawMenuButton("게임시작", width/2, height/2 + 120, 150, 150, 150); // Disabled
  } else {
    drawMenuButton("게임시작", width/2, height/2 + 120, 100, 255, 200); // Enabled
  }
  
  drawMenuButton("포즈 맞추기 (마우스)", width/2, height/2 - 80, 100, 200, 255);
  drawMenuButton("포즈 맞추기 (카메라)", width/2, height/2, 150, 100, 255);
  drawMenuButton("벽 다가오기 (마우스)", width/2, height/2 + 80, 255, 150, 150);
  drawMenuButton("벽 다가오기 (카메라)", width/2, height/2 + 160, 255, 100, 100);
  drawMenuButton("게임 설명", width/2, height/2 + 240, 100, 255, 200);
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
  
  // 카메라 모드일 경우 포즈 업데이트
  if (controlMode === 'CAMERA' && cameraController && cameraController.isCalibrated) {
    const angles = cameraController.getPoseAngles();
    if (angles) {
      ragdoll.angles = angles;
      ragdoll.updateJoints();
    }
  }
  
  // 목표 포즈 표시 (왼쪽)
  poseManager.drawTarget(width * 0.2, height / 2);
  
  // 래그돌 그리기
  ragdoll.draw();
  
  // 점수 계산 (관절 위치 기반)
  let score = poseManager.calculateMatch(ragdoll.joints, ragdoll.angles);
  uiManager.update(score, controlMode === 'CAMERA');
  
  // UI 그리기
  uiManager.draw(poseManager);
  
  // 카메라 피드 표시
  if (controlMode === 'CAMERA' && cameraController) {
    cameraController.drawVideoFeed();
  }
  
  // 카메라 모드 자동 진행 로직
  if (controlMode === 'CAMERA' && uiManager.isSuccess()) {
    if (!isAutoProgressing) {
      // 성공 상태 시작
      isAutoProgressing = true;
      autoProgressTimer = 0;
    } else {
      // 타이머 증가
      autoProgressTimer++;
      
      // 일정 시간 후 자동으로 다음 포즈
      if (autoProgressTimer >= autoProgressDelay) {
        poseManager.nextPose();
        ragdoll.reset();
        isAutoProgressing = false;
        autoProgressTimer = 0;
      }
    }
  } else {
    // 성공 상태가 아니면 타이머 리셋
    if (isAutoProgressing) {
      isAutoProgressing = false;
      autoProgressTimer = 0;
    }
  }
  
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
    let btn6Y = height/2 + 120; // "게임시작" 버튼
    let btn1Y = height/2 - 80;  // 포즈 맞추기 (마우스)
    let btn2Y = height/2;       // 포즈 맞추기 (카메라)
    let btn3Y = height/2 + 80;  // 벽 다가오기 (마우스)
    let btn4Y = height/2 + 160; // 벽 다가오기 (카메라)
    let btn5Y = height/2 + 240; // 게임 설명
    let infoBtnDist = dist(mouseX, mouseY, 50, 50) < 25;
    
    let nickname = nicknameInput.value();
    let isNicknameEmpty = nickname.trim() === '';

    // 버튼 클릭 확인
    if (mouseX > centerX - btnW/2 && mouseX < centerX + btnW/2) {
      if (mouseY > btn1Y - btnH/2 && mouseY < btn1Y + btnH/2) {
        // 포즈 맞추기 (마우스)
        controlMode = 'MOUSE';
        poseManager.setCameraMode(false); // 마우스용 포즈로 전환
        currentState = STATE_POSE_MATCH;
      } else if (mouseY > btn2Y - btnH/2 && mouseY < btn2Y + btnH/2) {
        // 포즈 맞추기 (카메라)
        controlMode = 'CAMERA';
        nextStateAfterCalibration = STATE_POSE_MATCH;
        poseManager.setCameraMode(true); // 카메라용 포즈로 전환
        cameraController.setup().then(() => {
          currentState = STATE_CALIBRATION;
        });
      } else if (mouseY > btn3Y - btnH/2 && mouseY < btn3Y + btnH/2) {
        // 벽 다가오기 (마우스)
        controlMode = 'MOUSE';
        poseManager.setCameraMode(false); // 마우스용 포즈로 전환
        currentState = STATE_WALL_APPROACH;
      } else if (mouseY > btn4Y - btnH/2 && mouseY < btn4Y + btnH/2) {
        // 벽 다가오기 (카메라)
        controlMode = 'CAMERA';
        nextStateAfterCalibration = STATE_WALL_APPROACH;
        poseManager.setCameraMode(true); // 카메라용 포즈로 전환
        cameraController.setup().then(() => {
          currentState = STATE_CALIBRATION;
        });
      } else if (mouseY > btn5Y - btnH/2 && mouseY < btn5Y + btnH/2) {
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
      } else if (mouseY > btn2Y - btnH/2 && mouseY < btn2Y + btnH/2 && !isNicknameEmpty) {
        let scores = LocalStorageManager.getItem('poseGameScores') || [];
        let isDuplicate = scores.some(score => score.nickname === nickname);

        if (isDuplicate) {
          popup.open("오류", "이미 사용중인 닉네임입니다.");
        } else {
          scores.push({ nickname: nickname, score: 0 });
          LocalStorageManager.setItem('poseGameScores', scores);
          currentState = STATE_WALL_APPROACH;
          nicknameInput.hide();
        }
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
      nicknameInput.show();
      controlMode = 'MOUSE'; // 마우스 모드로 리셋
      poseManager.setCameraMode(false); // 마우스용 포즈로 리셋
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
  let canvasSize = calculateCanvasSize();
  resizeCanvas(canvasSize.width, canvasSize.height);
  // 래그돌 위치를 새로운 화면 중앙으로 업데이트
  if (ragdoll) {
    ragdoll.setPosition(width / 2, height / 2);
  }
}

// 키보드 이벤트
function keyPressed() {
  if (popup.isActive()) return;

  // 캘리브레이션 상태에서 ESC: 취소
  if (currentState === STATE_CALIBRATION) {
    if (keyCode === ESCAPE) {
      currentState = STATE_START;
      cameraController.cleanup();
    }
  }

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

