// 게임 오브젝트
let ragdoll;
let poseManager;
let uiManager;

function setup() {
  createCanvas(800, 600);
  
  // 래그돌 생성 (고정된 위치)
  ragdoll = new Ragdoll(500, 300);
  
  // 포즈 매니저
  poseManager = new PoseManager();
  
  // UI 매니저
  uiManager = new UIManager();
}

function draw() {
  background(30);
  
  // 목표 포즈 표시 (왼쪽)
  poseManager.drawTarget(150, 300);
  
  // 래그돌 그리기
  ragdoll.draw();
  
  // 점수 계산 (관절 위치 기반)
  let score = poseManager.calculateMatch(ragdoll.joints, ragdoll.angles);
  uiManager.update(score);
  
  // UI 그리기
  uiManager.draw(poseManager);
}

// 마우스 이벤트
function mousePressed() {
  ragdoll.startDrag(mouseX, mouseY);
}

function mouseDragged() {
  ragdoll.drag(mouseX, mouseY);
}

function mouseReleased() {
  ragdoll.stopDrag();
}

// 키보드 이벤트
function keyPressed() {
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
