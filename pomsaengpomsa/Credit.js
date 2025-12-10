class CreditScreen {
  constructor() {
    this.scrollY = height + 50; // 시작 위치 (화면 아래에서 시작)
    this.scrollSpeed = 1.5;     // 스크롤 속도
    this.lineHeight = 38;       // 기본 줄 간격

    // === 크레딧 내용 정의 ===
    this.credits = [
      // 타이틀
      { text: "🤸폼생폼사🤸", size: 50 },
      { text: "", size: 100 },

      { text: "🎮Thanks for Playing🎮", size: 36 },
      { text: "", size: 30 },

      // 개발자
      { text: "🧑‍💻개발자(Developers)🧑‍💻", size: 28 },
      { text: "김동민", size: 22 },
      { text: "이가영", size: 22 },
      { text: "임소연", size: 22 },
      { text: "", size: 24 },

      // 엔진 및 기술
      { text: "⚙️엔진 및 기술(Engine & Technology)⚙️", size: 28 },
      { text: "p5.js", size: 20 },
      { text: "HTML5", size: 20 },
      { text: "JavaScript", size: 20 },
      { text: "", size: 24 },

      // AI 활용 코드 고지
      { text: "🤖AI 활용 코드 고지🤖", size: 28 },
      { text: "이 게임의 소스 코드 중 일부(약40%)는", size: 20 },
      { text: "OpenAI ChatGPT, Google Gemini의 도움을 받아", size: 20 },
      { text: "작성·수정되었습니다.", size: 20 },
      { text: "AI가 제안한 코드는 개발자가 직접 이해·검토 후", size: 20 },
      { text: "프로젝트에 맞게 수정·반영하였습니다.", size: 20 },
      { text: "", size: 24 },

      // p5.js 기능 안내
      { text: "⭐주요 p5.js 기능⭐", size: 28 },
      { text: "마우스 인터랙션: mousePressed(), mouseReleased(), mouseDragged() 등", size: 20 },
      { text: "키보드 인터랙션: keyPressed()", size: 20 },
      { text: "화상 캠 연동: createCapture(VIDEO)", size: 20 },
      { text: "이미지 삽입: loadImage(), image()", size: 20 },
      { text: "음악/효과음: loadSound(), play(), loop(), stop()", size: 20 },
      { text: "", size: 24 },

      // BGM
      { text: "📢BGM Copyright📢", size: 28 },
      { text: "1. titleBGM : https://youtu.be/ZofOjYXY88Y", size: 20 },
      { text: "2. gameBGM : ✔Track - 게임 시작!", size: 20 },
      { text: "✔Music by 부금", size: 20 },
      { text: "✔Watch : https://youtu.be/0aLKEeltie8", size: 20 },
      { text: "", size: 24 },

      // Made in
      { text: "In class Media&Tech, Department of Media Management,", size: 28 },
      { text: "Soongsil University, 2025.", size: 28 },
      { text: "", size: 100 }, // 로고 위 여백

      { type: "image", asset: "logo", width: 240, height: 100, spacing: 120 }, // 로고 이미지
    ];
  }

  // 크레딧을 처음부터 다시 시작할 때 호출
  reset() {
    this.scrollY = height + 50;
  }

  // 매 프레임마다 호출해서 그리기 + 스크롤
  draw() {
    fill(255);
    textAlign(CENTER, CENTER);

    let currentY = this.scrollY;
    let totalHeight = 0;

    // 크레딧 항목들을 순회하며 그리기
    for (let i = 0; i < this.credits.length; i++) {
      const c = this.credits[i];

      if (c.type === "image" && c.asset === "logo") {
        // 이미지 그리기
        imageMode(CENTER);
        image(logo, width / 2, currentY, c.width, c.height);
        currentY += c.spacing; // 이미지 높이 + 여백만큼 Y 위치 이동
      } else {
        // 텍스트 그리기
        textSize(c.size);
        text(c.text, width / 2, currentY);
        currentY += c.size * 1.2; // 텍스트 크기에 비례하여 Y 위치 이동
      }
    }
    totalHeight = currentY - this.scrollY; // 전체 크레딧의 높이 계산

    // 위로 스크롤
    this.scrollY -= this.scrollSpeed;

    // 크레딧이 화면 밖으로 완전히 사라지면 초기화
    if (this.scrollY < -totalHeight) {
      this.reset();
    }
  }
}
