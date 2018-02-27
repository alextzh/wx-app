var util = require("../../utils/util.js")
const app = getApp()

// 获取系统公告列表
var getNoticeList = function (that) {
  wx.request({
    url: app.api_url + '/api/v1/notice/caption',
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
        return false
      }
      that.setData({
        noticeList: res.data.rows
      })
      wx.hideLoading()
    },
    fail: function (e) {
      console.log(e)
      util.toastMsg('提示', '网络异常')
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
    noticeList: [],
    isFirstAction: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '加载中',
    })
    var that = this
    getNoticeList(that)
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var that = this
    that.setData({
      isFirstAction: true
    })
  },
  toItem: function (e) {
    if (!this.data.isFirstAction) {
      return false
    } else {
      this.setData({
        isFirstAction: false
      })
      let id = e.currentTarget.dataset.item.id
      wx.navigateTo({
        url: '../notice-item/notice-item?id='+ id
      })
    }
  }
})