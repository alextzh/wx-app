const app = getApp()
var util = require('../../utils/util.js')

Page({
  /**
   * 页面的初始数据
   */
  data: {
    currentProduct: null,
    subscribeBtnTxt: '提交修改', // 提交修改按钮参数
    btnLoading: false,
    btnDisabled: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    let value = wx.getStorageSync('CURPRODUCT')
    if (value) {
      that.setData({
        currentProduct: value
      })
    }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },
  // 提交赎回
  formSubmit: function (e) {
    var that = this
    var param = e.detail.value
    if (that.checkSubscribe(param)) {
      wx.showModal({
        title: '提示',
        content: '您确认要修改申购份额为' + param.subscribeAmt + '万份吗',
        success: function (res) {
          if (res.confirm) {
            that.mySubmit(param)
          } else if (res.cancel) {
            console.log('已取消')
          }
        }
      })
    }
  },
  setSubscribeData1: function () {
    this.setData({
      subscribeBtnTxt: "提交修改中",
      btnDisabled: !this.data.btnDisabled,
      btnLoading: !this.data.btnLoading
    })
  },
  setSubscribeData2: function () {
    this.setData({
      subscribeBtnTxt: "提交修改",
      btnDisabled: !this.data.btnDisabled,
      btnLoading: !this.data.btnLoading
    })
  },
  // 校验赎回金额
  checkSubscribe: function (param) {
    var amt = parseInt(param.subscribeAmt)
    var min = parseInt(this.data.currentProduct.min_money) / 10000
    if (!amt) {
      wx.showModal({
        title: '提示',
        showCancel: false,
        content: '请输入申购份额'
      })
      return false
    } else if (amt < min) {
      wx.showModal({
        title: '提示',
        showCancel: false,
        content: '最小申购份额为'+ min +'万份'
      })
      return false
    } else if (amt % 1 !== 0) {
      wx.showModal({
        title: '提示',
        showCancel: false,
        content: '申购递增份额为1万份'
      })
      return false
    } else {
      return true
    }
  },
  mySubmit: function (param) {
    var that = this
    var subscribeAmt = parseInt(param.subscribeAmt)
    let custom = wx.getStorageSync('USERINFO')
    let subscribe_id = that.data.currentProduct.subscribe_id
    wx.request({
      url: app.api_url + '/api/v1/subscribe/editApply',
      data: {
        customer_id: custom.id,
        subscribe_id: subscribe_id,
        subscribe_money: subscribeAmt * 10000
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      method: 'POST',
      success: function (res) {
        if (!res.data.ret) {
          wx.showModal({
            title: '提示',
            showCancel: false,
            content: res.data.msg
          })
          that.setSubscribeData2()
          return false
        }
        that.setSubscribeData1()
        setTimeout(() => {
          wx.showToast({
            title: '修改申请已提交',
            icon: 'success',
            duration: 1500
          })
          setTimeout(() => {
            that.setSubscribeData2()
            wx.switchTab({
              url: '../mine/mine'
            })
          }, 500)
        }, 2000)
      }
    })
  }
})