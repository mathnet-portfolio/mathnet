from .base import *

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = env('SECRET_KEY')

ALLOWED_HOSTS = env.get_value('ALLOWED_HOSTS',list)

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = env.get_value('DEBUG',bool)

# Database
# https://docs.djangoproject.com/en/3.1/ref/settings/#databases

DATABASES = {
    "default": env.db()
}


# ログ設定
# 参考: https://blog.narito.ninja/detail/21/#_4
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "standard": {
            "format": "[%(asctime)s] %(levelname)s [%(name)s:%(lineno)s] %(message)s",
            "datefmt": "%d/%b/%Y %H:%M:%S",
        },
    },
    "handlers": {
        "file": {
            "class": "logging.handlers.TimedRotatingFileHandler",  # 特定の間隔ごとにログファイルを分割
            "filename": "/var/log/myDjango/django.log",  # ここにログを保存する
            "formatter": "standard",  # 上記のstandardという形式でログを保存する
            "when": "W0",  # ログファイルの分割を日曜日に設定
        },
    },
    "loggers": {
        # Django全体のログ設定
        "django": {
            "handlers": ["file"],  # 上記handlersの'file'という意味
            "level": "ERROR",
        },
        # mathQAアプリレベルのログ
        "mathQA": {
            "handlers": ["file"],  # 同上
            "level": "DEBUG",
        },
    },
}
