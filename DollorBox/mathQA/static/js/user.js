
$('.setting-edit-btn:not(".resend-email")').on('click', function () {
  console.log("OK");
  let item = $(this).data('item');
  let itemName = $(this).siblings('.setting-item').text();
  let valueDOM = $(this).siblings('.setting-value');
  let value = valueDOM.text();
  $('.popBg').css({ 'display': 'flex' });
  $('.pop-title > p').text(itemName + '変更');
  if (item == 'icon') {
    $('.pop-icon_edit').css({ 'display': 'block' });
    $('.pop-text_form').css({ 'display': 'none' });
  } else {
    $('.pop-icon_edit').css({ 'display': 'none' });
    $('.pop-text_form').css({ 'display': 'block' });
    $('#js-oldValue').val(value);
  }
  $('#js-edit_btn').on('click', function () {
    let formData = new FormData();
    let newValue;
    let uuid;
    if (item == 'icon') {
      newValue = $('#js-newValue-icon').prop('files')[0];
      uuid = generateUuid()
      formData.append('uuid', uuid);
    } else {
      newValue = $('#js-newValue').val();
    }
    formData.append('newValue', newValue);

    let csrf_token = getCookie("csrftoken");
    if (item == 'email' && !newValue.match(/^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/)) {
      $('#js-setting-error').text('有効なメールアドレスではありません。');
      return false;
    }
    $.ajax({
      type: "POST",
      url: "/settings_post/account/" + item + "/",
      data: formData,
      contentType: false,
      processData: false,
      beforeSend: function (xhr, settings) {
        if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
          xhr.setRequestHeader("X-CSRFToken", csrf_token);
        }
      },
      success: function (data) {
        if (data.status == '0') {
          if (item == 'icon') {
            let imgname = uuid + "." + newValue.name.split(".")[1];
            let imgpath = "/media/icon/" + imgname;
            $(".setting-value-img img").attr("src", imgpath);
            $(".header-icon img").attr("src", imgpath);
          } else if (item == 'email') {
            if (!$('.resend-email').length) {
              // すでに再送信ボタンがないなら
              $('.setting-edit-btn-email').before(`<button data-item="resend-email" type="button" class="normal_btn resend-email">再送信</button>`);
            }
            $('.setting-alert').html('<span class="material-icons">warning</span><p>メールを送信しました。メールを確認して、有効化してください。m(_ _)m</p>');
            valueDOM.text(newValue);
          } else {
            valueDOM.text(newValue);
          }
          $("#js-newValue").val("");
          $("#js-edit_btn").off("click");
          $('.popBg').css({ 'display': 'none' });
        } else if (data.status == 'error') {
          $('#js-setting-error').text(data.msg);
        } else if (data.status == 'InputLack') {
          $('#js-setting-error').text(data.msg);
        } else {
          $('#js-setting-error').text('エラーが発生しました。');
          console.log(data);
        }
      },
      error: function (xhr, status, error) {
        console.log(xhr);
        console.log(status);
        console.log(error);
        $('#js-setting-error').text('申し訳ございません... サーバエラーが発生しました。右下アイコンより不具合をご報告いただけますと大変うれしいです。');
      }
    })

  })
})

$('.resend-email').on('click', function () {
  let item = $(this).data('item');
  let csrf_token = getCookie("csrftoken");
  $.ajax({
    type: "POST",
    url: "/settings_post/account/" + item + "/",
    contentType: false,
    processData: false,
    beforeSend: function (xhr, settings) {
      if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
        xhr.setRequestHeader("X-CSRFToken", csrf_token);
      }
    },
    success: function (data) {
      if (data.status == '0') {
        alert('送信に成功しました。');
      } else if (data.status == 'error') {
        alert(data.msg);
      } else {
        $('#js-setting-error').text('エラーが発生しました。');
        console.log(data);
      }
    },
    error: function (xhr, status, error) {
      console.log(xhr);
      console.log(status);
      console.log(error);
      $('#js-setting-error').text('申し訳ございません... サーバエラーが発生しました。右下アイコンより不具合をご報告いただけますと大変うれしいです。');
    }
  })
});

$('.close_icon').on('click', function () {
  $("#js-edit_btn").off("click");
  $("#js-newValue").val("");
  $('.popBg').css({ 'display': 'none' });
})

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

/////////////////////////////
// tabメニューの実装
/////////////////////////////

$('.setting-menu-btn').on('click', function () {
  let type = $(this).data('type');
  $('.l-setting-main').css({
    'display': 'none',
  });
  $('.setting-main--' + type).css({
    'display': 'block',
  });
  $('.l-setting-menu').removeClass('setting-menu--selected');
  $(this).parents('.l-setting-menu').addClass('setting-menu--selected');
  // cssのtext ellipsisは100%が使えないため、pxで指定する。
  // https://stackoverflow.com/questions/27314149/css-text-ellipsis-and-100-percent-width
  console.log($('.setting-my_post').width());
  $('.setting-my_post a').width($('.setting-my_post').width());
});

// 初期設定
$('.l-setting-main').css({ 'display': 'none' });
$('.setting-main--' + 'account').css({ 'display': 'block' });
