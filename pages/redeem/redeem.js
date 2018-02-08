const app = getApp()
var util = require("../../utils/util.js")

Page({
  data: {
    tabs: [ // 单选按钮数据
      { name: '全部赎回', value: 'all', checked: 'true' },
      { name: '部分赎回', value: 'part' }
    ],
    currentProduct: null,
    can_redeem_money: 0,
    hidden: true, // 显示哪页的标志
    redeemAllBtnTxt: '全部赎回', // 全部赎回和部分赎回按钮参数
    allBtnLoading: false,
    allDisabled: false,
    redeemPartBtnTxt: '部分赎回',
    partBtnLoading: false,
    partDisabled: false,
  },
  onLoad: function () {
    var that = this
    try {
      var value = wx.getStorageSync('CURPRODUCT')
      var userInfo = wx.getStorageSync('USERINFO')
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
  },
  onReady: function () {
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
        title: '提示',
        content: '您确认要赎回' + param.redeemAmt + '万份吗',
        success: function (res) {
          if (res.confirm) {
            that.mySubmit(param, 'all')
          } else if (res.cancel) {
            console.log('已取消')
          }
        }
      })
    } else {
      if (that.checkRedeem(param)) {
        wx.showModal({
          title: '提示',
          content: '您确认要赎回' + param.redeemAmt + '万份吗',
          success: function (res) {
            if (res.confirm) {
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
        redeemPartBtnTxt: "部分赎回中",
        partDisabled: true,
        partBtnLoading: true
      })
    } else {
      this.setData({
        redeemAllBtnTxt: "全部赎回中",
        allDisabled: !this.data.allDisabled,
        allBtnLoading: !this.data.allBtnLoading
      })
    }
  },
  setRedeemData2: function (bType) {
    if (bType === 'part') {
      this.setData({
        redeemPartBtnTxt: "部分赎回",
        partDisabled: false,
        partBtnLoading: false
      })
    } else {
      this.setData({
        redeemAllBtnTxt: "全部赎回",
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
      wx.showModal({
        title: '提示',
        showCancel: false,
        content: '请输入赎回份额'
      })
      return false
    } else if (amt < 1) {
      wx.showModal({
        title: '提示',
        showCancel: false,
        content: '最小赎回份额为1万份'
      })
      return false
    } else if (amt > max) {
      wx.showModal({
        title: '提示',
        showCancel: false,
        content: '赎回份额不能大于申购份额'
      })
      return false
    } else if (amt % 1 !== 0) {
      wx.showModal({
        title: '提示',
        showCancel: false,
        content: '赎回递增份额为1万份'
      })
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
          wx.showModal({
            title: '提示',
            showCancel: false,
            content: res.data.msg
          })
          that.setRedeemData2(bType)
          return false
        }
        that.setRedeemData1(bType)
        wx.showToast({
          title: '赎回申请已提交',
          icon: 'success',
          duration: 1500
        })
        setTimeout(() => {
          that.setRedeemData2(bType)
          wx.reLaunch({
            url: '../mine/mine'
          })
        }, 500)
      },
      fail: function (e) {
        console.log(e)
        util.toastMsg('提示', '网络异常')
      }
    })
  }
})