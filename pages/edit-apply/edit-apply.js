const app = getApp()
const util = require('../../utils/util')
const i18n = require('../../utils/i18n')
const langData = require('../../utils/langData')

Page({
  /**
   * 页面的初始数据
   */
  data: Object.assign({}, langData.data, {
    currentProduct: null,
    btnLoading: false,
    btnDisabled: false,
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
    let value = wx.getStorageSync('CURPRODUCT')
    if (value) {
      that.setData({
        currentProduct: value
      })
    }
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var that = this
    wx.setNavigationBarTitle({
      title: i18n[that.data.lg].navigator.modifyPurchase
    })
  },
  // 提交修改申购
  formSubmit: function (e) {
    var that = this
    var param = e.detail.value
    if (that.checkSubscribe(param)) {
      wx.showModal({
        title: i18n[that.data.lg].common.tip,
        content: `${i18n[that.data.lg].purchase.tip8}${param.subscribeAmt}万份`,
        confirmText: i18n[that.data.lg].common.confirm,
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
          util.toastMsg(i18n[that.data.lg].common.tip, i18n[that.data.lg].common.network, i18n[that.data.lg].common.confirm)
        }
      })
    }
  },
  setSubscribeData1: function () {
    this.setData({
      btnDisabled: true,
      btnLoading: true
    })
  },
  setSubscribeData2: function () {
    this.setData({
      btnDisabled: false,
      btnLoading: false
    })
  },
  // 校验申购金额
  checkSubscribe: function (param) {
    var amt = param.subscribeAmt
    var min = this.data.currentProduct.min_money / 10000
    if (!amt) {
      util.toastMsg(i18n[this.data.lg].common.tip, i18n[this.data.lg].purchase.tip1, i18n[this.data.lg].common.confirm)
      return false
    } else if (amt < min) {
      wx.showModal({
        title: i18n[this.data.lg].common.tip,
        showCancel: false,
        content: `${i18n[this.data.lg].purchase.tip2}${min}万份`,
        confirmText: i18n[this.data.lg].common.confirm
      })
      return false
    } else if (amt > 100000) {
      util.toastMsg(i18n[this.data.lg].common.tip, i18n[this.data.lg].purchase.tip3, i18n[this.data.lg].common.confirm)
      return false
    } else if (amt % 1 !== 0) {
      util.toastMsg(i18n[this.data.lg].common.tip, i18n[this.data.lg].purchase.tip7, i18n[this.data.lg].common.confirm)
      return false
    } else {
      return true
    }
  },
  mySubmit: function (param) {
    var that = this
    var subscribeAmt = parseInt(param.subscribeAmt)
    let custom = wx.getStorageSync('USERINFO')
    let subscribe_id = that.data.currentProduct.subscribe_id
    const time_stamp = util.getBJDate()
    const secret_key = util.getMd5()
    wx.request({
      url: app.api_url + '/api/v1/subscribe/editApply',
      data: {
        customer_id: custom.id,
        subscribe_id: subscribe_id,
        subscribe_money: subscribeAmt * 10000
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        time_stamp: time_stamp,
        secret_key: secret_key
      },
      method: 'POST',
      success: function (res) {
        if (!res.data.ret) {
          util.toastMsg(i18n[that.data.lg].common.tip, res.data.msg, i18n[that.data.lg].common.confirm)
          that.setSubscribeData2()
          return false
        }
        wx.showToast({
          title: res.data.msg,
          icon: 'success',
          duration: 1500
        })
        setTimeout(() => {
          that.setSubscribeData2()
          wx.reLaunch({
            url: '../mine/mine?lg=' + that.data.lg
          })
        }, 500)
      },
      fail: function (e) {
        console.log(e)
        util.toastMsg(i18n[that.data.lg].common.tip, i18n[that.data.lg].common.network, i18n[that.data.lg].common.confirm)
      }
    })
  }
})