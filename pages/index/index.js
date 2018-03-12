const app = getApp()
const util = require('../../utils/util')
const i18n = require('../../utils/i18n')
const langData = require('../../utils/langData')

var page = 1
var rows = 10

// 获取产品列表
var getProductList = function (that, customer_id) {
  wx.request({
    url: app.api_url + '/api/v1/product/baseList',
    data: {
      page: page,
      rows: rows,
      status: 'sgz',
      customer_id: customer_id
    },
    header: {
      'content-type': 'application/x-www-form-urlencoded'
    },
    method: 'POST',
    success: function (res) {
      if (!res.data.ret) {
        util.toastMsg(i18n[that.data.lg].common.tip, res.data.msg, i18n[that.data.lg].common.confirm)
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
        list[i].sg_start_time = util._normalizeDate(list[i].sg_start_time)
        list[i].sg_end_time = util._normalizeDate(list[i].sg_end_time)
      }
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
      util.toastMsg(i18n[that.data.lg].common.tip, i18n[that.data.lg].common.network, i18n[that.data.lg].common.confirm)
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
  data: Object.assign({}, langData.data, {
    productList: [],
    fresh: false, // 上拉刷新标志
    hasData: false, // 是否有数据
    hasMore: true, // 是否下拉加载
    isFirstAction: true
  }),
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    util.resetSetData.call(this, langData)
    var that = this
    page = 1
    var lang = wx.getStorageSync('lang')
    if (lang) {
      that.setData({
        lg: lang
      })
    }
    wx.showLoading({
      title: i18n[that.data.lg].common.loading
    })
    var customer_id = wx.getStorageSync('USERINFO').id
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
    let lang = wx.getStorageSync('lang')
    wx.setNavigationBarTitle({
      title: i18n[lang].navigator.product
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
        url: '../product-detail/product-detail'
      })
    }
  }
})
