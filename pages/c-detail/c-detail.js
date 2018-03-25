const app = getApp()
var util = require("../../utils/util.js")

Page({
  data: {
    currentProduct: null,
    purchaseBtnTxt: '申购', // 申购按钮
    purchaseBtnLoading: false,
    purchaseDisabled: false,
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
      if (userInfo) {
        that.setData({
          cid: userInfo.id
        })
      }
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
    let product_id = that.data.showArr[e.detail.value].id
    let customer_id = that.data.cid
    itemIsCanPurchase(that, customer_id, product_id)
  },
  formSubmit: function (e) {
    var that = this
    var param = e.detail.value
    if (that.checkPurchase(param)) {
      wx.showModal({
        title: '提示',
        content: '您确认要申购当前产品' + param.purchaseAmt + '个吗',
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
  // 校验申购数量
  checkPurchase: function (param) {
    var amt = param.purchaseAmt
    if (!amt) {
      wx.showModal({
        title: '提示',
        showCancel: false,
        content: '请输入申购数量'
      })
      return false
    } else if (amt < 1) {
      wx.showModal({
        title: '提示',
        showCancel: false,
        content: '最小申购数量为1个'
      })
      return false
    } else if (amt % 1 !== 0) {
      wx.showModal({
        title: '提示',
        showCancel: false,
        content: '申购递增数量为1个'
      })
      return false
    } else {
      return true
    }
  },
  setRedeemData1: function () {
    this.setData({
      purchaseBtnTxt: "申购中",
      purchaseDisabled: true,
      purchaseBtnLoading: true
    })
  },
  setRedeemData2: function () {
    this.setData({
      purchaseBtnTxt: "申购",
      purchaseDisabled: false,
      purchaseBtnLoading: false
    })
  },
  mySubmit: function (param) {
    var that = this
    var customer_id = that.data.cid
    var product_id = wx.getStorageSync('CURPRODUCT').id
    var purchaseAmt = parseInt(param.purchaseAmt)
    wx.request({
      url: app.api_url + '/api/v1/test/product/addSub',
      data: {
        product_id: product_id,
        customer_id: that.data.cid,
        sub_number: purchaseAmt
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        time_stamp: util.getBJDate().getTime(),
        secret_key: util.getMd5()
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
          title: '申购申请已提交',
          icon: 'success',
          duration: 1500
        })
        setTimeout(() => {
          that.setRedeemData2()
          wx.reLaunch({
            url: '../c-mine/c-mine'
          })
        }, 500)
      },
      fail: function (e) {
        util.toastMsg('提示', '网络异常')
      }
    })
  }
})
