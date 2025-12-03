// 웹캠 및 포즈 인식 컨트롤러
class CameraController {
  constructor() {
    this.video = null;
    this.poseNet = null;
    this.poses = [];
    this.isReady = false;
    this.isCalibrated = false;
    this.calibrationData = null;
    this.smoothingFactor = 0.15; // 안정성 우선 (0.25 -> 0.15)
    
    // 이전 포즈 데이터 (스무딩용)
    this.prevAngles = null;
    
    // 이상치 필터링
    this.maxAngleChange = 0.3; // 급격한 변화 제한 강화 (0.8 -> 0.3)
    this.deadZone = 0.02; // 데드존 약간 증가 (떨림 방지)
    this.minConfidenceForUpdate = 0.4; // 각도 업데이트를 위한 최소 신뢰도
    
    // 자동 캘리브레이션
    this.calibrationFrames = 0;
    this.calibrationRequired = 180; // 180프레임 (약 3초) 동안 안정적으로 인식
    this.calibrationThreshold = 0.3; // 최소 신뢰도
  }
  
  async setup() {
    try {
      // 웹캠 생성 (숨김 처리)
      this.video = createCapture(VIDEO);
      this.video.size(640, 480);
      this.video.hide();
      
      // PoseNet 모델 로드
      this.poseNet = ml5.poseNet(this.video, () => {
        console.log('PoseNet 모델 로드 완료!');
        this.isReady = true;
      });
      
      // 포즈 감지 시작
      this.poseNet.on('pose', (results) => {
        this.poses = results;
      });
      
      return true;
    } catch (error) {
      console.error('카메라 초기화 실패:', error);
      return false;
    }
  }
  
  // 자동 캘리브레이션 체크
  checkAutoCalibration() {
    if (this.poses.length === 0) {
      this.calibrationFrames = 0;
      return false;
    }
    
    const pose = this.poses[0].pose;
    const keypoints = pose.keypoints;
    
    // 신뢰도 체크
    const hasAllKeypoints = [
      'leftShoulder', 'rightShoulder',
      'leftElbow', 'rightElbow',
      'leftWrist', 'rightWrist',
      'leftHip', 'rightHip',
      'leftKnee', 'rightKnee',
      'leftAnkle', 'rightAnkle'
    ].every(name => {
      const kp = keypoints.find(k => k.part === name);
      return kp && kp.score > this.calibrationThreshold;
    });
    
    // T자 포즈 체크 추가 (매우 관대하게)
    let isTpose = false;
    if (hasAllKeypoints) {
      const leftShoulder = this.getKeypoint('leftShoulder');
      const rightShoulder = this.getKeypoint('rightShoulder');
      const leftElbow = this.getKeypoint('leftElbow');
      const rightElbow = this.getKeypoint('rightElbow');
      
      if (leftShoulder && rightShoulder && leftElbow && rightElbow) {
        // 카메라 좌우 반전 때문에 조건이 반대!
        // 왼팔: 팔꿈치 X가 어깨 X보다 커야 함 (화면상 왼쪽)
        const leftArmOut = leftElbow.x > leftShoulder.x + 20;
        // 오른팔: 팔꿈치 X가 어깨 X보다 작아야 함 (화면상 오른쪽)
        const rightArmOut = rightElbow.x < rightShoulder.x - 20;
        
        // 팔꿈치가 너무 아래로 내려가지 않았는지 체크 (매우 관대)
        const leftArmNotDown = leftElbow.y < leftShoulder.y + 150;
        const rightArmNotDown = rightElbow.y < rightShoulder.y + 150;
        
        isTpose = leftArmOut && rightArmOut && leftArmNotDown && rightArmNotDown;
        
        // 디버깅 출력
        console.log('T-pose check:', {
          leftArmOut, rightArmOut, leftArmNotDown, rightArmNotDown,
          leftElbowX: leftElbow.x, leftShoulderX: leftShoulder.x,
          rightElbowX: rightElbow.x, rightShoulderX: rightShoulder.x
        });
      }
    }
    
    if (hasAllKeypoints && isTpose) {
      this.calibrationFrames++;
      if (this.calibrationFrames >= this.calibrationRequired) {
        return this.calibrate();
      }
    } else {
      this.calibrationFrames = 0;
    }
    
    return false;
  }
  
  // 캘리브레이션 진행률
  getCalibrationProgress() {
    return this.calibrationFrames / this.calibrationRequired;
  }
  
  // 캘리브레이션 (T자 포즈 기준)
  calibrate() {
    if (this.poses.length === 0) return false;
    
    const pose = this.poses[0].pose;
    const keypoints = pose.keypoints;
    
    // 신뢰도 체크
    const minConfidence = 0.5;
    const hasAllKeypoints = [
      'leftShoulder', 'rightShoulder',
      'leftElbow', 'rightElbow',
      'leftWrist', 'rightWrist',
      'leftHip', 'rightHip',
      'leftKnee', 'rightKnee',
      'leftAnkle', 'rightAnkle'
    ].every(name => {
      const kp = keypoints.find(k => k.part === name);
      return kp && kp.score > minConfidence;
    });
    
    if (!hasAllKeypoints) return false;
    
    // 기준 데이터 저장
    const leftShoulder = this.getKeypoint('leftShoulder');
    const rightShoulder = this.getKeypoint('rightShoulder');
    const leftHip = this.getKeypoint('leftHip');
    const rightHip = this.getKeypoint('rightHip');
    
    this.calibrationData = {
      shoulderWidth: dist(leftShoulder.x, leftShoulder.y, rightShoulder.x, rightShoulder.y),
      hipWidth: dist(leftHip.x, leftHip.y, rightHip.x, rightHip.y),
      centerX: (leftShoulder.x + rightShoulder.x) / 2,
      centerY: (leftShoulder.y + rightShoulder.y + leftHip.y + rightHip.y) / 4,
      // T자 포즈 기준 각도
      baseLeftShoulderAngle: PI,
      baseRightShoulderAngle: 0
    };
    
    this.isCalibrated = true;
    console.log('캘리브레이션 완료!', this.calibrationData);
    return true;
  }
  
  // 특정 관절 포인트 가져오기
  getKeypoint(name) {
    if (this.poses.length === 0) return null;
    const keypoints = this.poses[0].pose.keypoints;
    const kp = keypoints.find(k => k.part === name);
    return kp && kp.score > 0.3 ? kp.position : null;
  }

  // 각도 보간 (최단 거리)
  lerpAngle(a, b, t) {
    let diff = b - a;
    while (diff > PI) diff -= TWO_PI;
    while (diff < -PI) diff += TWO_PI;
    return a + diff * t;
  }

  // 포즈를 래그돌 각도로 변환
  getPoseAngles() {
    if (!this.isCalibrated || this.poses.length === 0) return null;
    
    // 각도 정규화 함수 (가장 먼저 정의)
    const normalize = (angle) => {
      while (angle > PI) angle -= TWO_PI;
      while (angle < -PI) angle += TWO_PI;
      return angle;
    };

    // 스무딩 초기화
    if (!this.prevAngles) {
      this.prevAngles = {
        neck: 0, waist: 0,
        leftShoulder: PI, leftElbow: 0,
        rightShoulder: 0, rightElbow: 0,
        leftHip: 0, leftKnee: 0,
        rightHip: 0, rightKnee: 0
      };
    }

    const pose = this.poses[0].pose;
    // 로컬 헬퍼 함수 (클래스 메서드와 이름 충돌 방지 위해 getKP로 명명)
    const getKP = (name) => {
      const kp = pose.keypoints.find(k => k.part === name);
      return kp; // score 체크 없이 반환 (null 체크는 사용처에서)
    };
    
    const leftShoulder = getKP('leftShoulder');
    const rightShoulder = getKP('rightShoulder');
    const leftElbow = getKP('leftElbow');
    const rightElbow = getKP('rightElbow');
    const leftWrist = getKP('leftWrist');
    const rightWrist = getKP('rightWrist');
    const leftHip = getKP('leftHip');
    const rightHip = getKP('rightHip');
    const leftKnee = getKP('leftKnee');
    const rightKnee = getKP('rightKnee');
    const leftAnkle = getKP('leftAnkle');
    const rightAnkle = getKP('rightAnkle');
    
    // 필요한 주요 관절이 없으면 null 반환 (전체 포즈 유지)
    if (!leftShoulder || !rightShoulder || !leftElbow || !rightElbow || !leftHip || !rightHip) return null;

    // 각 관절의 신뢰도 체크 헬퍼 함수
    const hasGoodConfidence = (kp) => kp && kp.score >= this.minConfidenceForUpdate;

    // === 각도 계산 (벡터 기반 거울 모드) ===
    // 1. 벡터 계산 -> 2. X좌표 반전(거울) -> 3. 각도 변환 -> 4. 상대 각도 계산
    
    const getVector = (p1, p2) => {
      return { x: p2.x - p1.x, y: p2.y - p1.y };
    };
    
    const getMirroredAngle = (vec) => {
      // 거울 모드: X축 반전 (화면상 좌우 반전)
      return Math.atan2(vec.y, -vec.x);
    };

    // 벡터 계산 (신뢰도 체크 포함)
    const vecRightShoulder = (hasGoodConfidence(rightShoulder) && hasGoodConfidence(rightElbow)) 
      ? getVector(rightShoulder.position, rightElbow.position) : null;
    const vecRightElbow = (hasGoodConfidence(rightElbow) && hasGoodConfidence(rightWrist)) 
      ? getVector(rightElbow.position, rightWrist.position) : null;
    
    const vecLeftShoulder = (hasGoodConfidence(leftShoulder) && hasGoodConfidence(leftElbow)) 
      ? getVector(leftShoulder.position, leftElbow.position) : null;
    const vecLeftElbow = (hasGoodConfidence(leftElbow) && hasGoodConfidence(leftWrist)) 
      ? getVector(leftElbow.position, leftWrist.position) : null;
    
    const vecRightHip = (hasGoodConfidence(rightHip) && hasGoodConfidence(rightKnee)) 
      ? getVector(rightHip.position, rightKnee.position) : null;
    const vecRightKnee = (hasGoodConfidence(rightKnee) && hasGoodConfidence(rightAnkle)) 
      ? getVector(rightKnee.position, rightAnkle.position) : null;
    
    const vecLeftHip = (hasGoodConfidence(leftHip) && hasGoodConfidence(leftKnee)) 
      ? getVector(leftHip.position, leftKnee.position) : null;
    const vecLeftKnee = (hasGoodConfidence(leftKnee) && hasGoodConfidence(leftAnkle)) 
      ? getVector(leftKnee.position, leftAnkle.position) : null;

    // 절대 각도 계산 (null이면 이전 값 사용)
    const absRightShoulder = vecRightShoulder ? getMirroredAngle(vecRightShoulder) : this.prevAngles.rightShoulder;
    const absRightElbow = vecRightElbow ? getMirroredAngle(vecRightElbow) : null;
    
    const absLeftShoulder = vecLeftShoulder ? getMirroredAngle(vecLeftShoulder) : this.prevAngles.leftShoulder;
    const absLeftElbow = vecLeftElbow ? getMirroredAngle(vecLeftElbow) : null;
    
    const absRightHip = vecRightHip ? getMirroredAngle(vecRightHip) : null;
    const absRightKnee = vecRightKnee ? getMirroredAngle(vecRightKnee) : null;
    
    const absLeftHip = vecLeftHip ? getMirroredAngle(vecLeftHip) : null;
    const absLeftKnee = vecLeftKnee ? getMirroredAngle(vecLeftKnee) : null;

    // 래그돌 상대 각도로 변환 (null이면 이전 값 유지)
    const angles = {
      neck: 0,
      waist: 0,
      
      // 왼팔
      leftShoulder: absLeftShoulder, 
      leftElbow: absLeftElbow ? normalize(absLeftElbow - absLeftShoulder) : this.prevAngles.leftElbow,
      
      // 오른팔
      rightShoulder: absRightShoulder,
      rightElbow: absRightElbow ? normalize(absRightElbow - absRightShoulder) : this.prevAngles.rightElbow,
      
      // 왼다리
      leftHip: absLeftHip ? normalize(absLeftHip - PI/2) : this.prevAngles.leftHip,
      leftKnee: absLeftKnee && absLeftHip ? normalize(absLeftKnee - absLeftHip) : this.prevAngles.leftKnee,
      
      // 오른다리
      rightHip: absRightHip ? normalize(absRightHip - PI/2) : this.prevAngles.rightHip,
      rightKnee: absRightKnee && absRightHip ? normalize(absRightKnee - absRightHip) : this.prevAngles.rightKnee
    };
    
    // 디버깅: 무릎 각도 출력 (60프레임마다)
    if (frameCount % 60 === 0) {
      console.log('무릎 각도 (라디안):', {
        leftKnee: angles.leftKnee?.toFixed(2),
        rightKnee: angles.rightKnee?.toFixed(2),
        absLeftHip: absLeftHip?.toFixed(2),
        absLeftKnee: absLeftKnee?.toFixed(2),
        absRightHip: absRightHip?.toFixed(2),
        absRightKnee: absRightKnee?.toFixed(2)
      });
    }

    // 스무딩 및 제한 적용
    const smoothedAngles = {};
    for (let key in angles) {
      // 각도 정규화
      let target = angles[key];
      while (target > PI) target -= TWO_PI;
      while (target < -PI) target += TWO_PI;
      
      // 각도 변화량 계산 (최단 거리)
      let angleDiff = target - this.prevAngles[key];
      while (angleDiff > PI) angleDiff -= TWO_PI;
      while (angleDiff < -PI) angleDiff += TWO_PI;
      
      // 데드존: 작은 변화는 무시 (무릎은 더 민감하게)
      let deadZone = this.deadZone;
      if (key === 'leftKnee' || key === 'rightKnee') {
        deadZone = 0.01; // 무릎은 더 작은 데드존
      }
      if (abs(angleDiff) < deadZone) {
        smoothedAngles[key] = this.prevAngles[key];
        continue;
      }
      
      // 최대 변화량 제한 (이상치 제거)
      if (abs(angleDiff) > this.maxAngleChange) {
        angleDiff = this.maxAngleChange * (angleDiff > 0 ? 1 : -1);
        target = this.prevAngles[key] + angleDiff;
        // 다시 정규화
        while (target > PI) target -= TWO_PI;
        while (target < -PI) target += TWO_PI;
      }
      
      // 최단 거리 보간 (스무딩) - 무릎은 더 빠르게 반응
      let smoothing = this.smoothingFactor;
      if (key === 'leftKnee' || key === 'rightKnee') {
        smoothing = 0.25; // 무릎은 더 빠르게 반응 (0.15 -> 0.25)
      }
      smoothedAngles[key] = this.lerpAngle(this.prevAngles[key], target, smoothing);
    }

    // 관절 제한 (자연스러운 범위)
    smoothedAngles.leftElbow = constrain(smoothedAngles.leftElbow, -PI, PI);
    smoothedAngles.rightElbow = constrain(smoothedAngles.rightElbow, -PI, PI);
    
    // 무릎: 앞으로만 구부러짐 (절대값 기준)
    // 음수 각도도 허용 (좌우 대칭)
    smoothedAngles.leftKnee = constrain(smoothedAngles.leftKnee, -PI * 2/3, PI * 2/3);
    smoothedAngles.rightKnee = constrain(smoothedAngles.rightKnee, -PI * 2/3, PI * 2/3);

    this.prevAngles = smoothedAngles;
    return smoothedAngles;
  }
  
  // 두 점 사이의 각도 계산
  calculateAngle(p1, p2) {
    return atan2(p2.y - p1.y, p2.x - p1.x);
  }
  
  // 스켈레톤 연결선 그리기
  drawSkeleton(keypoints, videoX, videoY, videoW, videoH) {
    // 연결할 관절 쌍 정의
    const connections = [
      ['leftShoulder', 'rightShoulder'],
      ['leftShoulder', 'leftElbow'],
      ['leftElbow', 'leftWrist'],
      ['rightShoulder', 'rightElbow'],
      ['rightElbow', 'rightWrist'],
      ['leftShoulder', 'leftHip'],
      ['rightShoulder', 'rightHip'],
      ['leftHip', 'rightHip'],
      ['leftHip', 'leftKnee'],
      ['leftKnee', 'leftAnkle'],
      ['rightHip', 'rightKnee'],
      ['rightKnee', 'rightAnkle']
    ];
    
    for (let [part1, part2] of connections) {
      const kp1 = keypoints.find(k => k.part === part1);
      const kp2 = keypoints.find(k => k.part === part2);
      
      if (kp1 && kp2 && kp1.score > 0.3 && kp2.score > 0.3) {
        let x1 = map(kp1.position.x, 0, 640, videoX + videoW, videoX);
        let y1 = map(kp1.position.y, 0, 480, videoY, videoY + videoH);
        let x2 = map(kp2.position.x, 0, 640, videoX + videoW, videoX);
        let y2 = map(kp2.position.y, 0, 480, videoY, videoY + videoH);
        
        line(x1, y1, x2, y2);
      }
    }
  }
  
  // 카메라 피드 그리기 (작게, 우측 하단)
  drawVideoFeed() {
    if (!this.video) return;
    
    push();
    // 우측 하단에 작게 표시
    let feedW = 160;
    let feedH = 120;
    let feedX = width - feedW - 10;
    let feedY = height - feedH - 10;
    
    // 테두리
    stroke(0, 243, 255);
    strokeWeight(2);
    noFill();
    rect(feedX - 2, feedY - 2, feedW + 4, feedH + 4);
    
    // 비디오 (좌우 반전)
    push();
    translate(feedX + feedW, feedY);
    scale(-1, 1);
    image(this.video, 0, 0, feedW, feedH);
    pop();
    
    // 상태 텍스트
    fill(255);
    noStroke();
    textSize(10);
    textAlign(LEFT);
    text(this.isCalibrated ? '인식 중' : '캘리브레이션 필요', feedX, feedY - 5);
    
    // 관절 포인트 표시
    if (this.poses.length > 0) {
      const pose = this.poses[0].pose;
      for (let kp of pose.keypoints) {
        if (kp.score > 0.3) {
          let x = map(kp.position.x, 0, 640, feedX + feedW, feedX);
          let y = map(kp.position.y, 0, 480, feedY, feedY + feedH);
          fill(0, 255, 0);
          noStroke();
          circle(x, y, 3);
        }
      }
    }
    
    pop();
  }
  
  // 캘리브레이션 화면 그리기
  drawCalibrationScreen() {
    push();
    
    // 반투명 배경
    fill(0, 0, 0, 200);
    noStroke();
    rect(0, 0, width, height);
    
    // 비디오 피드 (중앙, 크게)
    if (this.video) {
      let videoW = 480;
      let videoH = 360;
      let videoX = (width - videoW) / 2;
      let videoY = (height - videoH) / 2 - 50;
      
      // 좌우 반전
      push();
      translate(videoX + videoW, videoY);
      scale(-1, 1);
      image(this.video, 0, 0, videoW, videoH);
      pop();
      
      // 관절 포인트 표시
      if (this.poses.length > 0) {
        const pose = this.poses[0].pose;
        
        // 스켈레톤 연결선 그리기
        stroke(0, 255, 0, 150);
        strokeWeight(2);
        this.drawSkeleton(pose.keypoints, videoX, videoY, videoW, videoH);
        
        // 관절 포인트 그리기
        for (let kp of pose.keypoints) {
          if (kp.score > 0.3) {
            let x = map(kp.position.x, 0, 640, videoX + videoW, videoX);
            let y = map(kp.position.y, 0, 480, videoY, videoY + videoH);
            
            // 신뢰도에 따라 색상 변경
            if (kp.score > 0.6) {
              fill(100, 255, 100); // 높은 신뢰도: 녹색
            } else {
              fill(255, 200, 100); // 낮은 신뢰도: 주황색
            }
            noStroke();
            circle(x, y, 8);
            
            // 관절 이름 표시 (주요 관절만)
            if (['leftShoulder', 'rightShoulder', 'leftElbow', 'rightElbow', 
                 'leftWrist', 'rightWrist', 'leftHip', 'rightHip'].includes(kp.part)) {
              fill(255);
              textSize(10);
              textAlign(CENTER);
              text(kp.part, x, y - 12);
            }
          }
        }
      }
      
      // 테두리
      stroke(0, 243, 255);
      strokeWeight(3);
      noFill();
      rect(videoX, videoY, videoW, videoH);
    }
    
    // T자 포즈 가이드 그리기
    push();
    translate(width / 2 - 250, height / 2 + 200);
    stroke(100, 255, 100);
    strokeWeight(4);
    noFill();
    
    // 머리
    circle(0, -60, 30);
    // 몸통
    line(0, -45, 0, 20);
    // 팔 (수평)
    line(-60, -30, 60, -30);
    // 다리
    line(0, 20, -20, 60);
    line(0, 20, 20, 60);
    pop();
    
    // 안내 텍스트
    fill(255);
    textAlign(CENTER);
    textSize(32);
    text('T자 포즈를 취해주세요', width / 2, height / 2 + 200);
    
    textSize(18);
    fill(200);
    text('← 이렇게 양팔을 수평으로 벌려주세요', width / 2, height / 2 + 240);
    text('자세를 유지하면 자동으로 시작됩니다', width / 2, height / 2 + 270);
    
    // 진행률 바
    let progress = this.getCalibrationProgress();
    let barW = 400;
    let barH = 30;
    let barX = (width - barW) / 2;
    let barY = height / 2 + 310;
    
    // 배경
    fill(50, 50, 50);
    noStroke();
    rect(barX, barY, barW, barH, 15);
    
    // 진행률
    if (progress > 0) {
      fill(100, 255, 100);
      rect(barX, barY, barW * progress, barH, 15);
    }
    
    // 진행률 텍스트
    fill(255);
    textSize(16);
    text(`${(progress * 100).toFixed(0)}%`, width / 2, barY + barH / 2);
    
    // 신뢰도 및 T자 포즈 상태 표시
    if (this.poses.length > 0) {
      const avgConfidence = this.poses[0].pose.keypoints
        .reduce((sum, kp) => sum + kp.score, 0) / this.poses[0].pose.keypoints.length;
      
      fill(100, 255, 100);
      textSize(14);
      text(`인식률: ${(avgConfidence * 100).toFixed(0)}%`, width / 2, barY + barH + 30);
      
      // T자 포즈 체크 상태
      const leftShoulder = this.getKeypoint('leftShoulder');
      const rightShoulder = this.getKeypoint('rightShoulder');
      const leftElbow = this.getKeypoint('leftElbow');
      const rightElbow = this.getKeypoint('rightElbow');
      
      if (leftShoulder && rightShoulder && leftElbow && rightElbow) {
        // 카메라 좌우 반전 고려
        const leftArmOut = leftElbow.x > leftShoulder.x + 20;
        const rightArmOut = rightElbow.x < rightShoulder.x - 20;
        const leftArmNotDown = leftElbow.y < leftShoulder.y + 150;
        const rightArmNotDown = rightElbow.y < rightShoulder.y + 150;
        
        textSize(12);
        fill(leftArmOut ? 100 : 255, 255, leftArmOut ? 100 : 100);
        text(`왼팔 벌림: ${leftArmOut ? 'O' : 'X'}`, width / 2 - 100, barY + barH + 55);
        
        fill(rightArmOut ? 100 : 255, 255, rightArmOut ? 100 : 100);
        text(`오른팔 벌림: ${rightArmOut ? 'O' : 'X'}`, width / 2 + 100, barY + barH + 55);
      }
    }
    
    pop();
  }
  
  // 정리
  cleanup() {
    if (this.video) {
      this.video.remove();
    }
    if (this.poseNet) {
      this.poseNet.removeAllListeners();
    }
  }
}
