#!/bin/bash
# manage.pyと同じ階層で
# ./resetServer.sh

ESC=$(printf '\033')

echo "Ver: 2020.09.15"

echo "ユーザを選択してください。※mathQAとmathqaでバグが起きるため"
echo " h) 細川"
echo " k) 小崎"
read -p "君の名は。 (h/k): " name

if [ $name = 'h' ]; then
  echo "細川って言うんだね！"

elif [ $name = 'k' ]; then
  echo "小崎って言うんだね！"

else
  echo printf "${ESC}[31m%s${ESC}[m" 'ERROR'
  echo "それ全角とかじゃないですよねぇぇぇぇ？？？？？？？？？？？？"

fi


echo "以下からコースを選択して下さい。(^^)"
echo " 1) あっさり、DBとサーバの起動  ～:7777～"
echo " 2) こってり、DB初期化にサーバの起動  ～:7777～"
echo -n " 3) 世界"
printf "${ESC}[31m%s${ESC}[m" '消'
echo "失  ～sudo rm -rf /～"
read -p "Shall we dance? (1/2/3): " n
if [ $n = '1' ]; then
  echo "1番のコースですね。ただいまお持ちいたします。(｀･ω･´)ゞ"
  echo "少々お待ち下さい...(._.)"
  POSTGRES_IS_OK=`sudo ps aux | grep postgres | wc -l`
  if [ $POSTGRES_IS_OK -lt 3 ] ; then
    sudo /etc/init.d/postgresql restart
  fi
  # rm -R mathQA/migrations
  # echo "migrationsを削除完了"
  if [ $name = 'h' ]; then
    python3 manage.py makemigrations mathQA
    python3 manage.py migrate
    python3 manage.py runserver 7777
  elif [ $name = 'k' ]; then
    sudo python3 manage.py makemigrations mathQA
    sudo python3 manage.py migrate
    sudo python3 manage.py runserver 8000
  fi

elif [ $n = '2' ]; then
  echo "へい！コース2を3番テーブルにいっちょ！！( ﾟдﾟ )彡"
  echo "少々お待ち下さい...(._.)"
  sudo /etc/init.d/postgresql restart
  echo "お客様、パスワードはセルフサービスでお願いさせていただいております(´・ω・｀)ｺﾞﾒﾝﾈ"
  psql -U postgres << EOF
DROP DATABASE mathqa;
alter role postgres with password 'Tom-00000';
CREATE DATABASE mathqa;
ALTER ROLE postgres SET client_encoding TO 'utf8';
ALTER ROLE postgres SET default_transaction_isolation TO 'read committed';
ALTER ROLE postgres SET timezone TO 'Asia/Tokyo';
EOF
  # exit $?
  echo "少々お待ち下さい...(._.)"
  sudo /etc/init.d/postgresql restart

  # rm -R mathQA/migrations
  # echo "migrationsを削除完了"
  if [ $name = 'h' ]; then
    python3 manage.py makemigrations mathQA
    python3 manage.py migrate
  elif [ $name = 'k' ]; then
    sudo python3 manage.py makemigrations mathQA
    sudo python3 manage.py migrate
  fi

  echo "migrateを完了"
  echo "サーバ起動プロセスに移項..."
  if [ $name = 'h' ]; then
    python3 manage.py runserver 7777
  elif [ $name = 'k' ]; then
    sudo python3 manage.py runserver 8000
  fi


elif [ $n = '3' ]; then
  printf "\n\n${ESC}[31m%s${ESC}[m\n\n\n" '世界消失...'
  echo "(・。・;"

else
  echo printf "${ESC}[31m%s${ESC}[m" 'ERROR'
  echo "それ全角とかじゃないですよねぇぇぇぇ？？？？？？？？？？？？"

fi
