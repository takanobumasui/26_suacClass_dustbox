# 26_suacClass_dustbox

物理的なゴミ箱にゴミが溜まっていく様子を、距離センサー(Arduino Uno + HC-SR04)で検知し、
Webブラウザ上の映像のゴミ箱にリアルタイムで反映するプロジェクト。

## 全体の仕組み

```
① HC-SR04が距離を測る
      ↓ (配線)
② Arduino Unoがその数値をUSB経由でシリアル出力
      ↓
③ 中継ページ(relay/index.html)がWeb Serial APIで直接読み取り、
   Firebase Realtime Databaseに書き込む
      ↓ (インターネット経由)
④ 公開ページ(index.html, GitHub Pages)がFirebaseの値を購読し、
   充填率に応じた段階の動画に切り替えて再生する
```

Python等は使わず、Arduinoのスケッチ以外はすべてHTML/CSS/JSで完結しています。
中継ページはWeb Serial APIを使うため、**ChromeまたはEdgeブラウザ**で開く必要があります。

## ファイル構成

- `arduino/dustbox_sensor/dustbox_sensor.ino` — Arduino用スケッチ。距離(cm)を1行ずつSerial出力する
- `firebase-config.js` — Firebaseの接続設定(要編集。下記手順を参照)
- `relay/` — ゴミ箱の横のPCで開いておく中継ページ(Arduino → Firebase)
- `index.html` / `style.css` / `app.js` — 誰でも見られる公開ページ(GitHub Pagesで公開)
- `videos/` — 充填段階ごとに切り替える動画ファイルの置き場所(詳細は`videos/README.md`)

## セットアップ手順

### 1. ハードウェアの配線

HC-SR04をArduino Unoに接続する。

| HC-SR04 | Arduino Uno |
|---|---|
| VCC | 5V |
| GND | GND |
| Trig | 9番ピン |
| Echo | 10番ピン |

センサーはゴミ箱の蓋の裏など、ゴミの表面までの距離を測れる位置に取り付ける。

### 2. Arduinoスケッチの書き込み

1. Arduino IDEをインストール
2. `arduino/dustbox_sensor/dustbox_sensor.ino` を開く
3. Arduino Unoを選択して書き込み
4. シリアルモニタ(9600bps)を開き、距離の数値が表示されることを確認する

### 3. Firebaseプロジェクトの作成

1. https://console.firebase.google.com/ にアクセスし、Googleアカウントでログイン
2. 「プロジェクトを作成」から新規プロジェクトを作成(Googleアナリティクスは無効でよい)
3. 左メニューの「構築」→「Realtime Database」を開き、データベースを作成する
   - ロケーションは任意
   - セキュリティルールは「テストモード」で開始してよい(下記「注意」を参照)
4. 左メニューの「プロジェクトの設定」(歯車アイコン)→「全般」タブを開く
5. 「マイアプリ」で「</>(ウェブ)」アイコンをクリックしてウェブアプリを登録する
6. 表示された `firebaseConfig` の内容(apiKey, authDomain, databaseURL, projectId など)をコピーする

### 4. `firebase-config.js` の編集

コピーした内容を、リポジトリ直下の `firebase-config.js` に貼り付ける。

```js
export const firebaseConfig = {
  apiKey: "実際の値",
  authDomain: "実際の値",
  databaseURL: "実際の値",
  projectId: "実際の値",
};
```

### 5. GitHub Pagesの公開設定

1. GitHubのリポジトリ → Settings → Pages
2. Source を「Deploy from a branch」、Branch を `main` / `/(root)` に設定して保存
3. 数分後、`https://<ユーザー名>.github.io/26_suacClass_dustbox/` でアクセスできるようになる
   - 中継ページは `https://<ユーザー名>.github.io/26_suacClass_dustbox/relay/` でアクセスする

### 6. 中継ページの利用(ゴミ箱の横のPCで)

1. Chrome または Edge で中継ページ(`relay/`)を開く
2. 「空の時の距離」「満杯の時の距離」を実測してキャリブレーション欄に入力する
3. 「Arduinoに接続」ボタンを押し、Arduinoが接続されているシリアルポートを選択する
4. 以降、そのタブを開いたままにしておけば自動的にFirebaseへ値が送信され続ける

### 7. 段階ごとの動画の準備

公開ページは、充填率に応じて`videos/`内の動画(数秒・ループ再生)を切り替えて表示します。
ファイル名としきい値は`videos/README.md`と`app.js`の`STAGES`を参照してください。
動画がまだ置かれていない段階は「動画未設定」というプレースホルダーが表示されます。

## 注意: セキュリティルールについて

上記手順の「テストモード」はデータベースへの読み書きを誰でもできる状態にする簡易設定です。
授業・デモ用途としては手軽ですが、本番運用する場合はFirebaseの認証機能やセキュリティルールで
書き込みを制限することを検討してください。
