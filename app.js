const express = require("express");
// 同一生成元でないところへの要求を安全に許可する仕組み
const cors = require("cors");
const app = express();
// 「body-parser」の代わり
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// アクセスを許可するcors
app.use(cors());
// mongoDBを操作する「mongoose」をインポート
const mongoose = require("mongoose");

// process.env.PORT・・・環境変数（デプロイしたときに自動的に割り当てられるサーバー名）
// ローカルのときは3000番（http://localhost:3000）
const port = process.env.PORT || "3000";
app.listen(port, () => {
  console.log(`${port}番のサーバーが立ち上がりました`);
});

// mongoDBのログイン情報取得
// const logininfo = require("./keys.js");

// mongoDBに接続
mongoose.connect(
  // herokuに登録した環境変数をもってくる「process.env.設定したkey」でもってこれる
  `mongodb+srv://${process.env.NAME}:${process.env.PASS}@cluster0.bwr5d.mongodb.net/login?retryWrites=true&w=majority`,
  () => {
    console.log("mongoDBに接続しました");
  }
);

// スキーマの定義
const userSchema = new mongoose.Schema({
  email: String,
  name: String,
  pass: String,
});

// userSchema型のデータを"users"に入れる
// usersのコレクションを操作するUsermodelオブジェクト作成
const Usermodel = mongoose.model("users", userSchema);

//herokuデプロイ済み https://api-rks.herokuapp.com/

//管理者登録
app.post("/register", async function (req, res) {
  // アドレスが既に登録済みかどうか確認（resultにDBからの結果が返ってくる）
  Usermodel.find({ email: req.body.email }, function (err, result) {
    //   既に存在する場合
    if (result.length !== 0) {
      res.send({
        data: req.body,
        message: "そのメールアドレスはすでに登録済みです。",
        status: "error",
      });
      //   メールアドレスが存在しない場合
    } else {
      //   新しく入れるuserオブジェクト作成
      const user = new Usermodel();
      user.email = req.body.email;
      user.name = req.body.name;
      user.pass = req.body.pass;
      res.send({ data: req.body, status: "success" });
      user.save();
    }
  });
});
// ログイン
app.post("/login", async function (req, res) {
  //   userコレクションに送信するemailとpassの組み合わせが存在するか確認
  Usermodel.find(
    // AND検索
    { email: req.body.email, pass: req.body.pass },
    function (err, result) {
      // 存在する場合ログイン成功
      if (result.length !== 0) {
        res.send({
          data: req.body,
          status: "success",
        });
      } else {
        res.send({
          data: req.body,
          status: "error",
          message: "メールアドレス、またはパスワードが間違っています",
        });
      }
    }
  );
});
//  ログアウト
app.post("/logout", function (req, res) {
  res.send({ status: 200, messsage: "ログアウトに成功しました" });
});

// スキーマは外に出す
const itemSchema = new mongoose.Schema({
  _id: String,
  item: Array,
  __v: Number,
});
// ポケモンの持ち物を取得する
app.get("/pokemonitem", function (req, res) {
  const pokemonmodel = mongoose.model("items", itemSchema);
  pokemonmodel.find({}, function (error, result) {
    res.send(result[0]);
  });
});
// 持ち物コレクション作成用
app.post("/pokemonitem", function (req, res) {
  const itemSchema = mongoose.Schema({ item: Array });
  const pokemonmodel = mongoose.model("item", itemSchema);
  const items = new pokemonmodel();
  res.send(req.body);
  items.item = req.body;
  items.save();
});

app.post("/line", function (req, res) {
  res.send(req.body);
});

require("dotenv").config();
app.get("/test", function (req, res) {
  res.send(process.env.NAME);
});
// ショッピングカート
// const cartShema = mongoose.Schema({ address: String }, { items: Array });
// app.post("/shoppingCart", function (req, wqs) {
//   const cartmodel = mongoose.model("shoppingcart", cartShema);
//   const cartitems = new cartmodel();

//   cartitems.address = req.body.address;
//   cartitems.items = req.body.items;
// });
