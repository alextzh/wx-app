const app = getApp()
const util = require('../../utils/util')
const i18n = require('../../utils/i18n')
const langData = require('../../utils/langData')

/**
 * 获取充值渠道列表
*/
var getSubProductList = function (that, id) {
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
  /**
   * 页面的初始数据
   */
  data: Object.assign({}, langData.data, {
    currentProduct: null,
    showArr: [],
    pickerArr: [],
    pickerIndex: 0,
    currentPlan: null,
    btnLoading: false,
    btnDisabled: false,
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
    let value = wx.getStorageSync('CURPRODUCT')
    if (value) {
      that.setData({
        currentProduct: value
      })
    }
    getSubProductList(that, value.base_product_id)
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let lang = wx.getStorageSync('lang')
    wx.setNavigationBarTitle({
      title: i18n[lang].navigator.applyAdd
    })
  },
  // picker改变事件
  bindPickerChange: function (e) {
    var that = this
    that.setData({
      pickerIndex: e.detail.value,
      currentPlan: that.data.showArr[e.detail.value]
    })
  },
  // 提交追加
  formSubmit: function (e) {
    var that = this
    var param = e.detail.value
    var planName = that.data.currentPlan.name
    if (that.checkSubscribe(param)) {
      wx.showModal({
        title: i18n[that.data.lg].common.tip,
        content: `${i18n[that.data.lg].addApply.tip5}${planName}${i18n[that.data.lg].addApply.tip6}${param.subscribeAmt}万份`,
        confirmText: i18n[that.data.lg].common.confirm,
        success: function (res) {
          if (res.confirm) {
            that.setSubscribeData1()
            that.mySubmit(param)
          } else if (res.cancel) {
            console.log('已取消')
          }
        }
      })
    }
  },
  setSubscribeData1: function () {
    this.setData({
      btnDisabled: !this.data.btnDisabled,
      btnLoading: !this.data.btnLoading
    })
  },
  setSubscribeData2: function () {
    this.setData({
      btnDisabled: !this.data.btnDisabled,
      btnLoading: !this.data.btnLoading
    })
  },
  // 校验追加份额
  checkSubscribe: function (param) {
    var amt = param.subscribeAmt
    if (!amt) {
      util.toastMsg(i18n[this.data.lg].common.tip, i18n[this.data.lg].addApply.tip1, i18n[this.data.lg].common.confirm)
      return false
    } else if (amt < 1) {
      util.toastMsg(i18n[this.data.lg].common.tip, i18n[this.data.lg].addApply.tip2, i18n[this.data.lg].common.confirm)
      return false
    } else if (amt > 100000) {
      util.toastMsg(i18n[this.data.lg].common.tip, i18n[this.data.lg].addApply.tip3, i18n[this.data.lg].common.confirm)
      return false
    } else if (amt % 1 !== 0) {
      util.toastMsg(i18n[this.data.lg].common.tip, i18n[this.data.lg].addApply.tip4, i18n[this.data.lg].common.confirm)
      return false
    } else {
      return true
    }
  },
  mySubmit: function (param) {
    var that = this
    var subscribeAmt = parseInt(param.subscribeAmt)
    let customer_id = wx.getStorageSync('USERINFO').id
    let product_id = that.data.currentPlan.id
    wx.request({
      url: app.api_url + '/api/v1/subscribe/addRecast',
      data: {
        product_id: product_id,
        customer_id: customer_id,
        money: subscribeAmt * 10000
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded'
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
        that.setSubscribeData2()
      }
    })
  }
})
