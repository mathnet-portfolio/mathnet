import requests,os,uuid, random
from ..models import CustomUser

def SaveIMG(url):
    res = requests.get(url)
    path = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))) + "/media/icon/"
    if not os.path.exists(path):
        os.mkdir(path)
    name = str(uuid.uuid4()) + "." + url.split("/")[-1].split(".")[-1]
    path += name
    with open(path, 'wb') as file:
        file.write(res.content)
    return name

def RegisterInfo(backend, user,request, response, *args, **kwargs):
    # for i,j in kwargs.items():
    #     print(i,":",j)
    # for i,j in response.items():
    #     print(i,":",j)
    if kwargs["is_new"]:
        if backend.name == 'google-oauth2':
            url = response["picture"]
            name = SaveIMG(url)
            username = response.get("name")
            while CustomUser.objects.filter(username=username).exists():
                username += str(random.randint(0,9))
            user.username = username
            user.icon = "/icon/" + name
            user.save()
        elif backend.name == 'twitter':
            url = response["profile_image_url"]
            name = SaveIMG(url)
            username = response.get("name")
            while CustomUser.objects.filter(username=username).exists():
                username += str(random.randint(0,9))
            user.username = username
            user.icon= "/icon/" + name
            user.save()
        elif backend.name == 'facebook':
            username = response.get("name")
            while CustomUser.objects.filter(username=username).exists():
                username += str(random.randint(0,9))
            user.username = username
            user.save()
        email = response.get("email")
        if not email or CustomUser.objects.filter(email=email).exists():
            print("email-used")
            request.session["used-email"] = email
            user.email = ""
            user.save()
