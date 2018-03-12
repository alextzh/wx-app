const util = require('../../utils/util')
const i18n = require('../../utils/i18n')
const langData = require('../../utils/langData')

Page({

  /**
   * 页面的初始数据
   */
  data: Object.assign({}, langData.data, {
    curNotice: null
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
    try {
      var value = wx.getStorageSync('CURNOTICE')
      if (value) {
        that.setData({
          curNotice: value
        })
      }
    } catch (e) {
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let lang = wx.getStorageSync('lang')
    wx.setNavigationBarTitle({
      title: i18n[lang].navigator.noticeDetail
    })
  }
})