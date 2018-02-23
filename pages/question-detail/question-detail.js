// pages/notice-detail/notice-detail.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    curQuestion: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    try {
      var value = wx.getStorageSync('CURNOTICE')
      if (value) {
        that.setData({
          curQuestion: value
        })
      }
    } catch (e) {
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  }
})