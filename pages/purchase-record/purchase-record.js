const app = getApp()
const util = require('../../utils/util')
const i18n = require('../../utils/i18n')
const langData = require('../../utils/langData')

// 获取申购产品列表
var getPurchaseList = function (that, id) {
  wx.request({
    url: app.api_url + '/api/v1/subscribe/allByCustomerId',
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
      var list = res.data.obj
      for (let i = 0; i < list.length; i++) {
        list[i].subscribe_time = util._normalizeDate(list[i].subscribe_time)
        list[i].subscribe_money = util.rendererZhMoneyWan(list[i].subscribe_money)
        list[i].settlement_time = _normalizeStr(list[i].settlement_time)
      }
      that.setData({
        purchaseList: that.data.purchaseList.concat(list),
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
    purchaseList: [],
    fresh: false, // 上拉刷新标志
    hasData: false, // 是否有数据
    isFirstAction: true
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
    let lang = wx.getStorageSync('lang')
    wx.setNavigationBarTitle({
      title: i18n[lang].navigator.purchaseRecord
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
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  },
  // 申请赎回操作
  redeemAction: function (e) {
    if (!this.data.isFirstAction) {
      return false
    } else {
      this.setData({
        isFirstAction: false
      })
      let item = e.currentTarget.dataset.item
      try {
        wx.setStorageSync('CURPRODUCT', item)
      } catch (e) {
      }
      wx.navigateTo({
        url: '../redeem/redeem'
      })
    }
  },
  // 增加申购
  addAction: function (e) {
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
        url: '../add-apply/add-apply'
      })
    }
  },
  // 修改追加
  editFt: function (e) {
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
        url: '../modify-additional/modify-additional'
      })
    }
  },
  // 取消追加
  cancelFt: function (e) {
    let account_id = e.currentTarget.dataset.accountid
    wx.showModal({
      title: i18n[this.data.lg].common.tip,
      content: i18n[this.data.lg].purchaseRecord.tip2,
      confirmText: i18n[this.data.lg].common.confirm,
      success: function (res) {
        if (res.confirm) {
          wx.request({
            url: app.api_url + '/api/v1/subscribe/qxRecast',
            data: {
              account_id: account_id
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
  },
  // 修改申请
  editAction: function (e) {
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
        url: '../edit-apply/edit-apply'
      })
    }
  },
  // 删除申请
  cancelAction: function (e) {
    let customer = wx.getStorageSync("USERINFO")
    let subsid = e.currentTarget.dataset.subsid
    wx.showModal({
      title: i18n[this.data.lg].common.tip,
      content: i18n[this.data.lg].purchaseRecord.tip1,
      confirmText: i18n[this.data.lg].common.confirm,
      success: function (res) {
        if (res.confirm) {
          wx.request({
            url: app.api_url + '/api/v1/subscribe/qxApply',
            data: {
              customer_id: customer.id,
              subscribe_id: subsid
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
