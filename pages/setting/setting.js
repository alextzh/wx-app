const app = getApp()
const util = require('../../utils/util')
const i18n = require('../../utils/i18n')
const langData = require('../../utils/langData')

// 绑定微信
function bindWx(that) {
  let customer = wx.getStorageSync("USERINFO")
  wx.showModal({
    title: i18n[that.data.lg].common.tip,
    content: i18n[that.data.lg].setting.tip2,
    cancelText: i18n[that.data.lg].common.cancel,
    confirmText: i18n[that.data.lg].common.confirm,
    success: function (res) {
      if (res.confirm) {
        wx.request({
          url: app.api_url + '/api/v1/login/bindWxOpenid',
          data: {
            customer_id: customer.id,
            openid: app.openid
          },
          header: {
            'content-type': 'application/x-www-form-urlencoded',
            time_stamp: util.getBJDate().getTime(),
            secret_key: util.getMd5()
          },
          method: 'POST',
          success: function (res) {
            if (res.data.ret) {
              customer.bind_status = "Y";
              wx.setStorageSync("USERINFO", customer);
            }
            wx.showToast({
              title: res.data.msg,
              icon: 'success',
              duration: 1500
            })
          },
          fail: function (e) {
            console.log(e)
          }
        })
      } else if (res.cancel) {
        that.setData({
          isChecked: false
        })
      } else {
        that.setData({
          isChecked: false
        })
      }
    },
    fail: function (e) {
      console.log(e)
    }
  })
}

//取消绑定微信

function qxBindWx(that) {
  let customer = wx.getStorageSync("USERINFO")
  wx.showModal({
    title: i18n[that.data.lg].common.tip,
    content: i18n[that.data.lg].setting.tip3,
    cancelText: i18n[that.data.lg].common.cancel,
    confirmText: i18n[that.data.lg].common.confirm,
    success: function (res) {
      if (res.confirm) {
        wx.request({
          url: app.api_url + '/api/v1/login/qxBindOpenid',
          data: {
            customer_id: customer.id,
            openid: app.openid
          },
          header: {
            'content-type': 'application/x-www-form-urlencoded',
            time_stamp: util.getBJDate().getTime(),
            secret_key: util.getMd5()
          },
          method: 'POST',
          success: function (res) {
            if (res.data.ret) {
              customer.bind_status = "N";
              wx.setStorageSync("USERINFO", customer);
            }
            wx.showToast({
              title: res.data.msg,
              icon: 'success',
              duration: 1500
            })
          },
          fail: function (e) {
            console.log(e)
          }
        })
      } else if (res.cancel) {
        that.setData({
          isChecked: true
        })
      } else {
        that.setData({
          isChecked: true
        })
      }
    },
    fail: function (e) {
      console.log(e)
    }
  })
}

function findIndex(list, lang) {
  return list.findIndex((item) => {
    return item.type === lang
  })
}

Page({

  /**
   * 页面的初始数据
   */
  data: Object.assign({}, langData.data, {
    isChecked: false,
    isFirstAction: true,
    showArr: [
      { type: 'zh', name: '简体中文' },
      { type: 'en', name: 'English' },
      { type: 'tw', name: '繁体中文' }
    ],
    pickerArr: ['简体中文', 'English', '繁体中文'],
    pickerIndex: 0
  }),

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    util.resetSetData.call(this, langData)
    var that = this
    try {
      var userInfo = wx.getStorageSync('USERINFO')
      var lang = wx.getStorageSync('lang')
      if (lang) {
        let index = findIndex(that.data.showArr, lang)
        that.setData({
          pickerIndex: index,
          lg: lang
        })
      }
      if (userInfo) {
        if (userInfo.bind_status === 'Y') {
          that.setData({
            isChecked: true
          })
        } else {
          that.setData({
            isChecked: false
          })
        }
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
      title: i18n[lang].navigator.setting
    })
  },

  /**
   * 切换语言
  */
  switchLanguage: function (e) {
    var that = this
    let lang = that.data.showArr[e.detail.value].type
    that.setData({
      pickerIndex: e.detail.value,
      lg: lang
    })
    wx.setNavigationBarTitle({
      title: i18n[that.data.lg].navigator.setting
    })
    var pages = getCurrentPages()
    var prevPage = pages[pages.length - 2]
    //直接调用上一个页面的setData()方法，把数据存到上一个页面中去
    prevPage.setData({
      lg: lang
    })
  },
  // 跳转到修改密码页面
  toModifyPwd: function () {
    if (!this.data.isFirstAction) {
      return false
    } else {
      this.setData({
        isFirstAction: false
      })
      wx.navigateTo({
        url: '../modify-pwd/modify-pwd'
      })
    }
  },
  // 跳转到划款申请页面
  toTransfer: function () {
    if (!this.data.isFirstAction) {
      return false
    } else {
      this.setData({
        isFirstAction: false
      })
      wx.navigateTo({
        url: '../transfer-apply/transfer-apply'
      })
    }
  },
  // 跳转到划款记录页面
  toTransferRecord: function () {
    if (!this.data.isFirstAction) {
      return false
    } else {
      this.setData({
        isFirstAction: false
      })
      wx.navigateTo({
        url: '../transfer-record/transfer-record'
      })
    }
  },
  switchChange: function (e) {
    var flag = e.detail.value
    if (flag) {
      bindWx(this)
    } else {
      qxBindWx(this)
    }
  },
  //绑定微信
  bindWx: function () {
    bindWx(this)
  },
  //取消绑定微信
  qxBindWx: function () {
    qxBindWx(this)
  },
  // 退出账号操作
  loginOut: function () {
    wx.showModal({
      title: i18n[this.data.lg].common.quitTip,
      content: i18n[this.data.lg].setting.tip1,
      cancelText: i18n[this.data.lg].common.cancel,
      confirmText: i18n[this.data.lg].common.confirm,
      success: function (res) {
        if (res.confirm) {
          try {
            wx.removeStorageSync('USERINFO')
          } catch (e) {
            // Do something when catch error
          }
          wx.reLaunch({
            url: '../login/login',
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  }
})