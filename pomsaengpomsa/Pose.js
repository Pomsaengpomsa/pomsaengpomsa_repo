// 포즈 관리 클래스
class PoseManager {
  constructor() {
    this.poses = [];
    this.currentIndex = 0;
    this.initPoses();
  }
  
  initPoses() {
    // 포즈 1: T자 (팔 양옆 수평으로 벌리기)
    this.poses.push({
      name: "T자 포즈",
      angles: {
        leftShoulder: PI,
        leftElbow: 0,
        rightShoulder: 0,
        rightElbow: 0,
        leftHip: 0,
        leftKnee: 0,
        rightHip: 0,
        rightKnee: 0
      }
    });
    
    // 포즈 2: Y자 (만세 - 팔 위로)
    this.poses.push({
      name: "Y자 포즈",
      angles: {
        leftShoulder: PI * 3/4,
        leftElbow: 0,
        rightShoulder: -PI/4,
        rightElbow: 0,
        leftHip: 0,
        leftKnee: 0,
        rightHip: 0,
        rightKnee: 0
      }
    });
    
    // 포즈 3: 점프 (팔 위로, 다리 벌리기)
    this.poses.push({
      name: "점프 포즈",
      angles: {
        leftShoulder: -PI/2,
        leftElbow: 0,
        rightShoulder: -PI/2,
        rightElbow: 0,
        leftHip: -PI/6,
        leftKnee: 0,
        rightHip: PI/6,
        rightKnee: 0
      }
    });
    
    // 포즈 4: 깍지 포즈
    this.poses.push({
      name: "깍지 포즈",
      angles: {
        leftShoulder: 0,
        leftElbow: PI/2,
        rightShoulder: PI,
        rightElbow: -PI/2,
        leftHip: 0,
        leftKnee: 0,
        rightHip: 0,
        rightKnee: 0
      }
    });
  }
  
  getCurrentPose() {
    return this.poses[this.currentIndex];
  }
  
  nextPose() {
    this.currentIndex = (this.currentIndex + 1) % this.poses.length;
    return this.getCurrentPose();
  }
  
  getTotalPoses() {
    return this.poses.length;
  }
  
  // 현재 래그돌 포즈와 목표 포즈 비교 (관절 점 위치 기반)
  calculateMatch(ragdollJoints, ragdollAngles) {
    // 목표 포즈의 관절 위치 계산
    let targetJoints = this.calculateTargetJoints(this.getCurrentPose().angles);
    
    // 비교할 주요 관절 점들
    const keyJoints = [
      'leftElbow', 'leftHand',
      'rightElbow', 'rightHand',
      'leftKnee', 'leftFoot',
      'rightKnee', 'rightFoot'
    ];
    
    let totalDistance = 0;
    let maxAllowedDistance = 20; // 픽셀 단위 허용 거리
    
    // 각 관절 점의 거리 계산
    for (let jointName of keyJoints) {
      let actual = ragdollJoints[jointName];
      let target = targetJoints[jointName];
      
      // 두 점 사이의 거리
      let distance = dist(actual.x, actual.y, target.x, target.y);
      totalDistance += distance;
    }
    
    // 평균 거리 계산
    let avgDistance = totalDistance / keyJoints.length;
    
    // 점수 계산 (거리가 가까울수록 100점에 가까움)
    let score = max(0, 100 - (avgDistance / maxAllowedDistance * 100));
    
    return score;
  }
  
  // 목표 포즈의 관절 위치 계산 (래그돌과 동일한 위치에서)
  calculateTargetJoints(angles) {
    // 래그돌과 동일한 위치 (500, 300)
    let x = 500;
    let y = 300;
    
    // 신체 부위 크기 (Ragdoll과 동일)
    let torsoWidth = 30;
    let torsoHeight = 60;
    let upperArmLength = 45;
    let lowerArmLength = 40;
    let upperLegLength = 50;
    let lowerLegLength = 45;
    
    let joints = {};
    
    // 왼쪽 팔
    joints.leftShoulder = {
      x: x - torsoWidth / 2,
      y: y - torsoHeight / 2 + 10
    };
    
    let leftElbowX = joints.leftShoulder.x + cos(angles.leftShoulder) * upperArmLength;
    let leftElbowY = joints.leftShoulder.y + sin(angles.leftShoulder) * upperArmLength;
    joints.leftElbow = { x: leftElbowX, y: leftElbowY };
    
    let leftHandX = leftElbowX + cos(angles.leftShoulder + angles.leftElbow) * lowerArmLength;
    let leftHandY = leftElbowY + sin(angles.leftShoulder + angles.leftElbow) * lowerArmLength;
    joints.leftHand = { x: leftHandX, y: leftHandY };
    
    // 오른쪽 팔
    joints.rightShoulder = {
      x: x + torsoWidth / 2,
      y: y - torsoHeight / 2 + 10
    };
    
    let rightElbowX = joints.rightShoulder.x + cos(angles.rightShoulder) * upperArmLength;
    let rightElbowY = joints.rightShoulder.y + sin(angles.rightShoulder) * upperArmLength;
    joints.rightElbow = { x: rightElbowX, y: rightElbowY };
    
    let rightHandX = rightElbowX + cos(angles.rightShoulder + angles.rightElbow) * lowerArmLength;
    let rightHandY = rightElbowY + sin(angles.rightShoulder + angles.rightElbow) * lowerArmLength;
    joints.rightHand = { x: rightHandX, y: rightHandY };
    
    // 왼쪽 다리
    joints.leftHip = {
      x: x - 10,
      y: y + torsoHeight / 2
    };
    
    let leftKneeX = joints.leftHip.x + cos(angles.leftHip + PI/2) * upperLegLength;
    let leftKneeY = joints.leftHip.y + sin(angles.leftHip + PI/2) * upperLegLength;
    joints.leftKnee = { x: leftKneeX, y: leftKneeY };
    
    let leftFootX = leftKneeX + cos(angles.leftHip + angles.leftKnee + PI/2) * lowerLegLength;
    let leftFootY = leftKneeY + sin(angles.leftHip + angles.leftKnee + PI/2) * lowerLegLength;
    joints.leftFoot = { x: leftFootX, y: leftFootY };
    
    // 오른쪽 다리
    joints.rightHip = {
      x: x + 10,
      y: y + torsoHeight / 2
    };
    
    let rightKneeX = joints.rightHip.x + cos(angles.rightHip + PI/2) * upperLegLength;
    let rightKneeY = joints.rightHip.y + sin(angles.rightHip + PI/2) * upperLegLength;
    joints.rightKnee = { x: rightKneeX, y: rightKneeY };
    
    let rightFootX = rightKneeX + cos(angles.rightHip + angles.rightKnee + PI/2) * lowerLegLength;
    let rightFootY = rightKneeY + sin(angles.rightHip + angles.rightKnee + PI/2) * lowerLegLength;
    joints.rightFoot = { x: rightFootX, y: rightFootY };
    
    return joints;
  }
  
  angleDiff(a, b) {
    let diff = a - b;
    while (diff > PI) diff -= TWO_PI;
    while (diff < -PI) diff += TWO_PI;
    return diff;
  }
  
  // 목표 포즈 그리기
  drawTarget(x, y) {
    push();
    translate(x, y);
    
    // 배경 패널
    fill(50, 50, 70, 200);
    noStroke();
    rectMode(CENTER);
    rect(0, 0, 200, 350, 10);
    
    // 제목
    fill(255);
    textAlign(CENTER);
    textSize(16);
    text("목표 포즈", 0, -160);
    text(this.getCurrentPose().name, 0, -135);
    
    // 포즈 시각화
    this.drawPoseStick(this.getCurrentPose().angles);
    
    pop();
  }
  
  drawPoseStick(angles) {
    push();
    
    // 스틱 피규어 스타일
    stroke(255, 200, 100);
    strokeWeight(4);
    noFill();
    
    let torsoY = 0;
    let headRadius = 20;
    let torsoHeight = 50;
    let armLength = 35;
    let legLength = 40;
    
    // 머리
    circle(0, torsoY - torsoHeight - headRadius, headRadius * 2);
    
    // 몸통
    line(0, torsoY - torsoHeight, 0, torsoY + torsoHeight);
    
    // 왼쪽 팔
    let leftShoulderX = 0;
    let leftShoulderY = torsoY - torsoHeight + 5;
    let leftElbowX = leftShoulderX + cos(angles.leftShoulder) * armLength;
    let leftElbowY = leftShoulderY + sin(angles.leftShoulder) * armLength;
    let leftHandX = leftElbowX + cos(angles.leftShoulder + angles.leftElbow) * armLength;
    let leftHandY = leftElbowY + sin(angles.leftShoulder + angles.leftElbow) * armLength;
    
    line(leftShoulderX, leftShoulderY, leftElbowX, leftElbowY);
    line(leftElbowX, leftElbowY, leftHandX, leftHandY);
    
    // 오른쪽 팔
    let rightShoulderX = 0;
    let rightShoulderY = torsoY - torsoHeight + 5;
    let rightElbowX = rightShoulderX + cos(angles.rightShoulder) * armLength;
    let rightElbowY = rightShoulderY + sin(angles.rightShoulder) * armLength;
    let rightHandX = rightElbowX + cos(angles.rightShoulder + angles.rightElbow) * armLength;
    let rightHandY = rightElbowY + sin(angles.rightShoulder + angles.rightElbow) * armLength;
    
    line(rightShoulderX, rightShoulderY, rightElbowX, rightElbowY);
    line(rightElbowX, rightElbowY, rightHandX, rightHandY);
    
    // 왼쪽 다리
    let leftHipX = -8;
    let leftHipY = torsoY + torsoHeight;
    let leftKneeX = leftHipX + cos(angles.leftHip + PI/2) * legLength;
    let leftKneeY = leftHipY + sin(angles.leftHip + PI/2) * legLength;
    let leftFootX = leftKneeX + cos(angles.leftHip + angles.leftKnee + PI/2) * legLength;
    let leftFootY = leftKneeY + sin(angles.leftHip + angles.leftKnee + PI/2) * legLength;
    
    line(leftHipX, leftHipY, leftKneeX, leftKneeY);
    line(leftKneeX, leftKneeY, leftFootX, leftFootY);
    
    // 오른쪽 다리
    let rightHipX = 8;
    let rightHipY = torsoY + torsoHeight;
    let rightKneeX = rightHipX + cos(angles.rightHip + PI/2) * legLength;
    let rightKneeY = rightHipY + sin(angles.rightHip + PI/2) * legLength;
    let rightFootX = rightKneeX + cos(angles.rightHip + angles.rightKnee + PI/2) * legLength;
    let rightFootY = rightKneeY + sin(angles.rightHip + angles.rightKnee + PI/2) * legLength;
    
    line(rightHipX, rightHipY, rightKneeX, rightKneeY);
    line(rightKneeX, rightKneeY, rightFootX, rightFootY);
    
    pop();
  }
}
