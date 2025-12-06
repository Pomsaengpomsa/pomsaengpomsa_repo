// 게임 상태 상수
const STATE_START = 0;
const STATE_POSE_MATCH = 1;
const STATE_WALL_APPROACH = 2;
const STATE_CALIBRATION = 3;
const STATE_ENDING_SCORE = 4; // 게임 종료 상태 추가

// 게임 타이머 관련
let gameTimer;
let gameDuration = 60; // 1분 (60초)
let gameStartTime;
 
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

// 점수 관련
let totalScore = 0;
let scoreMultiplier = 0.1; // 포즈 모드 점수 배율

// 텍스처
let grassTexture;
let brickTexture;

//화면 객체
let popup;
let cameraController;

// 메뉴 요소
let menuContainer;
let nicknameInput;
let mouseBtn, cameraBtn;
let poseMapBtn, wallMapBtn;
let startGameBtn;
let selectedMode = 'MOUSE';
let selectedMap = 'POSE';
let nickname;


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
  
  // --- 새로운 메뉴 UI 요소 ---
  menuContainer = select('#menu-container');
  nicknameInput = select('#nickname-input');
  mouseBtn = select('#mouse-btn');
  cameraBtn = select('#camera-btn');
  poseMapBtn = select('#pose-map-btn');
  wallMapBtn = select('#wall-map-btn');
  startGameBtn = select('#start-game-btn');

  // 닉네임 입력에 따른 게임 시작 버튼 활성화/비활성화
  nicknameInput.input(() => {
    if (nicknameInput.value().trim() === '') {
      startGameBtn.attribute('disabled', '');
    } else {
      startGameBtn.removeAttribute('disabled');
    }
  });
  startGameBtn.attribute('disabled', ''); // 초기에는 비활성화

  // 버튼 클릭 이벤트 핸들러
  mouseBtn.mousePressed(() => {
    selectedMode = 'MOUSE';
    mouseBtn.addClass('active');
    cameraBtn.removeClass('active');
  });

  cameraBtn.mousePressed(() => {
    selectedMode = 'CAMERA';
    cameraBtn.addClass('active');
    mouseBtn.removeClass('active');
  });

  poseMapBtn.mousePressed(() => {
    selectedMap = 'POSE';
    poseMapBtn.addClass('active');
    wallMapBtn.removeClass('active');
  });

  wallMapBtn.mousePressed(() => {
    selectedMap = 'WALL';
    wallMapBtn.addClass('active');
    poseMapBtn.removeClass('active');
  });

  startGameBtn.mousePressed(startGame);


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
    background(20, 20, 30);
    if (currentState === STATE_START) {
        drawStartScreen();
        popup.display();
        if (!popup.isActive()) {
            menuContainer.style('display', 'block');
        } else {
            menuContainer.style('display', 'none');
        }

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
      // 캘리브레이션이 안됐을 때 안내
      if (!cameraController.isCalibrated) drawCalibrationNeeded();
    }
    
    drawBackButton();
    if (updateAndDrawTimer()) return; // 타이머 업데이트 및 표시, 게임 종료 시 즉시 반환

  } else if (currentState === STATE_ENDING_SCORE) { drawEndingScore(nickname); }
}

function drawStartScreen() {
  
  // 장식용 배경 패턴 (간단한 격자)
  stroke(50);
  strokeWeight(1);
  for (let x = 0; x < width; x += 40) {
    line(x, 0, x, height);
  }
  for (let y = 0; y < height; y += 40) {
    line(0, y, width, y);
  }
  
  infoButton("i", 50, 50, 25, 100,100,100);
}


function startGame() {
  nickname = nicknameInput.value();
  if (nickname.trim() === '') {
    popup.open("오류", "닉네임을 입력해주세요.");
    return;
  }

  menuContainer.style('display', 'none');
  controlMode = selectedMode;
  totalScore = 0; // 게임 시작 시 점수 초기화

  // 게임 모드와 관계없이 타이머 시작
  gameStartTime = millis();

  if (selectedMap === 'POSE') {
    if (controlMode === 'MOUSE') {
      poseManager.setCameraMode(false);
      currentState = STATE_POSE_MATCH;
    } else { // CAMERA
      nextStateAfterCalibration = STATE_POSE_MATCH;
      poseManager.setCameraMode(true);
      cameraController.setup().then(() => {
        currentState = STATE_CALIBRATION;
      });
    }
  } else { // WALL
    if (controlMode === 'MOUSE') {
      poseManager.setCameraMode(false);
      currentState = STATE_WALL_APPROACH;
    } else { // CAMERA
      nextStateAfterCalibration = STATE_WALL_APPROACH;
      poseManager.setCameraMode(true);
      cameraController.setup().then(() => {
        currentState = STATE_CALIBRATION;
      });
    }
  }
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
  if (updateAndDrawTimer()) return; // 타이머 업데이트 및 표시, 게임 종료 시 즉시 반환
  if (controlMode === 'CAMERA' && cameraController) {
    cameraController.drawVideoFeed();
    // 캘리브레이션이 안됐을 때 안내
    if (!cameraController.isCalibrated) drawCalibrationNeeded();
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
        // 다음으로 넘어가기 직전의 정확도로 점수 계산
        let currentScore = poseManager.calculateMatch(ragdoll.joints, ragdoll.angles);
        let points = currentScore * 1; // 100%일 때 100점
        totalScore += points;

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

function drawCalibrationNeeded() {
  push();
  fill(255, 100, 100, 200);
  noStroke();
  rectMode(CENTER);
  rect(width / 2, height / 2, 400, 100, 10);
  
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(24);
  text("카메라 인식이 불안정합니다.\nT자 포즈로 캘리브레이션을 다시 진행해주세요.", width / 2, height / 2);
  pop();
}

function updateAndDrawTimer() {
  let elapsedTime = (millis() - gameStartTime) / 1000; // 초 단위로 경과 시간 계산
  let remainingTime = gameDuration - elapsedTime;

  if (remainingTime <= 0) {
    remainingTime = 0;
    if (currentState !== STATE_ENDING_SCORE) {
      wallGame.combo = 0; // 게임 종료 시 콤보 초기화
      saveScore(nickname, totalScore);
      currentState = STATE_ENDING_SCORE;
      drawEndingScore(nickname);
      noLoop(); // draw() 루프를 멈춰서 종료 화면이 한 번만 그려지게 함
      return true; // 게임이 종료되었음을 알림
    }
  }

  // 남은 시간 표시
  push();

  textAlign(CENTER, TOP);

  // 10초 이하일 때 경고 효과
  if (remainingTime > 0 && remainingTime <= 10) {
    // 화면 가장자리에 붉은색 테두리 깜빡임 효과
    const alpha = 100 + sin(millis() / 100) * 100; // 0 ~ 200 사이에서 깜빡임
    noFill();
    stroke(255, 0, 0, alpha);
    strokeWeight(20); // 두꺼운 테두리
    rect(0, 0, width, height);

    // 타이머 텍스트도 붉은색으로 변경하고 크기 키우기
    fill(255, 100, 100);
    textSize(36);
  } else {
    // 평상시 타이머
    fill(255);
    textSize(32);
  }
  noStroke(); // 텍스트에는 테두리 없도록
  text(`남은 시간: ${ceil(remainingTime)}초`, width / 2, 20);
  pop();

  // 총 점수 표시
  push();
  fill(255, 220, 0);
  textSize(28);
  textAlign(CENTER, TOP);
  text(`SCORE: ${floor(totalScore)}`, width / 2, 60);
  pop();

  return false; // 게임이 계속 진행 중임을 알림
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

function resetGame() {
  currentState = STATE_START;
  menuContainer.style('display', 'block');
  
  // 게임 상태 초기화
  controlMode = 'MOUSE';
  poseManager.setCameraMode(false);
  ragdoll.reset();
  wallGame.createNewWall(); // 벽 게임 상태 리셋
  cameraController.cleanup(); // 카메라 리소스 정리
  totalScore = 0; // 점수 초기화
  nicknameInput.value(''); // 닉네임 입력 필드 초기화
  loop(); // 게임을 다시 시작할 때 draw() 루프를 재개
}

// 마우스 이벤트
function mousePressed() {
  if (popup.handleClick()) { // 팝업이 켜져있으면 뒷배경 선택 차단
    return;
  }

  if (currentState === STATE_START) {
    let infoBtnDist = dist(mouseX, mouseY, 50, 50) < 25;
    
    if (infoBtnDist) {
      popup.open("INFORMATION",
        "Developer\n" +
        "숭실대학교 디지털미디어학과 25학번 김동민, 이가영, 임소연\n"
      );
    }
  } else if (currentState === STATE_ENDING_SCORE) {
    // "처음으로" 버튼 클릭 확인
    let btnX = width / 2;
    let btnY = height - 100;
    let btnW = 240;
    let btnH = 60;
    if (mouseX > btnX - btnW / 2 && mouseX < btnX + btnW / 2 &&
        mouseY > btnY - btnH / 2 && mouseY < btnY + btnH / 2) {
      resetGame();
    }
  } else {
    // 뒤로가기 버튼 (좌상단)
    if (mouseX > 10 && mouseX < 90 && mouseY > 10 && mouseY < 40) {
      resetGame();
    }
    
    if (currentState === STATE_POSE_MATCH || currentState === STATE_WALL_APPROACH) {
      ragdoll.startDrag(mouseX, mouseY);
    }
  }
}

function saveScore(nickname, score) {
  if (!nickname) return;
  let scores = LocalStorageManager.getItem('poseGameScores') || [];
  const newScore = floor(score);

  // 해당 닉네임으로 저장된 기존 점수 확인
  const existingPlayerIndex = scores.findIndex(s => s.nickname === nickname);

  if (existingPlayerIndex !== -1) {
    // 기존 점수가 있을 경우, 새 점수가 더 높을 때만 갱신
    if (newScore > scores[existingPlayerIndex].score) {
      scores[existingPlayerIndex].score = newScore;
      scores[existingPlayerIndex].date = new Date().toISOString();
    }
  } else {
    // 기존 점수가 없으면 새로 추가
    scores.push({ nickname: nickname, score: floor(score), date: new Date().toISOString() });
  }

  // 먼저 현재 플레이어의 점수가 포함된 전체 목록을 저장합니다.
  LocalStorageManager.setItem('poseGameScores', scores);

  // 점수 순으로 정렬
  scores.sort((a, b) => b.score - a.score);
  // 상위 10개만 저장
  scores = scores.slice(0, 10);
  return scores; // 업데이트된 점수 목록 반환
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
      // N키를 눌렀을 때의 정확도를 기준으로 점수 계산
      let score = poseManager.calculateMatch(ragdoll.joints, ragdoll.angles);
      // 100%일 때 1000점을 얻도록 점수 계산
      let points = score * 1; // 100%일 때 100점
      totalScore += points;

      poseManager.nextPose();
      ragdoll.reset();
    }
  }
}
