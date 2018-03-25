const app = getApp()
var util = require("../../utils/util.js")

// 获取申购产品列表
var getPurchaseList = function (that, id) {
  wx.request({
    url: app.api_url + '/api/v1/test/product/mySub',
    data: {
      customer_id: id
    },
    header: {
      'content-type': 'application/x-www-form-urlencoded',
      time_stamp: util.getBJDate().getTime(),
      secret_key: util.getMd5()
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
      var list = res.data.obj
      that.setData({
        purchaseList: that.data.purchaseList.concat(list),
        hasData: false
      })
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
    purchaseList: [],
    fresh: false, // 上拉刷新标志
    hasData: false, // 是否有数据
    hasMore: true, // 是否下拉加载
    isFirstAction: true
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '加载中',
    })
    var that = this
    try {
      var userInfo = wx.getStorageSync('USERINFO')
      if (userInfo) {
        getPurchaseList(that, userInfo.id)
      }
    } catch (e) {
      // Do something when catch error
    }
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
    var that = this
    that.setData({
      fresh: true,
      purchaseList: []
    })
    try {
      var userInfo = wx.getStorageSync('USERINFO')
      if (userInfo) {
        getPurchaseList(that, userInfo.id)
      }
    } catch (e) {
      // Do something when catch error
    }
  },
  // 申请赎回操作
  redeemAction: function (e) {
    if (!this.data.isFirstAction) {
      return false
    } else {
      this.setData({
        isFirstAction: false
      })
      let id = e.target.dataset.item.id
      wx.showModal({
        title: '提示',
        content: '您确认要赎回当前产品吗？',
        success: function (res) {
          if (res.confirm) {
            wx.request({
              url: app.api_url + '/api/v1/test/product/updateStatus',
              data: {
                sub_id: id,
                status: '赎回待审核'
              },
              header: {
                'content-type': 'application/x-www-form-urlencoded',
                time_stamp: util.getBJDate().getTime(),
                secret_key: util.getMd5()
              },
              method: 'POST',
              success: function (res) {
                if (!res.data.ret) {
                  wx.showModal({
                    title: '提示',
                    showCancel: false,
                    content: res.data.msg
                  })
                  return false
                }
                wx.showToast({
                  title: res.data.msg,
                  icon: 'success',
                  duration: 1500
                })
                wx.reLaunch({
                  url: '../c-mine/c-mine'
                })
              },
              fail: function (e) {
                console.log(e)
                util.toastMsg('提示', '网络异常')
              }
            })
          } else if (res.cancel) {
            console.log('已取消')
          }
        }
      })
    }
  }
})
