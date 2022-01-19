function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== "") {
    let cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      let cookie = jQuery.trim(cookies[i]);
      if (cookie.substring(0, name.length + 1) === name + "=") {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

function csrfSafeMethod(method) {
  return /^(GET|HEAD|OPTIONS|TRACE)$/.test(method);
}

// テキストエリアの自動伸縮
// DOM: JqeruyのDOMを要求
// 参考: https://qiita.com/mimoe/items/037af8fd430ea1db3ff2
const autoHightTextArea = function (DOM) {
  $(DOM).on({
    input: function (e) {
      const resetHeight = new Promise(function (resolve) {
        resolve($(DOM).css({ height: "auto" }));
      });
      resetHeight.then(function () {
        $(DOM).css({ height: $(DOM).get(0).scrollHeight + 16 });
      });
    },
  });
};

// ハンバーガメニューの開閉
let hamCounter = 1;
$("#js-ham-btn").on("click", () => {
  $(".l-nav").toggleClass("l-nav--open");
  $("#js-ham-icon").text(hamCounter % 2 == 0 ? "menu_open" : "close");
  hamCounter++;
});

//エスケープ XSS対策
function escapeHtml(str) {
  str = str.replace(/&/g, "&amp;");
  str = str.replace(/</g, "&lt;");
  str = str.replace(/>/g, "&gt;");
  str = str.replace(/"/g, "&quot;");
  str = str.replace(/'/g, "&#39;");
  return str;
}

function reverseEscape(str) {
  str = str.replace(/&amp;/g, "&");
  str = str.replace(/&lt;/g, "<");
  str = str.replace(/&gt;/g, ">");
  str = str.replace(/&quot;/g, '"');
  str = str.replace(/&#39;/g, "'");
  return str;
}

// スマホで入力すると、フッダーが邪魔になるので、画面の縦サイズが極度に小さい場合はヘッダーを非表示
$(window).on("scroll", function () {
  if ($(window).width() <= 900) {
    if ($(window).height() <= 400) {
      $(".l-footbar").css({ display: "none" });
    } else {
      $(".l-footbar").css({ display: "flex" });
    }
  } else {
    $(".l-footbar").css({ display: "none" });
  }
});

/**
 * Fetchを用いたPOST
 * @param {string} url POST先URL
 * @param {dics} data POST内容, 内部でjson形式に変換されます
 * @returns {promise} プロミスオブジェクトで返却されます。
 */
const postJson = function (url, data) {
  axios.defaults.xsrfCookieName = "csrftoken";
  axios.defaults.xsrfHeaderName = "X-CSRFTOKEN";
  return axios.post(url, data);
};

function generateUuid() {
  let chars = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".split("");
  for (let i = 0, len = chars.length; i < len; i++) {
    switch (chars[i]) {
      case "x":
        chars[i] = Math.floor(Math.random() * 16).toString(16);
        break;
      case "y":
        chars[i] = (Math.floor(Math.random() * 4) + 8).toString(16);
        break;
    }
  }
  return chars.join("");
}

/**
 * ファイルobjを受け取り、問題がないかを確認
 * 問題がなければ true
 * 問題があれば  false
 */
const checkFile = function (file) {
  let result = true;
  const SIZE_LIMIT = 5 * 1000 * 1000; // 1000 * 1000 = MB
  // ローカルマシンからの読み込みをキャンセルしたら処理中断
  if (!file) {
    result = false;
  }
  if (file.type !== "image/jpeg" && file.type !== "image/png") {
    result = false;
    alert("jpeg, png画像のみ対応しております。");
  }
  if (file.size > SIZE_LIMIT) {
    result = false;
    alert("画像のサイズが大きすぎます(^_^;)");
  }
  return result;
};

/**
 * Base64形式にエンコードする。時間がかかるためpromiseで返却。
 */
const convToBase64 = function (file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * ファイルオブジェクト配列を受け取り、formDataに加工する。
 * そのさい、名前をuuidに変更する。
 * @param {fileObj[]} files
 */
const createImgFormData = function (files) {
  let formData = new FormData();
  files.forEach((file, i) => {
    formData.append(i, file, file.altName);
  });
  return formData;
};

/**
 * ファイル名から、拡張子を取得する。
 * ない場合は空文字を返す。
 * @param {string} filename
 */
const getExt = function (filename) {
  let pos = filename.lastIndexOf(".");
  if (pos === -1) return "";
  return filename.slice(pos + 1);
};

/**
 * 与えられたファイルオブジェクトに、uuidによる新たな名前をつける（altName）。
 * ブラウザではfile.nameの書き換えは不可なので、このような仕組みにしている。
 * @param {fileObj} file
 * @returns {fileObj} file
 */
const addUuidToFile = function (file) {
  file.altName = generateUuid() + "." + getExt(file.name);
  return file;
};

/**
 * 与えられたfileオブジェクト配列から、画像マークダウン文字列を生成する。
 * @param {fileObj[]} files
 */
const generateImgMarkdown = function (files) {
  let s = "";
  files.forEach((f) => {
    s += "\n![画像](" + f.altName + ")";
  });
  return s;
};

function generateTitle(context){
  let maxsize = 20;
  if (context.length<=maxsize) return context;
  let sentence_math_split = [];
  let sentence = context.split(/(\\begin\{.*?\}.*?\\end\{.*?\}|\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|\$.*?\$|\\\([\s\S]*?\\\))/);
  console.log(sentence);
}
