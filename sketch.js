// EdTech 手勢互動遊戲完整版
let video;
let handpose;
let predictions = [];
let bubbles = [];
let score = 0;
let timer = 60;
let gameStarted = false;
let lastBubbleTime = 0;
let questionSet = [
  { text: "教育科技強調科技與學習的整合", correct: true },
  { text: "建構主義提倡學生主動建構知識", correct: true },
  { text: "教育科技主要應用在學校硬體設備維修", correct: false },
  { text: "多元智能理論與教育科技無關", correct: false },
  { text: "教學媒體包含影片、AR、互動式模擬等", correct: true },
  { text: "教學設計不需要考慮學生學習歷程", correct: false },
  { text: "教育科技與課程設計可結合進行教學創新", correct: true }
];

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  handpose = ml5.handpose(video, () => console.log("模型已載入"));
  handpose.on("predict", results => predictions = results);

  textAlign(CENTER, CENTER);
  setInterval(() => {
    if (gameStarted && timer > 0) timer--;
  }, 1000);
}

function draw() {
  // 將畫面左右翻轉
  push();
  translate(width, 0);
  scale(-1, 1);
  image(video, 0, 0, width, height);
  pop();

  fill(255);
  textSize(20);
  stroke(0);
  strokeWeight(3);
  text(`分數：${score}  時間：${timer}`, width / 2, 20);
  noStroke();

  if (!gameStarted) {
    textSize(28);
    fill(255);
    stroke(0);
    strokeWeight(4);
    text("按任意鍵開始遊戲", width / 2, height / 2);
    noStroke();
    return;
  }

  if (timer <= 0) {
    textSize(32);
    fill(255);
    stroke(0);
    strokeWeight(4);
    text("遊戲結束！最終分數：" + score, width / 2, height / 2);
    noStroke();
    noLoop();
    return;
  }

  if (millis() - lastBubbleTime > 2000) {
    let q = random(questionSet);
    bubbles.push(new Bubble(q.text, q.correct));
    lastBubbleTime = millis();
  }

  for (let i = bubbles.length - 1; i >= 0; i--) {
    bubbles[i].update();
    bubbles[i].display();
    if (bubbles[i].offScreen()) bubbles.splice(i, 1);
  }

  drawHandAndDetect();
}

function keyPressed() {
  if (!gameStarted) {
    gameStarted = true;
    timer = 60;
    score = 0;
    bubbles = [];
    loop();
  }
}

function drawHandAndDetect() {
  if (predictions.length > 0) {
    const hand = predictions[0].landmarks;
    const thumbTip = hand[4];
    const indexTip = hand[8];
    const middleTip = hand[12];
    const wrist = hand[0];

    // 畫出手部
    noFill();
    stroke(0, 255, 0);
    strokeWeight(2);
    for (let pt of hand) ellipse(width - pt[0], pt[1], 8, 8);

    for (let i = bubbles.length - 1; i >= 0; i--) {
      let b = bubbles[i];
      if (dist(width - indexTip[0], indexTip[1], b.x, b.y) < b.r) {
        // 👍 判斷
        if (thumbTip[1] < wrist[1] - 30) {
          if (b.correct) score++;
          else score--;
          bubbles.splice(i, 1);
        }
        // ✋ 張手：食指與中指距離大（分開）
        else if (dist(indexTip[0], indexTip[1], middleTip[0], middleTip[1]) > 40) {
          if (!b.correct) score++;
          else score--;
          bubbles.splice(i, 1);
        }
      }
    }
  }
}

class Bubble {
  constructor(txt, correct) {
    this.text = txt;
    this.correct = correct;
    this.x = random(100, width - 100);
    this.y = -50;
    this.r = 60;
    this.speed = 2;
  }

  update() {
    this.y += this.speed;
  }

  offScreen() {
    return this.y > height + this.r;
  }

  display() {
    fill(this.correct ? 'lightblue' : 'lightpink');
    stroke(0);
    ellipse(this.x, this.y, this.r * 2);
    fill(0);
    textSize(16);
    stroke(255);
    strokeWeight(4);
    text(this.text, this.x, this.y);
    noStroke();
  }
}
