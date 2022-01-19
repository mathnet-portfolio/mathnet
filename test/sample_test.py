from local import *
import unittest
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
import time
from tqdm import tqdm

def c(n):
    for i in tqdm(range(n)):
        time.sleep(1)

class SampleGoogleTest(unittest.TestCase):
    def setUp(self):
        # #ブラウザ起動
        self.browser = webdriver.Chrome(executable_path=DRIVER_PATH)
        self.browser.set_window_position(WINDOW_POSITION_X, WINDOW_POSITION_Y)
        # 5秒停止
        # time.sleep(3)
        c(3)
        # 画面最大化
        self.browser.maximize_window()

    # cssセレクタの要素を返す
    def f(self, css_selecter):
        return self.browser.find_elements_by_css_selector(css_selecter)

    def tearDown(self):
        self.browser.quit()

    def test_check_google_translate_work_properly(self):
        # Googleアクセス
        self.browser.get("https://www.google.co.jp/")
        # 検索窓取得
        input_search = self.f(
            "#tsf > div:nth-child(2) > div.A8SBwf > div.RNNXgb > div > div.a4bIc > input"
        )[0]
        # キーワード入力
        input_search.clear()
        input_search.send_keys("翻訳")
        input_search.submit()
        # 一時停止
        c(3)
        # 『Google 翻訳』というリンクをクリック
        link_list = self.f("#rso > div:nth-child(2) > div > div.r > a")[0]
        link_list.click()
        # 一時停止
        time.sleep(3)
        # 入力のinputを要素名,idから取得し『america』と入力
        input_text = self.browser.find_element_by_xpath("//textarea[@id='source']")
        input_text.send_keys("america")
        # Enterキー(おそらく押さなくても結果は出るが念の為)
        input_text.send_keys(Keys.ENTER)
        # 一時停止
        time.sleep(5)
        # 出力を要素名,idから取得
        output_text = self.f(
            "body > div.container > div.frame > div.page.tlid-homepage.homepage.translate-text > div.homepage-content-wrap > div.tlid-source-target.main-header > div.source-target-row > div.tlid-results-container.results-container > div.tlid-result.result-dict-wrapper > div.result.tlid-copy-target > div.text-wrap.tlid-copy-target > div > span.tlid-translation.translation > span"
        )[0]
        # 出力が想定したものと間違っていないか確認
        self.assertEqual(output_text.text, "アメリカ")


if __name__ == "__main__":
    unittest.main(verbosity=2)
