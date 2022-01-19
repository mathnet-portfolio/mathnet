from django.conf import settings
import environ,os

# 環境変数読み込み準備
BASE_DIR = settings.BASE_DIR
env = environ.Env()
env.read_env(os.path.join(BASE_DIR,'.env'))

ALLOWED_SEND_EMAIL = env.get_value("ALLOWED_SEND_EMAIL",bool)

footer = """
※本メールは自動送信です。お問い合わせは https://mathnet.biz/opinionaire/ までよろしくお願いいたします。
※もし本メールにお心当たりが無い場合は、破棄していただけますようお願いします。

■-------------------
mathNET
数学のためのQ&Aサイト
お問い合わせ： https://mathnet.biz/opinionaire/
連絡先： mathnet.jp@gmail.com
-------------------■
"""


# 新規登録時
def RegisterMessage(info, token, request):
    subject = "[mathnet] メールアドレスを認証してください"
    msg = (
        f"""
{info.username}さん

以下のURLに24時間以内にアクセスして、登録を完了してください。
https://mathnet.biz/auth-complete/{token}/
    """
        + footer
    )
    from_email = "mathnet.jp@gmail.com"
    recipient_list = [info.email]
    return (
        subject,
        msg,
        from_email,
        recipient_list,
    )


# 解答投稿時に質問者へ
def ToQuestionerMessage(request, question):
    subject = "[mathnet] 解答が投稿されました"
    msg = (
        f"""
    {question.customUser.username}さん

        タイトル「{question.title}」の質問に解答が投稿されました。
        {request.build_absolute_uri()}
    """ + footer
    )
    from_email = "mathnet.jp@gmail.com"
    recipient_list = [question.customUser.email]
    return (
        subject,
        msg,
        from_email,
        recipient_list,
    )


# 再送信
def ResendEmailMessage(request, token):
    subject = "[mathnet] メールアドレスを認証してください"
    msg = (
        f"""
{request.user.username}さん

以下のURLにアクセスして、登録を完了してください。
https://mathnet.biz/auth-complete/{token}/
    """ + footer
    )
    from_email = "mathnet.jp@gmail.com"
    recipient_list = [request.user.email]
    return (
        subject,
        msg,
        from_email,
        recipient_list,
    )

def ToReplyGroup(request,user,question):
    subject = "[mathnet] 返信欄に新しく投稿されました。"
    msg = f"""
    {request.user.username}さん

        タイトル「{question.title}」の質問に返信が投稿されました。
        {request.build_absolute_uri()}
    """ + footer
    from_email = "mathnet.jp@gmail.com"
    recipient_list = [user.email]
    return (
        subject,
        msg,
        from_email,
        recipient_list,
    )
