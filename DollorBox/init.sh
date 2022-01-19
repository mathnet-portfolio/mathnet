#!/bin/bash
# manage.pyと同じ階層で
# ./static/js/*.js が相対パス
echo "これはサーバ初期化シェルスクリプトです。データベースの内容がすべて消えます。"
read -p "よろしいですか？ (y/n): " s1

if [ $s1 = 'y' ]; then
  ESC=$(printf '\033')
  echo -n "え？本当にいいの？"
  printf "${ESC}[31m%s${ESC}[m\n" 'データ全部消えるよ？？？？'
  read -p "よろしいですか？ (y/n): " s2
  if [ $s2 = 'y' ]; then
  #
    echo "どーん"
    grep -l '//.*' ./static/js/*.js | xargs sed -ie 's@//.*@@g'
    echo "jsファイルのコメントの削除...完了"
    sudo /etc/init.d/postgresql restart
    echo "psqlのパスワードを入力してください"
    psql -U postgres << EOF
DROP DATABASE mathqa;
CREATE DATABASE mathqa;
ALTER ROLE postgres SET client_encoding TO 'utf8';
ALTER ROLE postgres SET default_transaction_isolation TO 'read committed';
ALTER ROLE postgres SET timezone TO 'Asia/Tokyo';
EOF
    sudo /etc/init.d/postgresql restart
    rm -R mathQA/migrations
    python3 manage.py makemigrations mathQA
    python3 manage.py migrate

    echo "static削除"
    rm -R static
    echo "collectstatic"
    python3 manage.py collectstatic
    echo "uwsgiをポート8001で起動"
    uwsgi --ini uwsgi-pro.ini
    #
  else
    echo "恐怖を感じた...(゜o゜;"
  fi

else
  echo "危ない危ない...(・。・;"

fi

