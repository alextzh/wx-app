const app = getApp()
var util = require("../../utils/util.js")
var page = 1
var rows = 10

// 获取赎回记录
var getRedeemRecord = function (that, id) {
  wx.request({
    url: app.api_url + '/api/v1/redeem/myRedeems',
    data: {
      page: page,
      rows: rows,
      customer_id: id
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
        that.setData({
          hasData: true
        })
        return false
      }
      var totalPage = res.data.obj.totalPage
      var list = res.data.obj.list
      for (let i = 0; i < list.length; i++) {
        list[i].redeem_time = util._normalizeDate(list[i].redeem_time)
        list[i].money = util.rendererZhMoneyWan(list[i].money)
      }
      that.setData({
        redeemRecord: that.data.redeemRecord.concat(list)
      })
      page++
      if (page > totalPage) {
        that.setData({
          hasMore: false
        })
      }
    },
    fail: function (e) {
      console.log(e)
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
    hasMore: true // 是否下拉加载
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    page = 1
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
    page = 1
    var that = this
    that.setData({
      fresh: true,
      hasMore: true,
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
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    var that = this
    if (!that.data.hasMore) {
      return false
    }
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
