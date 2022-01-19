const sumArray = (array) => {
  let sum = 0;
  for (let i = 0, len = array.length; i < len; i++) {
    sum += array[i];
  }
  return sum;
};

/**
 * プレビュー or サーバからの読み取りを判別するための関数
 * @param {string} filename uuid+拡張子のファイル名
 * @param {fileObj[]} pictures 画像ファイル配列
 */
const isPreview = function (filename, pictures) {
  return pictures.some((f) => f.altName == filename);
};

/**
 * 与えられた画像マークダウンを、img url に変換する。
 * 初期マークダウンに使用する。
 * @param {string} context
 */
const replaceImgFromURL = function (context) {
  context = context.replace(
    /!\[.+?\]\([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|jpeg|gif|png|bmp)\)/g,
    (match) => {
      let filename = match.match(
        /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|jpeg|gif|png|bmp)/
      )[0];
      return "<img src=/media/image/" + filename + ">";
    }
  );
  return context;
};

/**
 * 与えられた画像マークダウンを、img src に変換する。
 * まだサーバに画像を送信してないので、base64で表示させる。
 * @param {string} context
 * @param {*} uuid_and_base64 uuidがキー、base64が値の辞書リスト
 */
const replaceImgFromBase64 = function (context, uuid_and_base64) {
  return context.replace(
    /!\[.+?\]\([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|jpeg|gif|png|bmp)\)/g,
    (match) => {
      let filename = match.match(
        /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|jpeg|gif|png|bmp)/
      )[0];
      return "<img src=" + uuid_and_base64[filename] + ">";
    }
  );
};

function replaceHTML(context) {
  // 数式末端の意図的ではない改行を消す
  context = context.replace(
    /(end\{.*?\}|\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\])(\s)*?(\n|\r|\r\n)/g,
    (match) => {
      return match.replace(/(\s)*(\n|\r|\r\n)/g, "");
    }
  );
  context = context.replace(/(\r\n|\r|\n)/g, "<br>");
  // $$ $$
  context = context.replace(/\$\$[\s\S]*?\$\$/g, (match) => {
    return match.replace(/\\\\/g, "$$$ $$$");
    // 改行あり未完成
    // return match.replace(/(\$\$<br>|<br>\$\$)/g,"\$$\$").replace(/\\\\(<br>)?/g,"\$$\$ \$$\$").replace(/<br>/g,"\$$\$ \$$\$");
  });
  // \[ \]
  context = context.replace(/\\\[[\s\S]*?\\\]/g, (match) => {
    return match.replace(/\\\\/g, "\\] \\[");
    // 改行あり未完成
    // return match.replace(/\\\\/g,"\\\] \\\[").replace(/\\\[<br>/g,"\\\[").replace(/<br>\\\\/g,"\\\]").replace(/<br>/g,"\\\] \\\[");
  });
  // equation
  context = context.replace(
    /\\begin\{equation\}[\s\S]*?\\end\{equation\}/g,
    (match) => {
      return match.replace(/\\\\/g, "\\end{equation} \\begin{equation}");
      // 改行あり未完成
      // return match.replace(/\\\\/g,"\\end{equation} \\begin{equation}").replace(
      //   /<br>\\end{equation}/g,"\\end{equation}").replace(
      //     /\\begin{equation}<br>/g,"\\begin{equation}").replace(/<br>/g,"\\end{equation} \\begin{equation}")
    }
  );
  // $ $ /( /)
  context = context.replace(/(\$.*?\$|\\\(.*?\\\))/g, (match) => {
    return " " + match + " ";
  });
  return context;
}

// 特殊な記号
const specialFormulas = {
  dollar: [
    // ここの名前は、一意でセレクタ名になるならなんでもOK
    { content: "$ x=y $", display: "式", selectRange: [2, 5] },
    { content: "$$ y=f(x) $$", display: "一行式", selectRange: [3, 6] },
    {
      content: "\\begin{align}\n x&=a+b \\\\\n x+y&=c\n\\end{align}",
      display: "複数式",
      selectRange: [14, 14 + 18],
    },
  ],
};

const btnFormulas = {
  alpha: [
    { content: "\\alpha", selectRange: [3, 3] },
    { content: "\\beta", selectRange: [3, 3] },
    { content: "\\gamma", selectRange: [3, 3] },
    { content: "\\infty", selectRange: [3, 3] },
  ],
  top: [
    { content: "a^x", selectRange: [3, 3] },
    { content: "a_x", selectRange: [3, 3] },
  ],
  plus: [
    { content: "+", selectRange: [1, 1] },
    { content: "-", selectRange: [1, 1] },
    { content: "\\times", selectRange: [7, 7] },
    { content: "\\div", selectRange: [5, 5] },
    { content: "\\pm", selectRange: [4, 4] },
    { content: "\\mp", selectRange: [4, 4] },
    { content: "\\cdot", selectRange: [5, 5] },
  ],
  gt: [
    { content: "\\gt", selectRange: [4, 4] },
    { content: "\\geq", selectRange: [5, 5] },
    { content: "\\lt", selectRange: [4, 4] },
    { content: "\\leq", selectRange: [5, 5] },
    { content: "=", selectRange: [3, 3] },
    { content: "\\neq", selectRange: [5, 5] },
    { content: "\\fallingdotseq", selectRange: [15, 15] },
  ],
  in: [
    { content: "\\subset", selectRange: [8, 8] },
    { content: "\\in", selectRange: [4, 4] },
    { content: "\\notin", selectRange: [7, 7] },
    { content: "\\subseteq", selectRange: [10, 10] },
    { content: "\\not \\subset", selectRange: [8, 8] },
    { content: "\\supset", selectRange: [8, 8] },
    { content: "\\ni", selectRange: [4, 4] },
    { content: "\\supseteq", selectRange: [10, 10] },
    { content: "\\cap", selectRange: [5, 5] },
    { content: "\\cup", selectRange: [5, 5] },
    { content: "\\varnothing", selectRange: [12, 12] },
  ],
  sin: [
    { content: "\\sin", selectRange: [5, 5] },
    { content: "\\cos", selectRange: [5, 5] },
    { content: "\\tan", selectRange: [5, 5] },
  ],
  vec: [
    { content: "\\vec{a}", selectRange: [5, 6] },
    { content: "\\overrightarrow{AB}", selectRange: [16, 18] },
  ],
};

// 配列の２番目以降はホバーで展開すると表示される。
const functionFormulas = {
  lim: [
    { content: "\\displaystyle \\lim_{x→0}", selectRange: [20, 23] },
    { content: "\\displaystyle \\log_{10}", selectRange: [20, 22] },
  ],
  sum: [
    { content: "\\displaystyle \\sum_{i=1}^n a_n", selectRange: [27, 27 + 3] },
    { content: "\\displaystyle \\prod_{i=0}^n x_i", selectRange: [28, 28 + 3] }, // 以下ホバーでの表示
  ],
  int: [
    { content: "\\int_0^1 dx", selectRange: [5, 5 + 3] },
    { content: "\\iint_0^1 dx", selectRange: [6, 6 + 3] },
    { content: "\\iiint_0^1 dx", selectRange: [7, 7 + 3] },
  ],
  matrix: [
    {
      content: "\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}",
      selectRange: [16, 16 + 14],
    },
    {
      content: "\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}",
      selectRange: [16, 16 + 14],
    },
    {
      content: "\\begin{vmatrix} a & b \\\\ c & d \\end{vmatrix}",
      selectRange: [16, 16 + 14],
    },
  ],
  brank: [
    { content: "(x)", selectRange: [1, 1 + 1] },
    { content: "[x]", selectRange: [1, 1 + 1] },
    { content: "\\{x\\}", selectRange: [3, 3 + 1] },
    { content: "|x|", selectRange: [1, 1 + 1] },
    { content: "\\left[ \\frac{1}{2} \\right]", selectRange: [7, 7 + 11] },
  ],
};

// formDOM: JQeruyで取得
function mathForm(formDOM) {
  formDOM.each(function (index, obj) {
    autoHightTextArea($(obj).find(".mathForm_input"));

    // テキストエリアの設定
    let mathForm_input = $(obj).find(".mathForm_input");
    let mathForm_output = $(obj).find(".mathForm_output");

    let TextTypeCount = 0;
    let processCount = 0;
    let toralProcessingTime = [0, 0, 0, 0, 0]; // 直近5回のタイム
    let isSkipMode = false; // 5回に一回のMathjax.typeSet()が有効か
    let lastProcessTimerID;
    let lastTypeTime;
    let delayPreviewTime = 500; // 単位: ms

    let pictures = [];
    // 変換時に毎回base64に変換するとやばいので、あらかじめbase64に変換したリストを用意
    let bace64_pics = {}; // {uuid.拡張子: base64}

    // テキストが変わった時に発火
    function TextChange(textarea) {
      let context = textarea.val();
      context = replaceHTML(context);
      context = replaceImgFromBase64(context, bace64_pics);
      mathForm_output.html(context);
      try {
        let _start = performance.now();
        MathJax.typesetPromise([mathForm_output.get(0)]);
        toralProcessingTime[processCount % 5] = performance.now() - _start;
        processCount++;
      } catch (e) {
        console.log(e);
      }
    }

    function InsertString(str) {
      let select_pos = mathForm_input.get(0).selectionStart;
      let before = mathForm_input.val().substr(0, select_pos);
      let insert = str;
      let after = mathForm_input
        .val()
        .substr(select_pos, mathForm_input.val().length);
      return [before + insert + after, before.length];
    }

    // テキスト入力のラグを改善
    mathForm_input.on("keyup", function () {
      TextTypeCount++;
      lastTypeTime = performance.now();
      if (sumArray(toralProcessingTime) / 5 > 50) {
        isSkipMode = true;
        console.log("SKIP: ON");
      } else {
        isSkipMode = false;
        console.log("SKIP: OFF");
      }
      if (!isSkipMode) {
        TextChange(mathForm_input);
      } else {
        // 前回の入力から一定の時間が経過したら5回に1回じゃなくても入力
        if (performance.now() - lastTypeTime < delayPreviewTime) {
          clearTimeout(lastProcessTimerID);
        }
        if (TextTypeCount % 5 == 5) {
          TextChange(mathForm_input);
        } else {
          lastProcessTimerID = setTimeout(function () {
            TextChange(mathForm_input);
          }, delayPreviewTime);
        }
      }
    });

    // 特殊ボタンを自動生成
    // 具体的には$$, alineなど
    Object.keys(specialFormulas).forEach((key) => {
      let f = specialFormulas[key];
      let html = f.length == 1 ? "なし" : "";
      for (let i = 1; i < f.length; i++) {
        html += `<div class="formula-btn formula-btn-special ${
          key + String(i)
        }">${f[i].display}</div>`;
      }
      const el = $(`
      <div class="formula-btn formula-btn-special ${key}">
        ${f[0].display}
        <div class="formula-submenu">${html}</div>
      </div>
      `);
      $(obj).find(".formula-section-special").append(el);
      // 要素が完全にロードされてからじゃないとイベントを紐付けれない
      el.ready(() => {
        for (let i = 0; i < f.length; i++) {
          let c = i == 0 ? "" : String(i);
          $(obj)
            .find(`.${key + c}`)
            .on("click", (e) => {
              let insertinfo = InsertString(f[i].content);
              mathForm_input.val(insertinfo[0]);
              mathForm_input
                .focus()
                .get(0)
                .setSelectionRange(
                  insertinfo[1] + f[i].selectRange[0],
                  insertinfo[1] + f[i].selectRange[1]
                );
              TextChange(mathForm_input);
              e.stopPropagation();
            });
        }
      });
    });

    // 記号ボタンを自動生成
    Object.keys(btnFormulas).forEach((key) => {
      let f = btnFormulas[key];
      let html = f.length == 1 ? "なし" : "";
      for (let i = 1; i < f.length; i++) {
        html += `<div class="formula-btn formula-btn-symbol ${
          key + String(i)
        }">$${f[i].content}$</div>`;
      }
      const el = $(`
      <div class="formula-btn formula-btn-symbol ${key}">
        $${f[0].content}$
        <div class="formula-submenu">${html}</div>
      </div>
      `);
      $(obj).find(".formula-section-symbol").append(el);
      // 要素が完全にロードされてからじゃないとイベントを紐付けれない
      el.ready(() => {
        for (let i = 0; i < f.length; i++) {
          let c = i == 0 ? "" : String(i);
          $(obj)
            .find(`.${key + c}`)
            .on("click", (e) => {
              let insertinfo = InsertString(f[i].content);
              mathForm_input.val(insertinfo[0]);
              mathForm_input
                .focus()
                .get(0)
                .setSelectionRange(
                  insertinfo[1] + f[i].selectRange[0],
                  insertinfo[1] + f[i].selectRange[1]
                );
              TextChange(mathForm_input);
              e.stopPropagation();
            });
        }
      });
    });

    // 数式ボタンを自動生成
    Object.keys(functionFormulas).forEach((key) => {
      let f = functionFormulas[key];
      let html = f.length == 1 ? "なし" : "";
      for (let i = 1; i < f.length; i++) {
        html += `<div class="formula-btn formula-btn-function ${
          key + String(i)
        }">$${f[i].content}$</div>`;
      }
      const el = $(`
      <div class="formula-btn formula-btn-function ${key}">
        $${f[0].content}$
        <div class="formula-submenu">${html}</div>
      </div>
      `);
      $(obj).find(".formula-section-function").append(el);
      // 要素が完全にロードされてからじゃないとイベントを紐付けれない
      el.ready(() => {
        for (let i = 0; i < f.length; i++) {
          let c = i == 0 ? "" : String(i);
          $(obj)
            .find(`.${key + c}`)
            .on("click", (e) => {
              let insertinfo = InsertString(f[i].content);
              mathForm_input.val(insertinfo[0]);
              mathForm_input
                .focus()
                .get(0)
                .setSelectionRange(
                  insertinfo[1] + f[i].selectRange[0],
                  insertinfo[1] + f[i].selectRange[1]
                );
              TextChange(mathForm_input);
              e.stopPropagation();
            });
        }
      });
    });

    // ページ読み込み時
    TextChange(mathForm_input);

    //align環境
    const btn_align = $(obj)
      .find(".mathForm_btns")
      .find(".js_convertToFormula_align");

    btn_align.on("click", function () {
      let insertinfo = InsertString("\\begin{align}\ny&=x\n\\end{align}");
      mathForm_input.val(insertinfo[0]);
      mathForm_input
        .focus()
        .get(0)
        .setSelectionRange(insertinfo[1] - 16, insertinfo[1] - 12);
      TextChange(mathForm_input);
    });

    // 画像挿入
    const btn_pic = $(obj).find(".js_convertToFormula_pic")[0]; // 生JSに変換
    const btn_pic_mobile = $(obj).find(".js_convertToFormula_pic--mobile")[0];
    if (btn_pic != undefined){
      btn_pic.addEventListener("change", async (event) => {
        const files = event.target.files || event.dataTransfer.files;
        for (let file of files) {
          if (checkFile(file)) {
            file = addUuidToFile(file);
            pictures.push(file);
            bace64_pics[file.altName] = await convToBase64(file);
            let insertinfo = InsertString("![画像](" + file.altName + ")\n");
            mathForm_input.val(insertinfo[0]);
            mathForm_input
              .focus()
              .get(0)
              .setSelectionRange(insertinfo[1], insertinfo[1]);
          }
        }
        TextChange(mathForm_input);
      });
    }

    if (btn_pic_mobile != undefined){
      btn_pic_mobile.addEventListener("change", async (event) => {
        const files = event.target.files || event.dataTransfer.files;
        for (let file of files) {
          if (checkFile(file)) {
            file = addUuidToFile(file);
            pictures.push(file);
            bace64_pics[file.altName] = await convToBase64(file);
            let insertinfo = InsertString("![画像](" + file.altName + ")\n");
            mathForm_input.val(insertinfo[0]);
            mathForm_input
              .focus()
              .get(0)
              .setSelectionRange(insertinfo[1], insertinfo[1]);
          }
        }
        TextChange(mathForm_input);
      });
    }


    /////////////////////////////////////////////
    // 以下は送信の機能
    /////////////////////////////////////////////

    $(obj)
      .find(".js-post_btn")
      .on("click", function () {
        const sendImg = function () {
          if (pictures.length > 0) {
            let formData = createImgFormData(pictures);
            return postJson("/img_post/", formData);
          }
        };
        const sendContext = function () {
          console.log($(obj).data("json").method);
          return postJson($(obj).data("json").post_url, {
            method: $(obj).data("json").method || "",
            answerID: $(obj).data("json").answerID || "",
            text: $(obj).find(".mathForm_input").val(),
          });
        };
        Promise.all([sendImg(), sendContext()])
          .then((res) => {
            console.log(res);
            let data = res[1].data;
            if (data.status == 0) {
              window.location.href = data.redirect;
            } else {
              $(obj).find(".js-post_error").text(data.msg);
            }
          })
          .catch((err) => {
            console.log(err);
            alert("サーバエラーが発生しました。");
          });
      });
  });

}

//初期マークダウン
function InitMarkDown() {
  let markdownContents = $(".markdown-contents");
  markdownContents.each((index, obj) => {
    let context = $(obj).html();
    context = replaceHTML(context);
    context = replaceImgFromURL(context);
    $(obj).html(context);
  });
}

window.addEventListener("DOMContentLoaded", () => {
  mathForm($(".mathForm"));
  InitMarkDown();
  setTimeout(() => {
    try {
      MathJax.typesetPromise();
    } catch (error) {
      console.log(error);
    }
  }, 500);
});
