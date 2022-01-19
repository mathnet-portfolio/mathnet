function CheckTags(tag_choice_val) {
  $(".tagerror").text("");
  if (taglist.length >= 5) {
    $(".tagerror").text("タグは5つまで選べます。");
    return false;
  } else {
    if (taglist.indexOf(tag_choice_val) === -1) {
      return true;
    } else {
      $(".tagerror").text("このタグは既に選ばれています。");
      return false;
    }
  }
}

/**
 * スクロール時に数式ボタンがヘッダーにくっついたら固定する。
 */
// const mathForm_btns = $(".mathForm_btns");
// const btnsTop = mathForm_btns.offset().top;
// $(window).scroll(function () {
//   // winTop いまページの上端が、HTML全体で上から何pxか
//   // btnsTop ボタンのHTML全体での上からの高さ
//   // 16*4 = 16rem ヘッダーの高さ
//   let winTop = $(this).scrollTop();
//   if (winTop + 16 * 4 >= btnsTop) {
//     mathForm_btns.addClass("mathForm_btns--fixed");
//   } else if (winTop + 16 * 4 <= btnsTop) {
//     mathForm_btns.removeClass("mathForm_btns--fixed");
//   }
// });

/**
 * モバイルサイズ: 560px 以下ではテキストエリアの中を空に
 */

if ($(window).width() <= 560) {
  $(".mathForm_input").val("");
}

// タグを検索できるように初期化
// search_tag_dataはwriteQのインラインjsで取得
let tagList = [];
for (let key in search_tag_data) {
  tagList.push({
    name: key,
    term: search_tag_data[key],
  });
}

/**
 * タグを受け取り、検索候補をリストで返す
 * @param {string} text - 検索テキスト
 * @returns {string[]} - [候補1, 候補2...] という形で返される。
 */
const getTagSearchRes = function (text) {
  let fuse = new Fuse(tagList, {
    threshold: 0.5,
    shouldSort: true,
    keys: ["name", "term"],
  });
  return fuse.search(text).map((x) => x.name);
};

Vue.component("post-img", {
  props: ["pic", "picIndex", "canEdit"],
  data() {
    return {
      bace64: "",
    };
  },
  /**
   * picで与えられるデータはfileオブジェクトなので、インスタンス作成完了後にbace64形式に変換する。
   */
  async created() {
    const bace64 = await convToBase64(this.pic);
    this.bace64 = bace64;
  },
  template: `
    <div class="card-pic">
      <img :src="this.bace64">
      <div @click="$emit('del-pic', picIndex)" class="card-pic-del_btn">
        <span class="material-icons">delete</span>
      </div>
    </div>
  `,
});

const app = new Vue({
  delimiters: ["[[", "]]"],
  el: "#app",
  data: {
    pictures: [], // 形式: fileObj
    contents: "",
    tags: [],
    searchTagsRes: [],
    nowCardNum: 1, // 1, 2, 3
    transName: "slide_to_left",
    tagSearchText: "",
  },
  methods: {
    prevCard() {
      this.transName = "slide_to_right";
      this.nowCardNum--;
    },
    nextCard() {
      this.transName = "slide_to_left";
      this.nowCardNum++;
      if (this.nowCardNum == 3) {
        // v-modelだとIME変換中に取得できないのでこうする。
        this.$nextTick(() => {
          const $input = this.$refs.tag_search;
          $input.addEventListener("keyup", this.updateTagSearch);
          $input.addEventListener("compositionend", this.updateTagSearch);
        });
      }
      console.log(this.sene);
    },
    upload(event) {
      const files = event.target.files || event.dataTransfer.files;
      for (let file of files) {
        if (checkFile(file)) {
          file = addUuidToFile(file);
          this.pictures.push(file);
          console.log(this.pictures);
        }
      }
    },
    delPic(i) {
      console.log(i);
      this.pictures.splice(i, 1);
    },
    addTag(tagName) {
      this.tagSearchText = "";
      this.searchTagsRes.splice(-this.searchTagsRes.length); // 普通に上書きするとリアクティブにならない
      this.tags.push(tagName);
    },
    delTag(i) {
      this.tags.splice(i, 1);
    },
    updateTagSearch(e) {
      this.tagSearchText = e.target.value;
      this.searchTagsRes = getTagSearchRes(this.tagSearchText);
    },
    sendQes() {
      const sendImg = function () {
        // jsonじゃないけど、fromDataも送れるのでとりあえずpostJsonを使用
        if (this.pictures.length > 0) {
          let formData = createImgFormData(this.pictures);
          return postJson("/img_post/", formData);
        }
      }.bind(this);
      // デバック用タイトル
      const sendContext = function () {
        return postJson("/writeQ/", {
          title: "",
          text: this.contents + generateImgMarkdown(this.pictures),
          tags: this.tags,
        });
      }.bind(this);
      Promise.all([sendImg(), sendContext()])
        .then((res) => {
          console.log(res);
          let data = res[1].data;
          if (data.status == 0) {
            window.location.href = data.redirect;
          } else {
            alert(data.msg);
          }
        })
        .catch((err) => {
          console.log(err);
          alert("サーバエラーが発生しました。");
        });
    },
  },
});
