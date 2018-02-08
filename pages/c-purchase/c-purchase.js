const app = getApp()
var util = require("../../utils/util.js")
var page = 1
var rows = 10

// 获取产品列表
var getProductList = function (that, customer_id) {
  wx.request({
    url: app.api_url + '/api/v1/test/product/list',
    data: {
      page: page,
      rows: rows,
      customer_id: customer_id
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
      that.setData({
        productList: that.data.productList.concat(list),
        hasData: false
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
      util.toastMsg('提示', '网络异常')
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

Page({
  /**
   * 页面的初始数据
   */
  data: {
    productList: [],
    fresh: false, // 上拉刷新标志
    hasData: false, // 是否有数据
    hasMore: true, // 是否下拉加载
    isFirstAction: true
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    page = 1
    wx.showLoading({
      title: '加载中',
    })
    var customer_id = wx.getStorageSync('USERINFO').id
    var that = this
    getProductList(that, customer_id)
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onShow: function () {
    var that = this
    that.setData({
      isFirstAction: true
    })
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    wx.showNavigationBarLoading()
    page = 1
    var customer_id = wx.getStorageSync('USERINFO').id
    var that = this
    that.setData({
      fresh: true,
      hasMore: true,
      productList: []
    })
    getProductList(that, customer_id)
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    var customer_id = wx.getStorageSync('USERINFO').id
    var that = this
    if (!that.data.hasMore) {
      return false
    }
    getProductList(that, customer_id)
  },
  toDetail: function (e) {
    if (!this.data.isFirstAction) {
      return false
    } else {
      this.setData({
        isFirstAction: false
      })
      try {
        wx.setStorageSync('CURPRODUCT', e.currentTarget.dataset.item)
      } catch (e) {
      }
      wx.navigateTo({
        url: '../c-detail/c-detail'
      })
    }
  }
})
