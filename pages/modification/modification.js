const app = getApp()
const util = require('../../utils/util')
const i18n = require('../../utils/i18n')
const langData = require('../../utils/langData')

/**
 * 获取子产品列表
 * @param id 基本产品的Id(必选)
*/
var getSubProductList = function (that, baseid) {
  wx.request({
    url: app.api_url + '/api/v1/product/listByBaseId',
    data: {
      base_product_id: baseid
    },
    header: {
      'content-type': 'application/x-www-form-urlencoded'
    },
    method: 'POST',
    success: function (res) {
      var list = res.data.obj.list.reverse()
      var pickerArr = []
      var showArr = list
      if (showArr) {
        showArr.forEach((e) => {
          e.settlement_time = _normalizeStr(e.settlement_time)
          pickerArr.push(e.name)
        })
        that.setData({
          pickerArr: pickerArr,
          showArr: showArr,
          currentPlan: showArr[0]
        })
      }
    },
    fail: function (e) {
      console.log(e)
      util.toastMsg(i18n[that.data.lg].common.tip, i18n[that.data.lg].common.network, i18n[that.data.lg].common.confirm)
    }
  })
}
/**
 * 字符串转数组
*/
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
    currentProduct: null,
    modifyBtnLoading: false,
    modifyDisabled: false,
  }),
  onLoad: function () {
    util.resetSetData.call(this, langData)
    var that = this
    try {
      var value = wx.getStorageSync('CURPRODUCT')
      var lang = wx.getStorageSync('lang')
      if (lang) {
        that.setData({
          lg: lang
        })
      }
      if (value) {
        that.setData({
          currentProduct: value
        })
      }
      getSubProductList(that, value.base_id)
    } catch (e) {
    }
  },
  onShow: function () {
    let lang = wx.getStorageSync('lang')
    wx.setNavigationBarTitle({
      title: i18n[lang].navigator.modifyPlan
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
    var curPlan = that.data.currentPlan
    if (that.checkModification(param)) {
      wx.showModal({
        title: i18n[that.data.lg].common.tip,
        content: `${i18n[that.data.lg].modifyPlan.tip5}${curPlan.name}${param.purchaseAmt}万份?`,
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
  // 校验是否选择了当前方案 更改方案不能选择原方案
  checkModification: function (param) {
    var amt = param.purchaseAmt
    var curPlan = this.data.currentPlan
    var min = curPlan.min_money / 10000
    var max = this.data.currentProduct.subscribe_money / 10000
    var step = curPlan.step_money / 10000
    if (!amt) {
      util.toastMsg(i18n[this.data.lg].common.tip, i18n[this.data.lg].modifyPlan.tip1, i18n[this.data.lg].common.confirm)
      return false
    } else if (amt < min) {
      wx.showModal({
        title: i18n[this.data.lg].common.tip,
        showCancel: false,
        content: `${i18n[this.data.lg].modifyPlan.tip2}${min}万份`,
        confirmText: i18n[this.data.lg].common.confirm
      })
      return false
    } else if (amt > max) {
      util.toastMsg(i18n[this.data.lg].common.tip, i18n[this.data.lg].modifyPlan.tip3, i18n[this.data.lg].common.confirm)
      return false
    } else if (amt % step !== 0) {
      wx.showModal({
        title: i18n[this.data.lg].common.tip,
        showCancel: false,
        content: `${i18n[this.data.lg].modifyPlan.tip4}${step}万份`,
        confirmText: i18n[this.data.lg].common.confirm
      })
      return false
    } else {
      return true
    }
  },
  setRedeemData1: function () {
    this.setData({
      modifyDisabled: true,
      modifyBtnLoading: true
    })
  },
  setRedeemData2: function () {
    this.setData({
      modifyDisabled: false,
      modifyBtnLoading: false
    })
  },
  mySubmit: function (param) {
    var that = this
    var subscribe_id = that.data.currentProduct.id
    var target_product_id = that.data.currentPlan.id
    var purchaseAmt = parseInt(param.purchaseAmt)
    wx.request({
      url: app.api_url + '/api/v1/subscribe/editFA',
      data: {
        subscribe_id: subscribe_id,
        target_product_id: target_product_id,
        eidt_money: purchaseAmt * 10000
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded'
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
