# mathNET ポートフォリオ公開用

[mathNET](https://mathnet.biz/)のポートフォリオ用の公開コードです。mathNET のくわしい説明は[こちら](https://scrapbox.io/HosokawaR/mathnet)です。またポートフォリオ一覧[こちら](https://scrapbox.io/HosokawaR/%E3%83%9D%E3%83%BC%E3%83%88%E3%83%95%E3%82%A9%E3%83%AA%E3%82%AA)にあります。

# 謝辞

## Git 履歴の削除

せキュリティキーを一部ハードコードしてしまっていたため、git 履歴を削除及び一部のコードを削除しています。削除した部分には`# 公開コードなので削除`と記載されています。
<br>また mathNET は[karintou8710](https://github.com/karintou8710)との共同開発です。git 履歴が見れませんので、具体的な担当領域については[こちら](https://scrapbox.io/HosokawaR/mathnet)を参照ください。

## ローカルでの起動方法
`/` と `/DollorBox`の階層で `cp .env.example .env`を実行します。
`sudo docker-compose up`で起動できます。
