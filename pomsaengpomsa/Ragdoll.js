// 래그돌 클래스 - 고정된 위치에서 관절 회전만 가능
class Ragdoll {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    
    // 신체 부위 크기
    this.headRadius = 25;
    this.torsoWidth = 30;
    this.torsoHeight = 60;
    this.upperArmLength = 45;
    this.lowerArmLength = 40;
    this.upperLegLength = 50;
    this.lowerLegLength = 45;
    this.limbWidth = 12;
    
    // 관절 각도 (라디안) - T자 포즈 (양옆 수평)
    this.angles = {
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
    let torsoX = this.x;
    let torsoY = this.y;
    
    this.joints.neck = {
      x: torsoX,
      y: torsoY - this.torsoHeight / 2
    };
    
    // 왼쪽 팔
    this.joints.leftShoulder = {
      x: torsoX - this.torsoWidth / 2,
      y: torsoY - this.torsoHeight / 2 + 10
    };
    
    let leftElbowX = this.joints.leftShoulder.x + cos(this.angles.leftShoulder) * this.upperArmLength;
    let leftElbowY = this.joints.leftShoulder.y + sin(this.angles.leftShoulder) * this.upperArmLength;
    this.joints.leftElbow = { x: leftElbowX, y: leftElbowY };
    
    let leftHandX = leftElbowX + cos(this.angles.leftShoulder + this.angles.leftElbow) * this.lowerArmLength;
    let leftHandY = leftElbowY + sin(this.angles.leftShoulder + this.angles.leftElbow) * this.lowerArmLength;
    this.joints.leftHand = { x: leftHandX, y: leftHandY };
    
    // 오른쪽 팔
    this.joints.rightShoulder = {
      x: torsoX + this.torsoWidth / 2,
      y: torsoY - this.torsoHeight / 2 + 10
    };
    
    let rightElbowX = this.joints.rightShoulder.x + cos(this.angles.rightShoulder) * this.upperArmLength;
    let rightElbowY = this.joints.rightShoulder.y + sin(this.angles.rightShoulder) * this.upperArmLength;
    this.joints.rightElbow = { x: rightElbowX, y: rightElbowY };
    
    let rightHandX = rightElbowX + cos(this.angles.rightShoulder + this.angles.rightElbow) * this.lowerArmLength;
    let rightHandY = rightElbowY + sin(this.angles.rightShoulder + this.angles.rightElbow) * this.lowerArmLength;
    this.joints.rightHand = { x: rightHandX, y: rightHandY };
    
    // 왼쪽 다리
    this.joints.leftHip = {
      x: torsoX - 10,
      y: torsoY + this.torsoHeight / 2
    };
    
    let leftKneeX = this.joints.leftHip.x + cos(this.angles.leftHip + PI/2) * this.upperLegLength;
    let leftKneeY = this.joints.leftHip.y + sin(this.angles.leftHip + PI/2) * this.upperLegLength;
    this.joints.leftKnee = { x: leftKneeX, y: leftKneeY };
    
    let leftFootX = leftKneeX + cos(this.angles.leftHip + this.angles.leftKnee + PI/2) * this.lowerLegLength;
    let leftFootY = leftKneeY + sin(this.angles.leftHip + this.angles.leftKnee + PI/2) * this.lowerLegLength;
    this.joints.leftFoot = { x: leftFootX, y: leftFootY };
    
    // 오른쪽 다리
    this.joints.rightHip = {
      x: torsoX + 10,
      y: torsoY + this.torsoHeight / 2
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
      'leftElbow', 'leftHand', 
      'rightElbow', 'rightHand',
      'leftKnee', 'leftFoot',
      'rightKnee', 'rightFoot'
    ];
    
    for (let jointName of draggableJoints) {
      let joint = this.joints[jointName];
      let d = dist(mx, my, joint.x, joint.y);
      if (d < this.jointRadius) {
        this.selectedJoint = jointName;
        return true;
      }
    }
    return false;
  }
  
  drag(mx, my) {
    if (!this.selectedJoint) return;
    
    switch(this.selectedJoint) {
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
  
  rotateArm(mx, my, side, isHand) {
    let shoulder = this.joints[side + 'Shoulder'];
    let elbow = this.joints[side + 'Elbow'];
    
    if (isHand) {
      let elbowAngle = atan2(my - elbow.y, mx - elbow.x);
      this.angles[side + 'Elbow'] = elbowAngle - this.angles[side + 'Shoulder'];
    } else {
      let shoulderAngle = atan2(my - shoulder.y, mx - shoulder.x);
      this.angles[side + 'Shoulder'] = shoulderAngle;
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
    
    this.drawLimb(this.joints.leftShoulder, this.joints.leftElbow, this.joints.leftHand);
    this.drawLimb(this.joints.rightShoulder, this.joints.rightElbow, this.joints.rightHand);
    
    fill(255);
    stroke(0);
    strokeWeight(3);
    rectMode(CENTER);
    rect(this.x, this.y, this.torsoWidth, this.torsoHeight, 5);
    
    circle(this.joints.neck.x, this.joints.neck.y - this.headRadius, this.headRadius * 2);
    
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
