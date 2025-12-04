// 포즈 관리 클래스
class PoseManager {
  constructor() {
    this.poses = [];
    this.cameraPoses = []; // 카메라 모드 전용 포즈
    this.currentIndex = 0;
    this.isCameraMode = false;
    this.initPoses();
    this.initCameraPoses();
  }
  
  // 카메라 모드로 전환
  setCameraMode(isCamera) {
    this.isCameraMode = isCamera;
    this.currentIndex = 0; // 포즈 초기화
  }
  
  // 카메라 모드 전용 포즈 (허리/목 고정, 팔 위로 X, 팔 꼬기 X)
  initCameraPoses() {
    // 포즈 1: T자 (팔 양옆 수평)
    this.cameraPoses.push({
      name: "T자 포즈",
      angles: {
        neck: 0, waist: 0,
        leftShoulder: PI, leftElbow: 0,
        rightShoulder: 0, rightElbow: 0,
        leftHip: 0, leftKnee: 0,
        rightHip: 0, rightKnee: 0
      }
    });
    
    // 포즈 2: 양팔 앞으로
    this.cameraPoses.push({
      name: "양팔 앞으로",
      angles: {
        neck: 0, waist: 0,
        leftShoulder: PI/2, leftElbow: 0,
        rightShoulder: PI/2, rightElbow: 0,
        leftHip: 0, leftKnee: 0,
        rightHip: 0, rightKnee: 0
      }
    });
    
    // 포즈 3: 양팔 옆으로 약간 들기
    this.cameraPoses.push({
      name: "팔 약간 들기",
      angles: {
        neck: 0, waist: 0,
        leftShoulder: PI * 3/4, leftElbow: 0,
        rightShoulder: PI/4, rightElbow: 0,
        leftHip: 0, leftKnee: 0,
        rightHip: 0, rightKnee: 0
      }
    });
    
    // 포즈 4: 팔꿈치 구부리기 (양팔)
    this.cameraPoses.push({
      name: "팔꿈치 구부리기",
      angles: {
        neck: 0, waist: 0,
        leftShoulder: PI, leftElbow: PI/2,
        rightShoulder: 0, rightElbow: PI/2,
        leftHip: 0, leftKnee: 0,
        rightHip: 0, rightKnee: 0
      }
    });
    
    // 포즈 5: 왼팔 앞으로
    this.cameraPoses.push({
      name: "왼팔 앞으로",
      angles: {
        neck: 0, waist: 0,
        leftShoulder: PI/2, leftElbow: 0,
        rightShoulder: 0, rightElbow: 0,
        leftHip: 0, leftKnee: 0,
        rightHip: 0, rightKnee: 0
      }
    });
    
    // 포즈 6: 오른팔 앞으로
    this.cameraPoses.push({
      name: "오른팔 앞으로",
      angles: {
        neck: 0, waist: 0,
        leftShoulder: PI, leftElbow: 0,
        rightShoulder: PI/2, rightElbow: 0,
        leftHip: 0, leftKnee: 0,
        rightHip: 0, rightKnee: 0
      }
    });
    
    // 포즈 7: 다리 벌리기 (T자 + 다리)
    this.cameraPoses.push({
      name: "다리 벌리기",
      angles: {
        neck: 0, waist: 0,
        leftShoulder: PI, leftElbow: 0,
        rightShoulder: 0, rightElbow: 0,
        leftHip: PI/6, leftKnee: 0,
        rightHip: -PI/6, rightKnee: 0
      }
    });
    
    // 포즈 8: 왼쪽 무릎 구부리기 (완전한 ㄱ자)
    this.cameraPoses.push({
      name: "왼쪽 무릎 구부리기",
      angles: {
        neck: 0, waist: 0,
        leftShoulder: PI, leftElbow: 0,
        rightShoulder: 0, rightElbow: 0,
        leftHip: PI/3, leftKnee: -PI/2,  // 넓적다리 들고, 종아리는 아래로
        rightHip: 0, rightKnee: 0
      }
    });
    
    // 포즈 9: 오른쪽 무릎 구부리기 (완전한 ㄱ자 - 수정됨)
    this.cameraPoses.push({
      name: "오른쪽 무릎 구부리기",
      angles: {
        neck: 0, waist: 0,
        leftShoulder: PI, leftElbow: 0,
        rightShoulder: 0, rightElbow: 0,
        leftHip: 0, leftKnee: 0,
        rightHip: -PI/2, rightKnee: PI/2  // 넓적다리 수평(-90), 종아리 아래로(+90 상쇄)
      }
    });
    
    // 포즈 10: 양손 모으기 (앞으로)
    this.cameraPoses.push({
      name: "양손 모으기",
      angles: {
        neck: 0, waist: 0,
        leftShoulder: PI/2, leftElbow: PI/4,
        rightShoulder: PI/2, rightElbow: -PI/4,
        leftHip: 0, leftKnee: 0,
        rightHip: 0, rightKnee: 0
      }
    });
  }
  
  initPoses() {
    // 포즈 1: T자 (팔 양옆 수평으로 벌리기)
    this.poses.push({
      name: "T자 포즈",
      angles: {
        neck: 0,
        waist: 0,
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
        neck: 0,
        waist: 0,
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
        neck: 0,
        waist: 0,
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
        neck: 0,
        waist: 0,
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
    
    // 포즈 5: 인사 포즈 (허리 숙이기)
    this.poses.push({
      name: "인사 포즈",
      angles: {
        neck: PI/6,        // 목 앞으로 숙임
        waist: PI/8,       // 허리 앞으로 굽힘
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
    
    // 포즈 6: 뒤로 젖히기
    this.poses.push({
      name: "뒤로 젖히기",
      angles: {
        neck: -PI/5,       // 목 뒤로 젖힘
        waist: -PI/8,      // 허리 뒤로 굽힘
        leftShoulder: -PI/3,
        leftElbow: 0,
        rightShoulder: -PI/3,
        rightElbow: 0,
        leftHip: 0,
        leftKnee: 0,
        rightHip: 0,
        rightKnee: 0
      }
    });
    
    // 포즈 7: 옆으로 기울이기 (왼쪽)
    this.poses.push({
      name: "왼쪽 기울이기",
      angles: {
        neck: 0,
        waist: PI/6,       // 허리 왼쪽으로 굽힘
        leftShoulder: PI/2,
        leftElbow: 0,
        rightShoulder: -PI/2,
        rightElbow: 0,
        leftHip: 0,
        leftKnee: 0,
        rightHip: 0,
        rightKnee: 0
      }
    });
    
    // 포즈 8: 고개 갸우뚱
    this.poses.push({
      name: "고개 갸우뚱",
      angles: {
        neck: PI/4,        // 목 옆으로 기울임
        waist: 0,
        leftShoulder: PI * 3/4,
        leftElbow: -PI/4,
        rightShoulder: PI/4,
        rightElbow: 0,
        leftHip: 0,
        leftKnee: 0,
        rightHip: 0,
        rightKnee: 0
      }
    });
    
    // 포즈 9: 스트레칭 (허리 + 팔)
    this.poses.push({
      name: "스트레칭",
      angles: {
        neck: -PI/6,
        waist: -PI/10,     // 허리 약간 뒤로
        leftShoulder: -PI/2,
        leftElbow: 0,
        rightShoulder: -PI/2,
        rightElbow: 0,
        leftHip: 0,
        leftKnee: 0,
        rightHip: 0,
        rightKnee: 0
      }
    });
    
    // 포즈 10: 한쪽 팔 들기 + 허리 굽히기
    this.poses.push({
      name: "한쪽 팔 들기",
      angles: {
        neck: 0,
        waist: PI/8,       // 허리 왼쪽으로
        leftShoulder: -PI/2,
        leftElbow: 0,
        rightShoulder: PI/2,
        rightElbow: 0,
        leftHip: 0,
        leftKnee: 0,
        rightHip: 0,
        rightKnee: 0
      }
    });
  }
  
  // 현재 사용 중인 포즈 배열 반환
  getActivePoses() {
    return this.isCameraMode ? this.cameraPoses : this.poses;
  }
  
  getCurrentPose() {
    const activePoses = this.getActivePoses();
    return activePoses[this.currentIndex];
  }
  
  nextPose() {
    const activePoses = this.getActivePoses();
    this.currentIndex = (this.currentIndex + 1) % activePoses.length;
    return this.getCurrentPose();
  }
  
  getTotalPoses() {
    return this.getActivePoses().length;
  }
  
  // 현재 래그돌 포즈와 목표 포즈 비교 (관절 점 위치 기반)
  calculateMatch(ragdollJoints, ragdollAngles) {
    // 목표 포즈의 관절 위치 계산 (래그돌의 허리 위치 기준)
    let targetJoints = this.calculateTargetJoints(
      this.getCurrentPose().angles,
      ragdollJoints.waist.x,
      ragdollJoints.waist.y
    );
    
    // 비교할 주요 관절 점들
    const keyJoints = [
      'head',
      'leftElbow', 'leftHand',
      'rightElbow', 'rightHand',
      'leftKnee', 'leftFoot',
      'rightKnee', 'rightFoot'
    ];
    // waist는 기준점이므로 제외
    
    let totalDistance = 0;
    let maxAllowedDistance = 30; // 픽셀 단위 허용 거리 (더 관대하게)
    
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
  
  // 목표 포즈의 관절 위치 계산
  calculateTargetJoints(angles, cx = 400, cy = 300) {
    // 래그돌의 허리 위치를 기준으로 계산
    let x = cx;
    let y = cy;
    
    // 신체 부위 크기 (Ragdoll과 동일 - 1.5배 확대)
    let torsoWidth = 45;
    let upperTorsoHeight = 45;
    let lowerTorsoHeight = 45;
    let headRadius = 38;
    let upperArmLength = 68;
    let lowerArmLength = 60;
    let upperLegLength = 75;
    let lowerLegLength = 68;
    
    let joints = {};
    
    // 허리 관절
    joints.waist = { x: x, y: y };
    
    // 상체 중심
    let waistOffsetX = sin(angles.waist) * upperTorsoHeight;
    let waistOffsetY = -cos(angles.waist) * upperTorsoHeight;
    let upperTorsoX = joints.waist.x + waistOffsetX;
    let upperTorsoY = joints.waist.y + waistOffsetY;
    
    // 목 관절
    joints.neck = { x: upperTorsoX, y: upperTorsoY };
    
    // 머리
    let neckOffsetX = sin(angles.waist + angles.neck) * headRadius;
    let neckOffsetY = -cos(angles.waist + angles.neck) * headRadius;
    joints.head = {
      x: joints.neck.x + neckOffsetX,
      y: joints.neck.y + neckOffsetY
    };
    
    // 왼쪽 팔
    joints.leftShoulder = {
      x: upperTorsoX - torsoWidth / 2 * cos(angles.waist),
      y: upperTorsoY - torsoWidth / 2 * sin(angles.waist)
    };
    
    let leftElbowX = joints.leftShoulder.x + cos(angles.leftShoulder + angles.waist) * upperArmLength;
    let leftElbowY = joints.leftShoulder.y + sin(angles.leftShoulder + angles.waist) * upperArmLength;
    joints.leftElbow = { x: leftElbowX, y: leftElbowY };
    
    let leftHandX = leftElbowX + cos(angles.leftShoulder + angles.leftElbow + angles.waist) * lowerArmLength;
    let leftHandY = leftElbowY + sin(angles.leftShoulder + angles.leftElbow + angles.waist) * lowerArmLength;
    joints.leftHand = { x: leftHandX, y: leftHandY };
    
    // 오른쪽 팔
    joints.rightShoulder = {
      x: upperTorsoX + torsoWidth / 2 * cos(angles.waist),
      y: upperTorsoY + torsoWidth / 2 * sin(angles.waist)
    };
    
    let rightElbowX = joints.rightShoulder.x + cos(angles.rightShoulder + angles.waist) * upperArmLength;
    let rightElbowY = joints.rightShoulder.y + sin(angles.rightShoulder + angles.waist) * upperArmLength;
    joints.rightElbow = { x: rightElbowX, y: rightElbowY };
    
    let rightHandX = rightElbowX + cos(angles.rightShoulder + angles.rightElbow + angles.waist) * lowerArmLength;
    let rightHandY = rightElbowY + sin(angles.rightShoulder + angles.rightElbow + angles.waist) * lowerArmLength;
    joints.rightHand = { x: rightHandX, y: rightHandY };
    
    // 하체 중심
    let lowerTorsoOffsetX = -sin(angles.waist) * lowerTorsoHeight;
    let lowerTorsoOffsetY = cos(angles.waist) * lowerTorsoHeight;
    let lowerTorsoX = joints.waist.x + lowerTorsoOffsetX;
    let lowerTorsoY = joints.waist.y + lowerTorsoOffsetY;
    
    // 왼쪽 다리
    joints.leftHip = {
      x: lowerTorsoX - 10,
      y: lowerTorsoY
    };
    
    let leftKneeX = joints.leftHip.x + cos(angles.leftHip + PI/2) * upperLegLength;
    let leftKneeY = joints.leftHip.y + sin(angles.leftHip + PI/2) * upperLegLength;
    joints.leftKnee = { x: leftKneeX, y: leftKneeY };
    
    let leftFootX = leftKneeX + cos(angles.leftHip + angles.leftKnee + PI/2) * lowerLegLength;
    let leftFootY = leftKneeY + sin(angles.leftHip + angles.leftKnee + PI/2) * lowerLegLength;
    joints.leftFoot = { x: leftFootX, y: leftFootY };
    
    // 오른쪽 다리
    joints.rightHip = {
      x: lowerTorsoX + 10,
      y: lowerTorsoY
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
    
    // 배경 패널 (1.5배 확대)
    fill(50, 50, 70, 200);
    noStroke();
    rectMode(CENTER);
    rect(0, 0, 280, 520, 10);
    
    // 제목
    fill(255);
    textAlign(CENTER);
    textSize(18);
    text("목표 포즈", 0, -245);
    text(this.getCurrentPose().name, 0, -215);
    
    // 가이드라인 (수평/수직 참조선)
    stroke(100, 100, 120, 100);
    strokeWeight(1);
    line(-120, 0, 120, 0);  // 수평선
    line(0, -180, 0, 180); // 수직선
    
    // 포즈 시각화
    this.drawPoseStick(this.getCurrentPose().angles);
    
    // 힌트 텍스트
    fill(200, 200, 220);
    textSize(12);
    text("N키: 다음 포즈", 0, 240);
    
    pop();
  }
  
  drawPoseStick(angles) {
    push();
    
    let waistX = 0;
    let waistY = 0;
    let headRadius = 30;
    let torsoWidth = 45;
    let upperTorsoHeight = 38;
    let lowerTorsoHeight = 38;
    let armLength = 53;
    let legLength = 60;
    
    // 허리에서 상체까지
    let upperTorsoX = waistX + sin(angles.waist) * upperTorsoHeight;
    let upperTorsoY = waistY - cos(angles.waist) * upperTorsoHeight;

    // 허리에서 하체까지
    let lowerTorsoX = waistX - sin(angles.waist) * lowerTorsoHeight;
    let lowerTorsoY = waistY + cos(angles.waist) * lowerTorsoHeight;

    // 팔 계산
    let leftShoulderX = upperTorsoX - torsoWidth / 2 * cos(angles.waist);
    let leftShoulderY = upperTorsoY - torsoWidth / 2 * sin(angles.waist);
    let leftElbowX = leftShoulderX + cos(angles.leftShoulder + angles.waist) * armLength;
    let leftElbowY = leftShoulderY + sin(angles.leftShoulder + angles.waist) * armLength;
    let leftHandX = leftElbowX + cos(angles.leftShoulder + angles.leftElbow + angles.waist) * armLength;
    let leftHandY = leftElbowY + sin(angles.leftShoulder + angles.leftElbow + angles.waist) * armLength;

    let rightShoulderX = upperTorsoX + torsoWidth / 2 * cos(angles.waist);
    let rightShoulderY = upperTorsoY + torsoWidth / 2 * sin(angles.waist);
    let rightElbowX = rightShoulderX + cos(angles.rightShoulder + angles.waist) * armLength;
    let rightElbowY = rightShoulderY + sin(angles.rightShoulder + angles.waist) * armLength;
    let rightHandX = rightElbowX + cos(angles.rightShoulder + angles.rightElbow + angles.waist) * armLength;
    let rightHandY = rightElbowY + sin(angles.rightShoulder + angles.rightElbow + angles.waist) * armLength;
    
    // 다리 계산
    let leftHipX = lowerTorsoX - 8;
    let leftHipY = lowerTorsoY;
    let leftKneeX = leftHipX + cos(angles.leftHip + PI/2) * legLength;
    let leftKneeY = leftHipY + sin(angles.leftHip + PI/2) * legLength;
    let leftFootX = leftKneeX + cos(angles.leftHip + angles.leftKnee + PI/2) * legLength;
    let leftFootY = leftKneeY + sin(angles.leftHip + angles.leftKnee + PI/2) * legLength;
    
    let rightHipX = lowerTorsoX + 8;
    let rightHipY = lowerTorsoY;
    let rightKneeX = rightHipX + cos(angles.rightHip + PI/2) * legLength;
    let rightKneeY = rightHipY + sin(angles.rightHip + PI/2) * legLength;
    let rightFootX = rightKneeX + cos(angles.rightHip + angles.rightKnee + PI/2) * legLength;
    let rightFootY = rightKneeY + sin(angles.rightHip + angles.rightKnee + PI/2) * legLength;
    
    // === 그림자 레이어 (뒤쪽 외곽선) ===
    // 왼쪽 팔 그림자
    stroke(0, 0, 0, 80);
    strokeWeight(7);
    line(leftShoulderX, leftShoulderY, leftElbowX, leftElbowY);
    strokeWeight(6);
    line(leftElbowX, leftElbowY, leftHandX, leftHandY);
    
    // 오른쪽 팔 그림자
    strokeWeight(7);
    line(rightShoulderX, rightShoulderY, rightElbowX, rightElbowY);
    strokeWeight(6);
    line(rightElbowX, rightElbowY, rightHandX, rightHandY);
    
    // 다리 그림자
    strokeWeight(7);
    line(leftHipX, leftHipY, leftKneeX, leftKneeY);
    strokeWeight(6);
    line(leftKneeX, leftKneeY, leftFootX, leftFootY);
    strokeWeight(7);
    line(rightHipX, rightHipY, rightKneeX, rightKneeY);
    strokeWeight(6);
    line(rightKneeX, rightKneeY, rightFootX, rightFootY);
    
    // 몸통 그림자
    strokeWeight(8);
    line(waistX, waistY, upperTorsoX, upperTorsoY);
    line(waistX, waistY, lowerTorsoX, lowerTorsoY);
    
    // === 실제 신체 부위 ===
    // 왼쪽 다리 - 분홍색
    stroke(255, 120, 150);
    strokeWeight(4);
    line(leftHipX, leftHipY, leftKneeX, leftKneeY);
    strokeWeight(3);
    line(leftKneeX, leftKneeY, leftFootX, leftFootY);
    
    // 오른쪽 다리 - 연한 분홍색
    stroke(255, 150, 180);
    strokeWeight(4);
    line(rightHipX, rightHipY, rightKneeX, rightKneeY);
    strokeWeight(3);
    line(rightKneeX, rightKneeY, rightFootX, rightFootY);
    
    // 몸통 (상체 + 하체) - 노란색
    stroke(255, 220, 100);
    strokeWeight(5);
    line(waistX, waistY, upperTorsoX, upperTorsoY);
    line(waistX, waistY, lowerTorsoX, lowerTorsoY);
    
    // 왼쪽 팔 - 하늘색 (흰색 외곽선)
    stroke(255, 255, 255);
    strokeWeight(6);
    line(leftShoulderX, leftShoulderY, leftElbowX, leftElbowY);
    strokeWeight(5);
    line(leftElbowX, leftElbowY, leftHandX, leftHandY);
    
    stroke(100, 180, 255);
    strokeWeight(4);
    line(leftShoulderX, leftShoulderY, leftElbowX, leftElbowY);
    strokeWeight(3);
    line(leftElbowX, leftElbowY, leftHandX, leftHandY);
    
    // 오른쪽 팔 - 연한 하늘색 (흰색 외곽선)
    stroke(255, 255, 255);
    strokeWeight(6);
    line(rightShoulderX, rightShoulderY, rightElbowX, rightElbowY);
    strokeWeight(5);
    line(rightElbowX, rightElbowY, rightHandX, rightHandY);
    
    stroke(150, 200, 255);
    strokeWeight(4);
    line(rightShoulderX, rightShoulderY, rightElbowX, rightElbowY);
    strokeWeight(3);
    line(rightElbowX, rightElbowY, rightHandX, rightHandY);
    
    // 목과 머리 - 주황색
    let headX = upperTorsoX + sin(angles.waist + angles.neck) * headRadius;
    let headY = upperTorsoY - cos(angles.waist + angles.neck) * headRadius;
    stroke(255, 180, 100);
    strokeWeight(4);
    noFill();
    circle(headX, headY, headRadius * 2);
    
    // 주요 관절 표시 (작은 원)
    fill(255, 255, 100);
    noStroke();
    circle(waistX, waistY, 8);           // 허리
    circle(headX, headY, 8);             // 머리
    circle(leftElbowX, leftElbowY, 7);   // 왼쪽 팔꿈치
    circle(leftHandX, leftHandY, 7);     // 왼쪽 손
    circle(rightElbowX, rightElbowY, 7); // 오른쪽 팔꿈치
    circle(rightHandX, rightHandY, 7);   // 오른쪽 손
    circle(leftKneeX, leftKneeY, 7);     // 왼쪽 무릎
    circle(leftFootX, leftFootY, 7);     // 왼쪽 발
    circle(rightKneeX, rightKneeY, 7);   // 오른쪽 무릎
    circle(rightFootX, rightFootY, 7);   // 오른쪽 발
    
    pop();
  }
}
