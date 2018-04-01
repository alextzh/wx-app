const app = getApp()
const util = require('../../utils/util')
const i18n = require('../../utils/i18n')
const langData = require('../../utils/langData')

// var timer = null

/**
 * 获取申请划款可以选择的项目
 * @param 无参数
*/
var getSubProductList = function (that) {
  wx.request({
    url: app.api_url + '/api/v1/deduct/productList',
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
      var list = res.data.obj.reverse()
      var pickerArr = []
      var showArr = list
      if (showArr && showArr.length >= 1) {
        showArr.forEach((e) => {
          e.settlement_time = _normalizeStr(e.settlement_time)
          pickerArr.push(e.name)
        })
        that.setData({
          pickerArr: pickerArr,
          showArr: showArr,
          currentPlan: showArr[0],
          hasData: false
        })
      }
    },
    fail: function (e) {
      console.log(e)
      util.toastMsg(i18n[that.data.lg].common.tip, i18n[that.data.lg].common.network, i18n[that.data.lg].common.confirm)
    }
  })
}

function _normalizeStr(str) {
  str = str || ''
  let arr = str.split(',')
  let newArr = arr.map(item => {
    return item
  })
  return newArr
}

Page({
  data: Object.assign({}, langData.data, {
    showArr: [],
    pickerArr: [],
    pickerIndex: 0,
    currentPlan: null,
    purchaseBtnLoading: false,
    purchaseDisabled: false,
    hasData: false,
    describe: '',
    channelsArr: [{ type: 'VIP', label: 'VIP账户', value: 0 }, { type: 'YHKZC', label: '银行卡转账', value: 1 }],
    channelArr: ['VIP账户', '银行卡转账'],
    channelIndex: 0,
    currentChannel: null
  }),
  onLoad: function () {
    var that = this
    util.resetSetData.call(that, langData)
    var userInfo = wx.getStorageSync('USERINFO')
    var lang = wx.getStorageSync('lang')
    if (lang) {
      that.setData({
        lg: lang
      })
    }
    if (userInfo) {
      that.setData({
        cid: userInfo.id,
        currentChannel: that.data.channelsArr[0]
      })
    }
    getSubProductList(that)
    // that.isTransfer()
  },
  onShow: function () {
    var that = this
    wx.setNavigationBarTitle({
      title: i18n[that.data.lg].navigator.transferApply
    })
    // timer = setInterval(() => {
    //   this.isTransfer()
    // }, 1000)
  },
  /**
   * 生命周期函数--监听页面卸载
   */
  // onUnload: function () {
  //   clearInterval(timer)
  // },
  // 判断当前时间是否可以申请划款
  // isTransfer: function () {
  //   if (util.time_range('09:00', '17:30')) {
  //     this.setData({
  //       purchaseDisabled: false
  //     })
  //   } else {
  //     this.setData({
  //       purchaseDisabled: true
  //     })
  //   }
  // },
  bindChannelChange: function (e) {
    var that = this
    that.setData({
      channelIndex: e.detail.value,
      currentChannel: that.data.channelsArr[e.detail.value]
    })
  },
  bindPickerChange: function (e) {
    var that = this
    that.setData({
      pickerIndex: e.detail.value,
      currentPlan: that.data.showArr[e.detail.value]
    })
  },
  formSubmit: function (e) {
    var that = this
    var param = e.detail.value
    if (that.checkPurchase(param)) {
      wx.showModal({
        title: i18n[that.data.lg].common.tip,
        content: `${i18n[that.data.lg].purchase.tip12}${param.purchaseAmt}${i18n[that.data.lg].purchase.tip13}`,
        confirmText: i18n[that.data.lg].common.confirm,
        success: function (res) {
          if (res.confirm) {
            that.setRedeemData1()
            that.mySubmit(param)
          } else if (res.cancel) {
            console.log('已取消')
          }
        }
      })
    }
  },
  // 校验划款份额
  checkPurchase: function (param) {
    var amt = param.purchaseAmt
    if (!amt) {
      util.toastMsg(i18n[this.data.lg].common.tip, i18n[this.data.lg].purchase.tip9, i18n[this.data.lg].common.confirm)
      return false
    } else if (amt < 10000) {
      util.toastMsg(i18n[this.data.lg].common.tip, i18n[this.data.lg].purchase.tip17, i18n[this.data.lg].common.confirm)
      return false
    } else if (amt > 1000000000) {
      util.toastMsg(i18n[this.data.lg].common.tip, i18n[this.data.lg].purchase.tip11, i18n[this.data.lg].common.confirm)
      return false
    } else if (amt % 1 !== 0) {
      util.toastMsg(i18n[this.data.lg].common.tip, i18n[this.data.lg].purchase.tip10, i18n[this.data.lg].common.confirm)
      return false
    } else {
      return true
    }
  },
  setRedeemData1: function () {
    this.setData({
      purchaseDisabled: true,
      purchaseBtnLoading: true
    })
  },
  setRedeemData2: function () {
    this.setData({
      purchaseDisabled: false,
      purchaseBtnLoading: false
    })
  },
  mySubmit: function (param) {
    var that = this
    var product_id = that.data.currentPlan.id
    var purchaseAmt = parseInt(param.purchaseAmt)
    var describe = param.describe
    var channel = that.data.currentChannel.type
    wx.request({
      url: app.api_url + '/api/v1/deduct/apply',
      data: {
        product_id: product_id,
        customer_id: that.data.cid,
        deduct_money: purchaseAmt,
        describe: describe,
        channel: channel
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
          that.setRedeemData2()
          return false
        }
        wx.showToast({
          title: res.data.msg,
          icon: 'success',
          duration: 1500
        })
        setTimeout(() => {
          that.setRedeemData2()
          wx.reLaunch({
            url: '../mine/mine?lg=' + that.data.lg
          })
        }, 500)
      },
      fail: function (e) {
        console.log(e)
        util.toastMsg(i18n[that.data.lg].common.tip, i18n[that.data.lg].common.network, i18n[that.data.lg].common.confirm)
        that.setRedeemData2()
      }
    })
  }
})
