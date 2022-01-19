from local import *
from tqdm import tqdm
import unittest
import random, string
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from time import sleep, time


def sleep_(n=2):
    """普通のsleepにプログレスバーをつけた

    Args:
        n (int): 待機秒数(s)
    """
    if n < 1:
        sleep(n)
    else:
        for i in tqdm(range(n)):
            sleep(1)


def randomname(n=5):
    """テストで毎回新しくユーザを作成するために、ランダムにユーザを作成するための名前をつくる。

    Args:
        n (int): 文字数、デフォルトは5文字

    Returns:
        str: ランダムな文字列
    """
    return "".join(random.choices(string.ascii_letters + string.digits, k=n))


class TestMain(unittest.TestCase):
    def setUp(self):
        self.your_name = randomname()
        self.account_data = {
            "username": self.your_name,
            "email": self.your_name + "@example.com",
            "password": self.your_name,
        }
        self.b = webdriver.Chrome(executable_path=DRIVER_PATH)
        self.b.set_window_position(WINDOW_POSITION_X, WINDOW_POSITION_Y)
        sleep_()
        self.b.maximize_window()

    def f(self, css_selecter):
        """cssセレクタをもとに要素を取得する。[0]であることに注意！

        Args:
            css_selecter (string): cssセレクタ

        Returns:
            obj: self.bの要素
        """
        return self.b.find_elements_by_css_selector(css_selecter)[0]

    def tearDown(self):
        self.b.quit()

    def test_main(self):
        #
        # 新規登録をテスト
        #
        self.b.get(HOST_URL + "register/")
        # 各入力欄に入力、利用規約に同意
        self.f("#js-userName").send_keys(self.account_data["username"])
        self.f("#js-email").send_keys(self.account_data["email"])
        self.f("#js-password").send_keys(self.account_data["password"])
        self.f("#js-passwordForCheck").send_keys(self.account_data["password"])
        self.f(
            "body > article.l-grid > section.l-grid-l > div > div:nth-child(3) > label.normal_checkbox"
        ).click()
        sleep_()
        # 新規登録ボタンを押す
        self.f("#js-registerBtn").click()
        sleep_()
        # 遷移先のURLを照合
        self.assertEqual(self.b.current_url, HOST_URL)

        #
        # ユーザ情報の変更をテスト
        #
        self.b.get(HOST_URL + "user/")
        sleep_()
        # あたらしいアカウントデータを作成
        self.new_your_name = randomname()
        self.account_data = {
            "username": self.new_your_name,
            "email": self.new_your_name + "@example.com",
            "password": self.new_your_name,
        }
        # ユーザネーム変更
        self.f(
            "body > article > div > section.l-setting-main.setting-main--account > div:nth-child(1) > button"
        ).click()
        sleep_(1)
        self.f("#js-newValue").send_keys(self.account_data["username"])
        self.f("#js-edit_btn").click()
        # email変更
        self.f(
            "body > article > div > section.l-setting-main.setting-main--account > div:nth-child(3) > button.normal_btn.setting-edit-btn.setting-edit-btn-email"
        ).click()
        sleep_(1)
        self.f("#js-newValue").send_keys(self.account_data["email"])
        self.f("#js-edit_btn").click()
        # パスワード変更
        self.f(
            "body > article > div > section.l-setting-main.setting-main--account > div:nth-child(4) > button"
        ).click()
        sleep_(1)
        self.f("#js-newValue").send_keys(self.account_data["password"])
        self.f("#js-edit_btn").click()
        sleep_(1)
        new_account_data = {
            "username": self.f(
                "body > article > div > section.l-setting-main.setting-main--account > div:nth-child(1) > div.setting-value"
            ).get_attribute("textContent"),
            "email": self.f(
                "body > article > div > section.l-setting-main.setting-main--account > div:nth-child(3) > div.setting-value"
            ).get_attribute("textContent"),
            "password": self.f(
                "body > article > div > section.l-setting-main.setting-main--account > div:nth-child(4) > div.setting-value"
            ).get_attribute("textContent"),
        }

        # 変更したデータが反映されているか確認
        self.assertEqual(self.account_data, new_account_data)


if __name__ == "__main__":
    unittest.main(verbosity=2)
