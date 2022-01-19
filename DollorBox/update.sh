#!/bin/bash
# manage.pyと同じ階層で
# ./static/js/*.js が相対パス

echo "【!】このshはpermissionの関係で失敗する可能性があります（）by 細川"
echo "バックグラウンド起動のuwsgiを停止します"
ps aux | grep uwsgi | grep -v grep | awk '{ print "kill -9", $2 }' | sh
echo "起動プロセス確認"
ps aux | grep uwsgi
read -p "サーバーをバックグラウンド起動しますか[y/n] : " isback

read -p "pullするブランチを指定してください : " branch
git pull origin $branch

echo "migrateします"
python3 manage.py makemigrations mathQA
python3 manage.py migrate

echo "static削除"
rm -R static
echo "collectstatic"
python3 manage.py collectstatic

grep -l '//.*' ./static/js/*.js | xargs sed -ie 's@//.*@@g'
echo "jsファイルのコメントの削除...完了"

echo "uwsgiをポート8001で起動"
if [ $isback = 'y' ]; then
  echo "yですね。"
  curl -X POST --data-urlencode "payload={\"text\": \"[手動] サーバを更新しました。\"}" https://hooks.slack.com/services/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
  nohup uwsgi --ini uwsgi-pro.ini 1>/var/log/uwsgi/log 2>/var/log/uwsgi/err &
else
  echo "yではないと...(⌒,_ゝ⌒)"
  uwsgi --ini uwsgi-pro.ini
fi
