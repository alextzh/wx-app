const app = getApp()
var util = require("../../utils/util.js")

// 获取我的合同记录
var getContractList = function (that) {
  var custom = wx.getStorageSync('USERINFO')
  wx.request({
    url: app.api_url + '/api/v1/contract/customer_id',
    data: {
      customer_id: custom.id
    },
    header: {
      'content-type': 'application/x-www-form-urlencoded'
    },
    method: 'POST',
    success: function (res) {
      console.log(res.data)
      if (!res.data.ret) {
        wx.showModal({
          title: '提示',
          showCancel: false,
          content: res.data.msg,
        })
        that.setData({
          hasData: true
        })
        return false
      }
      that.setData({
        contractList: res.data.obj,
        hasData: false
      })
      wx.hideLoading()
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
    // pdfUrl: 'https://testapi.fadada.com/api//getdocs.action?app_id=400956&send_app_id=&v=2.0&timestamp=20180227121106&transaction_id=1519704588627_mcp&msg_digest=OEEyMDdDNTkzMjdGMTNDNDlGMEIyQzdDN0M3RUJFMUZBNjc2Rjg4Mg==',
    isFirstAction: true,
    contractList: [],
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
    getContractList(that)
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

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    wx.showNavigationBarLoading()
    var that = this
    that.setData({
      fresh: true
    })
    getContractList(that)
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