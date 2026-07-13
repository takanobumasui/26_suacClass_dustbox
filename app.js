import { firebaseConfig, DB_PATH } from "./firebase-config.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js";

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const dustboxRef = ref(db, DB_PATH);

const fillEl = document.getElementById("fill");
const percentLabel = document.getElementById("percentLabel");
const updatedLabel = document.getElementById("updatedLabel");

onValue(dustboxRef, (snapshot) => {
  const data = snapshot.val();
  if (!data) return;

  const percent = Math.max(0, Math.min(100, data.fillPercent ?? 0));
  fillEl.style.height = percent + "%";
  percentLabel.textContent = Math.round(percent) + "%";

  if (data.updatedAt) {
    const date = new Date(data.updatedAt);
    updatedLabel.textContent = "最終更新: " + date.toLocaleString();
  }
});
