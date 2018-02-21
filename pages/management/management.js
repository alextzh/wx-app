var util = require("../../utils/util.js")

Page({

  /**
   * 页面的初始数据
   */
  data: {
    pdfUrl: '../../images.index.pdf',
    isFirstAction: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var that = this
    that.setData({
      isFirstAction: true
    })
  },
  downloadFile: function () {
    var that = this
    if (!that.data.isFirstAction) {
      return false
    } else {
      that.setData({
        isFirstAction: false
      })
      wx.downloadFile({
        url: that.data.pdfUrl,
        success: function (res) {
          if (res.statusCode === 200) {
            var filePath = res.tempFilePath
            wx.openDocument({
              filePath: filePath,
              success: function (res) {
                console.log('打开成功')
              },
              fail: function (e) {
                console.log(e)
                util.toastMsg('提示', '网络异常')
              }
            })
          }
        },
        fail: function (e) {
          console.log(e)
          util.toastMsg('提示', '网络异常')
        }
      })
    }
  }
})