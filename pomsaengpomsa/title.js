/*
- c.TitleScreen : sketch에서 호출하는 Title화면 클래스
  - initButtons
  - draw
  - openPopup
  - closePopup
  - drawPopup
  - drawCloseButton
  - drawTitle
  - showMessage
  - drawMessage
  - handleMousePressed
  - handleMouseMoved

- c.button
  - constructor
  - isHovered
  - update
  - show

-c.CircleButton
  - constructor
  - isHovered
  - update
  - show
*/

class TitleScreen {
    constructor(font) {
        this.font = font;
        this.buttons = [];
        this.infoButton = null; //초기화 명시

        // 팝업 상태 관리 객체
        this.popup = {
            active: false,
            title: "",
            content: ""
        };

        //컬러 설정
        this.colors = {
            primary : '#00f3ff', //메인색
            textFill : '#ffffff', //글씨색
            outline : '#09ff00', //글씨 outline
            buttonBg : 'rgba(255, 255, 255, 0.1)',
            buttonHover : 'rgba(0, 243, 255, 0.3)', //Hover : 마우스를 올린 상태
            popupBg: 'rgba(0, 0, 0, 0.9)'
        };

        //버튼 초기화
        this.initButtons();
    }

    initButtons() {
        this.buttons = [];
        let startY = height * 0.68;
        let buttonWidth = 220;
        let buttonHeight = 50;
        let gap = 15;

        // 1. 카메라 모드 버튼
        this.buttons.push(new Button("카메라 인식 모드", width / 2, startY, buttonWidth, buttonHeight, () => {
        // sketch.js에 있는 startGame 함수 호출
            //startGame("CAMERA"); 
        }, this.colors));

        // 2. 마우스 모드 버튼
        this.buttons.push(new Button("마우스 조작 모드", width / 2, startY + buttonHeight + gap, buttonWidth, buttonHeight, () => {
        // sketch.js에 있는 startGame 함수 호출
            startGame("MOUSE");
        }, this.colors));

        // 3. 게임 설명 버튼
        this.buttons.push(new Button("게임 설명", width / 2, startY + (buttonHeight + gap) * 2, buttonWidth, buttonHeight, () => {
            this.openPopup("게임 설명",
                "1. 모드를 선택해주세요.\n" +
                "2. 제시되는 포즈에 맞게 캐릭터를 움직여주세요.\n"
            );
        }, this.colors, true));

        // info 버튼
        this.infoButton = new CircleButton("i", 40, 40, 25, () => {
            this.openPopup("Project: 폼생폼사\n\n" +
                "Developer: Kim Dongmin\n"+
                "                                  Lee Gayeong\n"+
                "                          Im Soyeon\n\n" +
                "Depart of DigitalMedia\n" +
                "Soongsil University\n"
            );
        }, this.colors);
    }

    draw() {
        background(0);
        this.drawTitle();

        //버튼 UI 그리기
        this.buttons.forEach(button => { //forEach : Button 배열에 들어있는 모든 버튼 하나씩 꺼내서 내부 코드 실행
            button.update();
            button.show(this.font);
        });

        if (this.infoButton) {
            this.infoButton.update();
            this.infoButton.show(this.font);
        }

        if (this.popup.active) {
            this.drawPopup();
        }
    }

    openPopup(title, content) {
        this.popup.active = true;
        this.popup.title = title;
        this.popup.content = content;
    }

    closePopup() {
        this.popup.active = false;
    }

    drawPopup() {
        push();
        // 배경 어둡게 처리 (Overlay)
        fill(0, 150);
        noStroke();
        rectMode(CORNER);
        rect(0, 0, width, height);

        // 팝업 창
        let w = width * 0.7;
        let h = height * 0.7;
        let x = width / 2;
        let y = height / 2;

        rectMode(CENTER);
        stroke(this.colors.primary);
        strokeWeight(2);
        fill(0, 0, 0, 240);

        // 네온 효과
        drawingContext.shadowBlur = 20;
        drawingContext.shadowColor = this.colors.primary;
        rect(x, y, w, h, 15); // 둥근 모서리
        drawingContext.shadowBlur = 0;

        // 팝업 제목
        if (this.font) textFont(this.font);
        textAlign(CENTER, TOP);
        noStroke();
        fill(this.colors.primary);
        textSize(32);
        text(this.popup.title, x, y - h / 2 + 40);

        // 구분선
        stroke(100);
        strokeWeight(1);
        line(x - w / 2 + 20, y - h / 2 + 90, x + w / 2 - 20, y - h / 2 + 90);

        // 5. 팝업 내용 (멀티라인 텍스트)
        rectMode(CORNER); 
        noStroke();
        fill(255);
        textSize(18);
        textAlign(CENTER, TOP);
        textLeading(30);

        if (this.font) textFont(this.font);

        // 텍스트 박스 영역 계산
        let textX = x - w / 2 + 30; // 팝업 왼쪽 끝 + 여백
        let textY = y - h / 2 + 110; // 팝업 위쪽 끝 + 제목/구분선 높이
        let textW = w - 60; // 팝업 너비 - 양쪽 여백
        let textH = h - 140; // 팝업 높이 - 위쪽 여백 - 아래쪽 여백

        // 텍스트 박스 영역이 어디인지 빨간 테두리로 확인
        // noFill(); stroke(255, 0, 0); rect(textX, textY, textW, textH); fill(255); noStroke();

        text(this.popup.content, textX, textY, textW, textH);

        // 닫기(X) 버튼 그리기
        this.drawCloseButton(x + w / 2 - 30, y - h / 2 + 30);

        pop();
    }

    drawCloseButton(bx, by) {
        // 마우스 오버 확인
        let d = dist(mouseX, mouseY, bx, by);
        let isHover = d < 20;

        if (isHover) {
            fill(255, 50, 50); // 빨간색 호버
            cursor(HAND);
        } else {
            fill(150);
        }
        noStroke();
        circle(bx, by, 30);

        fill(255);
        textSize(18);
        textAlign(CENTER, CENTER);
        text("X", bx, by - 2);
    }

    drawTitle() { //폼생폼사 타이틀 설정 함수
        push();
        if (this.font) {
            textFont(this.font); //폰트가 로드되었을때만 적용
            textAlign(CENTER, CENTER);
        }

        let titleSize = 130;
        let titleY = height * 0.3; //화면 높이 기준 제목 위치

        //1단계 : 글씨 테두리
        //drawingContext.strokeLineJoin = 'round'; //테두리 겹칩 부드럽게
        strokeWeight(40);
        stroke(this.colors.outline);

        //네온 효과를 위한 글로우
        drawingContext.shadowBlur = 30;
        drawingContext.shadowColor = this.colors.outline;

        textSize(titleSize);
        fill(this.colors.outline);
        text("폼생", width / 2, titleY - titleSize/2);
        text("폼사", width / 2, titleY + titleSize/2);

        //2단계 : 글씨 본체
        noStroke();
        textSize(titleSize);
        fill(this.colors.textFill);
        drawingContext.shadowBlur = 0;

        textStyle(BOLD);
        text("폼생", width / 2, titleY - titleSize/2);
        text("폼사", width / 2, titleY + titleSize/2);

        drawingContext.shadowBlur = 0; //글로우 효과 초기화    
        pop();
    }

    //sketch.js에 있는 mousePressed 함수 호출
    handleMousePressed() {
        //팝업이 열려있을때 => 모드 선택 차단
        if (this.popup.active) {
            //닫기 버튼 위치 : drawPopup과 동일하게
            let w = width * 0.7;
            let h = height * 0.7;
            let bx = width / 2 + w / 2 - 30;
            let by = height / 2 - h / 2 + 30;

            // X 버튼 클릭 확인
            if (dist(mouseX, mouseY, bx, by) < 20) {
                this.closePopup();
            }
            // 팝업이 열려있으면 뒤에 있는 버튼 클릭 금지 (return)
            return;
        }

        //팝업 닫혀있을때 => 모드 선택
        for (let button of this.buttons) {
            if (button.isHovered()) {
                button.onClick();
                return;
            }
        }
        if (this.infoButton && this.infoButton.isHovered()) {
            this.infoButton.onClick();
        }
    }

    //sketch.js에 있는 mouseMoved 함수 호출
    //마우스 커서 모양 변경 함수
    handleMouseMoved() {
        if (this.popup.active) {
            let w = width * 0.7;
            let h = height * 0.7;
            let bx = width / 2 + w / 2 - 30;
            let by = height / 2 - h / 2 + 30;
            
             if (dist(mouseX, mouseY, bx, by) < 20) {
             } else {
                 cursor(ARROW);
             }
            return;
        }

        let hovering = false;
        for (let button of this.buttons) {
            if (button.isHovered()) {
                hovering = true;
            }
        }

        if (this.infoButton && this.infoButton.isHovered()) {
            hovering = true;
        }

        if (!hovering) {
            cursor(ARROW);
        }
    }
}

class Button {
    constructor(label, x, y, w, h, onClick, colors, isSecondary = false) { //버튼이름, x, y, 너비, 높이, 
        this.label = label;
        this.x = x; this.y = y; this.w = w; this.h = h;
        this.onClick = onClick;
        this.colors = colors;
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

    show(font) {
        push();
        rectMode(CENTER);

        if (font) {
            textFont(font);
        }

        let currentW = this.w + this.hoverSize;
        let currentH = this.h + (this.hoverSize / 4);

        if (this.isHovered()) {
            stroke(this.colors.primary);
            strokeWeight(2);
            fill(this.colors.buttonHover);
            drawingContext.shadowBlur = 15;
            drawingContext.shadowColor = this.colors.primary;
        } else {
            stroke(this.isSecondary ? 80 : 120);
            strokeWeight(1);
            fill(this.colors.buttonBg);
            drawingContext.shadowBlur = 0;
        }

        rect(this.x, this.y, currentW, currentH, 8);
                
        drawingContext.shadowBlur = 0;
        noStroke();
        fill(255);
        textSize(this.isSecondary ? 16 : 20);
        textAlign(CENTER, CENTER);
        text(this.label, this.x, this.y - 2);
        pop();
    }
}

class CircleButton {
    constructor(label, x, y, r, onClick, colors) {
        this.label = label;
        this.x = x; this.y = y; this.r = r;
        this.onClick = onClick;
        this.colors = colors;
    }

    isHovered() {
        return dist(mouseX, mouseY, this.x, this.y) < this.r;
    }

    update() {
        if (this.isHovered()) {
            cursor(HAND);
        }
    }

    show(font) {
        push();

        if (font) {
            textFont(font);
        }
        if (this.isHovered()) {
            stroke(this.colors.primary);
            fill(this.colors.buttonHover);
            drawingContext.shadowBlur = 10;
            drawingContext.shadowColor = this.colors.primary;
        } else {
            stroke(100);
            fill(this.colors.buttonBg);
            drawingContext.shadowBlur = 0;
        }
        strokeWeight(2);
        circle(this.x, this.y, this.r * 2);
        drawingContext.shadowBlur = 0;
        noStroke();
        fill(255);
        textSize(24);
        textAlign(CENTER, CENTER);
        text(this.label, this.x, this.y - 2);
        pop();
    }
}