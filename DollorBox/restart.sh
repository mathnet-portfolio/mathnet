#!/bin/bash
# manage.pyと同じ階層で

echo "バックグラウンド起動のuwsgiを停止します"
ps aux | grep uwsgi | grep -v grep | awk '{ print "kill -9", $2 }' | sh
echo "起動プロセス確認"
ps aux | grep uwsgi
read -p "サーバーをバックグラウンド起動しますか[y/n] : " isback

echo "static削除"
rm -R static
echo "collectstatic"
python3 manage.py collectstatic
echo "uwsgiをポート8001で起動"

grep -l '//.*' ./static/js/*.js | xargs sed -ie 's@//.*@@g'
echo "jsファイルのコメントの削除...完了"

if [ $isback = 'y' ]; then
  echo "back"
  nohup uwsgi --ini uwsgi-pro.ini > /var/log/uwsgi/nohup.log &
else
  echo "noback"
  uwsgi --ini uwsgi-pro.ini
fi
