from django.test import TestCase
from django_webtest import WebTest

# Create your tests here.
class sampletest(WebTest):

    def test(self):
        index = self.app.get("/")
        self.assertEqual("mathnet" in index.text,True)
