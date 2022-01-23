# mathNET ポートフォリオ公開用

## mathNET とは

2020 年 9 月から 2021 年 1 月まで公開していた数学専用 Q&A サイトです。知恵袋などの汎用 Q&A サイトとは違い、LaTeX を用いた数式描画や高画質画像の投稿が特徴的な、数学の質問に特化した Q&A サイトです。 コロナ禍により友人と大学数学について相談し合う機会が減ったため本サービスが作られました。  
しかし利用者が思うように伸びずサービスを終了、その後ポートポートフォリオとして活用すべく公開しています。
![image](https://user-images.githubusercontent.com/45098934/150676517-9f2ece0d-acad-4e1c-8332-9d07bc9b3a9a.png)

## 製作者

本サービスは [@HosokawaR](https://github.com/hosokawaR) と [@karintou8710](https://github.com/karintou8710) により作成されました。@HosokawaR は主にフロントエンドや UI/UX 設計、@karintou8710 は主にバックエンドや Docker 環境の整備を担当しました。ただし明確に役割分担をしていたわけではなくお互いがお互いの領域を手伝っていました。

### 特徴

#### LaTeX を用いた数式投稿

![image](https://user-images.githubusercontent.com/45098934/150676522-4e1e50a7-df98-4ed9-b2d4-2fdae4d06398.png)

### 高画質画像の複数投稿

![image](https://user-images.githubusercontent.com/45098934/150676529-2347d75b-abc9-4965-9286-2d3629426cb6.png)

### 分野ごとのタグ付与

![image](https://user-images.githubusercontent.com/45098934/150676573-759d7832-93a9-47ba-ac13-4feb0c4b58ad.png)

## ローカルでの実行

### 起動

以下を実行します。Docker が必要です。

```bash
sudo bash local-setup.sh
```

### 操作

Docker コンテナが立ち上がったら、`http://localhost`にアクセスしてください。  
※オレオレ証明書を使用している都合上ブラウザによっては警告が表示されることがありますが問題ありません。  
ログインすると質問の投稿や回答ができるようになります。初期状態ではメールアドレスログインのみが使用可能です。OAuth ログインは`.env`に API KEY をセットすることで利用できます。また、ダミデータを挿入してありますのでログインしなくても機能を把握することができます。

## 技術

- HTML5
- CSS3
- SASS
- JavaScript
- JQeruy
- Vue
- Python3
- Django
- PostgreSQL
- Docker
- Nginx

## Git 履歴

本コードは当初ポートフォリをとしての公開を想定していなかったため、念の為 Git 履歴をすべて削除した上で公開しています。
