var util = require("../../utils/util.js")
const app = getApp()

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
  data: {
    showArr: [],
    pickerArr: [],
    pickerIndex: 0,
    currentPlan: null,
    currentProduct: null,
    modifyBtnTxt: '更改方案', // 修改方案按钮
    modifyBtnLoading: false,
    modifyDisabled: false,
  },
  onLoad: function () {
    var that = this
    try {
      var value = wx.getStorageSync('CURPRODUCT')
      var userInfo = wx.getStorageSync('USERINFO')
      if (value) {
        that.setData({
          currentProduct: value
        })
      }
      getSubProductList(that, value.base_id)
    } catch (e) {
    }
  },
  onReady: function () {
    // 页面渲染完成
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
        title: '提示',
        content: `您确认要更改方案为${curPlan.name}${param.purchaseAmt}万份吗`,
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
    var oldName = this.data.currentProduct.product_name
    var newName = curPlan.name
    var min = curPlan.min_money / 10000
    var max = this.data.currentProduct.subscribe_money / 10000
    var step = curPlan.step_money / 10000
    if (newName === oldName) {
      wx.showModal({
        title: '提示',
        showCancel: false,
        content: '请选择其他方案'
      })
      return false
    } else if (!amt) {
      wx.showModal({
        title: '提示',
        showCancel: false,
        content: '请输入更改份额'
      })
      return false
    } else if (amt < min) {
      wx.showModal({
        title: '提示',
        showCancel: false,
        content: '最小更改份额为' + min + '万份'
      })
      return false
    } else if (amt > max) {
      wx.showModal({
        title: '提示',
        showCancel: false,
        content: '更改份额不能大于申购份额'
      })
      return false
    } else if (amt % step !== 0) {
      wx.showModal({
        title: '提示',
        showCancel: false,
        content: '更改递增份额为' + step + '万份'
      })
      return false
    } else {
      return true
    }
  },
  setRedeemData1: function () {
    this.setData({
      modifyBtnTxt: "更改方案中",
      modifyDisabled: true,
      modifyBtnLoading: true
    })
  },
  setRedeemData2: function () {
    this.setData({
      modifyBtnTxt: "更改方案",
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
          wx.showModal({
            title: '提示',
            showCancel: false,
            content: res.data.msg
          })
          that.setRedeemData2()
          return false
        }
        wx.showToast({
          title: '方案修改已提交',
          icon: 'success',
          duration: 1500
        })
        setTimeout(() => {
          that.setRedeemData2()
          wx.reLaunch({
            url: '../mine/mine'
          })
        }, 500)
      },
      fail: function (e) {
        console.log(e)
        util.toastMsg('提示', '网络异常')
        that.setRedeemData2()
      }
    })
  }
})
