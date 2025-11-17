// 래그돌 클래스 - 고정된 위치에서 관절 회전만 가능
class Ragdoll {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    
    // 신체 부위 크기
    this.headRadius = 25;
    this.torsoWidth = 30;
    this.upperTorsoHeight = 30;  // 상체 (어깨~허리)
    this.lowerTorsoHeight = 30;  // 하체 (허리~골반)
    this.upperArmLength = 45;
    this.lowerArmLength = 40;
    this.upperLegLength = 50;
    this.lowerLegLength = 45;
    this.limbWidth = 12;
    
    // 관절 각도 (라디안) - T자 포즈 (양옆 수평)
    this.angles = {
      neck: 0,              // 목 회전 (위아래)
      waist: 0,             // 허리 회전 (좌우 굽히기)
      leftShoulder: PI,
      leftElbow: 0,
      rightShoulder: 0,
      rightElbow: 0,
      leftHip: 0,
      leftKnee: 0,
      rightHip: 0,
      rightKnee: 0
    };
    
    // 관절 위치 (계산됨)
    this.joints = {};
    
    // 현재 드래그 중인 관절
    this.selectedJoint = null;
    this.jointRadius = 15;
    
    this.updateJoints();
  }
  
  updateJoints() {
    // 허리 관절 위치 (중심점)
    this.joints.waist = {
      x: this.x,
      y: this.y
    };
    
    // 허리 회전에 따른 상체 오프셋
    let waistOffsetX = sin(this.angles.waist) * this.upperTorsoHeight;
    let waistOffsetY = -cos(this.angles.waist) * this.upperTorsoHeight;
    
    // 상체 중심 (어깨 위치)
    let upperTorsoX = this.joints.waist.x + waistOffsetX;
    let upperTorsoY = this.joints.waist.y + waistOffsetY;
    
    // 목 관절 위치
    this.joints.neck = {
      x: upperTorsoX,
      y: upperTorsoY
    };
    
    // 목 회전에 따른 머리 위치
    let neckOffsetX = sin(this.angles.waist + this.angles.neck) * this.headRadius;
    let neckOffsetY = -cos(this.angles.waist + this.angles.neck) * this.headRadius;
    
    this.joints.head = {
      x: this.joints.neck.x + neckOffsetX,
      y: this.joints.neck.y + neckOffsetY
    };
    
    // 왼쪽 팔 (상체 회전 적용)
    this.joints.leftShoulder = {
      x: upperTorsoX - this.torsoWidth / 2 * cos(this.angles.waist),
      y: upperTorsoY - this.torsoWidth / 2 * sin(this.angles.waist)
    };
    
    let leftElbowX = this.joints.leftShoulder.x + cos(this.angles.leftShoulder + this.angles.waist) * this.upperArmLength;
    let leftElbowY = this.joints.leftShoulder.y + sin(this.angles.leftShoulder + this.angles.waist) * this.upperArmLength;
    this.joints.leftElbow = { x: leftElbowX, y: leftElbowY };
    
    let leftHandX = leftElbowX + cos(this.angles.leftShoulder + this.angles.leftElbow + this.angles.waist) * this.lowerArmLength;
    let leftHandY = leftElbowY + sin(this.angles.leftShoulder + this.angles.leftElbow + this.angles.waist) * this.lowerArmLength;
    this.joints.leftHand = { x: leftHandX, y: leftHandY };
    
    // 오른쪽 팔 (상체 회전 적용)
    this.joints.rightShoulder = {
      x: upperTorsoX + this.torsoWidth / 2 * cos(this.angles.waist),
      y: upperTorsoY + this.torsoWidth / 2 * sin(this.angles.waist)
    };
    
    let rightElbowX = this.joints.rightShoulder.x + cos(this.angles.rightShoulder + this.angles.waist) * this.upperArmLength;
    let rightElbowY = this.joints.rightShoulder.y + sin(this.angles.rightShoulder + this.angles.waist) * this.upperArmLength;
    this.joints.rightElbow = { x: rightElbowX, y: rightElbowY };
    
    let rightHandX = rightElbowX + cos(this.angles.rightShoulder + this.angles.rightElbow + this.angles.waist) * this.lowerArmLength;
    let rightHandY = rightElbowY + sin(this.angles.rightShoulder + this.angles.rightElbow + this.angles.waist) * this.lowerArmLength;
    this.joints.rightHand = { x: rightHandX, y: rightHandY };
    
    // 하체 중심 (골반)
    let lowerTorsoOffsetX = -sin(this.angles.waist) * this.lowerTorsoHeight;
    let lowerTorsoOffsetY = cos(this.angles.waist) * this.lowerTorsoHeight;
    
    let lowerTorsoX = this.joints.waist.x + lowerTorsoOffsetX;
    let lowerTorsoY = this.joints.waist.y + lowerTorsoOffsetY;
    
    // 왼쪽 다리
    this.joints.leftHip = {
      x: lowerTorsoX - 10,
      y: lowerTorsoY
    };
    
    let leftKneeX = this.joints.leftHip.x + cos(this.angles.leftHip + PI/2) * this.upperLegLength;
    let leftKneeY = this.joints.leftHip.y + sin(this.angles.leftHip + PI/2) * this.upperLegLength;
    this.joints.leftKnee = { x: leftKneeX, y: leftKneeY };
    
    let leftFootX = leftKneeX + cos(this.angles.leftHip + this.angles.leftKnee + PI/2) * this.lowerLegLength;
    let leftFootY = leftKneeY + sin(this.angles.leftHip + this.angles.leftKnee + PI/2) * this.lowerLegLength;
    this.joints.leftFoot = { x: leftFootX, y: leftFootY };
    
    // 오른쪽 다리
    this.joints.rightHip = {
      x: lowerTorsoX + 10,
      y: lowerTorsoY
    };
    
    let rightKneeX = this.joints.rightHip.x + cos(this.angles.rightHip + PI/2) * this.upperLegLength;
    let rightKneeY = this.joints.rightHip.y + sin(this.angles.rightHip + PI/2) * this.upperLegLength;
    this.joints.rightKnee = { x: rightKneeX, y: rightKneeY };
    
    let rightFootX = rightKneeX + cos(this.angles.rightHip + this.angles.rightKnee + PI/2) * this.lowerLegLength;
    let rightFootY = rightKneeY + sin(this.angles.rightHip + this.angles.rightKnee + PI/2) * this.lowerLegLength;
    this.joints.rightFoot = { x: rightFootX, y: rightFootY };
  }
  
  startDrag(mx, my) {
    const draggableJoints = [
      'head', 'waist',
      'leftElbow', 'leftHand', 
      'rightElbow', 'rightHand',
      'leftKnee', 'leftFoot',
      'rightKnee', 'rightFoot'
    ];
    
    for (let jointName of draggableJoints) {
      let joint = this.joints[jointName];
      let d = dist(mx, my, joint.x, joint.y);
      // 허리는 약간 큰 드래그 영역 사용
      let radius = (jointName === 'waist') ? 20 : this.jointRadius;
      if (d < radius) {
        this.selectedJoint = jointName;
        return true;
      }
    }
    return false;
  }
  
  drag(mx, my) {
    if (!this.selectedJoint) return;
    
    switch(this.selectedJoint) {
      case 'head':
        this.rotateNeck(mx, my);
        break;
      case 'waist':
        this.rotateWaist(mx, my);
        break;
      case 'leftElbow':
      case 'leftHand':
        this.rotateArm(mx, my, 'left', this.selectedJoint === 'leftHand');
        break;
      case 'rightElbow':
      case 'rightHand':
        this.rotateArm(mx, my, 'right', this.selectedJoint === 'rightHand');
        break;
      case 'leftKnee':
      case 'leftFoot':
        this.rotateLeg(mx, my, 'left', this.selectedJoint === 'leftFoot');
        break;
      case 'rightKnee':
      case 'rightFoot':
        this.rotateLeg(mx, my, 'right', this.selectedJoint === 'rightFoot');
        break;
    }
    
    this.updateJoints();
  }
  
  rotateNeck(mx, my) {
    let neck = this.joints.neck;
    let angle = atan2(my - neck.y, mx - neck.x) + PI/2;
    this.angles.neck = angle - this.angles.waist;
    // 목 회전 제한 (-45도 ~ 45도)
    this.angles.neck = constrain(this.angles.neck, -PI/4, PI/4);
  }
  
  rotateWaist(mx, my) {
    let waist = this.joints.waist;
    let targetAngle = atan2(mx - waist.x, waist.y - my);
    
    // 허리 회전 제한 (-30도 ~ 30도)
    targetAngle = constrain(targetAngle, -PI/6, PI/6);
    
    // 부드러운 회전을 위한 보간 (민감도 감소)
    let lerpAmount = 0.15; // 값이 작을수록 더 부드럽게 움직임
    this.angles.waist = lerp(this.angles.waist, targetAngle, lerpAmount);
  }
  
  rotateArm(mx, my, side, isHand) {
    let shoulder = this.joints[side + 'Shoulder'];
    let elbow = this.joints[side + 'Elbow'];
    
    if (isHand) {
      let elbowAngle = atan2(my - elbow.y, mx - elbow.x);
      this.angles[side + 'Elbow'] = elbowAngle - this.angles[side + 'Shoulder'] - this.angles.waist;
    } else {
      let shoulderAngle = atan2(my - shoulder.y, mx - shoulder.x);
      this.angles[side + 'Shoulder'] = shoulderAngle - this.angles.waist;
    }
  }
  
  rotateLeg(mx, my, side, isFoot) {
    let hip = this.joints[side + 'Hip'];
    let knee = this.joints[side + 'Knee'];
    
    if (isFoot) {
      let kneeAngle = atan2(my - knee.y, mx - knee.x) - PI/2;
      this.angles[side + 'Knee'] = kneeAngle - this.angles[side + 'Hip'];
    } else {
      let hipAngle = atan2(my - hip.y, mx - hip.x) - PI/2;
      this.angles[side + 'Hip'] = hipAngle;
    }
  }
  
  stopDrag() {
    this.selectedJoint = null;
  }
  
  draw() {
    this.updateJoints();
    
    push();
    
    // 팔 그리기
    this.drawLimb(this.joints.leftShoulder, this.joints.leftElbow, this.joints.leftHand);
    this.drawLimb(this.joints.rightShoulder, this.joints.rightElbow, this.joints.rightHand);
    
    // 몸통 전체 그리기 (허리를 중심으로)
    push();
    translate(this.joints.waist.x, this.joints.waist.y);
    rotate(this.angles.waist);
    fill(255);
    stroke(0);
    strokeWeight(3);
    rectMode(CENTER);
    // 상체와 하체를 합친 전체 몸통
    let totalTorsoHeight = this.upperTorsoHeight + this.lowerTorsoHeight;
    rect(0, 0, this.torsoWidth, totalTorsoHeight, 5);
    pop();
    
    // 머리 그리기
    fill(255);
    stroke(0);
    strokeWeight(3);
    circle(this.joints.head.x, this.joints.head.y, this.headRadius * 2);
    
    // 다리 그리기
    this.drawLimb(this.joints.leftHip, this.joints.leftKnee, this.joints.leftFoot);
    this.drawLimb(this.joints.rightHip, this.joints.rightKnee, this.joints.rightFoot);
    
    this.drawJoints();
    
    pop();
  }
  
  drawLimb(start, middle, end) {
    stroke(100, 150, 255);
    strokeWeight(this.limbWidth);
    line(start.x, start.y, middle.x, middle.y);
    
    strokeWeight(this.limbWidth - 2);
    line(middle.x, middle.y, end.x, end.y);
  }
  
  drawJoints() {
    fill(255, 100, 100);
    noStroke();
    
    const joints = [
      this.joints.head, this.joints.waist,
      this.joints.leftElbow, this.joints.leftHand,
      this.joints.rightElbow, this.joints.rightHand,
      this.joints.leftKnee, this.joints.leftFoot,
      this.joints.rightKnee, this.joints.rightFoot
    ];
    
    for (let joint of joints) {
      circle(joint.x, joint.y, 10);
    }
    
    if (this.selectedJoint) {
      fill(255, 200, 0);
      let j = this.joints[this.selectedJoint];
      circle(j.x, j.y, 15);
    }
  }
  
  reset() {
    // T자 포즈로 리셋 (양옆 수평)
    this.angles = {
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
    };
    this.updateJoints();
  }
}
