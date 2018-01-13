const app = getApp()
var util = require("../../utils/util.js")

Page({
  data: {
    boughtList: [],
    page: 1,
    rows: 10,
    fresh: false
  },
  onLoad: function () {
    wx.showLoading({
      title: '加载中',
    })
    var that = this
    wx.getStorage({
      key: 'USERINFO',
      success: function (res) {
        getBoughtList(that, res.data.id)
      }
    })
  },
  onReady: function () {
  
  },
  onPullDownRefresh: function () {
    var that = this
    that.setData({
      fresh: true
    })
    wx.showToast({
      title: "加载中...",
      icon: 'loading',
      duration: 8000
    })
    wx.getStorage({
      key: 'USERINFO',
      success: function (res) {
        getBoughtList(that, res.data.id)
      }
    })
  },
  toMyDetail: function (e) {
    wx.navigateTo({
      url: '../my-detail/my-detail'
    })
  },
  redeemAction: function (e) {
    let data = {
      sid: e.target.dataset.sid,
      mon: e.target.dataset.subs,
      name: e.target.dataset.name
    }
    let url = '../redeem/redeem'
    wx.navigateTo({
      url: util.jointUrl(url, data)
    })
  }
})
function getBoughtList(that, id) {
  wx.request({
    url: app.api_url + '/api/v1/product/myProducts',
    data: {
      page: that.data.page,
      rows: that.data.rows,
      customer_id: id
    },
    header: {
      'content-type': 'application/x-www-form-urlencoded'
    },
    method: 'POST',
    success: function (res) {
      wx.hideLoading()
      if (that.data.fresh) {
        wx.stopPullDownRefresh();
        wx.hideToast()
      }
      if (!res.data.ret) {
        wx.showModal({
          title: '提示',
          showCancel: false,
          content: res.data.msg
        })
        return false
      }
      var list = res.data.obj.list
      for(let i = 0; i < list.length; i++) {
        list[i].subscribe_time = util._normalizeDate(list[i].subscribe_time)
        list[i].caopan_time = util._normalizeDate(list[i].caopan_time)
        list[i].subscribe_money = util.rendererZhMoneyWan(list[i].subscribe_money)
      }
      that.setData({
        boughtList: list
      })
    }
  })
}
