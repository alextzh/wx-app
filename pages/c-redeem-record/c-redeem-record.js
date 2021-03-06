const app = getApp()
var util = require("../../utils/util.js")

// 获取赎回记录
var getRedeemRecord = function (that, id) {
  const time_stamp = util.getBJDate()
  const secret_key = util.getMd5()
  wx.request({
    url: app.api_url + '/api/v1/test/product/myRedeem',
    data: {
      customer_id: id
    },
    header: {
      'content-type': 'application/x-www-form-urlencoded',
      time_stamp: time_stamp,
      secret_key: secret_key
    },
    method: 'POST',
    success: function (res) {
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
        redeemRecord: that.data.redeemRecord.concat(list),
        hasData: false
      })
    },
    fail: function (e) {
      console.log(e)
      util.toastMsg('提示', '网络异常')
    },
    complete: function () {
      wx.hideLoading()
      if (that.data.fresh) {
        setTimeout(() => {
          wx.hideNavigationBarLoading()
          wx.stopPullDownRefresh()
        }, 1000)
      }
    }
  })
}

Page({
  /**
   * 页面的初始数据
   */
  data: {
    redeemRecord: [],
    fresh: false, // 上拉刷新标志
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
      var userInfo = wx.getStorageSync('USERINFO')
      if (userInfo) {
        // Do something with return value
        getRedeemRecord(that, userInfo.id)
      }
    } catch (e) {
      // Do something when catch error
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
    wx.showNavigationBarLoading()
    var that = this
    that.setData({
      fresh: true,
      redeemRecord: []
    })
    try {
      var userInfo = wx.getStorageSync('USERINFO')
      if (userInfo) {
        // Do something with return value
        getRedeemRecord(that, userInfo.id)
      }
    } catch (e) {
      // Do something when catch error
    }
  }
})
