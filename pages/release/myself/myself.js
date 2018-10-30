var util = require('../../../utils/util.js');
var app = getApp();
var uId = '';
Page({
  data: {
    spell: '',
    newDate: util.formatDate(new Date())+' ' +util.formatTime(new Date()),
  },
  //-监听页面加载
  onLoad: function (options) {
    let that = this;
  },
  // 生命周期函数--监听页面初次渲染完成
  onReady: function () {
    let that = this;
  },
  // 生命周期函数--监听页面显示
  onShow: function () {
    let that = this;
    //获取本地缓存
    uId = wx.getStorageSync('uId');
    if (!uId) {
      app.login();
    }else{
      that.getMiDate();
    }
  },
  //请求接口数据
  getMiDate: function (e){
    wx.showLoading({
      title: '加载中',
      icon: 'loading',
    });
    //请求接口
    wx.request({
      url: 'https://pin.losso.cn/api/v1/wx/spell/getMiByuId/' + uId, //请求接口的url
      method: 'GET', //请求方式
      success: res => {
        if (res.data.code == '0') {
          this.setData({
            spell: res.data.data
          })
        }else{
          this.setData({
            spell: ''
          })
        }
        wx.hideLoading();
      }
    });
  },
  //删除信息
  deleteSpell: function (e){
    let that = this;
    wx.showModal({
      title: '提示',
      content: '确定删除这条记录吗？',
      success: function (res) {
        if(res.confirm) {
          wx.showLoading({
            title: '加载中',
            mask: true,
            icon: 'loading',
          });
          //请求接口
          wx.request({
            url: 'https://pin.losso.cn/api/v1/wx/spell/deleteById/' + e.currentTarget.dataset.sid,
            method: 'GET',
            success: res => {
              if (res.data.code == '0') {
                wx.showToast({
                  title: '删除成功',
                  icon: 'success',
                  duration: 2000
                });
                setTimeout(function () {
                  that.onShow();
                }, 1000);
              } else {
                wx.showToast({
                  title: '删除失败',
                  icon: 'success',
                  duration: 2000
                })
              }
            }
          });
        }
      }
    })
  },
  //修改信息
  editSpell: function (e) {
    let that = this;
    wx.showLoading({
      title: '加载中',
      mask: true,
      icon: 'loading',
    });
    //请求接口
    wx.request({
      url: 'https://pin.losso.cn/api/v1/wx/spell/getById/' + e.currentTarget.dataset.sid,
      method: 'GET',
      success: res => {
        let str = JSON.stringify(res.data.data);
        wx.navigateTo({
          url: '../edit/edit?jsonStr=' + str,
          complete: function () {
            wx.hideLoading();
          }
        })
      }
    });
  }
})