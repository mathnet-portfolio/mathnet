//エスケープ XSS対策
function escapeHtml(str) {
  str = str.replace(/&/g, '&amp;');
  str = str.replace(/</g, '&lt;');
  str = str.replace(/>/g, '&gt;');
  str = str.replace(/"/g, '&quot;');
  str = str.replace(/'/g, '&#39;');
  return str;
}


// formDOM: JQeruyで取得
function mathForm(formDOM) {

  // 設定
  // marked.setOptions({
  //   breaks: true,
  // });

  formDOM.each(function (index, obj) {

    /////////////////////////////////////////////
    // 以下は数式変換の機能
    /////////////////////////////////////////////

    // テキストエリアの設定
    const mathForm_input = $(obj).find('.mathForm_input');
    const mathForm_output = $(obj).find('.mathForm_box').find('.mathForm_output');

    let select_pos = 0;
    let renderer = new marked.Renderer();

    // テキストが変わった時に発火
    function TextChange(textarea) {
      let context = textarea.val();
      context = escapeHtml(context);
      context = marked(context);
      mathForm_output.html(context);
      MathJax.typeset();
    }

    function InsertString(str) {
      let select_pos = mathForm_input.get(0).selectionStart;
      let before = mathForm_input.val().substr(0, select_pos);
      let insert = str;
      let after = mathForm_input.val().substr(select_pos, mathForm_input.val().length);
      return before + insert + after;
    }

    // テキストエリアの上にあるボタンの設定

    const btn_head = $(obj).find('.mathForm_btns').find('.js_convertToFormula_head');
    btn_head.on('click', function () {
      mathForm_input.val(InsertString("# --ここに文章を入力--"));
      TextChange(mathForm_input);
    });

    const btn_bold = $(obj).find('.mathForm_btns').find('.js_convertToFormula_bold');
    btn_bold.on('click', function () {
      mathForm_input.val(InsertString("**ここに文章を入力**"));
      TextChange(mathForm_input);
    });

    // 分数
    const btn_frac = $(obj).find('.mathForm_btns').find('.js_convertToFormula_frac');
    btn_frac.on('click', function () {
      mathForm_input.val(InsertString("\\frac{A}{B}"));
      TextChange(mathForm_input);
    });

    // 平方根
    const btn_sqrt = $(obj).find('.mathForm_btns').find('.js_convertToFormula_sqrt');
    btn_sqrt.on('click', function () {
      mathForm_input.val(InsertString("\\sqrt{A}"));
      TextChange(mathForm_input);
    });

    // 下付き文字
    const btn_bottom = $(obj).find('.mathForm_btns').find('.js_convertToFormula_bottom');
    btn_bottom.on('click', function () {
      mathForm_input.val(InsertString("a_{n}"));
      TextChange(mathForm_input);
    });

    // シグマ
    const btn_sigma = $(obj).find('.mathForm_btns').find('.js_convertToFormula_sigma');
    btn_sigma.on('click', function () {
      mathForm_input.val(InsertString("\\sum_{k=1}^{n}"));
      TextChange(mathForm_input);
    });

    function parse_cookies() {
      var cookies = {};
      if (document.cookie && document.cookie !== '') {
        document.cookie.split(';').forEach(function (c) {
          var m = c.trim().match(/(\w+)=(.*)/);
          if (m !== undefined) {
            cookies[m[1]] = decodeURIComponent(m[2]);
          }
        });
      }
      return cookies;
    }

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

    // 画像保存
    const btn_pic = $(obj).find('.mathForm_btns').find('.js_convertToFormula_pic');
    btn_pic.on("change", function () {
      let files = btn_pic.prop('files');
      if (files.length == 0) {
        return;
      }
      let file = files[0];
      let uuid = generateUuid();
      let formData = new FormData();
      formData.append("uuid", uuid);
      formData.append("pic", file);
      cookies = parse_cookies();
      // xhr start
      let xhr = new XMLHttpRequest();
      xhr.open("POST", "/img_post/");
      xhr.setRequestHeader("X-CSRFToken", cookies["csrftoken"]);
      xhr.send(formData);
      xhr.onload = () => {
        if (xhr.status === 200) {
          alert(xhr.responseText);
          let imgname = uuid + "." + file.name.split(".")[1];
          mathForm_input.val(InsertString("![画像タイトル](/media/image/" + imgname + ")"));
          TextChange(mathForm_input);
        }
      }
      xhr.onerror = function () {
        alert("error");
      }
      // xhr end
      btn_pic.val(null);
    });

    mathForm_input.on('keyup', function () {
      TextChange(mathForm_input);
    })

    /////////////////////////////////////////////
    // 以下は送信の機能
    /////////////////////////////////////////////

    $(obj).find('.js-post_btn').on('click', function () {
      const text = $(obj).find('.mathForm_input').val();
      let csrf_token = getCookie("csrftoken");
      $.ajax({
        type: "POST",
        url: $(obj).data('json').post_url,
        data: {
          'method': $(obj).data('json').method || '',
          'answerID': $(obj).data('json').answerID || '',
          'text': text,
          'title': $(obj).find('.js-question-title').val() || ''
        },
        contentType: "application/json",
        beforeSend: function (xhr, settings) {
          if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
            xhr.setRequestHeader("X-CSRFToken", csrf_token);
          }
        },
        success: function (data) {
          if (data.status == 0) {
            window.location.href = data.redirect;
          } else {
            $(obj).find('.js-post_error').text(data.msg);
          }
        },
        error: function (xhr, status, error) {
          console.log(xhr);
          console.log(status);
          console.log(error);
          $(obj).find('.js-post_error').text('申し訳ございません... サーバエラーが発生しました。右下アイコンより不具合をご報告いただけますと大変うれしいです。');
        }
      });
    });
  });
}


mathForm($('.mathForm'));

//初期マークダウン
let markdownContents = $(".markdown-contents");
markdownContents.each((index, obj) => {
  $(obj).html(marked(escapeHtml($(obj).text())));
});
