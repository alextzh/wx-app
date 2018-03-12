const app = getApp()
const util = require('../../utils/util')
const i18n = require('../../utils/i18n')
const langData = require('../../utils/langData')

/**
 * 获取子产品列表
 * @param id 基本产品的Id(必选)
*/
var getSubProductList = function (that, customer_id, id) {
  wx.request({
    url: app.api_url + '/api/v1/product/listByBaseId',
    data: {
      base_product_id: id
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
      itemIsCanPurchase(that, customer_id, showArr[0].id)
    },
    fail: function (e) {
      console.log(e)
      util.toastMsg(i18n[that.data.lg].common.tip, i18n[that.data.lg].common.network, i18n[that.data.lg].common.confirm)
    }
  })
}
/**
 * 判断当前项目是否能申购
*/
function itemIsCanPurchase (that, customer_id, product_id) {
  if (that.data.currentProduct.status !== '申购中') {
    that.setData({
      isHidden: false
    })
  } else {
    wx.request({
      url: app.api_url + '/api/v1/subscribe/validate',
      data: {
        product_id: product_id,
        customer_id: customer_id
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      method: 'POST',
      success: function (res) {
        if (!res.data.ret) {
          that.setData({
            isHidden: false
          })
        } else {
          that.setData({
            isHidden: true
          })
        }
      },
      fail: function (e) {
        console.log(e)
        util.toastMsg(i18n[that.data.lg].common.tip, i18n[that.data.lg].common.network, i18n[that.data.lg].common.confirm)
      }
    })
  }
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
    isHidden: false,
    currentPlan: null,
    currentProduct: null,
    purchaseBtnLoading: false,
    purchaseDisabled: false,
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
        that.setData({
          currentProduct: value
        })
      }
      if (userInfo) {
        that.setData({
          cid: userInfo.id
        })
      }
      let customer_id = that.data.cid
      getSubProductList(that, customer_id, value.id)
    } catch(e) {
    }
  },
  onShow: function () {
    let lang = wx.getStorageSync('lang')
    wx.setNavigationBarTitle({
      title: i18n[lang].navigator.productDetail
    })
  },
  bindPickerChange: function (e) {
    var that = this
    that.setData({
      pickerIndex: e.detail.value,
      currentPlan: that.data.showArr[e.detail.value]
    })
    let product_id = that.data.showArr[e.detail.value].id
    let customer_id = that.data.cid
    itemIsCanPurchase(that, customer_id, product_id)
  },
  formSubmit: function (e) {
    var that = this
    var param = e.detail.value
    if (that.checkPurchase(param)) {
      wx.showModal({
        title: i18n[that.data.lg].common.tip,
        content: `${i18n[that.data.lg].purchase.tip6}${param.purchaseAmt}万份`,
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
  // 校验申购金额
  checkPurchase: function (param) {
    var amt = param.purchaseAmt
    var curPlan = this.data.currentPlan
    var min = parseInt(curPlan.min_money) / 10000
    var step = parseInt(curPlan.step_money) / 10000
    if (!amt) {
      util.toastMsg(i18n[this.data.lg].common.tip, i18n[this.data.lg].purchase.tip1, i18n[this.data.lg].common.confirm)
      return false
    } else if (amt < min) {
      wx.showModal({
        title: i18n[this.data.lg].common.tip,
        showCancel: false,
        content: `${i18n[this.data.lg].purchase.tip2}${min}万份`,
        confirmText: i18n[this.data.lg].common.confirm,
      })
      return false
    } else if (amt > 100000) {
      util.toastMsg(i18n[this.data.lg].common.tip, i18n[this.data.lg].purchase.tip3, i18n[this.data.lg].common.confirm)
      return false
    } else if (amt % step !== 0) {
      wx.showModal({
        title: i18n[this.data.lg].common.tip,
        showCancel: false,
        content: `${i18n[this.data.lg].purchase.tip4}${step}万份`,
        confirmText: i18n[this.data.lg].common.confirm,
      })
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
    wx.request({
      url: app.api_url + '/api/v1/subscribe/addApply',
      data: {
        product_id: product_id,
        customer_id: that.data.cid,
        source: 'wx_xcx',
        subscribe_money: purchaseAmt * 10000
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
