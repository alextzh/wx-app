const app = getApp()
const util = require('../../utils/util')
const i18n = require('../../utils/i18n')
const langData = require('../../utils/langData')

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
      'content-type': 'application/x-www-form-urlencoded',
      time_stamp: util.getBJDate().getTime(),
      secret_key: util.getMd5()
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
      var totalPage = res.data.obj.totalPage
      var list = res.data.obj.list
      for (let i = 0; i < list.length; i++) {
        list[i].redeem_time = util._normalizeDate(list[i].redeem_time)
        list[i].money = util.rendererZhMoneyWan(list[i].money)
      }
      that.setData({
        redeemRecord: that.data.redeemRecord.concat(list),
        hasData: false
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
    redeemRecord: [],
    fresh: false, // 上拉刷新标志
    hasData: false, // 是否有数据
    hasMore: true // 是否下拉加载
  }),
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    util.resetSetData.call(this, langData)
    page = 1
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
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let lang = wx.getStorageSync('lang')
    wx.setNavigationBarTitle({
      title: i18n[lang].navigator.redeemRecord
    })
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
  },
  cancelAction: function (e) {
    let redeem_id = e.currentTarget.dataset.redeemid
    wx.showModal({
      title: i18n[this.data.lg].common.tip,
      content: i18n[this.data.lg].redeemRecord.tip1,
      confirmText: i18n[this.data.lg].common.confirm,
      success: function (res) {
        if (res.confirm) {
          wx.request({
            url: app.api_url + '/api/v1/redeem/qxApply',
            data: {
              redeem_id: redeem_id
            },
            header: {
              'content-type': 'application/x-www-form-urlencoded',
              time_stamp: util.getBJDate().getTime(),
              secret_key: util.getMd5()
            },
            method: 'POST',
            success: function (res) {
              if (!res.data.ret) {
                util.toastMsg(i18n[this.data.lg].common.tip, res.data.msg, i18n[this.data.lg].common.confirm)
                return false
              }
              wx.showToast({
                title: res.data.msg,
                icon: 'success',
                duration: 1500
              })
              let lg = wx.getStorageSync('lang')
              wx.reLaunch({
                url: '../mine/mine?lg=' + lg
              })
            },
            fail: function (e) {
              console.log(e)
              util.toastMsg(i18n[this.data.lg].common.tip, i18n[this.data.lg].common.network, i18n[this.data.lg].common.confirm)
            }
          })
        } else if (res.cancel) {
          console.log('已取消')
        }
      }
    })
  }
})
