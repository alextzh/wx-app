const app = getApp()
const util = require('../../utils/util')
const i18n = require('../../utils/i18n')
const langData = require('../../utils/langData')

// 获取系统公告列表
var getNoticeList = function (that, id) {
  wx.request({
    url: app.api_url + '/api/v1/notice/all',
    data: {
      type_id: id
    },
    header: {
      'content-type': 'application/x-www-form-urlencoded'
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
        noticeList: res.data.obj,
        hasData: false
      })
      wx.hideLoading()
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
    
    var id = options.id
    if (id === 'PTGG') {
      wx.setNavigationBarTitle({
        title: i18n[lang].navigator.systemNotice
      })
    } else if (id === 'CPGG') {
      wx.setNavigationBarTitle({
        title: i18n[lang].navigator.productNotice
      })
    }
    that.setData({
      id: id
    })
    getNoticeList(that, id)
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

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    wx.showNavigationBarLoading()
    var that = this
    that.setData({
      fresh: true
    })
    getNoticeList(that, that.data.id)
  },
  toDetail: function (e) {
    if (!this.data.isFirstAction) {
      return false
    } else {
      this.setData({
        isFirstAction: false
      })
      try {
        wx.setStorageSync('CURNOTICE', e.currentTarget.dataset.item)
      } catch (e) {
      }
      wx.navigateTo({
        url: '../notice-detail/notice-detail'
      })
    }
  }
})