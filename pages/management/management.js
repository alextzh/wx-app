const app = getApp()
var util = require("../../utils/util.js")

// 获取我的合同记录
var getContractList = function (that) {
  var custom = wx.getStorageSync('USERINFO')
  wx.request({
    url: app.api_url + '/api/v1/contract/myContract',
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
          content: res.data.msg,
        })
        that.setData({
          hasData: true
        })
        return false
      }
      var list = res.data.rows
      that.setData({
        contractList: list,
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
    isFirstAction: true,
    contractList: [],
    hasData: false, // 是否有数据
    fresh: false, // 下拉刷新标志
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
  downloadFile: function (e) {
    var that = this
    if (!that.data.isFirstAction) {
      return false
    } else {
      that.setData({
        isFirstAction: false
      })
      let pdfUrl = e.currentTarget.dataset.item.download_url
      wx.downloadFile({
        url: pdfUrl,
        success: function (res) {
          if (res.statusCode === 200) {
            var filePath = res.tempFilePath
            wx.openDocument({
              filePath: filePath,
              success: function (res) {
                console.log('预览成功')
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
  // saveFile: function (e) {
  //   var that = this
  //   var id = e.currentTarget.dataset.item.id
  //   let pdfUrl = e.currentTarget.dataset.item.download_url
  //   wx.downloadFile({
  //     url: pdfUrl,
  //     success: function (res) {
  //       if (res.statusCode === 200) {
  //         var filePath = res.tempFilePath
  //         wx.saveFile({
  //           tempFilePath: filePath,
  //           success: function (res) {
  //             var savedFilePath = res.savedFilePath
  //             try {
  //               wx.setStorageSync(id, savedFilePath)
  //               util.toastMsg('下载成功', '文件保存到文件管理-微信')
  //               getContractList(that)
  //             } catch (e) {
  //             }
  //           },
  //           fail: function (e) {
  //             console.log(e)
  //             util.toastMsg('提示', '网络异常')
  //           }
  //         })
  //       }
  //     },
  //     fail: function (e) {
  //       console.log(e)
  //       util.toastMsg('提示', '网络异常')
  //     }
  //   })
  // }
})