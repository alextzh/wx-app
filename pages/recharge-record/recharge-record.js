const app = getApp()
var util = require("../../utils/util.js")

// 获取充值记录
var getRechargeRecord = function (that, id) {
  wx.request({
    url: app.api_url + '/api/v1/subscribe/recharges',
    data: {
      subscribe_id: id
    },
    header: {
      'content-type': 'application/x-www-form-urlencoded',
      time_stamp: util.getBJDate().getTime(),
      secret_key: util.getMd5()
    },
    method: 'POST',
    success: function (res) {
      console.log(res)
      if (!res.data.ret) {
        wx.showModal({
          title: '提示',
          showCancel: false,
          content: res.data.msg
        })
        that.setData({
          hasData: true
        })
        return false
      }
      var list = res.data.obj
      that.setData({
        rechargeRecord: list
      })
    },
    fail: function (e) {
      console.log(e)
    },
    complete: function () {
      wx.hideLoading()
    }
  })
}

Page({
  /**
   * 页面的初始数据
   */
  data: {
    rechargeRecord: [],
    currentProduct: null,
    hasData: false, // 是否有数据
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '加载中',
    })
    var that = this
    try {
      var value = wx.getStorageSync('CURPRODUCT')
      if (value) {
        that.setData({
          currentProduct: value
        })
        console.log(value)
        getRechargeRecord(that, value.subscribe_id)
      }
    } catch (e) {
      // Do something when catch error
    }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  }
})
