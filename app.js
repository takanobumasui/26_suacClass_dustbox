import { firebaseConfig, DB_PATH } from "./firebase-config.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js";

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const dustboxRef = ref(db, DB_PATH);

// 充填率(%)としきい値に応じて切り替える動画。
// 段階を増減したい場合はここに追加・削除するだけでよい。
// 動画ファイルは videos/ に同じファイル名で置く。
const STAGES = [
  { threshold: 0, label: "空", src: "videos/stage-empty.mp4" },
  { threshold: 25, label: "少し", src: "videos/stage-low.mp4" },
  { threshold: 50, label: "半分", src: "videos/stage-mid.mp4" },
  { threshold: 75, label: "満杯", src: "videos/stage-full.mp4" },
];

const videoEl = document.getElementById("binVideo");
const placeholderEl = document.getElementById("binPlaceholder");
const placeholderStageEl = document.getElementById("placeholderStage");
const percentLabel = document.getElementById("percentLabel");
const updatedLabel = document.getElementById("updatedLabel");

let currentSrc = null;

function pickStage(percent) {
  let chosen = STAGES[0];
  for (const stage of STAGES) {
    if (percent >= stage.threshold) chosen = stage;
  }
  return chosen;
}

function showStage(stage) {
  placeholderStageEl.textContent = stage.label;

  if (stage.src === currentSrc) return;
  currentSrc = stage.src;
  videoEl.src = stage.src;
  videoEl.load();
  videoEl.play().catch(() => {});
}

videoEl.addEventListener("error", () => {
  videoEl.style.display = "none";
  placeholderEl.style.display = "flex";
});

videoEl.addEventListener("loadeddata", () => {
  videoEl.style.display = "block";
  placeholderEl.style.display = "none";
});

onValue(dustboxRef, (snapshot) => {
  const data = snapshot.val();
  if (!data) return;

  const percent = Math.max(0, Math.min(100, data.fillPercent ?? 0));
  percentLabel.textContent = Math.round(percent) + "%";
  showStage(pickStage(percent));

  if (data.updatedAt) {
    const date = new Date(data.updatedAt);
    updatedLabel.textContent = "最終更新: " + date.toLocaleString();
  }
});
