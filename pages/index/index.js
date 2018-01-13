const app = getApp()
var util = require("../../utils/util.js")
var page = 1
var rows = 10

// 获取产品列表
var getProductList = function (that) {
  wx.request({
    url: app.api_url + '/api/v1/product/baseList',
    data: {
      page: page,
      rows: rows
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
        that.setData({
          hasData: true
        })
        return false
      }
      var totalPage = res.data.obj.totalPage
      var list = res.data.obj.list
      for (let i = 0; i < list.length; i++) {
        list[i].caopan_time = util._normalizeDate(list[i].caopan_time)
        list[i].expect_quota = util.rendererZhMoneyWan(list[i].expect_quota)
        list[i].settlement_time = _normalizeStr(list[i].settlement_time)
      }
      that.setData({
        productList: that.data.productList.concat(list)
      })
      page++
      if (page > totalPage) {
        that.setData({
          hasMore: false
        })
      }
    },
    fail: function (e) {
      console.log(e)
    },
    complete: function () {
      wx.hideLoading()
      if (that.data.fresh) {
        setTimeout(() => {
          wx.hideNavigationBarLoading()
          wx.stopPullDownRefresh()
        }, 1000)
      }
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
    productList: [],
    fresh: false, // 上拉刷新标志
    hasData: false, // 是否有数据
    hasMore: true // 是否下拉加载
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    page = 1
    wx.showLoading({
      title: '加载中',
    })
    var that = this
    getProductList(that)
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    wx.showNavigationBarLoading()
    page = 1
    var that = this
    that.setData({
      fresh: true,
      hasMore: true,
      productList: []
    })
    getProductList(that)
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    var that = this
    if (!that.data.hasMore) {
      return false
    }
    getProductList(that)
  },
  toDetail: function (e) {
    try {
      wx.setStorageSync('CURPRODUCT', e.currentTarget.dataset.item)
    } catch (e) {
    }
    wx.navigateTo({
      url: '../product-detail/product-detail'
    })
  }
})
