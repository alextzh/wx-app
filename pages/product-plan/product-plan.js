const app = getApp()
const util = require('../../utils/util')
const i18n = require('../../utils/i18n')
const langData = require('../../utils/langData')

// 获取申购方案产品列表
var getProductPlanList = function (that) {
  var custom = wx.getStorageSync('USERINFO')
  const time_stamp = util.getBJDate()
  const secret_key = util.getMd5()
  wx.request({
    url: app.api_url + '/api/v1/product/myFAproducts',
    data: {
      customer_id: custom.id
    },
    header: {
      'content-type': 'application/x-www-form-urlencoded',
      time_stamp: time_stamp,
      secret_key: secret_key
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
      that.setData({
        productPlanList: res.data.obj,
        hasData: false
      })
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

Page({
  /**
   * 页面的初始数据
   */
  data: Object.assign({}, langData.data, {
    productPlanList: [],
    hasData: false, // 是否有数据
    fresh: false, // 下拉刷新标志
    isFirstAction: true
  }),
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    util.resetSetData.call(that, langData)
    var lang = wx.getStorageSync('lang')
    if (lang) {
      that.setData({
        lg: lang
      })
    }
    wx.showLoading({
      title: i18n[that.data.lg].common.loading
    })
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
    wx.setNavigationBarTitle({
      title: i18n[that.data.lg].navigator.plan
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
      title: i18n[this.data.lg].common.tip,
      content: i18n[this.data.lg].plan.tip1,
      confirmText: i18n[this.data.lg].common.confirm,
      success: function (res) {
        if (res.confirm) {
          const time_stamp = util.getBJDate()
          const secret_key = util.getMd5()
          wx.request({
            url: app.api_url + '/api/v1/product/qxXgFA',
            data: {
              edit_item_id: edit_item_id
            },
            header: {
              'content-type': 'application/x-www-form-urlencoded',
              time_stamp: time_stamp,
              secret_key: secret_key
            },
            method: 'POST',
            success: function (res) {
              if (!res.data.ret) {
                util.toastMsg(i18n[this.data.lg].common.tip, res.data.msg, i18n[this.data.lg].common.confirm)
                return false
              }
              wx.showToast({
                title: res.data.msg,
                icon: 'success',
                duration: 1500
              })
              let lg = wx.getStorageSync('lang')
              wx.reLaunch({
                url: '../mine/mine?lg=' +lg
              })
            },
            fail: function (e) {
              console.log(e)
              util.toastMsg(i18n[this.data.lg].common.tip, i18n[this.data.lg].common.network, i18n[this.data.lg].common.confirm)
            }
          })
        } else if (res.cancel) {
          console.log('已取消')
        }
      }
    })
  }
})
