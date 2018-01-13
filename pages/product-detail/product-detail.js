const app = getApp()
var page = 1
var rows = 10

/**
 * 获取子产品列表
 * @param id 基本产品的Id(必选)
*/
var getSubProductList = function (that, id) {
  wx.request({
    url: app.api_url + '/api/v1/product/listByBaseId',
    data: {
      page: page,
      rows: rows,
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
      } else {
        that.setData({
          pickerArr: [],
          showArr: [],
          currentPlan: null
        })
      }
    },
    fail: function (e) {
      console.log(e)
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
  data: {
    showArr: [],
    pickerArr: [],
    pickerIndex: 0,
    currentPlan: null,
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
        getSubProductList(that, value.id)
        that.setData({

        })
      }
      if (userInfo) {
        that.setData({
          cid: userInfo.id
        })
      }
    } catch(e) {

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
    if (that.checkPurchase(param)) {
      wx.showModal({
        title: '提示',
        content: '您确认要申购当前产品' + param.purchaseAmt + '万份吗',
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
  // 校验申购金额
  checkPurchase: function (param) {
    var amt = parseInt(param.purchaseAmt)
    var curPlan = this.data.currentPlan
    var min = parseInt(curPlan.min_money) / 10000
    var step = parseInt(curPlan.step_money) / 10000
    if (!amt) {
      wx.showModal({
        title: '提示',
        showCancel: false,
        content: '请输入申购份额'
      })
      return false
    } else if (amt < min) {
      wx.showModal({
        title: '提示',
        showCancel: false,
        content: '最小申购份额为' +min+ '万份'
      })
      return false
    } else if (amt % step !== 0) {
      wx.showModal({
        title: '提示',
        showCancel: false,
        content: '申购递增份额为' +step+ '万份'
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
          wx.showModal({
            title: '提示',
            showCancel: false,
            content: res.data.msg
          })
          that.setRedeemData2()
          return false
        }
        that.setRedeemData1()
        setTimeout(() => {
          wx.showToast({
            title: '申购申请已提交',
            icon: 'success',
            duration: 1500
          })
          setTimeout(() => {
            that.setRedeemData2()
            wx.switchTab({
              url: '../mine/mine'
            })
          }, 500)
        }, 2000)
      }
    })
  }
})
