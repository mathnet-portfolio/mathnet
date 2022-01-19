from django.contrib.sitemaps import Sitemap
from django.urls import reverse
from mathQA.models import Question
from pytz import timezone

# 参考: https://medium.com/@kjmczk/django-sitemaps-75e1ed78398a


def GetAnsRepDate(question, date):
    """回答と返信の日付を、dateに保存する。

    Args:
        question: Questionデータモデル
        date (Array): [質問投稿日付]という配列
    """
    for answer in question.answer_set.all():
        date.append(answer.updated_at)
        for reply in answer.reply_set.all():
            date.append(reply.updated_at)


class PostSitemap(Sitemap):
    """
    動的なページが対象
    """

    changefreq = "never"
    priority = 0.8

    def items(self):
        """
        ここで返された配列は、以下のlocation, lastmodにobjとして順番に代入される。
        Returns:
            array: modelがが入ってる
        """
        return Question.objects.all()

    def location(self, question):
        """URLを返す

        Args:
            question (): データモデル

        Returns:
            str: URL
        """
        return "/detail/" + str(question.id) + "/"

    def lastmod(self, question):
        """最終更新日を表す。ここでは回答、返信のもっとも遅い時間を表している。

        Args:
            question (): データモデル

        Returns:
            late: 最終更新日
        """
        date = []
        date.append(question.updated_at)
        GetAnsRepDate(question, date)
        date.sort()
        late = date[-1].astimezone(timezone("Asia/Tokyo"))
        return late


class StaticViewSitemap(Sitemap):
    """
    静的なページが対象
    """

    changefreq = "daily"
    priority = 0.5

    def items(self):
        return [
            "mathQA:index",
            "mathQA:register",
            "mathQA:login",
            "mathQA:logout",
            "mathQA:writeQ",
            "mathQA:undone",
            "mathQA:tutorial",
            "mathQA:opinionaire",
        ]

    def location(self, item):
        return reverse(item)
