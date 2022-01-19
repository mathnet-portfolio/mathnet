FROM python:3

USER root

RUN apt update && apt install -y \
    libpq-dev \
    sudo

COPY DollorBox/requirements.txt /
RUN pip install -r requirements.txt

RUN mkdir /var/log/myDjango/ && touch /var/log/myDjango/django.log

WORKDIR /docker-init

COPY docker/app/container-init.sh /docker-init/
RUN chmod 744 /docker-init/container-init.sh