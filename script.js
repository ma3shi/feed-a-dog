// ルール
class Rule {
  constructor() {
    this.ruleContent = document.getElementById("rule"); //ルール内容
    const ruleBtn = document.getElementById("show-rule"); //ルールボタン
    this.overlayBlur = document.getElementById("overlay-blur"); //ぼかし
    const closeRuleBtn = document.getElementById("close-rule"); //ルールを閉じるボタン
    ruleBtn.addEventListener("click", () => this.openRule()); //ルールを開く
    closeRuleBtn.addEventListener("click", () => this.closeRule()); //ルールを閉じる
    this.overlayBlur.addEventListener("click", () => this.closeoverlayBlur()); //ぼかしを消す
  }

  //ルールを開く
  openRule() {
    this.ruleContent.classList.add("show");
    this.overlayBlur.classList.remove("hidden");
  }

  //ルールを閉じる
  closeRule() {
    this.ruleContent.classList.remove("show");
    this.overlayBlur.classList.add("hidden");
  }

  //ぼかしを消す
  closeoverlayBlur() {
    this.ruleContent.classList.remove("show");
    this.overlayBlur.classList.add("hidden");
  }
}

//パネル
class Panel {
  constructor(panelNum, game, board) {
    this.game = game; //ゲーム
    this.board = board; //ボード
    this.panelEl = document.createElement("div"); //div要素作成
    this.panelEl.id = panelNum; //idに数字を代入
    this.panelEl.classList.add("panel"); //class追加
    this.dog = document.createElement("div"); //div要素作成
    this.dog.classList.add("dog"); //class追加
    this.panelEl.appendChild(this.dog); //ドッグをパネルの子要素にする
    //mousedownイベント
    this.panelEl.addEventListener("mousedown", () => {
      this.pushPanel(panelNum); //パネルを押す
    });
  }

  //パネルを押す
  pushPanel(panelNum) {
    //犬の位置とmousedownの位置が一致
    if (panelNum === this.game.dogPosition) {
      //クラスにbarkが含まれている
      if (this.panelEl.classList.contains("bark")) {
        this.game.hitBarkDog(); //吠える犬にヒット
        //クラスにhungryが含まれている
      } else {
        this.panelEl.classList.add("full"); //お腹いっぱいクラスを追加
        this.game.hitHungryDog(); //腹ペコ犬にヒット
      }
    }
  }
}

//ボード
class Board {
  constructor(game) {
    this.game = game; //ゲーム
    this.panelNums = 9; //パネル数
    this.boardEl = document.getElementById("board"); //ボード表示

    for (let i = 0; i < this.panelNums; i++) {
      let panel = new Panel(i, this.game, this); //パネル作成
      this.boardEl.appendChild(panel.panelEl); //パネルをボードの子要素にする
    }
  }
}

//ゲーム
class Game {
  constructor() {
    this.rule = new Rule(); // ルール
    this.board = new Board(this); //ボード作成
    this.leftTimeEl = document.getElementById("time-left"); //残り時間表示
    this.scoreEl = document.getElementById("score"); //スコア表示
    this.highScoreEl = document.getElementById("high-score"); //ハイスコア表示
    this.messageEl = document.getElementById("message"); //メッセージ表示
    this.startBtn = document.getElementById("start"); //スタートボタン
    this.resetBtn = document.getElementById("reset"); //リセットボタン
    this.correctSound = document.getElementById("correct"); //正解音
    this.unCorrectSound = document.getElementById("uncorrect"); //不正解音

    // localStorage.setItem("gameHighScore", 0); //gameHighScoreを0にする
    this.highScore = localStorage.getItem("gameHighScore") || 0; //ハイスコア
    this.highScoreEl.textContent = `ハイスコア : ${this.highScore}`; //ハイスコア表示

    this.limitTime = 20; //制限時間
    this.timerId = null; //タイマーid
    this.countDown; //カウントダウン
    this.countDownTimerId;
    this.timesUp = false; //時間ぎれ
    this.dogPosition; //犬の位置
    this.lastDogPosition; //前回の犬の位置

    //スタートボタンをクリック
    this.startBtn.addEventListener("click", () => {
      this.startGame();
    });

    //リセットボタンをクリック
    this.resetBtn.addEventListener("click", () => {
      this.resetGame();
    });

    this.resetDisplay(); //表示リセット
  }

  //ゲームリセット
  resetGame() {
    clearInterval(this.countDownTimerId); //カウントダウン停止
    this.timesUp = true; //時間ぎれ
    this.startBtn.classList.remove("inactive"); //スタートボタン使用可
    this.resetDisplay(); //表示リセット
  }

  //表示リセット
  resetDisplay() {
    this.score = 0; //スコアをリセット
    this.scoreEl.textContent = `スコア : ${this.score}`; //スコア表示
    this.leftTimeEl.textContent = `残り秒数: ${this.limitTime}`; //制限時間表示
    this.messageEl.textContent = ` `; //メッセージ表示
  }

  //ゲームスタート
  startGame() {
    if (this.startBtn.classList.contains("inactive")) return; //スタートボタン使用不可の時
    this.startBtn.classList.add("inactive"); //スタートボタン使用不可にする

    this.timesUp = false; //タイムアップをfalseにする
    this.countDown = this.limitTime; //制限時間を残り時間に代入

    this.apperDog(); //犬が出現
    //一定時間ごとにカウントダウン
    this.countDownTimerId = setInterval(() => {
      this.countDownTimer();
    }, 1000);
  }

  //犬が現れる
  apperDog() {
    this.dogPosition = Math.floor(Math.random() * this.board.panelNums); //乱数を犬の位置に代入
    //前回と同じ位置ならもう一度
    if (this.dogPosition === this.lastDogPosition) {
      return this.apperDog();
    }
    this.lastDogPosition = this.dogPosition; //犬の位置を記録しておく
    const disapperTime = Math.random() * 1000 + 500; //消えるまでの時間(0.5〜1.5秒)
    const randomPanelEl = this.board.boardEl.children[this.dogPosition]; //ランダムに選んだパネル

    const incidence = Math.random(); //出現率
    if (incidence > 0.2) {
      randomPanelEl.classList.add("hungry"); //ランダムに選んだパネルにhungryクラスを追加
    } else {
      randomPanelEl.classList.add("bark"); //ランダムに選んだパネルにbarkクラスを追加
    }

    //犬が消える
    setTimeout(() => {
      randomPanelEl.classList.remove("hungry"); //hungryクラスを取り除く
      randomPanelEl.classList.remove("bark"); //barkクラスを取り除く
      randomPanelEl.classList.remove("full"); //お腹いっぱいクラスを取り除く
      if (!this.timesUp) this.apperDog(); //時間ぎれでなかったら,もう一度犬を出現
    }, disapperTime);
  }

  //吠える犬にヒット
  hitBarkDog(panelEl) {
    this.unCorrectSound.play(); //減点音
    if (this.score > 0) this.score--; //得点マイナス
    this.scoreEl.textContent = `スコア : ${this.score}`; //得点表示
    this.board.dogPosition = null; //ヒットポジションをnullにして連続マイナス得点できないようにする
  }

  //腹ペコ犬にヒット
  hitHungryDog() {
    this.correctSound.play(); //得点音
    this.score++; //得点プラス
    this.scoreEl.textContent = `スコア : ${this.score}`; //得点表示
    this.board.dogPosition = null; //ドックポジションをnullにして連続得点できないようにする
  }

  //カウントダウン
  countDownTimer() {
    this.countDown--; //残り時間を減らす
    this.leftTimeEl.textContent = `残り秒数 : ${this.countDown}`; //残り時間表示

    //時間が0になったかどうか
    if (this.countDown === 0) {
      clearInterval(this.countDownTimerId); //カウントダウン停止
      this.timesUp = true; //時間ぎれ
      this.board.dogPosition = null; //ヒットポジションをnullにして得点できないようにする
      this.messageEl.textContent = `Game Over スコア${this.score}点 `; //スコア表示
      this.checkHighScore(); //ハイスコアチェック
    }
  }

  //ハイスコアチェック
  checkHighScore() {
    if (this.score > localStorage.getItem("gameHighScore")) {
      localStorage.setItem("gameHighScore", this.score); //ブラウザに保存
      this.highScore = this.score; //スコアをハイスコアに代入
      this.highScoreEl.textContent = `HIGH SCORE : ${this.highScore}`; //ハイスコア表示
    }
  }
}

new Game();
