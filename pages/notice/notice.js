const app = getApp()
const util = require('../../utils/util')
const i18n = require('../../utils/i18n')
const langData = require('../../utils/langData')

// 获取系统公告列表
var getNoticeList = function (that) {
  const time_stamp = util.getBJDate()
  const secret_key = util.getMd5()
  wx.request({
    url: app.api_url + '/api/v1/notice/caption',
    header: {
      'content-type': 'application/x-www-form-urlencoded',
      time_stamp: time_stamp,
      secret_key: secret_key
    },
    method: 'POST',
    success: function (res) {
      if (!res.data.ret) {
        util.toastMsg(i18n[that.data.lg].common.tip, res.data.msg, i18n[that.data.lg].common.confirm)
        that.setData({
          hasData: true
        })
        return false
      }
      that.setData({
        noticeList: res.data.rows,
        hasData: false
      })
    },
    fail: function (e) {
      console.log(e)
      util.toastMsg(i18n[that.data.lg].common.tip, i18n[that.data.lg].common.network, i18n[that.data.lg].common.confirm)
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
  data: Object.assign({}, langData.data, {
    noticeList: [],
    hasData: false, // 是否有数据
    fresh: false, // 下拉刷新标志
    isFirstAction: true
  }),

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    util.resetSetData.call(that, langData)
    var lang = wx.getStorageSync('lang')
    if (lang) {
      that.setData({
        lg: lang
      })
    }
    wx.showLoading({
      title: i18n[that.data.lg].common.loading
    })
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
    wx.setNavigationBarTitle({
      title: i18n[that.data.lg].navigator.notice
    })
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    wx.showNavigationBarLoading()
    var that = this
    that.setData({
      fresh: true
    })
    getNoticeList(that)
  },
  toItem: function (e) {
    if (!this.data.isFirstAction) {
      return false
    } else {
      this.setData({
        isFirstAction: false
      })
      let id = e.currentTarget.dataset.item
      wx.navigateTo({
        url: '../notice-item/notice-item?id='+ id
      })
    }
  }
})