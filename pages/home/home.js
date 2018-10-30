var app = getApp()
Page({
  data: {
    authorize: true
  },
  //-监听页面加载
  onLoad: function (options) {
    let that = this;
    if (app.globalData.userInfo) {
      that.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (that.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        that.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          that.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
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
  //我发布的页面跳转
  myselfEdit: function () {
    wx.navigateTo({
      url: "../release/myself/myself"
    })
  },
  //拼车协议页面跳转
  agreementClick: function () {
    wx.navigateTo({
      url: "../home/agreement/agreement"
    })
  },
  //安全守则页面跳转
  securityClick: function () {
    wx.navigateTo({
      url: "../home/security/security"
    })
  }
})