#!/bin/bash

# バックアップファイルを残しておく日数
PERIOD='+14'

# 日付
DATE=`date '+%Y%m%d-%H%M%S'`

# バックアップ先ディレクトリ
SAVEPATH='/var/backup/'

# 先頭文字
PREFIX='mathnet-'

# 拡張子
EXT='.custom'

# データーベース名
USER='postgres'
DBNAME='mathqa'


# バックアップ実行
pg_dump -Fc $DBNAME > $SAVEPATH$PREFIX$DATE$EXT -U $USER


# 保存期間が過ぎたファイルの削除
find $SAVEPATH -type f -daystart -mtime $PERIOD -exec rm {} \;