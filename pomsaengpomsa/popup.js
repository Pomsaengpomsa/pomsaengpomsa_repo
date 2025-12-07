class Popup {
    constructor(font = null) {
        this.font = font;
        this.active = false;
        this.title = "";
        this.content = "";

        this.colors = {
            primary: '#09ff00',     // 메인 네온색
            text: '#ffffff',        // 텍스트
            overlay: 'rgba(0, 0, 0, 0.4)', // 뒷배경 어둡게
            boxBg: 'rgba(0, 0, 0, 0.95)',  // 팝업창 배경
            closeBtnHover: '#ff3232'       // 닫기버튼 호버색
        };
        
        // 닫기 버튼 위치 계산용 변수
        this.closeBtnPos = { x: 0, y: 0, r: 15 }; // r은 반지름
    }

    open(title, content) {
        this.active = true;
        this.title = title;
        this.content = content;
        cursor(ARROW);
    }

    close() {
        this.active = false;
    }

    isActive() {
        return this.active;
    }

    display() {
        if (!this.active) return;

        push();
        // 팝업 오버레이
        fill(this.colors.overlay);
        //fill(0, 150);
        noStroke();
        rectMode(CORNER);
        rect(0, 0, width, height);

        // 팝업 창 치수 계산
        let w = width * 0.6;
        let h = height * 0.7;
        let x = width / 2;
        let y = height / 2;

        rectMode(CENTER);
        stroke('#00f3ff');
        strokeWeight(2);
        fill(0, 0, 0, 240);

        // 네온 효과
        drawingContext.shadowBlur = 20;
        drawingContext.shadowColor = this.colors.primary;
        rect(x, y, w, h, 15);
        drawingContext.shadowBlur = 0;

        // 팝업 제목
        if (this.font) textFont(this.font);
        textAlign(CENTER, TOP);
        noStroke();
        fill(this.colors.primary);
        textSize(32);
        text(this.title, x, y - h / 2 + 40);

        // 구분선
        stroke(100);
        strokeWeight(1);
        line(x - w / 2 + 20, y - h / 2 + 90, x + w / 2 - 20, y - h / 2 + 90);

        // 팝업 내용
        rectMode(CORNER);
        noStroke();
        fill(this.colors.text);
        textSize(18);
        textAlign(CENTER, TOP);
        textLeading(30);
        
        let textX = x - w / 2 + 40;
        let textY = y - h / 2 + 110;
        let textW = w - 80;
        let textH = h - 160;

        text(this.content, textX, textY, textW, textH);

        // 닫기 버튼 그리기
        this.closeBtnPos.x = x + w / 2 - 30;
        this.closeBtnPos.y = y - h / 2 + 30;
        this.drawCloseButton(this.closeBtnPos.x, this.closeBtnPos.y);

        pop();
    }

    drawCloseButton(bx, by) {
        let d = dist(mouseX, mouseY, bx, by);
        let isHover = d < 20;

        if (isHover) {
            fill(this.colors.closeBtnHover);
            cursor(HAND);
        } else {
            fill(150);
            if (this.active) {
                cursor(ARROW);
            }
        }
        noStroke();
        circle(bx, by, 30);

        fill(255);
        textSize(18);
        textAlign(CENTER, CENTER);
        text("X", bx, by);
    }

    // 마우스 클릭 처리 (닫기 버튼을 눌렀는지 확인)
    // 반환값: 팝업이 이벤트를 소비했는지 (true) 또는 무시했는지 (false)
    handleClick() {
        if (!this.active) return false;

        //닫기 버튼 확인
        let d = dist(mouseX, mouseY, this.closeBtnPos.x, this.closeBtnPos.y);
        if (d < 20) {
            this.close();
            return true;
        }

        return true; // 팝업이 켜져있다면, 팝업이 클릭 이벤트 전체를 소비해야 하므로 true 반환
    }

    /*
    // 마우스 이동 처리 (커서 모양)
    handleMouseMove() {
        if (!this.active) return false;

        let d = dist()
        if (dist(mouseX, mouseY, bx, by) < 20) {
            // 닫기 버튼 위
            cursor(HAND);
        } else {
            // 팝업 창 내부
            cursor(ARROW);
        }
        return true; // 팝업이 켜져있다면, 뒤쪽 버튼 호버링 막기 위해 true 반환
    }
    */
}