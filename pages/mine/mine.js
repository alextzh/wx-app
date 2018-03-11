const app = getApp()
const util = require('../../utils/util')
const i18n = require('../../utils/i18n')
const langData = require('../../utils/langData')

/**
 * 判断该用户是否有申购方案产品
*/
var hasProductPlan = function (that) {
  let customer = wx.getStorageSync("USERINFO")
  wx.request({
    url: app.api_url + '/api/v1/product/myFAproducts',
    data: {
      customer_id: customer.id
    },
    header: {
      'content-type': 'application/x-www-form-urlencoded'
    },
    method: 'POST',
    success: function (res) {
      if (!res.data.ret) {
        that.setData({
          isShowPlan: false
        })
      } else {
        that.setData({
          isShowPlan: true
        })
      }
    },
    fail: function (e) {
      console.log(e)
    }
  })
}

Page({
  /**
   * 页面的初始数据
   */
  data: Object.assign({}, langData.data, {
    userAvatar: '/images/avatar.png',
    mobile: '',
    username: '',
    isShowPlan: false, // 是否显示产品方案
    isFirstAction: true
  }),
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (option) {
    util.resetSetData.call(this, langData)
    var that = this
    // 调用应用实例的方法获取全局数据
    app.getUserInfo(function (res) {
      if (!res.avatarUrl) {
        that.setData({
          userAvatar: '/images/avatar.png'
        })
        return false
      }
      that.setData({
        userAvatar: res.avatarUrl
      })
    })
    var userInfo = wx.getStorageSync('USERINFO')
    var lang = wx.getStorageSync('lang')
    if (lang) {
      that.setData({
        lg: lang
      })
    } else {
      that.setData({
        lg: option.lg
      })
      wx.setStorageSync('lang', option.lg)
    }
    if(userInfo) {
      that.setData({
        username: userInfo.name,
        mobile: userInfo.phone
      })
    }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },
  onShow: function () {
    var that = this
    hasProductPlan(that)
    that.setData({
      isFirstAction: true
    })
  },
  // 跳转到立即申购页面
  toPurchase: function () {
    if (!this.data.isFirstAction) {
      return false
    } else {
      this.setData({
        isFirstAction: false
      })
      wx.navigateTo({
        url: '../index/index'
      })
    }
  },
  // 跳转到赎回记录页面
  toRedeemRecord: function () {
    if (!this.data.isFirstAction) {
      return false
    } else {
      this.setData({
        isFirstAction: false
      })
      wx.navigateTo({
        url: '../redeem-record/redeem-record'
      })
    }
  },
  // 跳转到申购记录页面
  toPurchaseRecord: function () {
    if (!this.data.isFirstAction) {
      return false
    } else {
      this.setData({
        isFirstAction: false
      })
      wx.navigateTo({
        url: '../purchase-record/purchase-record'
      })
    }
  },
  // 跳转到产品方案列表
  toProductPlan: function () {
    if (!this.data.isFirstAction) {
      return false
    } else {
      this.setData({
        isFirstAction: false
      })
      wx.navigateTo({
        url: '../product-plan/product-plan'
      })
    }
  },
  // 跳转到设置页面
  toSetting: function () {
    if (!this.data.isFirstAction) {
      return false
    } else {
      this.setData({
        isFirstAction: false
      })
      wx.navigateTo({
        url: '../setting/setting'
      })
    }
  },
  // 跳转到合同管理页面
  toManagement: function () {
    if (!this.data.isFirstAction) {
      return false
    } else {
      this.setData({
        isFirstAction: false
      })
      wx.navigateTo({
        url: '../management/management'
      })
    }
  },
  // 跳转到公告页面
  toNotice: function () {
    if (!this.data.isFirstAction) {
      return false
    } else {
      this.setData({
        isFirstAction: false
      })
      wx.navigateTo({
        url: '../notice/notice'
      })
    }
  },
  // 跳转到常见问题页面
  toQuestion: function () {
    if (!this.data.isFirstAction) {
      return false
    } else {
      this.setData({
        isFirstAction: false
      })
      wx.navigateTo({
        url: '../question/question'
      })
    }
  },
  // 显示联系电话操作
  showLinkTo: function () {
    wx.showActionSheet({
      itemList: ['400-000-6887'],
      itemColor: '#F44336',
      success: function (e) {
        var tel = e.tapIndex + 1
        if(tel === 1) {
          wx.makePhoneCall({
            phoneNumber: '400-000-6887'
          })
        } else {
          return false
        }
      },
      fail: function (e) {
        console.log(e)
        return false
      }
    })
  }
})
