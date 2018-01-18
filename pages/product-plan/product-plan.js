const app = getApp()

// 获取申购产品列表
var getProductPlanList = function (that) {
  var custom = wx.getStorageSync('USERINFO')
  wx.request({
    url: app.api_url + '/api/v1/product/myFAproducts',
    data: {
      customer_id: custom.id
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
      that.setData({
        productPlanList: res.data.obj
      })
      wx.hideLoading()
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

Page({
  /**
   * 页面的初始数据
   */
  data: {
    productPlanList: [],
    hasData: false, // 是否有数据
    fresh: false // 下拉刷新标志
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '加载中',
    })
    var that = this
    getProductPlanList(that)
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
    var that = this
    that.setData({
      fresh: true
    })
    getProductPlanList(that)
  },
  modifyAction: function (e) {
    try {
      wx.setStorageSync('CURPRODUCT', e.currentTarget.dataset.item)
    } catch (e) {
    }
    wx.navigateTo({
      url: '../modification/modification'
    })
  }
})
