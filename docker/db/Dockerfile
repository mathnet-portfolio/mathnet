FROM postgres:12.5

USER root

RUN apt-get update -y

ARG DB_LANG=en_US

RUN localedef -i $DB_LANG -c -f UTF-8 -A /usr/share/locale/locale.alias $DB_LANG.UTF-8

ENV LANG $DB_LANG.utf8

#バックアップ設定
RUN mkdir /var/backup/ && mkdir /var/backup_sh/

COPY docker/db/pg_backup.sh /var/backup_sh/

RUN chmod 700 /var/backup_sh/pg_backup.sh
