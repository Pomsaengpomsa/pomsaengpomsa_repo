function drawEndingScore(myNickname) {
  // 배경
  background(20, 20, 30);

  // 로컬 스토리지에서 점수 데이터 가져오기
  let players = LocalStorageManager.getItem('poseGameScores') || [];
  // 점수 기준으로 내림차순 정렬
  players.sort((a, b) => b.score - a.score);

  // 제목
  fill(255, 215, 0);
  textSize(36);
  textAlign(CENTER);
  text("🏆 TOP 10 순위", width / 2, 60);

  // 구분선
  stroke(100);
  strokeWeight(2);
  line(50, 90, width - 50, 90);
  noStroke();

  // 순위 목록
  const yStart = 140;
  const yStep = 55;

  // 상위 10명만 표시
  for (let i = 0; i < min(players.length, 10); i++) {
    let player = players[i];
    const rank = i + 1;
    const isLeftColumn = i < 5;
    const yPos = yStart + (i % 5) * yStep;
    const xBase = isLeftColumn ? 0 : width / 2;
    
    drawPlayerRank(player, rank, xBase, yPos, myNickname);
  }

  // 내 점수 찾기
  const myPlayer = players.find(p => p.nickname === myNickname);
  const myScore = myPlayer ? myPlayer.score : 0;

  // 내 점수 표시
  fill(255);
  textSize(22);
  textAlign(CENTER);
  text(`내 점수: ${myScore.toLocaleString()}점`, width / 2, height - 170);
  
  // "처음으로" 버튼
  let btnX = width / 2;
  let btnY = height - 100;
  drawMenuButton("처음으로", btnX, btnY, 100, 200, 255);
}

function drawPlayerRank(player, rank, xBase, yPos, myNickname) {
  const isMyRank = player.nickname === myNickname; // 전달받은 myNickname 사용

  // 본인 순위 강조 배경
  if (isMyRank) {
    const pulsatingAlpha = 120 + sin(millis() / 150) * 120;
    fill(255, 215, 0, pulsatingAlpha / 4);
    noStroke();
    rect(xBase + 30, yPos - 23, width / 2 - 60, 46, 8);
    
    stroke(255, 215, 0, pulsatingAlpha);
    strokeWeight(2);
    noFill();
    rect(xBase + 30, yPos - 23, width / 2 - 60, 46, 8);
    noStroke();
  }

  // 순위 배경 원
  let rankColor;
  if (rank === 1) rankColor = color(255, 215, 0); // 금
  else if (rank === 2) rankColor = color(192, 192, 192); // 은
  else if (rank === 3) rankColor = color(205, 127, 50); // 동
  else rankColor = color(70, 80, 100);

  fill(rankColor);
  circle(xBase + 60, yPos, 35);

  // 순위 텍스트
  fill(255);
  textSize(18);
  textAlign(CENTER);
  text(rank, xBase + 60, yPos + 6);

  // 닉네임
  textAlign(LEFT);
  textSize(20);
  if (isMyRank) {
    fill(255, 215, 0);
    text("👤 " + player.nickname, xBase + 100, yPos + 6);
  } else {
    fill(rankColor);
    text(player.nickname, xBase + 100, yPos + 6);
  }

  // 점수
  textAlign(RIGHT);
  textSize(20);
  if (isMyRank) {
    fill(255, 215, 0);
  } else {
    fill(100, 200, 255);
  }
  text(player.score.toLocaleString() + "점", xBase + width / 2 - 40, yPos + 6);
}

function drawMenuButton(label, x, y, r, g, b) { // sketch.js와 중복되지만, 독립 실행을 위해 유지
  let btnW = 240;
  let btnH = 60;
  let isHover = mouseX > x - btnW/2 && mouseX < x + btnW/2 && 
                mouseY > y - btnH/2 && mouseY < y + btnH/2;
  
  push();
  translate(x, y);
  
  //팝업 활성화인 경우 호버 효과 끄기
  if (isHover) {
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
