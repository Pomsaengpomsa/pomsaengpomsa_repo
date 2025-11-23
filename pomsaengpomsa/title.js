/*
 - 사진 load
 - 컬러
 - setup / draw
 - f.drawTitle
 - f.initButtons
 - c.button
 - f.showMessage(msg)
*/

let myFont;
let buttons = [];

function preload() {
    myFont = loadFont('assets/Cafe24PROUP.ttf'); //폰트 파일 불러오기
}

const colors = {
    primary : '#00f3ff', //메인색
    textFill : '#ffffffff', //글씨색
    outline : '#09ff00', //글씨 outline
    buttonBg : 'rgba(255, 255, 255, 0.1)',
    buttonHover : 'rgba(0, 243, 255, 0.3)' //Hover : 마우스를 올린 상태
};

function setup() {
    createCanvas(800, 600);
    textAlign(CENTER, CENTER);
    rectMode(CENTER);

    initButtons();
}

function draw() {
    background(0);
    drawTitle();

    //버튼 UI 그리기
    buttons.forEach(btn => { //forEach : Button 배열에 들어있는 모든 버튼 하나씩 꺼내서 내부 코드 실행
        btn.update();
        btn.show();
    });
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

function initButtons() {
    buttons = [];
    let startY = height * 0.68;
    let buttonWidth = 220;
    let buttonHeight = 50;
    let gap = 15;

    buttons.push(new Button("카메라 인식 모드", width / 2, startY, buttonWidth, buttonHeight, () => {
        showMessage("카메라 인식 모드를 준비합니다.");
    }));

    buttons.push(new Button("마우스 조작 모드", width / 2, startY + buttonHeight + gap, buttonWidth, buttonHeight, () => {
        showMessage("마우스 조작 모드를 준비합니다...");
    }));

    buttons.push(new Button("게임 설명", width / 2, startY + (buttonHeight + gap) * 2, buttonWidth, buttonHeight, () => {
        showMessage("팁: 정확한 타이밍에 포즈를 맞추세요!");
    }, true));
}

class Button {
    constructor(label, x, y, w, h, onClick, isSecondary = false) { //버튼이름, x, y, 너비, 높이, 
        this.label = label;
        this.x = x; this.y = y; this.w = w; this.h = h;
        this.onClick = onClick;
        this.isSecondary = isSecondary;
        this.hoverSize = 0; //버튼에 마우스를 올렸을때
    }

    isHovered() {
        return mouseX > this.x - this.w/2 && mouseX < this.x + this.w/2 &&
            mouseY > this.y - this.h/2 && mouseY < this.y + this.h/2;
        }

    update() {
        if (this.isHovered()) {
            this.hoverSize = lerp(this.hoverSize, 5, 0.2);
            cursor(HAND);
        } else {
            this.hoverSize = lerp(this.hoverSize, 0, 0.2);
        }
    }

    show() {
        rectMode(CENTER);
        let currentW = this.w + this.hoverSize;
        let currentH = this.h + (this.hoverSize / 4);

        if (this.isHovered()) {
            stroke(colors.primary);
            strokeWeight(2);
            fill(colors.buttonHover);
            drawingContext.shadowBlur = 15;
            drawingContext.shadowColor = colors.primary;
        } else {
            stroke(this.isSecondary ? 80 : 120);
            strokeWeight(1);
            fill(colors.buttonBg);
            drawingContext.shadowBlur = 0;
        }

        rect(this.x, this.y, currentW, currentH, 8);
                
        drawingContext.shadowBlur = 0;
        noStroke();
        fill(255);
        textSize(this.isSecondary ? 14 : 16);
        text(this.label, this.x, this.y + 5);
    }
}

function showMessage(msg) {
    activeMessage = msg;
    messageTimer = 60;
}