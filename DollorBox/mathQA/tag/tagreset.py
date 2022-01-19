from ..models import QuestionTag
import pandas as pd
import pathlib, os


try:
    path_to_taglist = os.path.join(
        os.path.dirname(os.path.abspath(__file__)), "taglist.csv"
    )
    newtaglist = pd.read_csv(path_to_taglist)
    qs = QuestionTag.objects.values_list("tagName", flat=True)
    oldtaglist = [q for q in qs]

    if sorted(oldtaglist) != sorted(newtaglist["tagName"].values.tolist()):
        for index, tag in newtaglist.iterrows():
            if not QuestionTag.objects.filter(tagName=tag["tagName"]).exists():
                QuestionTag.objects.create(tagName=tag["tagName"])
                
except Exception as e:
    print(e)
    print("おそらくDBがないかな？")
