var util = require('../../../utils/util.js');
var app = getApp();
var agreementCheck = '';
Page({
  data: {
    objectArray: ['1', '2', '3', '4', '5', '6'],
    toast1Hidden: true,
    modalHidden: true,
    modalHidden2: true
  },
  onLoad: function (options) {
    let that = this;
    agreementCheck = '0';
    let item = JSON.parse(options.jsonStr);
    that.setData({
      sId: item.sId,
      uId: item.uId,
      type: item.type,
      startDate: item.startDate,
      startTime: item.startTime,
      indexNumber: item.indexNumber-1,
      contactName: item.contactName,
      contactGender: item.contactGender,
      contactTel: item.contactTel,
      startAddress: item.startAddress,
      endAddress: item.endAddress,
    })
  },
  //点击日期组件确定事件  
  bindDateChange: function (e) {
    let that = this;
    that.setData({
      startDate: e.detail.value
    })
  },//点击时间组件确定事件  
  bindTimeChange: function (e) {
    let that = this;
    that.setData({
      startTime: e.detail.value
    })
  },//点击人数确定事件  
  bindPickerChange: function (e) {
    let that = this;
    that.setData({
      indexNumber: e.detail.value
    })
  },//性别单选按钮
  genderChange: function (e) {
    let that = this;
    that.setData({
      contactGender: e.detail.value
    })
  },
  //起点终点选择器
  addressTab: function (e) {
    wx.navigateTo({
      url: '../city/city?item=' + e.currentTarget.dataset.type,
    })
  },
  //拼车协议
  agreementClick: function (e) {
    wx.navigateTo({
      url: '../../home/agreement/agreement',
    })
  },
  formSubmit: function(e){
    console.log('submit数据：', e.detail.value);
    var warn = "";//弹框时提示的内容
    var flag = true;//判断信息输入是否完整
    //判断的顺序依次是：姓名-手机号-地址-具体地址-预约日期-预约时间-开荒面积
    if (e.detail.value.startAddress == "") {
      warn = "请输入或选择出发地！";
    } else if (e.detail.value.endAddress == "") {
      warn = "请输入或选择目的地！";
    } else if (e.detail.value.startDate == "") {
      warn = "请选择出发日期！"
    } else if (e.detail.value.startTime == "") {
      warn = "请选择出发时间";
    } else if (e.detail.value.indexNumber == "") {
      warn = "请选择乘车人数";
    } else if (e.detail.value.contactName == "") {
      warn = "请输入姓名";
    } else if (!(/^1(3|4|5|6|7|8|9)\d{9}$/.test(e.detail.value.contactTel))) {
      warn = "手机号格式不正确";
    } else if (agreementCheck == "0") {
      warn = "请阅读并勾选《拼车协议》";
    } else {
      flag = false;//若必要信息都填写，则不用弹框，且页面可以进行跳转
      var that = this;
    }
    //如果信息填写不完整，弹出输入框
    if (flag == true) {
      this.setData(
        { popErrorMsg: warn }
      );
      this.ohShitfadeOut(); 
    }else{
      wx.showLoading({
        title: '加载中',
        mask: true,
        icon: 'loading',
      });
      //请求接口
      wx.request({
        url: 'https://pin.losso.cn/api/v1/wx/spell/spellEdit', //请求接口的url
        method: 'POST', //请求方式
        data: e.detail.value, //请求参数
        header: {
          'content-type': 'application/json' // 默认值
        },
        success: res => {
          if (res.data.code == '0') {
            wx.showToast({
              title: '修改成功',
              icon: 'success',
              duration: 2000
            });
            setTimeout(function () {
              wx.navigateBack();
            }, 1000);
          }else{
            wx.showToast({
              title: '修改失败',
              icon: 'success',
              duration: 2000
            });
          }
        },
      });
    }
  },
  //非空验证提示框关闭
  ohShitfadeOut() {
    var fadeOutTimeout = setTimeout(() => {
      this.setData({ popErrorMsg: '' });
      clearTimeout(fadeOutTimeout);
    }, 3000);
  },//监听页面显示
  onshow: function () {
    let that = this;
    that.onLoad();
  },
  //协议勾选判断
  agreementCheck: function(e){
    if (e.detail.value.length > 0){
      agreementCheck = '1';
    }else{
      agreementCheck = '0';
    }
  },
  //获取地址选择内容
  startAddress: function (e) {
    this.setData({
      startAddress: e.data.name
    })
  },
  //获取地址选择内容
  endAddress: function (e) {
    this.setData({
      endAddress: e.data.name
    })
  }
})