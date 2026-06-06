/* ============================================
   ドパガキ診断 - script.js
   フレームワーク不要 / バニラJS
   ============================================ */

"use strict";

/* --------------------------------------------
   質問データ（配列で管理 / 追加しやすい構造）
   各選択肢: { text: 表示文, point: 点数 }
   -------------------------------------------- */
const QUESTIONS = [
  {
    q: "スマホのホーム画面は？",
    options: [
      { text: "ほぼ空白。必要なアプリだけ置いている", point: 0 },
      { text: "よく使うアプリは並んでいるが、そこまで多くない", point: 1 },
      { text: "アプリ・フォルダ・ウィジェット・通知が多くて視界がうるさい", point: 2 },
      { text: "SNS、動画、ゲーム、通知バッジが1画面目に大量にある", point: 3 },
    ],
  },
  {
    q: "通知バッジは？",
    options: [
      { text: "基本オフにしている", point: 0 },
      { text: "必要なアプリだけオンにしている", point: 1 },
      { text: "赤い通知バッジがいくつも残っている", point: 2 },
      { text: "通知バッジが溜まっていても、もう気にならない", point: 3 },
    ],
  },
  {
    q: "退屈な時、最初にすることは？",
    options: [
      { text: "ぼーっとする / 何もしない", point: 0 },
      { text: "音楽を聴く、メモを見る、予定を確認する", point: 1 },
      { text: "とりあえずスマホを開いて、通知やアプリを確認する", point: 2 },
      { text: "SNSを開いて、そのままスワイプし続ける", point: 3 },
    ],
  },
  {
    q: "YouTube Shorts / TikTok / Reelsは？",
    options: [
      { text: "ほぼ見ない", point: 0 },
      { text: "たまに見る", point: 1 },
      { text: "気づいたら見ている", point: 2 },
      { text: "1本のつもりが30分以上消える", point: 3 },
    ],
  },
  {
    q: "アプリの数は？",
    options: [
      { text: "かなり少ない", point: 0 },
      { text: "普通", point: 1 },
      { text: "多い", point: 2 },
      { text: "使っていないアプリだらけ", point: 3 },
    ],
  },
  {
    q: "スマホを開いたあと、目的を忘れることは？",
    options: [
      { text: "ほとんどない。用事が済んだら閉じる", point: 0 },
      { text: "たまにあるが、すぐ気づく", point: 1 },
      { text: "目的と違うアプリを開いていることがよくある", point: 2 },
      { text: "何をしようとしていたか忘れて、SNSや動画を見続けている", point: 3 },
    ],
  },
  {
    q: "スマホを開く頻度は？",
    options: [
      { text: "休憩中や移動中に少し見る程度", point: 0 },
      { text: "暇になると、つい何度も開いてしまう", point: 1 },
      { text: "特に用事がなくても、気づいたらスマホを触っている", point: 2 },
      { text: "勉強中・仕事中・食事中・会話中でも開いてしまう", point: 3 },
    ],
  },
  {
    q: "SNSは1つのアプリで何人くらいフォローしている？",
    options: [
      { text: "100人未満", point: 0 },
      { text: "100〜299人", point: 1 },
      { text: "300〜699人", point: 2 },
      { text: "700人以上", point: 3 },
    ],
  },
];

/* --------------------------------------------
   結果判定データ（点数範囲で管理）
   -------------------------------------------- */
const RESULTS = [
  {
    min: 0,
    max: 6,
    name: "デジタル僧侶",
    body:
      "あなたはスマホに勝っている側の人間です。\n" +
      "通知に心を乱されず、SNSの海にも沈まない。\n" +
      "そのままデジタル寺で静かに暮らしてください。",
  },
  {
    min: 7,
    max: 12,
    name: "ドパベビー",
    body:
      "まだ軽症です。\n" +
      "でも退屈になると、スマホに手が伸びる。\n" +
      "脳の奥で小さなドパミン太鼓が鳴っています。\n" +
      "今のうちに通知バッジを消してください。",
  },
  {
    min: 13,
    max: 18,
    name: "ドーパミン小僧",
    body:
      "だいぶ焼かれています。\n" +
      "暇、疲れ、不安、全部スマホで埋めがち。\n" +
      "ホーム画面があなたの脳に毎日ビンタしています。\n" +
      "SNS・動画・ゲームは1ページ目から消してください。",
  },
  {
    min: 19,
    max: 24,
    name: "大病ドパガキ民",
    body:
      "かなり重症です。\n" +
      "スマホを開いているのではありません。\n" +
      "スマホに開かされています。\n" +
      "通知、SNS、ショート動画に人生のハンドルを握られています。\n" +
      "今すぐホーム画面を更地にしてください。",
  },
];

/* --------------------------------------------
   共通改善アドバイス
   -------------------------------------------- */
const ADVICE = [
  "SNS、動画、ゲームアプリを1画面目から消す",
  "通知バッジをオフにする",
  "使っていないアプリを削除する",
  "ホーム画面を1ページだけにする",
  "背景をシンプルにする",
  "スマホを開く前に「何をするために開くか」を決める",
];

/* --------------------------------------------
   状態
   -------------------------------------------- */
let currentIndex = 0; // 現在の質問番号（0始まり）
let answers = []; // 各問の選択肢index（戻る対応 / 再計算用）

/* --------------------------------------------
   DOM参照
   -------------------------------------------- */
const screens = {
  start: document.getElementById("screen-start"),
  quiz: document.getElementById("screen-quiz"),
  result: document.getElementById("screen-result"),
};

const el = {
  startBtn: document.getElementById("start-btn"),
  retryBtn: document.getElementById("retry-btn"),
  shareBtn: document.getElementById("share-btn"),
  progressBar: document.getElementById("progress-bar"),
  currentNum: document.getElementById("current-num"),
  totalNum: document.getElementById("total-num"),
  qLabelNum: document.getElementById("q-label-num"),
  questionText: document.getElementById("question-text"),
  options: document.getElementById("options"),
  backBtn: document.getElementById("back-btn"),
  resultCard: document.getElementById("result-card"),
  resultName: document.getElementById("result-name"),
  resultScore: document.getElementById("result-score"),
  gaugeFill: document.getElementById("gauge-fill"),
  resultBody: document.getElementById("result-body"),
  adviceList: document.getElementById("advice-list"),
};

const MAX_SCORE = QUESTIONS.length * 3; // 24点

/* --------------------------------------------
   画面切り替え
   -------------------------------------------- */
function showScreen(key) {
  Object.values(screens).forEach((s) => (s.hidden = true));
  screens[key].hidden = false;
  // 先頭にスクロール（結果が長い時用）
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* --------------------------------------------
   診断開始 / リセット
   -------------------------------------------- */
function startQuiz() {
  currentIndex = 0;
  answers = [];
  el.totalNum.textContent = QUESTIONS.length;
  showScreen("quiz");
  renderQuestion();
}

/* --------------------------------------------
   質問描画
   -------------------------------------------- */
function renderQuestion() {
  const question = QUESTIONS[currentIndex];
  const num = currentIndex + 1;

  // ヘッダー / 進捗
  el.currentNum.textContent = num;
  el.qLabelNum.textContent = num;
  el.questionText.textContent = question.q;

  const percent = (num / QUESTIONS.length) * 100;
  el.progressBar.style.width = percent + "%";

  const progressEl = document.querySelector(".progress");
  if (progressEl) progressEl.setAttribute("aria-valuenow", String(num));

  // 戻るボタンは2問目以降のみ表示
  el.backBtn.hidden = currentIndex === 0;

  // 選択肢生成
  el.options.innerHTML = "";
  question.options.forEach((opt, optIndex) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "option";
    btn.textContent = opt.text;
    // 戻ってきた時、前回の選択をハイライト表示
    if (answers[currentIndex] === optIndex) {
      btn.classList.add("is-pressed");
    }
    btn.addEventListener("click", () => handleAnswer(optIndex, btn));
    el.options.appendChild(btn);
  });
}

/* --------------------------------------------
   一つ前の質問へ戻る
   -------------------------------------------- */
function goBack() {
  if (currentIndex === 0) return;
  currentIndex -= 1;
  renderQuestion();
}

/* --------------------------------------------
   回答処理
   -------------------------------------------- */
function handleAnswer(optIndex, btn) {
  // 回答を記録（戻って選び直した場合は上書き）
  answers[currentIndex] = optIndex;

  // 押した感を出してから次へ
  btn.classList.add("is-pressed");

  // 連打防止
  const allBtns = el.options.querySelectorAll(".option");
  allBtns.forEach((b) => (b.disabled = true));

  window.setTimeout(() => {
    currentIndex += 1;
    if (currentIndex < QUESTIONS.length) {
      renderQuestion();
    } else {
      showResult();
    }
  }, 220);
}

/* --------------------------------------------
   合計点を計算
   -------------------------------------------- */
function calcScore() {
  return answers.reduce(
    (sum, optIndex, qIndex) => sum + QUESTIONS[qIndex].options[optIndex].point,
    0
  );
}

/* --------------------------------------------
   結果判定
   -------------------------------------------- */
function getResultIndex(score) {
  const idx = RESULTS.findIndex((r) => score >= r.min && score <= r.max);
  return idx === -1 ? RESULTS.length - 1 : idx;
}

function getResult(score) {
  return RESULTS[getResultIndex(score)];
}

/* --------------------------------------------
   結果描画
   -------------------------------------------- */
function showResult() {
  const score = calcScore();
  const typeIndex = getResultIndex(score);
  const result = RESULTS[typeIndex];

  // タイプ別カラー切り替え
  el.resultCard.setAttribute("data-type", String(typeIndex));

  el.resultName.textContent = result.name;
  el.resultScore.textContent = score;

  // 改行を <br> として安全に表示
  el.resultBody.innerHTML = "";
  result.body.split("\n").forEach((line, i) => {
    if (i > 0) el.resultBody.appendChild(document.createElement("br"));
    el.resultBody.appendChild(document.createTextNode(line));
  });

  // アドバイス
  el.adviceList.innerHTML = "";
  ADVICE.forEach((text) => {
    const li = document.createElement("li");
    li.textContent = text;
    el.adviceList.appendChild(li);
  });

  showScreen("result");

  // 名前のポップ演出を再生（再診断時もやり直す）
  el.resultName.style.animation = "none";
  // ゲージは0からアニメさせる
  el.gaugeFill.style.width = "0";

  // 次フレームで反映してトランジション/アニメを発火
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      el.resultName.style.animation = "";
      el.gaugeFill.style.width = (score / MAX_SCORE) * 100 + "%";
    });
  });
}

/* --------------------------------------------
   Xシェア
   -------------------------------------------- */
function shareToX() {
  const result = getResult(calcScore());
  const text =
    `私は【${result.name}】でした。\n` +
    "スマホを開いているのではない。スマホに開かされている。\n" +
    "#ドパガキ診断";

  const url = "https://twitter.com/intent/tweet?text=" + encodeURIComponent(text);
  window.open(url, "_blank", "noopener");
}

/* --------------------------------------------
   イベント登録
   -------------------------------------------- */
el.startBtn.addEventListener("click", startQuiz);
el.retryBtn.addEventListener("click", startQuiz);
el.shareBtn.addEventListener("click", shareToX);
el.backBtn.addEventListener("click", goBack);
