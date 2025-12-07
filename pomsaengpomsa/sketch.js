// 게임 상태 상수
const STATE_START = 0;
const STATE_POSE_MATCH = 1;
const STATE_WALL_APPROACH = 2;
const STATE_CALIBRATION = 3;
const STATE_CREDITS = 4;

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
let cameraController;
let logo;
let creditScreen;

//BGM
let gameBgm, titleBgm;
let audioInitialized = false; //오디오 권한 한번 얻기

// 메뉴 요소
let menuContainer;
let nicknameInput;
let mouseBtn, cameraBtn;
let poseMapBtn, wallMapBtn;
let startGameBtn;
let selectedMode = 'MOUSE';
let selectedMap = 'POSE';


// 자동 진행 관련 (카메라 모드 전용)
let autoProgressTimer = 0;
let autoProgressDelay = 60; // 1초 (60프레임)
let isAutoProgressing = false;

function preload() {
  logo = loadImage('assets/digitalLogo.png');
  grassTexture = loadImage('assets/grass.jpeg');
  brickTexture = loadImage('assets/brick.jpg');
  gameBgm = loadSound("assets/gameBGM.mp3");
  titleBgm = loadSound("assets/titleBGM.mp3");
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

  // 팝업창
  popup = new Popup();

  // 크레딧
  creditScreen = new CreditScreen();
  
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
      }
    
      drawBackButton();
    } else if (currentState === STATE_CREDITS) {
      image(logo, width - (width/5), height/30, 200, 40);
      creditScreen.draw();
    }
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

  image(logo, width - (width/12), height/30, 120, 50);
}


function startGame() {
  let nickname = nicknameInput.value();
  if (nickname.trim() === '') {
    popup.open("오류", "닉네임을 입력해주세요.");
    return;
  }

  // 닉네임 중복 확인 로직 (옵션)
  let scores = LocalStorageManager.getItem('poseGameScores') || [];
  let isDuplicate = scores.some(score => score.nickname === nickname);
  if (isDuplicate) {
    popup.open("오류", "이미 사용중인 닉네임입니다.");
    return;
  }
  
  menuContainer.style('display', 'none');
  controlMode = selectedMode;

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

  //오디오 삽입 - 게임이 시작되면 BGM 전환
  if (titleBgm && titleBgm.isPlaying()) { //titleBgm이 존재하고 재생 중이라면
    titleBgm.stop();
  }
  if (gameBgm && !gameBgm.isPlaying()) { //gameBgm이 존재하고 재생 중이 아니라면
    gameBgm.loop();
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
    let infoBtnDist = dist(mouseX, mouseY, 50, 50) < 25;
    
    if (infoBtnDist) {
      popup.open("🎮게임설명🎮",
        "⭐모드 선택⭐\n" +
        "🖲️마우스 모드 : 캐릭터의 관절(작은 원)을 잡고 마우스로 드래그합니다.\n" +
        "📸카메라 모드 : 카메라 권한이 필요합니다. 신체의 발 끝까지 화면에 보이도록 서주세요.\n\n" +
        "⭐맵 선택⭐\n" +
        "🤸포즈 : 제시되는 자세에 맞게 캐릭터의 포즈를 취해주세요.\n" +
        "🧱맵 : 다가오는 벽에 뚫려있는 자세에 맞게 캐릭터의 포즈를 취해주세요\n\n\n" +
        //"Developer\n" +
        "© 2025. Department of Media Management, Soongsil University\n" +
        "김동민, 이가영, 임소연. All rights reserved.\n"
        //숭실대학교 디지털미디어학과 25학번 김동민, 이가영, 임소연\n"
      );
    }
  } else {
    // 뒤로가기 버튼 (좌상단)
    if (mouseX > 10 && mouseX < 90 && mouseY > 10 && mouseY < 40) {
      currentState = STATE_START;
      menuContainer.style('display', 'block');
      controlMode = 'MOUSE'; // 마우스 모드로 리셋
      poseManager.setCameraMode(false); // 마우스용 포즈로 리셋
      if (gameBgm && gameBgm.isPlaying()) gameBgm.stop();
      if (titleBgm && !titleBgm.isPlaying()) titleBgm.loop();
      // Reset game states if needed
      if (ragdoll) ragdoll.reset();
      if (wallGame) wallGame.createNewWall();
      return;
    }
    
    if (currentState === STATE_POSE_MATCH || currentState === STATE_WALL_APPROACH) {
      ragdoll.startDrag(mouseX, mouseY);
    }
  }

  //오디오 삽입 - 처음 클릭시 타이틀용 BGM 재생
  if (!audioInitialized) {
    userStartAudio().then(() => {
      audioInitialized = true;
      if (!titleBgm.isPlaying() && !gameBgm.isPlaying()) {
        titleBgm.loop();
      }
    });
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

  if ((currentState !== STATE_START) && (currentState !== STATE_CREDITS)) {
    if (key === 'c' || key === 'C') {
      currentState = STATE_CREDITS;
      //오디오 삽입 - 게임 종료 후 크레딧 넘어가면 게임bgm 다시 재생
      gameBgm.stop();
      gameBgm.loop();
    }
  }
}

