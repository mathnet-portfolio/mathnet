$('#js-registerBtn').on("click", function () {
  let csrf_token = getCookie("csrftoken");
  if ($('#js-password').val() === $('#js-passwordForCheck').val()) {
    if ($('#js-termBtn').is(':checked')) {
      if($('#js-email').val().match(/^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/)){
        $.ajax({
          type: "POST",
          url: "/register/",
          data: {
            'userName': $('#js-userName').val(),
            'email': $('#js-email').val(),
            'password': $('#js-password').val(),
            'passwordForCheck': $('#js-passwordForCheck').val()
          },
          contentType: "application/json",
          beforeSend: function (xhr, settings) {
            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
              xhr.setRequestHeader("X-CSRFToken", csrf_token);
            }
          },
          success: function (data) {
            if (data.status == '0') {
              window.location.href = data.redirect;
            } else if (data.status == 'UserNameOverlap') {
              $('#js-doorwayError').text(data.msg);
            } else if (data.status == 'EmailOverlap') {
              $('#js-doorwayError').text(data.msg);
            } else if (data.status == 'InputLack') {
              $('#js-doorwayError').text(data.msg);
            } else {
              $('#js-doorwayError').text('エラーが発生しました。');
            }
          },
          error: function (xhr, status, error) {
            console.log(xhr);
            console.log(status);
            console.log(error);
            $('#js-doorwayError').text('申し訳ございません... サーバエラーが発生しました。ご意見フォームより不具合をご報告いただけますと大変うれしいです。');
          }
        })
      }else{
        $('#js-doorwayError').text('有効なメールアドレスではありません。')
      }
    } else {
      $('#js-doorwayError').text('利用規約に同意する必要があります。');
    }
  } else {
    console.log("aa");
    $('#js-doorwayError').text('確認用パスワードが一致しません（泣）');
  }
});
