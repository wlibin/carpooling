var QQMapWX = require('./utils/qqmap-wx-jssdk.js');
var qqmapsdk;
var province = "";//省
var city = "";//市
var district = "";//县
App({
  onLaunch: function () {
    let that = this;
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs);
    //获取本地缓存
    var address = wx.getStorageSync('address');
    if (!address) {
      qqmapsdk = new QQMapWX({
        key: 'AJ2BZ-DDM3U-X6XV6-BQ56W-CNXOV-FNFHL' //这里自己的key秘钥进行填充
      });
      that.getUserLocation();
    }
    // 查看是否授权
    /**wx.getSetting({
      success: function (res) {
        if (res.authSetting['scope.userInfo']) {
          //获取本地缓存
          var uId = wx.getStorageSync('uId');
          if (!uId) {
            that.login();
          }
        }
      }
    })**/
  },
  globalData: {
    userInfo: null,
    result:0,
  },
  login: function(){
    wx.showLoading({
      title: '加载中',
      mask: true,
      icon: 'loading',
    });
    let that = this;
    wx.login({
      success: function (loginRes) {
        if (loginRes) {
          //获取用户信息
          wx.getUserInfo({
            withCredentials: true,
            success: function (infoRes) {
              wx.request({
                url: 'https://pin.losso.cn/api/v1/wx/getLogin',
                data: {
                  wxCode: loginRes.code,
                  wxNick: encodeURIComponent(infoRes.userInfo.nickName),
                  wxGender: infoRes.userInfo.gender,
                  wxAvatarUrl: infoRes.userInfo.avatarUrl
                },
                success: function (res) {
                  if (res != null && res != '') {
                    console.log(res);
                    wx.setStorage({
                      key: 'uId',
                      data: res.data.data,
                      success: function (res) {
                        console.log('用户主键异步保存成功')
                      }
                    })
                  }
                  wx.hideLoading();
                },
                fail: function (error) {
                  //调用服务端登录接口失败
                  console.log(error);
                }
              });
            }
          });
        }
      }
    });
  },
  getUserLocation: function () {
    wx.showLoading({
      title: '加载中',
      mask: true,
      icon: 'loading',
    });
    let that = this;
    wx.getSetting({
      success: (res) => {
        // res.authSetting['scope.userLocation'] == undefined    表示 初始化进入该页面
        // res.authSetting['scope.userLocation'] == false    表示 非初始化进入该页面,且未授权
        // res.authSetting['scope.userLocation'] == true    表示 地理位置授权
        if (res.authSetting['scope.userLocation'] != undefined && res.authSetting['scope.userLocation'] != true) {
          wx.showModal({
            title: '请求授权当前位置',
            content: '需要获取您的地理位置，请确认授权',
            success: function (res) {
              if (res.cancel) {
                wx.showToast({
                  title: '拒绝授权',
                  icon: 'none',
                  duration: 1000
                })
              } else if (res.confirm) {
                wx.openSetting({
                  success: function (dataAu) {
                    if (dataAu.authSetting["scope.userLocation"] == true) {
                      wx.showToast({
                        title: '授权成功',
                        icon: 'success',
                        duration: 1000
                      })
                      //再次授权，调用wx.getLocation的API
                      that.getLocation();
                    } else {
                      wx.showToast({
                        title: '授权失败',
                        icon: 'none',
                        duration: 1000
                      })
                    }
                  }
                })
              }
            }
          })
        } else if (res.authSetting['scope.userLocation'] == undefined) {
          //调用wx.getLocation的API
          that.getLocation();
        }
        else {
          //调用wx.getLocation的API
          that.getLocation();
        }
      }
    })
  },
  // 微信获得经纬度
  getLocation: function () {
    let that = this;
    wx.getLocation({
      type: 'wgs84',
      success: function (res) {
        var latitude = res.latitude
        var longitude = res.longitude
        var speed = res.speed
        var accuracy = res.accuracy;
        that.getLocal(latitude, longitude)
      }
    })
  },
  // 获取当前地理位置
  getLocal: function (latitude, longitude) {
    let that = this;
    qqmapsdk.reverseGeocoder({
      location: {
        latitude: latitude,
        longitude: longitude
      },
      success: function (res) {
        province = res.result.ad_info.province
        city = res.result.ad_info.city
        district = res.result.ad_info.district
        wx.setStorage({
          key: 'address',
          data: { 'province': province, 'city': city, 'district': district},
          success: function (res) {
            console.log('地址异步保存成功')
          }
        })
      }
    });
  }
})