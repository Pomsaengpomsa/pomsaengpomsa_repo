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
      { text: "이 게임의 소스 코드 중 일부(약 80%)는", size: 20 },
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
    ];
  }

  // 크레딧을 처음부터 다시 시작할 때 호출
  reset() {
    this.scrollY = height + 50;
  }

  // 매 프레임마다 호출해서 그리기 + 스크롤
  draw() {
    fill(255);
    textAlign(CENTER, TOP);

    for (let i = 0; i < this.credits.length; i++) {
      const c = this.credits[i];
      textSize(c.size);
      const y = this.scrollY + i * this.lineHeight;
      text(c.text, width / 2, y);
    }

    // 위로 스크롤
    this.scrollY -= this.scrollSpeed;

    // 전부 지나가면 다시 처음으로 루프시키고 싶으면 아래 유지
    // 한 번만 보여주고 끝내고 싶으면 이 부분은 빼고,
    // 게임 쪽에서 상태를 바꿔버리면 됨.
    const totalHeight = this.scrollY + this.credits.length * this.lineHeight;
    if (totalHeight < -50) {
      this.reset();
    }
  }
}
