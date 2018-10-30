var util = require('../../../utils/util.js');
let QQMapWX = require('../../../utils/qqmap-wx-jssdk.js');
// 实例化API核心类
let qqmapsdk = new QQMapWX({
  key: 'AJ2BZ-DDM3U-X6XV6-BQ56W-CNXOV-FNFHL'
});
var app = getApp();
// 起点经纬度
var latStart = '';
var lngStart = '';
// 终点经纬度
var latEnd = '';
var lngEnd = '';
//起点地址
var adrStart = '';
//终点地址
var adrEnd = '';
//举报内容
var reportValue = "";
Page({
  data: {
    
  },
  onLoad: function (options) {
    let that = this;
    wx.getLocation({
      type: 'gcj02', //返回可以用于wx.openLocation的经纬度
      success: function (res) {
        that.setData({
          latitude: res.latitude,
          longitude: res.longitude,
          scale: 10
        });
      }
    })
    wx.clearStorageSync('latlngstart');
    wx.clearStorageSync('latlngend');
    //数据接口
    that.detailData(options.sid);
  },
  //监听页面显示
  onshow: function () {
    let that = this;
  },
  //详情数据展示
  detailData:function(sid){
    let that = this;
    wx.showLoading({
      title: '加载中',
      mask: true,
      icon: 'loading',
    });
    //请求接口
    wx.request({
      url: 'https://pin.losso.cn/api/v1/wx/spell/getById/' + sid,
      method: 'GET',
      success: res => {
        var item = res.data.data;
        adrStart = item.startAddress;
        adrEnd = item.endAddress;
        that.setData({
          sid:item.sId,
          uid:item.uId,
          type: item.type,
          startDate: item.startDate,
          startTime: item.startTime,
          indexNumber: item.indexNumber,
          contactName: item.contactName,
          contactGender: item.contactGender,
          contactTel: item.contactTel,
          startAddress: item.startAddress,
          endAddress: item.endAddress,
          marks:item.marks
        })
        that.getLatAndLng();
      },
      complete:function(){
        wx.hideLoading();
      }
    });
  },
  //地址转坐标
  getLatAndLng(e) {
    let that = this;
    qqmapsdk.geocoder({
      address: '"'+adrStart+'"',
      success: function (res) {
        latStart = res.result.location.lat;
        lngStart = res.result.location.lng;
        qqmapsdk.geocoder({
          address: '"'+adrEnd+'"',
          success: function (res) {
            latEnd = res.result.location.lat;
            lngEnd = res.result.location.lng;
            that.driving();
          }
        });
      }
    });
    
  },
  //事件回调函数
  driving: function () {
    let _page = this;
    _page.setData({
      latitude: latStart,
      longitude: lngStart,
      scale: 16,
      markers: [{
        id: 0,
        latitude: latStart,
        longitude: lngStart,
        // 起点图标
        iconPath: '../../resource/images/qidian.png'
      },
      {
        id: 1,
        latitude: latEnd,
        longitude: lngEnd,
        // 终点图标
        iconPath: '../../resource/images/zhongdian.png'
      },
      ]
    });
    /**
     * 获取两点的距离
     */
    qqmapsdk.calculateDistance({
      to: [{
        latitude: latStart,
        longitude: lngStart
      }, {
        latitude: latEnd,
        longitude: lngEnd
      }],
      success: function (res) {
        console.log(res, '两点之间的距离：', res.result.elements[1].distance);
        _page.setData({
          resultDistance: res.result.elements[1].distance/1000 + '千米'
        });
      }
    });
    //网络请求设置
    let opt = {
      //WebService请求地址，from为起点坐标，to为终点坐标，开发key为必填
      url: 'https://apis.map.qq.com/ws/direction/v1/driving/?from=' + latStart + ',' + lngStart + '&to=' + latEnd + ',' + lngEnd + '&key=' + qqmapsdk.key,
      method: 'GET',
      dataType: 'json',
      //请求成功回调
      success: function (res) {
        let ret = res.data
        if (ret.status != 0) return; //服务异常处理
        let coors = ret.result.routes[0].polyline,
          pl = [];
        //坐标解压（返回的点串坐标，通过前向差分进行压缩）
        let kr = 1000000;
        for (let i = 2; i < coors.length; i++) {
          coors[i] = Number(coors[i - 2]) + Number(coors[i]) / kr;
        }
        //将解压后的坐标放入点串数组pl中
        for (let i = 0; i < coors.length; i += 2) {
          pl.push({
            latitude: coors[i],
            longitude: coors[i + 1]
          })
        }
        //设置polyline属性，将路线显示出来
        _page.setData({
          polyline: [{
            points: pl,
            color: '#d51ee8',
            width: 6
          }]
        })
        _page.includePoints();
      }
    };
    wx.request(opt);
  },
  // 使用 wx.createMapContext 获取 map 上下文 
  onReady: function (e) {
    this.mapCtx = wx.createMapContext('myMap');
  },
  includePoints: function () {
    this.mapCtx.includePoints({
      padding: [20],
      points: [{
        latitude: latStart,
        longitude: lngStart,
      }, {
        latitude: latEnd,
        longitude: lngEnd,
      }]
    })
  },
  //拨打电话接口
  phoneCalling: function (e) {
    if (1 == 2) {
      wx.showModal({
        title: '认证提示',
        content: '你还没实名认证，不能联系乘客，是否去实名认证？',
        success: function (res) {
          if (res.confirm) {
            console.log('用户点击确定')
          }
        }
      })
    } else {
      var tel = e.currentTarget.dataset.tel;
      wx.makePhoneCall({
        phoneNumber: tel,
        success: function () {
          console.log("拨打电话成功！")
        },
        fail: function () {
          console.log("拨打电话失败！")
        }
      })
    }
  },
  //举报
  circleCalling: function (e) {
    this.setData({
      showModal: true
    })
  },
  //分享
  onShareAppMessage(e) {
    return {
      title: '老乡，我们拼车回家吧',
      path: '/pages/release/detail/detail?sid='+e.target.dataset.sid,
      imageUrl:'../../resource/images/pinchelogo.jpg'
    }
  },
  //弹出框蒙层截断touchmove事件
  preventTouchMove: function () {
  },
  // 隐藏模态对话框
  hideModal: function () {
    this.setData({
      showModal: false
    });
  },
  // 对话框取消按钮点击事件
  onCancel: function () {
    this.hideModal();
  },
  // 对话框确认按钮点击事件
  onConfirm: function (e) {
    if (reportValue != ""){
      wx.request({
        url: 'https://pin.losso.cn/api/v1/wx/report/reportEdit',
        method: 'POST',
        data: { 
          'theInformantUid': e.currentTarget.dataset.uid,
          'informantUid': wx.getStorageSync('uId'),
          'reportContent': reportValue,
        },
        header: {
          'content-type': 'application/json'
        },
        success: res => {
          if (res.data.code == '0') {
            wx.showToast({
              title: '举报成功',
              icon: 'success',
              duration: 2000
            });
          }
        }
      })
    }
    this.hideModal();
  },
  //获取举报输入内容
  reportValue:function(e){
    reportValue = e.detail.value;
  }
})