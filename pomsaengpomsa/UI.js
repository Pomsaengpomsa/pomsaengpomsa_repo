// UI 렌더링 클래스
class UIManager {
  constructor() {
    this.matchScore = 0;
    this.successThreshold = 90; // 통과 기준 (더 어려움)
  }
  
  update(score) {
    this.matchScore = score;
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
    textSize(14);
    textAlign(LEFT);
    // 뒤로가기 버튼 아래로 이동
    text("빨간 점을 드래그하여 포즈를 맞춰보세요!", 10, 65);
    textSize(12);
    fill(200, 200, 200);
    text("스페이스: 리셋 | N: 다음 포즈", 10, 85);
    pop();
  }
  
  drawScore() {
    push();
    fill(255);
    noStroke();
    textAlign(RIGHT, TOP);
    textSize(24);
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
    textSize(20);
    let currentLevel = poseManager.currentIndex + 1;
    let totalLevels = poseManager.getTotalPoses();
    text("레벨 " + currentLevel + " / " + totalLevels, 20, height - 20);
    pop();
  }
  
  drawSuccessMessage() {
    if (this.matchScore >= this.successThreshold) {
      push();
      
      // 배경
      fill(0, 0, 0, 150);
      noStroke();
      rectMode(CENTER);
      rect(width/2, height/2 - 80, 400, 120, 15);
      
      // 성공 텍스트
      fill(100, 255, 100);
      textAlign(CENTER);
      textSize(40);
      text("완벽합니다! 🎉", width/2, height/2 - 90);
      
      textSize(18);
      fill(255, 255, 100);
      text("정확도 " + nf(this.matchScore, 2, 1) + "% 달성!", width/2, height/2 - 60);
      
      textSize(16);
      fill(255);
      text("N키를 눌러 다음 포즈로 이동하세요", width/2, height/2 - 30);
      
      pop();
    }
  }
  
  isSuccess() {
    return this.matchScore >= this.successThreshold;
  }
}
