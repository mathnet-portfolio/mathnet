#!/usr/bin/env bash

cd /var/www/html
python manage.py makemigrations mathQA
python manage.py migrate
python manage.py collectstatic --noinput
python manage.py loaddata initdata.json
uwsgi --ini uwsgi-pro.ini