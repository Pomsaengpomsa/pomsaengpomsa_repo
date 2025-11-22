let myFont;

function preload() {
    myFont = loadFont('assets/Cafe24PROUP.ttf'); //폰트 파일 불러오기
}

const colors = {
    primary : '#00f3ff', //메인색
    textFill : '#ffffffff', //글씨색
    outline : '#09ff00'
};

function setup() {
    createCanvas(800, 600);
    textAlign(CENTER, CENTER);
    rectMode(CENTER);
}

function draw() {
    background(0);
    drawTitle();
}

function drawTitle() { //폼생폼사 타이틀 설정 함수
    push();
    textFont(myFont);

    let titleSize = 130;
    let titleY = height * 0.3; //제목 기준 높이

    //1단계 : 글씨 테두리
    //drawingContext.strokeLineJoin = 'round'; //테두리 겹칩 부드럽게
    strokeWeight(40);
    stroke(colors.outline);

    //네온 효과를 위한 글로우
    drawingContext.shadowBlur = 30;
    drawingContext.shadowColor = colors.outline;

    textSize(titleSize);
    fill(colors.outline);
    text("폼생", width / 2, titleY - titleSize/2);
    text("폼사", width / 2, titleY + titleSize/2);

    //2단계 : 글씨 본체
    noStroke();
    textSize(titleSize);
    fill(colors.textFill);
    drawingContext.shadowBlur = 0;

    textStyle(BOLD);
    text("폼생", width / 2, titleY - titleSize/2);
    text("폼사", width / 2, titleY + titleSize/2);

    drawingContext.shadowBlur = 0; //글로우 효과 초기화
}