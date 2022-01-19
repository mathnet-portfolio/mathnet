$('#js-loginBtn').on("click", function () {
  let csrf_token = getCookie("csrftoken");
  $.ajax({
    type: "POST",
    url: "/login/",
    data: {
      'userNameOrEmail': $('#js-userNameOrEmail').val(),
      'password': $('#js-password').val()
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
      } else if (data.status == 'NoUserNameOrEmail') {
        $('#js-doorwayError').text(data.msg);
      } else if (data.status == 'NoPassword') {
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
      $('#js-doorwayError > p').text('申し訳ございません... サーバエラーが発生しました。右下アイコンより不具合をご報告いただけますと大変うれしいです。');    
    }
  })
});