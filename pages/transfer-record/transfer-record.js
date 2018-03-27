const app = getApp()
const util = require('../../utils/util')
const i18n = require('../../utils/i18n')
const langData = require('../../utils/langData')

// var timer = null

// 获取划款记录
var getTransferRecord = function (that, id) {
  wx.request({
    url: app.api_url + '/api/v1/deduct/myDeducts',
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
        util.toastMsg(i18n[that.data.lg].common.tip, res.data.msg, i18n[that.data.lg].common.confirm)
        that.setData({
          hasData: true
        })
        return false
      }
      that.setData({
        transferRecord: res.data.rows,
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
    transferRecord: [],
    purchaseDisabled: false,
    fresh: false, // 上拉刷新标志
    hasData: false // 是否有数据
  }),
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    util.resetSetData.call(this, langData)
    var that = this
    var lang = wx.getStorageSync('lang')
    if (lang) {
      that.setData({
        lg: lang
      })
    }
    wx.showLoading({
      title: i18n[that.data.lg].common.loading
    })
    try {
      var userInfo = wx.getStorageSync('USERINFO')
      if (userInfo) {
        // Do something with return value
        getTransferRecord(that, userInfo.id)
      }
    } catch (e) {
      // Do something when catch error
    }
    // that.isTransfer()
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let lang = wx.getStorageSync('lang')
    wx.setNavigationBarTitle({
      title: i18n[lang].navigator.transferRecord
    })
    // timer = setInterval(() => {
    //   this.isTransfer()
    // }, 1000)
  },
  /**
   * 生命周期函数--监听页面卸载
   */
  // onUnload: function () {
  //   clearInterval(timer)
  // },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    wx.showNavigationBarLoading()
    var that = this
    that.setData({
      fresh: true,
      transferRecord: []
    })
    try {
      var userInfo = wx.getStorageSync('USERINFO')
      if (userInfo) {
        // Do something with return value
        getTransferRecord(that, userInfo.id)
      }
    } catch (e) {
      // Do something when catch error
    }
  },
  // 判断当前时间是否可以申请划款
  // isTransfer: function () {
  //   if (util.time_range('09:00', '17:30')) {
  //     this.setData({
  //       purchaseDisabled: false
  //     })
  //   } else {
  //     this.setData({
  //       purchaseDisabled: true
  //     })
  //   }
  // },
  // 取消划款申请
  cancelAction: function (e) {
    let transfer_id = e.currentTarget.dataset.transferid
    wx.showModal({
      title: i18n[this.data.lg].common.tip,
      content: i18n[this.data.lg].purchase.tip16,
      confirmText: i18n[this.data.lg].common.confirm,
      success: function (res) {
        if (res.confirm) {
          wx.request({
            url: app.api_url + '/api/v1/deduct/qxApply',
            data: {
              id: transfer_id
            },
            header: {
              'content-type': 'application/x-www-form-urlencoded',
              time_stamp: util.getBJDate().getTime(),
              secret_key: util.getMd5()
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
                url: '../mine/mine?lg=' + lg
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
