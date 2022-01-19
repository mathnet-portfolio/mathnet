const btn_good = document.querySelector(".post-good");
const goodnum = document.querySelector(".post-good > span");

function parse_cookies() {
  var cookies = {};
  if (document.cookie && document.cookie !== "") {
    document.cookie.split(";").forEach(function (c) {
      var m = c.trim().match(/(\w+)=(.*)/);
      if (m !== undefined) {
        cookies[m[1]] = decodeURIComponent(m[2]);
      }
    });
  }
  return cookies;
}

//goodbutton
function good(method, ID, btn) {
  let formData = new FormData();
  formData.append("method", method);
  formData.append("ID", ID);
  cookies = parse_cookies();
  let xhr = new XMLHttpRequest();
  xhr.open("POST", "/good_post/");
  xhr.setRequestHeader("X-CSRFToken", cookies["csrftoken"]);
  xhr.responseText = "json";
  xhr.send(formData);
  xhr.onload = () => {
    const jsonResponse = JSON.parse(xhr.response);
    if (jsonResponse.status == 0) {
      window.location.href = jsonResponse.redirect;
    } else if (jsonResponse.status == 1) {
      console.log(jsonResponse.msg);
    } else {
      if (method == "ques-up") {
        alert("高評価しました！");
      } else if (method == "ques-down") {
        alert("高評価を解除しました");
      }
      btn.textContent = jsonResponse.value;
    }
  };
  xhr.onerror = () => {
    alert("error");
  };
}

btn_good.addEventListener("click", () => {
  if (btn_good.classList.contains("pushed")) {
    btn_good.classList.remove("pushed");
    good("ques-down", questionID, goodnum);
  } else {
    btn_good.classList.add("pushed");
    good("ques-up", questionID, goodnum);
  }
});

/**
 * トグルボタンが押されると、回答欄が拡張される。
 * すべてのトグルボタンは連動しており、一つがONになるとほかもONになる。
 */
let nextIsChecked1 = true; // これはチェックされた後の状態を表している。
$(".is_expanded_toggle").on("change", () => {
  if (nextIsChecked1) {
    // 未展開時
    $(".is_expanded_toggle").each((index, obj) => {
      $(obj).prop("checked", nextIsChecked1);
    });
    $(".l-l_sidebar").hide(300);
    $(".l-r_sidebar").hide(300);
    $(".l-nav").hide(300);
    $("body").removeClass("basic_body");
    $("body").addClass("no_side_bar_body");
    $(".ip_forms").removeClass("ip_forms--shrink");
    nextIsChecked1 = false;
  } else {
    // 展開時
    $(".is_expanded_toggle").each((index, obj) => {
      $(obj).prop("checked", nextIsChecked1);
    });
    $(".l-l_sidebar").slideDown(300);
    $(".l-r_sidebar").slideDown(300);
    $(".l-nav").slideDown(300);
    $("body").addClass("basic_body");
    $("body").removeClass("no_side_bar_body");
    $(".ip_forms").addClass("ip_forms--shrink");
    nextIsChecked1 = true;
  }
});

$(function () {
  $(".is_fixed_toggle").on("change", function () {
    let isChecked = $(this).prop("checked");
    // 一度すべてのチェックをオフにし、classを剥奪する。
    $(".is_fixed_toggle").each((index, obj) => {
      $(obj).prop("checked", false);
      $(obj)
        .parents(".mathForm")
        .find(".mathForm_btns")
        .removeClass("mathForm_btns--fixed");
    });
    $(this).prop("checked", isChecked);
    if (isChecked) {
      // 未展開時
      $(this)
        .parents(".mathForm")
        .find(".mathForm_btns")
        .addClass("mathForm_btns--fixed");
    } else {
      // 展開時
      $(this)
        .parents(".mathForm")
        .find(".mathForm_btns")
        .removeClass("mathForm_btns--fixed");
    }
  });
});

Vue.component("math-form", {});

const detail = new Vue({
  delimiters: ["[[", "]]"],
  el: "#detail",
  data: {
    isExpanded: false,
    fixedMathBtnNum: 0,
  },
  method: {},
});
