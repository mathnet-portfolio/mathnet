let adding_tag_request = new Vue({
  delimiters: ['[[', ']]'],
  el: '#adding_tag_request',
  data: {
    newTag: '',
    tags: [],
    errorMsg: '',
    isShown: true,
    msg: '',
  },
  methods: {
    addTag() {
      if (this.newTag !== '') {
        this.tags.push(this.newTag);
        this.newTag = '';
      }
    },
    delTag(i) {
      this.tags.splice(i, 1);
    },
    send() {
      let self = this;
      // let formData = new FormData();
      // formData.append("tags", self.tags);
      axios({
        method: 'post',
        url: '/adding_tag_request_post/',
        headers: { 'X-CSRFToken': getCookie("csrftoken") },
        // data: formData,
        data: {"a": self.tags},
      })
        .then(res => {
          let data = res.data;
          if (data.status == 0) {
            self.tags = []
            self.isShown = false;
            self.msg = '送信が完了しました。タグが反映されるまで時間がかかります。ご理解ください。'
          } else {
            self.errorMsg = data.msg;
          }
        })
        .catch(err => {
          self.errorMsg = "申し訳ございません...サーバエラーが発生いたしました。"
        })
        .finally()
    }
  },
});

