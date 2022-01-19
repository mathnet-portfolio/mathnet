from django.db import models
from django.utils import timezone
from django.contrib.auth.models import AbstractUser


class Token(models.Model):
    token = models.CharField(max_length=200, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name_plural = "トークン"


class CustomUser(AbstractUser):
    icon = models.ImageField(upload_to="icon/", default="system_init/firsticon.jpg")
    verified = models.BooleanField(default=False)
    emailtoken = models.OneToOneField(
        Token, on_delete=models.CASCADE, null=True, blank=True
    )

    class Meta:
        verbose_name_plural = "カスタムユーザー"


class QuestionTag(models.Model):
    tagName = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return str(self.tagName)

    class Meta:
        ordering = ["-created_at"]
        verbose_name_plural = "使用可能なタグ(追加可能)"


class Question(models.Model):
    title = models.CharField(max_length=200, null=True)
    customUser = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    contents = models.TextField()
    bestAnswer = models.IntegerField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(default=timezone.now)
    cntBrowsed = models.PositiveIntegerField(default=0)
    tags = models.ManyToManyField(QuestionTag)

    def __str__(self):
        return self.contents[:15]

    class Meta:
        ordering = ["-updated_at"]
        verbose_name_plural = "質問"


class Answer(models.Model):
    customUser = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    contents = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.question.title

    class Meta:
        ordering = ["updated_at"]
        verbose_name_plural = "解答"


class Reply(models.Model):
    customUser = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    answer = models.ForeignKey(Answer, on_delete=models.CASCADE)
    contents = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.answer.question.title

    class Meta:
        ordering = ["updated_at"]
        verbose_name_plural = "返信"


class Images(models.Model):
    image = models.ImageField(upload_to="image/")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return str(self.created_at)

    class Meta:
        ordering = ["-created_at"]
        verbose_name_plural = "画像"


class GoodInfo(models.Model):
    customUser = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    question = models.ForeignKey(
        Question, on_delete=models.CASCADE, blank=True, null=True
    )
    answer = models.ForeignKey(Answer, on_delete=models.CASCADE, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True, blank=True, null=True)

    def __str__(self):
        return str(self.question.title)

    class Meta:
        verbose_name_plural = "高評価"
