let video;
let facemesh;
let predictions = [];

let emotion = "尚未偵測";
let lastDetectedTime = 0;

function setup() {
  createCanvas(640, 480).position((windowWidth - 640) / 2, (windowHeight - 480) / 2);
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  facemesh = ml5.facemesh(video, modelReady);
  facemesh.on("predict", results => {
    predictions = results;
  });
}

function modelReady() {
  console.log("模型載入完成！");
}

function draw() {
  image(video, 0, 0, width, height);

  if (predictions.length > 0) {
    const keypoints = predictions[0].scaledMesh;

    // 嘴巴上下距離（驚訝/講話）
    let topLip = keypoints[13];  // 上唇中心
    let bottomLip = keypoints[14]; // 下唇中心
    let mouthOpen = dist(topLip[0], topLip[1], bottomLip[0], bottomLip[1]);

    // 眉毛與眼睛距離（皺眉）
    let leftEye = keypoints[159];  // 左眼上緣
    let leftBrow = keypoints[70];  // 左眉毛底
    let browRaise = dist(leftEye[1], leftEye[0], leftBrow[1], leftBrow[0]);

    // 根據距離簡單判斷
    if (mouthOpen > 25 && browRaise < 20) {
      emotion = "看起來很驚訝 😲";
    } else if (browRaise < 10) {
      emotion = "你是不是有點困惑 🤔";
    } else if (mouthOpen < 10 && browRaise > 25) {
      emotion = "你看起來蠻專心的 👀";
    } else {
      emotion = "情緒穩定 🙂";
    }

    lastDetectedTime = millis();
  }

  // 顯示情緒
  if (millis() - lastDetectedTime < 3000) {
    fill(0, 0, 0, 150);
    rect(10, height - 50, width - 20, 40, 10);
    fill(255);
    textSize(24);
    textAlign(CENTER, CENTER);
    text("目前偵測到：" + emotion, width / 2, height - 30);
  }
}
