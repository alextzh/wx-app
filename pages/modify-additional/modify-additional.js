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
  // 提交赎回
  formSubmit: function (e) {
    var that = this
    var param = e.detail.value
    if (that.checkSubscribe(param)) {
      wx.showModal({
        title: '提示',
        content: '您确认要修改追加份额为' + param.subscribeAmt + '万份吗',
        success: function (res) {
          if (res.confirm) {
            that.setSubscribeData1()
            that.mySubmit(param)
          } else if (res.cancel) {
            console.log('已取消')
          }
        },
        fail: function (e) {
          console.log(e)
          util.toastMsg('提示', '网络异常')
        }
      })
    }
  },
  setSubscribeData1: function () {
    this.setData({
      subscribeBtnTxt: "提交修改中",
      btnDisabled: true,
      btnLoading: true
    })
  },
  setSubscribeData2: function () {
    this.setData({
      subscribeBtnTxt: "提交修改",
      btnDisabled: false,
      btnLoading: false
    })
  },
  // 校验赎回金额
  checkSubscribe: function (param) {
    var amt = param.subscribeAmt
    var min = this.data.currentProduct.min_money / 10000
    if (!amt) {
      wx.showModal({
        title: '提示',
        showCancel: false,
        content: '请输入追加份额'
      })
      return false
    } else if (amt < min) {
      wx.showModal({
        title: '提示',
        showCancel: false,
        content: '最小追加份额为' + min + '万份'
      })
      return false
    } else if (amt > 100000) {
      wx.showModal({
        title: '提示',
        showCancel: false,
        content: '最大追加份额为100000万份'
      })
      return false
    } else if (amt % 1 !== 0) {
      wx.showModal({
        title: '提示',
        showCancel: false,
        content: '追加递增份额为1万份'
      })
      return false
    } else {
      return true
    }
  },
  mySubmit: function (param) {
    var that = this
    var subscribeAmt = parseInt(param.subscribeAmt)
    let account_id = wx.getStorageSync('CURPRODUCT').account_id
    wx.request({
      url: app.api_url + '/api/v1/subscribe/editRecast',
      data: {
        account_id: account_id,
        money: subscribeAmt * 10000
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
        wx.showToast({
          title: '修改申请已提交',
          icon: 'success',
          duration: 1500
        })
        setTimeout(() => {
          that.setSubscribeData2()
          wx.reLaunch({
            url: '../mine/mine'
          })
        }, 500)
      },
      fail: function (e) {
        console.log(e)
        util.toastMsg('提示', '网络异常')
      }
    })
  }
})