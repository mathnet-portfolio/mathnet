#!/bin/bash
# これはcircle-ciで実行するものなので人が実行しないこと

sudo chown -R mathnet:mathnet /home/mathnet/Dollor-Box
sudo pkill -KILL -f uwsgi
git -C /home/mathnet/Dollor-Box/ pull origin develop

sudo python3 manage.py makemigrations mathQA
sudo python3 manage.py migrate
sudo rm -R static
sudo python3 manage.py collectstatic

sudo sh -c "grep -l '//.*' ./static/js/*.js | xargs sed -ie 's@//.*@@g'"
sudo curl -X POST --data-urlencode "payload={\"text\": \"[circle-ci] サーバを更新しました。\"}" https://hooks.slack.com/services/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
sudo sh -c "nohup uwsgi --ini uwsgi-pro.ini 1>/var/log/uwsgi/log 2>/var/log/uwsgi/err &"
