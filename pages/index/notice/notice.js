Page({
  data: {

  },
  onLoad: function (options) {
    console.log(options.id);
    this.noticeClick(options.id);
  },
  onReady: function () {

  },
  onShow: function () {

  },
  //公告
  noticeClick: function (id) {
    wx.request({
      url: 'https://pin.losso.cn/api/v1/wx/notice/getById/' + id,
      method: 'GET',
      header: {
        'content-type': 'application/json'
      },
      success: res => {
        if (res.data.code == '0') {
          res = res.data.data;
          this.setData({
            noticeTitle: res.noticeTitle,
            createTime: res.createTime,
            noticeContent: res.noticeContent
          });
        }
      }
    })
  },
})