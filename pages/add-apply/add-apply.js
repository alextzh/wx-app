const app = getApp()
var util = require('../../utils/util.js')

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
      util.toastMsg('提示', '网络异常')
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
  data: {
    currentProduct: null,
    showArr: [],
    pickerArr: [],
    pickerIndex: 0,
    currentPlan: null,
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
    getSubProductList(that, value.base_product_id)
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
      currentPlan: that.data.showArr[e.detail.value]
    })
  },
  // 提交赎回
  formSubmit: function (e) {
    var that = this
    var param = e.detail.value
    var planName = that.data.currentPlan.name
    if (that.checkSubscribe(param)) {
      wx.showModal({
        title: '提示',
        content: '您确认要追加' + planName + '申购份额' + param.subscribeAmt + '万份吗',
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
  // 校验追加金额
  checkSubscribe: function (param) {
    var amt = param.subscribeAmt
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
          wx.showModal({
            title: '提示',
            showCancel: false,
            content: res.data.msg
          })
          that.setSubscribeData2()
          return false
        }
        that.setSubscribeData1()
        wx.showToast({
          title: '追加份额申请成功',
          icon: 'success',
          duration: 1500
        })
        setTimeout(() => {
          that.setSubscribeData2()
          wx.reLaunch({
            url: '../mine/mine'
          })
        }, 500)
      },
      fail: function (e) {
        console.log(e)
        util.toastMsg('提示', '网络异常')
        that.setSubscribeData2()
      }
    })
  }
})
