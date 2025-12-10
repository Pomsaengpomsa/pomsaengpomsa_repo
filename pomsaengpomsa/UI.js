// UI 렌더링 클래스
class UIManager {
  constructor() {
    this.matchScore = 0;
    this.successThreshold = 90; // 마우스 모드 통과 기준
    this.cameraSuccessThreshold = 55; // 카메라 모드 통과 기준 (벽 모드와 동일)
    this.isCameraMode = false;
  }
  
  update(score, isCameraMode = false) {
    this.matchScore = score;
    this.isCameraMode = isCameraMode;
  }
  
  // 현재 모드에 맞는 threshold 반환
  getCurrentThreshold() {
    return this.isCameraMode ? this.cameraSuccessThreshold : this.successThreshold;
  }
  
  draw(poseManager) {
    this.drawInstructions();
    this.drawScore();
    this.drawProgressBar();
    this.drawLevelInfo(poseManager);
    this.drawSuccessMessage();
  }
  
  drawInstructions() {
    push();
    fill(255, 200);
    noStroke();
    textSize(width * 0.012); // 반응형 크기
    textAlign(LEFT);
    // 뒤로가기 버튼 아래로 이동
    if (this.isCameraMode) {
      text("카메라를 보고 포즈를 맞춰보세요!", 10, 65);
      textSize(width * 0.010); // 반응형 크기
      fill(200, 200, 200);
      text("스페이스: 리셋 | 55% 이상 시 자동 진행", 10, 85);
    } else {
      text("빨간 점을 드래그하여 포즈를 맞춰보세요!", 10, 65);
      textSize(width * 0.010); // 반응형 크기
      fill(200, 200, 200);
      text("스페이스: 리셋 | N: 다음 포즈", 10, 85);
    }
    pop();
  }
  
  drawScore() {
    push();
    fill(255);
    noStroke();
    textAlign(RIGHT, TOP);
    textSize(width * 0.020); // 반응형 크기
    // 상단 우측에 점수 표시
    text("일치도: " + nf(this.matchScore, 2, 1) + "%", width - 20, 20);
    pop();
  }
  
  drawProgressBar() {
    push();
    
    let barWidth = 200;
    let barHeight = 15;
    // 점수 텍스트 아래에 위치
    let barX = width - barWidth - 20;
    let barY = 55;
    
    // 배경
    fill(50);
    noStroke();
    rect(barX, barY, barWidth, barHeight, 8);
    
    // 진행도
    let progress = map(this.matchScore, 0, 100, 0, barWidth);
    let barColor = this.getProgressColor(this.matchScore);
    fill(barColor);
    rect(barX, barY, progress, barHeight, 8);
    
    // 테두리
    noFill();
    stroke(100);
    strokeWeight(1);
    rect(barX, barY, barWidth, barHeight, 8);
    
    pop();
  }
  
  getProgressColor(score) {
    if (score < 50) return color(255, 100, 100); // 빨강
    if (score < 75) return color(255, 200, 100); // 주황
    if (score < 95) return color(255, 255, 100); // 노랑
    return color(100, 255, 150); // 초록 (95점 이상)
  }
  
  drawLevelInfo(poseManager) {
    push();
    fill(255);
    noStroke();
    textAlign(LEFT);
    textSize(width * 0.017); // 반응형 크기
    let currentLevel = poseManager.currentIndex + 1;
    let totalLevels = poseManager.getTotalPoses();
    text("레벨 " + currentLevel + " / " + totalLevels, 20, height - 20);
    pop();
  }
  
  drawSuccessMessage() {
    if (this.matchScore >= this.getCurrentThreshold()) {
      push();
      
      // 배경
      fill(0, 0, 0, 150);
      noStroke();
      rectMode(CENTER);
      rect(width/2, height/2 - 80, 400, 180, 15);
      
      // 성공 텍스트
      fill(100, 255, 100);
      textAlign(CENTER);
      textSize(width * 0.033); // 반응형 크기
      text("완벽합니다! 🎉", width/2, height/2 - 90);
      
      textSize(width * 0.015); // 반응형 크기
      fill(255, 255, 100);
      text("정확도 " + nf(this.matchScore, 2, 1) + "% 달성!", width/2, height/2 - 60);
      
      textSize(width * 0.013); // 반응형 크기
      fill(255);
      // 카메라 모드일 때는 자동 진행 안내
      if (this.isCameraMode) {
        text("잠시 후 다음 포즈로 이동합니다...", width/2, height/2 - 30);
      } else {
        text("N키를 눌러 다음 포즈로 이동하세요", width/2, height/2 - 30);
      }
      
      pop();
    }
  }
  
  isSuccess() {
    return this.matchScore >= this.getCurrentThreshold();
  }
}
