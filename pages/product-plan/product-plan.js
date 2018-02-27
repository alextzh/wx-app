var util = require("../../utils/util.js")
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
          content: res.data.msg,
        })
        that.setData({
          hasData: true
        })
        return false
      }
      that.setData({
        productPlanList: res.data.obj,
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
    productPlanList: [],
    hasData: false, // 是否有数据
    fresh: false, // 下拉刷新标志
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
    getProductPlanList(that)
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
      fresh: true
    })
    getProductPlanList(that)
  },
  modifyAction: function (e) {
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
        url: '../modification/modification'
      })
    }
  },
  cancelAction: function (e) {
    var edit_item_id = e.currentTarget.dataset.item.edit_item_id
    wx.showModal({
      title: '提示',
      content: '您确认要取消修改当前产品吗？',
      success: function (res) {
        if (res.confirm) {
          wx.request({
            url: app.api_url + '/api/v1/product/qxXgFA',
            data: {
              edit_item_id: edit_item_id
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
                return false
              }
              wx.showToast({
                title: res.data.msg,
                icon: 'success',
                duration: 1500
              })
              wx.reLaunch({
                url: '../mine/mine'
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
})
