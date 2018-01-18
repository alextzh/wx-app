const app = getApp()
var util = require('../../utils/util.js')

/**
 * 获取充值渠道列表
*/
var getRechargeChannel = function (that) {
  wx.request({
    url: app.api_url + '/api/v1/subscribe/czqd',
    method: 'GET',
    success: function (res) {
      if (!res.data) {
        return false
      }
      console.log(res.data)
      var pickerArr = []
      var showArr = res.data
      showArr.forEach(e => {
        pickerArr.push(e.text)
      })
      that.setData({
        showArr: showArr,
        pickerArr: pickerArr,
        currentChannel: showArr[0]
      })
    },
    fail: function (e) {
      console.log(e)
    }
  })
}

Page({
  /**
   * 页面的初始数据
   */
  data: {
    currentProduct: null,
    showArr: [],
    pickerArr: [],
    pickerIndex: 0,
    currentChannel: null,
    subscribeBtnTxt: '追加申购', // 提交修改按钮参数
    btnLoading: false,
    btnDisabled: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    let value = wx.getStorageSync('CURPRODUCT')
    if (value) {
      that.setData({
        currentProduct: value
      })
    }
    getRechargeChannel(that)
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  // picker改变事件
  bindPickerChange: function (e) {
    var that = this
    that.setData({
      pickerIndex: e.detail.value,
      currentChannel: that.data.showArr[e.detail.value]
    })
  },
  // 提交赎回
  formSubmit: function (e) {
    var that = this
    var param = e.detail.value
    if (that.checkSubscribe(param)) {
      wx.showModal({
        title: '提示',
        content: '您确认要追加申购份额' + param.subscribeAmt + '万份吗',
        success: function (res) {
          if (res.confirm) {
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
      subscribeBtnTxt: "追加申购中",
      btnDisabled: !this.data.btnDisabled,
      btnLoading: !this.data.btnLoading
    })
  },
  setSubscribeData2: function () {
    this.setData({
      subscribeBtnTxt: "追加申购",
      btnDisabled: !this.data.btnDisabled,
      btnLoading: !this.data.btnLoading
    })
  },
  // 校验赎回金额
  checkSubscribe: function (param) {
    var amt = parseInt(param.subscribeAmt)
    if (!amt) {
      wx.showModal({
        title: '提示',
        showCancel: false,
        content: '请输入追加申购份额'
      })
      return false
    } else if (amt < 1) {
      wx.showModal({
        title: '提示',
        showCancel: false,
        content: '最小申购份额为1万份'
      })
      return false
    } else if (amt > 10000) {
      wx.showModal({
        title: '提示',
        showCancel: false,
        content: '最大申购份额为10000万份'
      })
      return false
    } else if (amt % 1 !== 0) {
      wx.showModal({
        title: '提示',
        showCancel: false,
        content: '申购递增份额为1万份'
      })
      return false
    } else {
      return true
    }
  },
  mySubmit: function (param) {
    var that = this
    var subscribeAmt = parseInt(param.subscribeAmt)
    let subscribe_id = that.data.currentProduct.subscribe_id
    let product_id = that.data.currentProduct.product_id
    let currentChannel = that.data.currentChannel.id
    wx.request({
      url: app.api_url + '/api/v1/subscribe/addAccount',
      data: {
        product_id: product_id,
        subscribe_id: subscribe_id,
        money_of_account: subscribeAmt * 10000,
        channel: currentChannel,
        source: 'wx_xcx'
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
          that.setSubscribeData2()
          return false
        }
        that.setSubscribeData1()
        setTimeout(() => {
          wx.showToast({
            title: '份额追加成功',
            icon: 'success',
            duration: 1500
          })
          setTimeout(() => {
            that.setSubscribeData2()
            wx.switchTab({
              url: '../mine/mine'
            })
          }, 500)
        }, 2000)
      }
    })
  }
})
