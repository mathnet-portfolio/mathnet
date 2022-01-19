$(document).ready(()=>{
  // 初回ログインかつ、メール未承認ならポップを出す
  // isLoginedはsearchResult.htmlで定義
  // 条件:
  //     365日ぶりに
  //     ログインして
  //     メール認証して人
  // console.log(isVerified);
  if (typeof $.cookie('isNotFirstLogin') === 'undefined' && searchResult_isLogined === 'True' && searchResult_isVerified !== 'True') {
    $('.popBg').css({ 'display': 'flex' });
    $.cookie('isNotFirstLogin', 'true', { expires: 365 });
  }
});

$('.close_icon').on('click', function () {
  $('.popBg').css({ 'display': 'none' });
})

$('#pop-conf_btn').on('click', function () {
  $('.popBg').css({ 'display': 'none' });
})