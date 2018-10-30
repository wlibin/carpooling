var app = getApp()
Page({
  data: {
    authorize: true
  },
  onLoad: function (options) {
  },
  // 生命周期函数--监听页面显示
  onShow: function () {
    let that = this;
    // 查看是否授权
    wx.getSetting({
      success: function (res) {
        if (!res.authSetting['scope.userInfo']) {
          //未授权，进行授权弹窗
          that.setData({
            authorize: false
          })
        } else {
          that.setData({
            authorize: true
          })
          //获取本地缓存
          var uId = wx.getStorageSync('uId');
          if (!uId) {
            app.login();
          }
        }
      }
    })
  },
  //用户点击允许授权
  getUserInfo: function (e) {
    let that = this;
    if (e.detail.userInfo) {
      that.setData({
        authorize: true
      })
      //调用登陆
      app.login();
    } else {
      that.setData({
        authorize: false
      })
    }
  },
  vehicleEdit: function (e) {
    wx.navigateTo({
      url: '../release/add/add?type=2',
    })
  },
  peopleEdit: function (e) {
    wx.navigateTo({
      url: '../release/add/add?type=1',
    })
  },
  //获取formId
  formSubmit: function (e) {
    if(e.target.id == '1'){
      wx.navigateTo({
        url: '../release/add/add?type=1',
      })
    }else if (e.target.id == '2') {
      wx.navigateTo({
        url: '../release/add/add?type=2',
      })
    }
    var uId = wx.getStorageSync('uId');
    var formId = e.detail.formId;
    wx.request({
      url: "https://pin.losso.cn/api/v1/wx/template/saveFormids",
      data: { "uId": uId, "formId": formId},
      success: function (res) {
        if (res.data.code == '0') {
          console.log("formId保存成功")
        }
      }
    })
  }
})