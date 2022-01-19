from django.urls import path
from django.conf import settings
from django.conf.urls.static import static

from . import views


app_name = "mathQA"
urlpatterns = [
    path("", views.index, name="index"),
    path("register/", views.register, name="register"),
    path("login/", views.login, name="login"),
    path("logout/", views.logout, name="logout"),
    path("user/", views.user, name="user"),
    path("writeQ/", views.writeQ, name="writeQ"),
    path("detail/<int:questionID>/", views.detail, name="detail"),
    path("searchResult/<int:start>/", views.searchResult, name="searchResult"),
    path("undone/", views.undone, name="undone"),
    path("privacy_policy/", views.privacy_policy, name="privacy_policy"),
    path("terms_of_service/", views.terms_of_service, name="terms_of_service"),
    path("tutorial/", views.tutorial, name="tutorial"),
    path("adding_tag_request/", views.adding_tag_request, name="adding_tag_request"),
    path(
        "adding_tag_request_post/",
        views.adding_tag_request_post,
        name="adding_tag_request_post",
    ),
    path("opinionaire/", views.opinionaire, name="opinionaire"),
    path("img_post/", views.img_post, name="img_post"),
    path("good_post/", views.good_post, name="good_post"),
    path(
        "settings_post/<str:section>/<str:item>/",
        views.settings_post,
        name="settings_post",
    ),
    path("bestans_post/<int:questionID>/", views.bestans_post, name="bestans_post"),
    path("tags/<str:tag>/<int:start>/", views.searchResult, name="tagSearchResult"),
    path("auth-complete/<str:token>/", views.auth_complete, name="auth-complete"),
    path("landingpage/", views.LandingPage, name="landingpage"),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
