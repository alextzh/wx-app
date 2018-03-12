const app = getApp()
const util = require('../../utils/util')
const i18n = require('../../utils/i18n')
const langData = require('../../utils/langData')
function initTabs(that) {
  return [
    { name: i18n[that.data.lg].redeem.redeemAllBtnTxt, value: 'all', checked: 'true' },
    { name: i18n[that.data.lg].redeem.redeemPartBtnTxt, value: 'part' }
  ]
}

Page({
  data: Object.assign({}, langData.data, {
    tabs: [],
    currentProduct: null,
    can_redeem_money: 0,
    hidden: true, // 显示哪页的标志
    allBtnLoading: false,
    allDisabled: false,
    partBtnLoading: false,
    partDisabled: false,
  }),
  onLoad: function () {
    util.resetSetData.call(this, langData)
    var that = this
    try {
      var value = wx.getStorageSync('CURPRODUCT')
      var userInfo = wx.getStorageSync('USERINFO')
      var lang = wx.getStorageSync('lang')
      if (lang) {
        that.setData({
          lg: lang
        })
      }
      if (value) {
        // Do something with return value
        that.setData({
          currentProduct: value,
          can_redeem_money: parseInt(value.subscribe_money) - parseInt(value.min_money) / 10000
        })
      }
      if (userInfo) {
        that.setData({
          cid: userInfo.id
        })
      }
    } catch (e) {
      // Do something when catch error
    }
    that.setData({
      tabs: initTabs(that)
    })
  },
  onShow: function () {
    let lang = wx.getStorageSync('lang')
    wx.setNavigationBarTitle({
      title: i18n[lang].navigator.applyRedeem
    })
  },
  radioChange: function (e) {
    var that = this
    var val = e.detail.value
    if (val === 'part') {
      that.setData({
        hidden: false
      })
    } else {
      that.setData({
        hidden: true
      })
    }
  },
  // 提交赎回
  formSubmit: function (e) {
    var that = this
    var param = e.detail.value
    if (that.data.hidden) {
      wx.showModal({
        title: i18n[that.data.lg].common.tip,
        content: `${i18n[that.data.lg].redeem.tip5}${param.redeemAmt}万份?`,
        confirmText: i18n[that.data.lg].common.confirm,
        success: function (res) {
          if (res.confirm) {
            that.setRedeemData1('all')
            that.mySubmit(param, 'all')
          } else if (res.cancel) {
            console.log('已取消')
          }
        }
      })
    } else {
      if (that.checkRedeem(param)) {
        wx.showModal({
          title: i18n[that.data.lg].common.tip,
          content: `${i18n[that.data.lg].redeem.tip5}${param.redeemAmt}万份?`,
          confirmText: i18n[that.data.lg].common.confirm,
          success: function (res) {
            if (res.confirm) {
              that.setRedeemData1('part')
              that.mySubmit(param, 'part')
            } else if (res.cancel) {
              console.log('已取消')
            }
          }
        })
      }
    }
  },
  setRedeemData1: function (bType) {
    if (bType === 'part') {
      this.setData({
        partDisabled: true,
        partBtnLoading: true
      })
    } else {
      this.setData({
        allDisabled: !this.data.allDisabled,
        allBtnLoading: !this.data.allBtnLoading
      })
    }
  },
  setRedeemData2: function (bType) {
    if (bType === 'part') {
      this.setData({
        partDisabled: false,
        partBtnLoading: false
      })
    } else {
      this.setData({
        allDisabled: !this.data.allDisabled,
        allBtnLoading: !this.data.allBtnLoading
      })
    }
  },
  // 校验赎回金额
  checkRedeem: function (param) {
    var amt = param.redeemAmt
    var max = this.data.currentProduct.subscribe_money
    if (!amt) {
      util.toastMsg(i18n[this.data.lg].common.tip, i18n[this.data.lg].redeem.tip1, i18n[this.data.lg].common.confirm)
      return false
    } else if (amt < 1) {
      util.toastMsg(i18n[this.data.lg].common.tip, i18n[this.data.lg].redeem.tip3, i18n[this.data.lg].common.confirm)
      return false
    } else if (amt > max) {
      util.toastMsg(i18n[this.data.lg].common.tip, i18n[this.data.lg].redeem.rule.two, i18n[this.data.lg].common.confirm)
      return false
    } else if (amt % 1 !== 0) {
      util.toastMsg(i18n[this.data.lg].common.tip, i18n[this.data.lg].redeem.tip4, i18n[this.data.lg].common.confirm)
      return false
    } else {
      return true
    }
  },
  mySubmit: function (param, bType) {
    var that = this
    var redeemAmt = parseInt(param.redeemAmt)
    wx.request({
      url: app.api_url + '/api/v1/redeem/addRedeem',
      data: {
        subscribe_id: that.data.currentProduct.subscribe_id,
        customer_id: that.data.cid,
        redeem_money: redeemAmt * 10000
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      method: 'POST',
      success: function (res) {
        if (!res.data.ret) {
          util.toastMsg(i18n[that.data.lg].common.tip, res.data.msg, i18n[that.data.lg].common.confirm)
          that.setRedeemData2(bType)
          return false
        }
        wx.showToast({
          title: res.data.msg,
          icon: 'success',
          duration: 1500
        })
        setTimeout(() => {
          that.setRedeemData2(bType)
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