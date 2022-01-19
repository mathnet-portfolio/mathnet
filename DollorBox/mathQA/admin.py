from django.contrib import admin
from .models import Question, Answer, Reply, Images, GoodInfo, QuestionTag, Token
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser

# Register your models here.


class CustomUserAdmin(UserAdmin):
    model = CustomUser
    fieldsets = UserAdmin.fieldsets + ((None, {"fields": ("icon",)}),)
    list_display = ["username", "email", "icon", "verified"]


admin.site.register(Question)
admin.site.register(Answer)
admin.site.register(Reply)
admin.site.register(Images)
admin.site.register(GoodInfo)
admin.site.register(QuestionTag)
admin.site.register(Token)
admin.site.register(CustomUser, CustomUserAdmin)
