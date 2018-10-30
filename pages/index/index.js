var app = getApp()
let page = 1; //页面页数
var currTab = '0'; //tab切换状态
var totalCount = "0"; //数据总页数
var currentCount = "0"; //当前数据页数
Page({
  data: {
    currentTab: '0',
    comCurrentTab: '0',
    spell: '',
    animationData: {},
    objectArray: ['1', '2', '3', '4', '5', '6'],
    isfooter:false,
    authorize: true
  },
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
    that.getCarpoolingData({ type: currTab, startAddress: '', endAddress: '', startDate: '', indexNumber: '', page: 1 });//调用数据请求
    that.noticeClick();
    that.indexImgs();
  },
  //请求接口数据
  getCarpoolingData: function (e) {
    let that = this;
    wx.showLoading({
      title: '加载中',
      icon: 'loading',
    });
    wx.request({
      url: 'https://pin.losso.cn/api/v1/wx/spell/getAll',
      method: 'GET',
      data: {
        type: e.type,
        startAddress: e.startAddress,
        endAddress: e.endAddress,
        startDate: e.startDate,
        indexNumber: e.indexNumber,
        page: e.page
      },
      header: {
        'content-type': 'application/json'
      },
      complete() {
        wx.hideLoading();
      },
      success: res => {
        if(res.data.code == '0'){
          that.setData({
            spell: res.data.data
          })
          totalCount = res.data.count;
          currentCount = res.data.data.length;
          if (totalCount <= currentCount && totalCount != 0) {
            that.setData({
              isfooter: true
            })
          }else{
            that.setData({
              isfooter: false
            })
          }
        }
      }
    });
  },
  //下拉刷新
  onPullDownRefresh: function () {
    let that = this;
    wx.setNavigationBarTitle({//动态设置导航条标题
      title: '正在刷新'
    });
    wx.showNavigationBarLoading();//在标题栏中显示加载图标
    that.getCarpoolingData({ type: currTab, startAddress: '', endAddress: '', startDate: '',indexNumber: '',page: 1});//调用数据请求
    that.noticeClick();
    that.indexImgs();
    wx.stopPullDownRefresh();//停止下拉刷新
    wx.hideNavigationBarLoading();//完成停止加载
    wx.setNavigationBarTitle({//动态设置导航条标题
      title: '庄浪出行'
    });
  },
  //上拉加载更多
  onReachBottom: function (e) {
    let that = this;
      page = page + 1;//页数+1
      that.getCarpoolingData({ type: currTab, startAddress: '', endAddress: '', startDate: '', indexNumber: '', page: page });
  },
  //tab页切换效果
  clickTab: function (e) {
    var that = this;
    if (that.data.currentTab != e.target.dataset.current) {
      that.setData({
        currentTab: e.target.dataset.current
      })
      currTab = that.data.currentTab;
      if (that.data.currentTab === '0') {
        that.getCarpoolingData({ type: '0', startAddress: '', endAddress: '', startDate: '', indexNumber: '', page: 1});//调用数据请求
      } else if (that.data.currentTab === '1') {
        this.getCarpoolingData({ type: '1', startAddress: '', endAddress: '', startDate: '', indexNumber: '', page: 1});//调用数据请求
      } else if (that.data.currentTab === '2') {
        that.getCarpoolingData({ type: '2', startAddress: '', endAddress: '', startDate: '', indexNumber: '', page: 1});//调用数据请求
      }
    }
  },
  //监听页面显示
  onShow: function (e) {
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
    if (app.globalData.result == 1) {
      that.getCarpoolingData({ type: currTab, startAddress: '', endAddress: '', startDate: '', indexNumber: '', page: 1 });//调用数据请求
    }
  },
  //监听页面隐藏
  onHide: function () {
    let that = this;
    that.hideModal();
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
  //底部弹窗
  showModal: function () {
    let that = this;
    //获取本地地址缓存
    wx.getStorage({
      key: "address",
      success: function (res) {
        if (res.data.province != "") {
          that.setData({
            region: [res.data.province, res.data.city, res.data.district]
          })
        }
      }
    })
    // 显示遮罩层
    var animation = wx.createAnimation({
      duration: 200,
      timingFunction: "linear",
      delay: 0
    })
    that.animation = animation
    animation.translateY(300).step()
    that.setData({
      animationData: animation.export(),
      showModalStatus: true
    })
    setTimeout(function () {
      animation.translateY(0).step()
      that.setData({
        animationData: animation.export()
      })
    }.bind(that), 200)
  },
  //隐藏对话框
  hideModal: function () {
    let that = this;
    // 隐藏遮罩层
    var animation = wx.createAnimation({
      duration: 200,
      timingFunction: "linear",
      delay: 0
    })
    that.animation = animation
    animation.translateY(300).step()
    that.setData({
      animationData: animation.export(),
    })
    setTimeout(function () {
      animation.translateY(0).step()
      that.setData({
        animationData: animation.export(),
        showModalStatus: false
      })
    }.bind(that), 200)
  },
  //省市县三级联动
  startAddressTab(e) {
    this.setData({ comStartAddress: e.detail.value });
  },
  //省市县三级联动
  endAddressTab(e) {
    this.setData({ comEndAddress: e.detail.value });
  },
  //点击日期组件事件  
  bindDateChange: function (e) {
    let that = this;
    that.setData({
      comStartDate: e.detail.value
    })
  },
  //点击人数事件  
  bindPickerChange: function (e) {
    let that = this;
    that.setData({
      comIndexNumber: e.detail.value
    })
  },
  //点击类型事件
  comCurrentTab: function (e) {
    let that = this;
    that.setData({
      comCurrentTab: e.currentTarget.dataset.value+'',
      comType: e.currentTarget.dataset.value+''
    })
  },
  //表单提交事件
  formSubmit: function (e) {
    let that = this;
    that.setData({
      currentTab: e.detail.value.comType
    })
    currTab = e.detail.value.comType;
    that.hideModal();
    that.getCarpoolingData({ type: e.detail.value.comType, startAddress: e.detail.value.comStartAddress, endAddress: e.detail.value.comEndAddress, startDate: e.detail.value.comStartDate, indexNumber: e.detail.value.comIndexNumber, page: 1 });//调用数据请求
  },
  //表单重置
  formResets: function(){
    this.setData({
      comCurrentTab: '0',
      comType: '',
      comStartAddress:'',
      comEndAddress:'',
      comStartDate:'',
      comIndexNumber:''
    })
  },
  //公告
  noticeClick: function () {
    wx.request({
      url: 'https://pin.losso.cn/api/v1/wx/notice/getAll',
      method: 'GET',
      header: {
        'content-type': 'application/json'
      },
      success: res => {
        if(res.data.code == '0'){
          this.setData({
            inforList: res.data.data,
            autoplay: true,
            interval: 5000
          });
        }
      }
    })
  },
  //首页轮播图
  indexImgs:function(){
    wx.request({
      url: 'https://pin.losso.cn/api/v1/wx/home/images/getAll',
      method: 'GET',
      header: {
        'content-type': 'application/json'
      },
      success: res => {
        if (res.data.code == '0') {
          this.setData({
            imgUrls: res.data.data,
            autoplay: true,
            interval: 5000,
          })
        }
      }
    })
  },
  //详情点击事件
  detailClick: function (e) {
    wx.navigateTo({
      url: '../release/detail/detail?sid=' + e.currentTarget.dataset.sid,
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
            wx.navigateTo({
              url: '../index/notice/notice',
            })
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
  }
})