// 벽 게임 클래스 - 포즈 모양의 구멍이 뚫린 벽이 다가오는 게임
class WallGame {
  constructor(brickTexture) {
    this.brickTexture = brickTexture;
    this.wallScale = 0.0;
    this.wallSpeed = 0.003; // 벽이 다가오는 속도
    this.wallGraphics = null; // 구멍이 뚫린 벽 이미지
    this.gameState = 'PLAYING'; // 'PLAYING', 'SUCCESS', 'FAIL'
    this.feedbackTimer = 0;
    this.currentPoseIndex = 0;
    
    // 래그돌과 포즈 매니저 참조 (전역에서 가져옴)
    this.ragdoll = null;
    this.poseManager = null;
    
    this.setupWall();
  }
  
  setupWall() {
    // 전역 변수에서 참조 가져오기
    this.ragdoll = ragdoll;
    this.poseManager = poseManager;
    
    // 벽 그래픽스 버퍼 생성
    this.wallGraphics = createGraphics(800, 600);
    this.createNewWall();
  }
  
  createNewWall() {
    this.wallScale = 0.0;
    this.gameState = 'PLAYING';
    this.prepareWallWithHole();
  }
  
  prepareWallWithHole() {
    let g = this.wallGraphics;
    g.clear();
    
    // 1. 벽 배경 그리기
    if (this.brickTexture) {
      g.image(this.brickTexture, 0, 0, 800, 600);
      // 약간 어둡게
      g.fill(0, 120);
      g.noStroke();
      g.rect(0, 0, 800, 600);
    } else {
      // 텍스처 없으면 벽돌 패턴 그리기
      g.background(140, 70, 60);
      g.stroke(100, 50, 40);
      g.strokeWeight(2);
      for(let y = 0; y < 600; y += 30) {
        g.line(0, y, 800, y);
        for(let x = 0; x < 800; x += 60) {
          let offset = (Math.floor(y / 30) % 2 === 0) ? 0 : 30;
          g.line(x + offset, y, x + offset, y + 30);
        }
      }
    }
    
    // 2. 포즈 모양의 구멍 뚫기
    g.push();
    // 래그돌 위치(400, 300)에 맞춰서 구멍 위치 설정
    g.translate(400, 300);
    
    // 지우개 모드로 구멍 뚫기
    g.erase();
    
    // 현재 포즈 가져오기
    let currentPose = this.poseManager.getCurrentPose();
    
    // 포즈 스틱 피겨를 그려서 구멍 만들기
    this.drawPoseHole(g, currentPose.angles);
    
    g.noErase();
    g.pop();
  }
  
  drawPoseHole(g, angles) {
    // 포즈 모양을 두껍게 그려서 구멍 만들기 (1.5배 확대)
    let waistX = 0;
    let waistY = 0;
    let headRadius = 38;
    let upperTorsoHeight = 45;
    let lowerTorsoHeight = 45;
    let upperArmLength = 68;
    let lowerArmLength = 60;
    let upperLegLength = 75;
    let lowerLegLength = 68;
    
    // 허리에서 상체까지
    let upperTorsoX = waistX + sin(angles.waist) * upperTorsoHeight;
    let upperTorsoY = waistY - cos(angles.waist) * upperTorsoHeight;
    
    // 허리에서 하체까지
    let lowerTorsoX = waistX - sin(angles.waist) * lowerTorsoHeight;
    let lowerTorsoY = waistY + cos(angles.waist) * lowerTorsoHeight;
    
    // 팔 계산
    let leftShoulderX = upperTorsoX;
    let leftShoulderY = upperTorsoY;
    let leftElbowX = leftShoulderX + cos(angles.leftShoulder + angles.waist) * upperArmLength;
    let leftElbowY = leftShoulderY + sin(angles.leftShoulder + angles.waist) * upperArmLength;
    let leftHandX = leftElbowX + cos(angles.leftShoulder + angles.leftElbow + angles.waist) * lowerArmLength;
    let leftHandY = leftElbowY + sin(angles.leftShoulder + angles.leftElbow + angles.waist) * lowerArmLength;
    
    let rightShoulderX = upperTorsoX;
    let rightShoulderY = upperTorsoY;
    let rightElbowX = rightShoulderX + cos(angles.rightShoulder + angles.waist) * upperArmLength;
    let rightElbowY = rightShoulderY + sin(angles.rightShoulder + angles.waist) * upperArmLength;
    let rightHandX = rightElbowX + cos(angles.rightShoulder + angles.rightElbow + angles.waist) * lowerArmLength;
    let rightHandY = rightElbowY + sin(angles.rightShoulder + angles.rightElbow + angles.waist) * lowerArmLength;
    
    // 다리 계산
    let leftHipX = lowerTorsoX - 10;
    let leftHipY = lowerTorsoY;
    let leftKneeX = leftHipX + cos(angles.leftHip + PI/2) * upperLegLength;
    let leftKneeY = leftHipY + sin(angles.leftHip + PI/2) * upperLegLength;
    let leftFootX = leftKneeX + cos(angles.leftHip + angles.leftKnee + PI/2) * lowerLegLength;
    let leftFootY = leftKneeY + sin(angles.leftHip + angles.leftKnee + PI/2) * lowerLegLength;
    
    let rightHipX = lowerTorsoX + 10;
    let rightHipY = lowerTorsoY;
    let rightKneeX = rightHipX + cos(angles.rightHip + PI/2) * upperLegLength;
    let rightKneeY = rightHipY + sin(angles.rightHip + PI/2) * upperLegLength;
    let rightFootX = rightKneeX + cos(angles.rightHip + angles.rightKnee + PI/2) * lowerLegLength;
    let rightFootY = rightKneeY + sin(angles.rightHip + angles.rightKnee + PI/2) * lowerLegLength;
    
    // 머리
    let headX = upperTorsoX + sin(angles.waist + angles.neck) * headRadius;
    let headY = upperTorsoY - cos(angles.waist + angles.neck) * headRadius;
    
    // 구멍을 넉넉하게 뚫기 위해 두껍게 그리기 (1.5배 확대)
    let holeWidth = 38; // 구멍 두께
    
    g.strokeWeight(holeWidth);
    g.stroke(0);
    
    // 몸통
    g.line(waistX, waistY, upperTorsoX, upperTorsoY);
    g.line(waistX, waistY, lowerTorsoX, lowerTorsoY);
    
    // 팔
    g.line(leftShoulderX, leftShoulderY, leftElbowX, leftElbowY);
    g.line(leftElbowX, leftElbowY, leftHandX, leftHandY);
    g.line(rightShoulderX, rightShoulderY, rightElbowX, rightElbowY);
    g.line(rightElbowX, rightElbowY, rightHandX, rightHandY);
    
    // 다리
    g.line(leftHipX, leftHipY, leftKneeX, leftKneeY);
    g.line(leftKneeX, leftKneeY, leftFootX, leftFootY);
    g.line(rightHipX, rightHipY, rightKneeX, rightKneeY);
    g.line(rightKneeX, rightKneeY, rightFootX, rightFootY);
    
    // 머리 (원)
    g.fill(0);
    g.noStroke();
    g.circle(headX, headY, headRadius * 2.5);
  }
  
  update() {
    if (this.gameState !== 'PLAYING') {
      this.feedbackTimer--;
      if (this.feedbackTimer <= 0) {
        // 다음 포즈로
        this.poseManager.nextPose();
        this.ragdoll.reset();
        this.createNewWall();
      }
      return;
    }
    
    // 벽 다가오기
    this.wallScale += this.wallSpeed;
    
    // 벽이 래그돌 위치에 도달했을 때 충돌 판정
    if (this.wallScale >= 1.0) {
      this.wallScale = 1.0;
      this.checkCollision();
    }
  }
  
  checkCollision() {
    // 래그돌과 목표 포즈 비교
    let score = this.poseManager.calculateMatch(this.ragdoll.joints, this.ragdoll.angles);
    
    // 카메라 모드일 때는 난이도 낮춤 (55%), 마우스 모드는 65%
    let threshold = (controlMode === 'CAMERA') ? 55 : 65;
    
    if (score >= threshold) {
      this.gameState = 'SUCCESS';
      this.feedbackTimer = 90; // 1.5초
    } else {
      this.gameState = 'FAIL';
      this.feedbackTimer = 90;
    }
  }
  
  draw() {
    // 배경
    this.drawBackground();
    
    // 벽 그리기 (원근감 효과)
    this.drawWall();
    
    // 래그돌 그리기
    this.ragdoll.draw();
    
    // 목표 포즈 미리보기 (작게, 우측 상단)
    this.drawPosePreview();
    
    // 피드백 메시지
    this.drawFeedback();
    
    // 진행도 바
    if (this.gameState === 'PLAYING') {
      this.drawProgressBar();
    }
  }
  
  drawBackground() {
    // 그라데이션 배경
    for (let y = 0; y < height; y++) {
      let inter = map(y, 0, height, 0, 1);
      let c = lerpColor(color(20, 20, 40), color(60, 40, 80), inter);
      stroke(c);
      line(0, y, width, y);
    }
    
    // 집중선 효과
    push();
    translate(width/2, height/2);
    stroke(255, 255, 255, 30);
    strokeWeight(2);
    let numLines = 16;
    for (let i = 0; i < numLines; i++) {
      let angle = (TWO_PI / numLines) * i;
      let x = cos(angle) * width;
      let y = sin(angle) * height;
      line(0, 0, x, y);
    }
    pop();
  }
  
  drawWall() {
    push();
    
    // 원근감: 벽이 멀리 있을 때는 작고, 가까이 올수록 커짐
    let scaleAmount = map(this.wallScale, 0, 1, 0.1, 1.2);
    
    translate(width/2, height/2);
    scale(scaleAmount);
    
    imageMode(CENTER);
    image(this.wallGraphics, 0, 0);
    
    pop();
  }
  
  drawPosePreview() {
    push();
    fill(50, 50, 70, 200);
    noStroke();
    rectMode(CORNER);
    rect(width - 240, 50, 220, 280, 10);
    
    fill(255);
    textAlign(CENTER);
    textSize(width * 0.013); // 반응형 크기
    text("목표 포즈", width - 130, 75);
    
    // 작은 포즈 그리기
    translate(width - 130, 190);
    scale(0.6);
    this.poseManager.drawPoseStick(this.poseManager.getCurrentPose().angles);
    
    pop();
  }
  
  drawFeedback() {
    if (this.gameState === 'PLAYING') return;
    
    push();
    textAlign(CENTER, CENTER);
    textSize(width * 0.067); // 반응형 크기
    stroke(0);
    strokeWeight(6);
    
    if (this.gameState === 'SUCCESS') {
      fill(100, 255, 100);
      text("통과!", width/2, height/2 - 50);
      
      textSize(width * 0.025); // 반응형 크기
      noStroke();
      fill(255);
      text("완벽합니다! 🎉", width/2, height/2 + 20);
    } else {
      fill(255, 100, 100);
      text("충돌!", width/2, height/2 - 50);
      
      textSize(width * 0.025); // 반응형 크기
      noStroke();
      fill(255);
      text("포즈를 다시 맞춰보세요!", width/2, height/2 + 20);
    }
    pop();
  }
  
  drawProgressBar() {
    push();
    fill(255, 0, 0, 150);
    noStroke();
    rect(0, height - 10, width * this.wallScale, 10);
    pop();
  }
}