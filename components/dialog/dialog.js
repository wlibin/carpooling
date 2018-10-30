Component({
  data:{
    isShow:false
  },
  methods: {
    show: function () {
      this.setData({
        isShow: true
      })
    },
    hide: function () {
      this.setData({
        isShow: false
      })
    }
  }
})