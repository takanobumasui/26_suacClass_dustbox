import { firebaseConfig, DB_PATH } from "../firebase-config.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js";

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const dustboxRef = ref(db, DB_PATH);

const connectBtn = document.getElementById("connectBtn");
const logEl = document.getElementById("log");
const distanceEl = document.getElementById("distance");
const percentEl = document.getElementById("percent");
const emptyInput = document.getElementById("emptyDistance");
const fullInput = document.getElementById("fullDistance");

function log(message) {
  const time = new Date().toLocaleTimeString();
  logEl.textContent = `[${time}] ${message}\n` + logEl.textContent;
}

function loadCalibration() {
  emptyInput.value = localStorage.getItem("dustbox_empty") ?? 30;
  fullInput.value = localStorage.getItem("dustbox_full") ?? 5;
}

function saveCalibration() {
  localStorage.setItem("dustbox_empty", emptyInput.value);
  localStorage.setItem("dustbox_full", fullInput.value);
}

emptyInput.addEventListener("change", saveCalibration);
fullInput.addEventListener("change", saveCalibration);
loadCalibration();

function distanceToPercent(distanceCm) {
  const empty = parseFloat(emptyInput.value);
  const full = parseFloat(fullInput.value);
  if (Number.isNaN(empty) || Number.isNaN(full) || empty === full) return 0;
  const percent = ((empty - distanceCm) / (empty - full)) * 100;
  return Math.max(0, Math.min(100, percent));
}

function handleLine(line) {
  if (!line || line === "NaN") return;
  const distance = parseFloat(line);
  if (Number.isNaN(distance)) return;

  const percent = distanceToPercent(distance);
  distanceEl.textContent = distance.toFixed(1);
  percentEl.textContent = percent.toFixed(0);

  set(dustboxRef, {
    distanceCm: distance,
    fillPercent: percent,
    updatedAt: Date.now(),
  }).catch((err) => log("Firebase書き込みエラー: " + err.message));
}

async function connectSerial() {
  if (!("serial" in navigator)) {
    log("このブラウザはWeb Serial APIに対応していません。ChromeまたはEdgeを使ってください。");
    return;
  }

  try {
    const port = await navigator.serial.requestPort();
    await port.open({ baudRate: 9600 });
    log("Arduinoに接続しました。");

    const textDecoder = new TextDecoderStream();
    const readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
    const reader = textDecoder.readable.getReader();

    let buffer = "";
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += value;
      const lines = buffer.split("\n");
      buffer = lines.pop();
      for (const line of lines) {
        handleLine(line.trim());
      }
    }
    await readableStreamClosed.catch(() => {});
  } catch (err) {
    log("エラー: " + err.message);
  }
}

connectBtn.addEventListener("click", connectSerial);
