let City = require('../../../utils/allcity.js');
let item = "";
Page({
  data: {
    city: City
  },
  onLoad: function (options) {
    item = options.item;
  },
  bindtap(e) {
    console.log(e.detail);
    let pages = getCurrentPages();
    let prevPage = pages[pages.length - 2];
    if (item == 1) {
      prevPage.startAddress({
        data: e.detail,
      })
    } else if (item == 2) {
      prevPage.endAddress({
        data: e.detail,
      })
    }
    wx.navigateBack({
      delta:1
    })
  },
  input(e) {
    this.value = e.detail.value
  },
  searchMt() {
    // 当没有输入的时候，默认inputvalue 为 空字符串，因为组件 只能接受 string类型的 数据 
    if (!this.value) {
      this.value = '';
    }
    this.setData({
      value: this.value
    })
  }

})