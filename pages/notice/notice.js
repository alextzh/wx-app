const app = getApp()
const util = require('../../utils/util')
const i18n = require('../../utils/i18n')
const langData = require('../../utils/langData')

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
        util.toastMsg(i18n[that.data.lg].common.tip, res.data.msg, i18n[that.data.lg].common.confirm)
        return false
      }
      that.setData({
        noticeList: res.data.rows
      })
      wx.hideLoading()
    },
    fail: function (e) {
      console.log(e)
      util.toastMsg(i18n[that.data.lg].common.tip, i18n[that.data.lg].common.network, i18n[that.data.lg].common.confirm)
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
  data: Object.assign({}, langData.data, {
    noticeList: [],
    isFirstAction: true
  }),

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    util.resetSetData.call(this, langData)
    var that = this
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
    let lang = wx.getStorageSync('lang')
    wx.setNavigationBarTitle({
      title: i18n[lang].navigator.notice
    })
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