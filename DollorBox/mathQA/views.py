import datetime
import json
import math
import os
import re
import secrets
import threading
from json import dumps

import pandas as pd
from django.contrib.auth import authenticate
from django.contrib.auth import login as dj_login
from django.contrib.auth import logout as dj_logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.hashers import check_password, make_password
from django.core.mail import send_mail
from django.db.models import Count, Q
from django.http import Http404, HttpResponse, HttpResponseRedirect, QueryDict
from django.shortcuts import get_object_or_404, redirect, render
from django.urls import reverse
from django.utils import timezone
from PIL import Image
from pykakasi import kakasi

try:
    from .email.local import *
except:
    from .email.product import *

from .models import *

# ログイン確認は別の方法がある

###################　注意　####################
###                                         ###
###　ajaxで変数を送るときはエスケープしてね　 ###
###                                         ###
###################　注意　####################

####--pykakasiの設定--####

kakasi = kakasi()
kakasi.setMode("H", "H")
kakasi.setMode("K", "H")
kakasi.setMode("J", "H")
# kakasi.setMode("r", "Hepburn")
kakasiconv = kakasi.getConverter()

####--ユーザー定義関数--####

# searchResultとdetailで使う


def createTitle(context):
    """
    本文から表示用のタイトルと残りの文章を取得する
    maxlength以下=>そのままタイトルだけ表示
    maxlengthより大きい=>数式が途切れないように最小値で
    """
    context = re.sub(
        r"\!\[.+?\]\([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.[\s\S]*?\)",
        "(画像)",
        context,
    )
    maxlength = 10
    if len(context) <= maxlength:
        return {
            "title": context,
            "leftcontext": "",
        }
    reg = r"(\\begin\{.*?\}[\s\S]*?\\end\{.*?\}|\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|\$[\s\S]*?\$|\\\([\s\S]*?\\\))"
    part_sentence = [len(i) for i in re.split(reg, context) if i]
    separeteNum = 0
    startIsmath = bool(re.match(reg, context))
    for i, part in enumerate(part_sentence):
        separeteNum += part
        if separeteNum > maxlength:
            if startIsmath:
                separeteNum = separeteNum if i % 2 == 0 else maxlength
            else:
                separeteNum = maxlength if i % 2 == 0 else separeteNum
            break
    return {"title": context[:separeteNum], "leftcontext": context[separeteNum:]}


def __CreateContextData___(request, questions):
    Data = {}
    # PVランキング
    pvRanking = Question.objects.order_by("cntBrowsed").reverse()[:10]
    for pv in pvRanking:
        pv.title = createTitle(pv.contents)["title"]
    Data["pvRanking"] = pvRanking
    # 注目のランキング
    attentionRanking = (
        Question.objects.annotate(numberAnswer=Count("answer"))
        .order_by("numberAnswer", "updated_at")
        .reverse()[:10]
    )
    ats = []
    for at in attentionRanking:
        at.title = createTitle(at.contents)["title"]
    Data["attentionRanking"] = attentionRanking
    # 未解決の質問
    unsolveds = Question.objects.filter(bestAnswer=None)[:10]
    for uns in unsolveds:
        uns.title = createTitle(uns.contents)["title"]
    Data["unsolveds"] = unsolveds
    # ユーザの回答数ランキング
    numAnsRanking = (
        CustomUser.objects.annotate(ansCountByUser=Count("answer"))
        .order_by("ansCountByUser")
        .reverse()[:10]
    )
    Data["userAnsCountRanking"] = numAnsRanking
    return Data


def getBasicContectData(data):
    """__CreateContextData__から受け取ったデータから、基本的なページで使う情報を辞書にして返却する。
       基本的なページで使う情報とは、主にサイドバーに表示される情報であり、メインコンテンツによって左右されないものである。

    Args:
        data (dict): __CreateContextData___の返り値

    Returns:
        dict: 基本的なページで使う情報を返される。
    """
    context = {
        "userAnsCountRanking": data["userAnsCountRanking"],
        "unsolveds": data["unsolveds"],
        "pvRanking": data["pvRanking"],
        "attentionRanking": data["attentionRanking"],
    }
    return context


def resizeImg(path, minLength):
    """画像の比率をそのままに、特定のサイズにリサイズして上書き保存する。対応してない拡張子の場合はエラーを出す。

    Args:
        path (string): リサイズしたい画像までのパス。基準がmanage.pyであることに注意。view.pyではない。
        minLength (int): 短辺のサイズ(単位: px)
    """
    try:
        img = Image.open(path)
        w = img.width
        h = img.height
        if w > h:
            img = img.resize((int(minLength * w / h), minLength))
        else:
            img = img.resize((minLength, int(minLength * h / w)))
        main, ext = os.path.splitext(path)
        img.save(main + ext)
    except OSError as e:
        print("処理できない拡張子の可能性があります。")
        print(e)
    except Exception as e:
        print(e)


def async_send_email(subject, msg, from_email, recipient_list):
    if ALLOWED_SEND_EMAIL:
        send_mail(subject, msg, from_email, recipient_list)


####--ここから下はviews--####


# ホームページ
def index(request):
    if request.session.get("used-email"):
        return redirect("mathQA:user")
    context = {}
    questions = Question.objects.all()
    start = 0
    pagenum = 10
    imgmarkdown = r"\!\[.+?\]\([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|jpeg|gif|png|bmp)\)"
    questionSet = []
    for question in questions[start : start + pagenum]:
        content = question.contents
        content = re.sub(imgmarkdown, "(画像)", content)
        # if len(content) >= 50:
        #     content = content[:50] + "..."
        questionSet.append(
            {
                "question": question,
                "content": content,
            }
        )
    Data = __CreateContextData___(request, questions)
    context = getBasicContectData(Data)
    context.update(
        {
            "start": start + 1,
            "matomeNum": math.ceil(len(questions) / pagenum),
            "questionSet": questionSet,
            "tag": None,
        }
    )
    return render(request, "mathQA/searchResult.html", context)


# 工事中のページ
def undone(request):
    questions = Question.objects.all()
    Data = __CreateContextData___(request, questions)
    context = getBasicContectData(Data)
    return render(request, "mathQA/undone.html", context)


# プライバシーポリシー
def privacy_policy(request):
    questions = Question.objects.all()
    Data = __CreateContextData___(request, questions)
    context = getBasicContectData(Data)
    return render(request, "mathQA/privacy_policy.html", context)


# 利用規約
def terms_of_service(request):
    questions = Question.objects.all()
    Data = __CreateContextData___(request, questions)
    context = getBasicContectData(Data)
    return render(request, "mathQA/terms_of_service.html", context)


# ご意見
def opinionaire(request):
    questions = Question.objects.all()
    Data = __CreateContextData___(request, questions)
    context = getBasicContectData(Data)
    return render(request, "mathQA/opinionaire.html", context)


# チュートリアル
def tutorial(request):
    questions = Question.objects.all()
    Data = __CreateContextData___(request, questions)
    context = getBasicContectData(Data)
    return render(request, "mathQA/tutorial.html", context)


# タグの追加要望
def adding_tag_request(request):
    questions = Question.objects.all()
    Data = __CreateContextData___(request, questions)
    context = getBasicContectData(Data)
    return render(request, "mathQA/adding_tag_request.html", context)


# 登録
def register(request):
    context = {}
    if request.method == "POST":
        dic = QueryDict(request.body, encoding="utf-8")
        userName = dic.get("userName")
        email = dic.get("email")
        password = dic.get("password")
        if not (userName == "") and not (password == "") and not (email == ""):
            if CustomUser.objects.filter(username=userName).exists():
                res = dumps(
                    {
                        "status": "UserNameOverlap",
                        "msg": "ごめんなさいm(_ _)m そのユーザネームは既に使われています。",
                    }
                )
            elif CustomUser.objects.filter(email=email).exists():
                res = dumps(
                    {
                        "status": "EmailOverlap",
                        "msg": "ごめんなさいm(_ _)m そのメールアドレスは既に使われています。",
                    }
                )
            elif not re.match(
                r"^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$",
                email,
            ):
                res = dumps(
                    {
                        "status": "EmailNotCorrect",
                        "msg": "ごめんなさいm(_ _)m そのメールアドレスは正しくありません。",
                    }
                )
            else:
                token = secrets.token_hex()
                token_hash = make_password(token)
                info = CustomUser.objects.create_user(
                    username=userName,
                    email=email,
                    password=password,
                    emailtoken=Token.objects.create(token=token_hash),
                )
                info.save()

                user = authenticate(request, username=userName, password=password)
                dj_login(request, user)
                threading.Thread(
                    target=async_send_email, args=RegisterMessage(info, token, request)
                ).start()
                res = dumps({"status": 0, "msg": "", "redirect": "/"})
        else:
            res = dumps({"status": "InputLack", "msg": "入力が不足しています。(._.)"})
        return HttpResponse(res, content_type="application/json")
    else:
        return render(request, "mathQA/register.html", context)


def logout(request):
    try:
        dj_logout(request)
    except Exception:
        pass
    context = {"msg": ""}
    return redirect("/login/")


def login(request):
    if request.user.is_authenticated:
        return HttpResponseRedirect(reverse("mathQA:user"))
    # バリデーションチェックはもっといい方法があるかも
    if request.method == "POST":
        dic = QueryDict(request.body, encoding="utf-8")
        userNameOrEmail = dic.get("userNameOrEmail")
        password = dic.get("password")
        if not (userNameOrEmail == "") and not (password == ""):
            # もうちょっとマシな書き方があるきがする...
            try:
                userData = CustomUser.objects.get(
                    Q(username=userNameOrEmail) | Q(email=userNameOrEmail)
                )
            except CustomUser.DoesNotExist:
                res = dumps(
                    {
                        "status": "NoUserNameOrEmail",
                        "msg": "ユーザネーム または メールアドレスがありません。(T_T)",
                    }
                )
            else:
                user = authenticate(username=userNameOrEmail, password=password)
                if user is None:
                    user = authenticate(email=userNameOrEmail, password=password)
                if user is not None:
                    dj_login(request, user)
                    res = dumps({"status": 0, "msg": "", "redirect": "/user/"})
                else:
                    res = dumps({"status": "NoPassword", "msg": "パスワードが一致しません。(ﾟ∀ﾟ)"})
        else:
            res = dumps({"status": "InputLack", "msg": "入力が不足しています。(._.)"})
        return HttpResponse(res, content_type="application/json")
    else:
        context = {"msg": ""}
        return render(request, "mathQA/login.html", context)


@login_required
def user(request):
    request.session.set_expiry(60 * 60 * 24 * 7 * 2)
    context = {}
    if request.session.get("used-email"):
        context["email"] = request.session["used-email"]
        del request.session["used-email"]
    return render(request, "mathQA/user.html", context)


# 質問入力
@login_required
def writeQ(request):
    data = {}
    for tag in QuestionTag.objects.all():
        data[tag.tagName] = [
            kakasiconv.do(tag.tagName),
        ]
    context = {
        "tags": QuestionTag.objects.all(),
        "js": dumps(data),
    }
    if request.method == "POST":
        try:
            # js側で純粋なjsonを送信する場合、このコード
            # JSON文字列をPython辞書に変換している
            # 不明点があれば細川まで
            j = json.loads(request.body.decode("utf-8"))
            contents = j["text"]
            title = j["title"]
            tags = j["tags"]
        except KeyError:
            res = dumps(
                {
                    "status": "InputLack",
                    "msg": "未入力です。(._.)",
                    "redirect": "",
                }
            )
            return HttpResponse(res, content_type="application/json")
        else:
            if not contents:
                res = dumps(
                    {"status": "InputLack", "msg": "質問を入力して下さい。(´・ω・｀)", "redirect": ""}
                )
                return HttpResponse(res, content_type="application/json")
            if len(set(tags)) > 5:
                res = dumps(
                    {
                        "status": "exceed limit",
                        "msg": "タグが５つより多く指定されています",
                        "redirect": "",
                    }
                )
                return HttpResponse(res, content_type="application/json")
            try:
                q = Question(
                    customUser=request.user,
                    contents=contents,
                    title=title,
                    updated_at=timezone.now(),
                )
            except Exception as e:
                print(e)
                res = dumps(
                    {"status": "InputLack", "msg": "例外が発生しました。", "redirect": ""}
                )
                return HttpResponse(res, content_type="application/json")
            else:
                q.save()
                try:
                    for tag in set(tags):
                        if not QuestionTag.objects.filter(tagName=tag).exists():
                            res = dumps(
                                {
                                    "status": "don't exist tag ",
                                    "msg": "指定したタグが存在しません",
                                    "redirect": "",
                                }
                            )
                            return HttpResponse(res, content_type="application/json")
                        q.tags.add(QuestionTag.objects.get(tagName=tag))
                except Exception as e:
                    print("tagの登録でエラーが発生しました")
                    print(e)

                res = dumps(
                    {"status": 0, "msg": "", "redirect": "/detail/" + str(q.id) + "/"}
                )
                return HttpResponse(res, content_type="application/json")
    else:
        return render(request, "mathQA/writeQ.html", context)


# 質問詳細
def detail(request, questionID):
    question = get_object_or_404(Question, pk=questionID)
    answers = question.answer_set.all()
    loginID = request.user.id if request.user.is_authenticated else ""
    ansIDs = []

    for answer in answers:
        ansIDs.append(answer.customUser.id)
    if not loginID:
        status = "guest"
    elif loginID == question.customUser.id:
        status = "questioner"
    elif loginID in ansIDs:
        status = "answer"
    else:
        status = "logging"
    userIDsgood = []
    for i in question.goodinfo_set.all():
        userIDsgood.append(i.customUser.id)
    Data = __CreateContextData___(request, Question.objects.all())
    context = getBasicContectData(Data)
    context.update(
        {
            "questionID": questionID,
            "question": question,
            "answers": answers,
            "status": status,
            "userIDsgood": userIDsgood,
        }
    )
    if request.method == "POST":
        if not request.user.is_authenticated:
            return HttpResponseRedirect(reverse("mathQA:login"))
        try:
            j = json.loads(request.body.decode("utf-8"))
            contents = j["text"]
            method = j["method"]
            answerID = j["answerID"]
        except KeyError:
            res = dumps({"status": "InputLack", "msg": "エラー", "redirect": ""})
            return HttpResponse(res, content_type="application/json")
        if not contents:
            res = dumps(
                {
                    "status": "InputLack",
                    "msg": "文章を入力して下さい。(´・ω・｀)",
                    "redirect": "",
                }
            )
            return HttpResponse(res, content_type="application/json")
        if method == "answer":
            a = Answer(
                customUser=request.user,
                question=question,
                contents=contents,
                updated_at=timezone.now(),
            )
            a.save()

            if question.customUser.verified == True:
                threading.Thread(
                    target=async_send_email, args=ToQuestionerMessage(request, question)
                ).start()

            context["status"] = "answer"
        elif method == "reply":
            thisans = get_object_or_404(Answer, pk=answerID)
            r = Reply(
                customUser=request.user,
                answer=thisans,
                contents=contents,
                updated_at=timezone.now(),
            )
            r.save()
            toemailusers = [thisans.customUser]
            toemailusers += [rep.customUser for rep in thisans.reply_set.all()]
            toemailusers = list(set(toemailusers))
            toemailusers.remove(request.user)
            for toemailuser in toemailusers:
                if toemailuser.verified == True:
                    threading.Thread(
                        target=async_send_email,
                        args=ToReplyGroup(request, toemailuser, question),
                    ).start()

        else:
            raise Http404
        res = dumps(
            {"status": 0, "msg": "", "redirect": "/detail/" + str(questionID) + "/"}
        )
        return HttpResponse(res, content_type="application/json")
    else:
        question.cntBrowsed += 1
        question.save()
        return render(request, "mathQA/detail.html", context)


def searchResult(request, start, tag=None):
    if tag is not None:
        questions = Question.objects.filter(tags__tagName=tag)
    else:
        questions = Question.objects.all()
    pagenum = 10
    startpage = pagenum * (int(start) - 1)
    imgmarkdown = r"\!\[.+\]\([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|jpeg|gif|png|bmp)\)"
    questionSet = []
    for question in questions[startpage : startpage + pagenum]:
        content = question.contents
        re.sub(imgmarkdown, "", content)
        if len(content) >= 50:
            content = content[:50] + "..."
        questionSet.append(
            {
                "question": question,
                "content": content,
            }
        )
    Data = __CreateContextData___(request, questions)
    context = getBasicContectData(Data)
    context.update(
        {
            "start": start,
            "tag": tag,
            "matomeNum": math.ceil(len(questions) / pagenum),
            "pagenum": pagenum,
            "questionSet": questionSet,  # メイン質問欄
        }
    )
    return render(request, "mathQA/searchResult.html", context)


@login_required
def auth_complete(request, token):
    if not request.user.emailtoken:
        raise Http404

    JST = datetime.timezone(datetime.timedelta(hours=9), "JST")
    user_token = request.user.emailtoken.token
    now = datetime.datetime.now(JST)
    delta = now - request.user.emailtoken.created_at
    if check_password(token, user_token):
        questions = Question.objects.all()
        Data = __CreateContextData___(request, questions)
        context = getBasicContectData(Data)
        if delta.seconds < 60 * 60 * 24:
            request.user.emailtoken = None
            request.user.verified = True
            request.user.save()
            context["msg"] = "認証に成功しました。"
            return render(request, "mathQA/authtoken.html", context)
        else:
            context["msg"] = "トークンの有効期限が切れました。"
            return render(request, "mathQA/authtoken.html", context)
    else:
        raise Http404


def LandingPage(request):
    return render(request, "mathQA/landingpage.html", {})


### ページなしpost(ajax)一覧 ###


# 画像
def img_post(request):
    if request.method == "POST":
        if not request.user.is_authenticated:
            return HttpResponseRedirect(reverse("mathQA:login"))
        for i in range(len(request.FILES)):
            try:
                pic = request.FILES[str(i)]
                img = Images(image=pic)
                img.save()
            except KeyError:
                return HttpResponse("ファイルがありません")
        return HttpResponse("画像のアップロード完了(｀･ω･´)ゞ")
    else:
        raise Http404


# 高評価
def good_post(request):
    if request.method == "POST":
        if not request.user.is_authenticated:
            res = dumps(
                {
                    "status": 0,
                    "msg": "",
                    "redirect": "/login/",
                }
            )
            return HttpResponse(res, content_type="application/json")
        method = request.POST.get("method")
        value = 0
        if method == "ques-up":
            q = get_object_or_404(Question, pk=request.POST.get("ID"))
            goodinfo = GoodInfo(
                customUser=request.user,
                question=q,
            )
            goodinfo.save()
            value = len(q.goodinfo_set.all())
        elif method == "ans-up":
            a = get_object_or_404(Answer, pk=request.POST.get("ID"))
            goodinfo = GoodInfo(
                customUser=request.user,
                answer=a,
            )
            a.save()
            value = len(a.goodinfo_set.all())
        elif method == "ques-down":
            q = get_object_or_404(Question, pk=request.POST.get("ID"))
            goodinfo = GoodInfo.objects.filter(
                customUser=request.user,
                question=q,
            )
            goodinfo.delete()
            value = len(q.goodinfo_set.all())
        elif method == "ans-down":
            a = get_object_or_404(Answer, pk=request.POST.get("ID"))
            goodinfo = GoodInfo.objects.get(
                customUser=request.user,
                answer=a,
            )
            goodinfo.delete()
            value = len(a.goodinfo_set.all())
        else:
            res = dumps(
                {
                    "status": 1,
                    "msg": "送信方法が間違っています",
                    "redirect": "",
                }
            )
            return HttpResponse(res, content_type="application/json")
        res = dumps(
            {
                "status": 2,
                "msg": "success",
                "redirect": "",
                "value": value,
            }
        )
        return HttpResponse(res, content_type="application/json")
    else:
        raise Http404


# ベストアンサー
def bestans_post(request, questionID):
    if request.method == "POST":
        if not request.user.is_authenticated:
            return HttpResponseRedirect(reverse("mathQA:login"))
        q = get_object_or_404(Question, pk=questionID)
        q.bestAnswer = request.POST.get("bestans")
        q.save()
        return HttpResponseRedirect(reverse("mathQA:detail", args=(questionID,)))


# sectionはアカウント設定、メール配信設定など大項目
# itemはアクアント設定の中のユーザネーム、メール配信設定の中の配信の是非などの小項目
def settings_post(request, section, item):
    if request.method == "POST":
        if not request.user.is_authenticated:
            return HttpResponseRedirect(reverse("mathQA:login"))
        if section == "account" and item == "resend-email":
            if request.user.email == "":
                res = dumps({"status": "error", "msg": "メールアドレスが入力されていません。"})
                return HttpResponse(res, content_type="application/json")
            token = secrets.token_hex()
            token_hash = make_password(token)
            request.user.emailtoken = Token.objects.create(token=token_hash)
            request.user.save()
            threading.Thread(
                target=async_send_email, args=ResendEmailMessage(request, token)
            ).start()
            res = dumps({"status": 0, "msg": ""})
            return HttpResponse(res, content_type="application/json")
        newValue = (
            request.FILES["newValue"] if item == "icon" else request.POST["newValue"]
        )
        customUser = request.user
        if newValue == "":
            res = dumps({"status": "InputLack", "msg": "未入力です。(・。・;", "redirect": ""})
        elif section == "account":
            if (
                item == "userName"
                and not CustomUser.objects.filter(username=newValue).exists()
            ):
                res = dumps({"status": 0})
                customUser.username = newValue
            elif (
                item == "email"
                and not CustomUser.objects.filter(email=newValue).exists()
            ):
                if not re.match(
                    r"^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$",
                    newValue,
                ):
                    res = dumps({"status": "error", "msg": "有効なメールアドレスではありません。"})
                else:
                    customUser.email = newValue
                    customUser.verified = False
                    token = secrets.token_hex()
                    token_hash = make_password(token)
                    request.user.emailtoken = Token.objects.create(token=token_hash)
                    request.user.save()
                    threading.Thread(
                        target=async_send_email, args=ResendEmailMessage(request, token)
                    ).start()
                    res = dumps({"status": 0})
            elif item == "password":
                res = dumps({"status": 0})
                customUser.set_password(newValue)
            elif item == "icon":
                uuid = request.POST["uuid"]
                newValue.name = uuid + "." + newValue.name.split(".")[1]
                customUser.icon = newValue
                res = dumps({"status": 0, "msg": ""})
                customUser.save()
                resizeImg("media/icon/" + newValue.name, 100)
            else:
                res = dumps({"status": "error", "msg": "すでに使われております。(´・ω・`)"})
            customUser.save()
        return HttpResponse(res, content_type="application/json")


# タグの追加要望
def adding_tag_request_post(request):
    if request.method == "POST":
        tags = QueryDict(request.body).getlist("a")
        print(tags)
        try:
            path_to_taglist = os.path.join(
                os.path.dirname(os.path.abspath(__file__)),
                "tag/tag_request_list.csv",
            )
            now = datetime.datetime.now().strftime("%Y/%m/%d/ %H:%M:%S")
            new_request = pd.DataFrame(
                {
                    "tagName": tags,
                    "time": now,
                }
            )
            print(new_request)
            if os.path.exists(path_to_taglist):
                new_request.to_csv(
                    path_to_taglist,
                    index=False,
                    encoding="utf-8",
                    mode="a",
                    header=False,
                )
            else:
                new_request.to_csv(path_to_taglist, index=False, encoding="utf-8")

            res = dumps({"status": 0, "msg": "", "redirect": ""})
        except Exception as e:
            print(e)
            res = dumps({"status": 500, "msg": "エラー", "redirect": ""})
        return HttpResponse(res, content_type="application/json")
