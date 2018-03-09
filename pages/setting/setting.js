const app = getApp()
const util = require('../../utils/util')
const i18n = require('../../utils/i18n')
const langData = require('../../utils/langData.js')

// 绑定微信
function bindWx(that) {
  let customer = wx.getStorageSync("USERINFO")
  wx.showModal({
    title: '提示',
    content: '您确认要把当前账户绑定该微信号吗？',
    success: function (res) {
      if (res.confirm) {
        wx.request({
          url: app.api_url + '/api/v1/login/bindWxOpenid',
          data: {
            customer_id: customer.id,
            openid: app.openid
          },
          header: {
            'content-type': 'application/x-www-form-urlencoded'
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
    title: '提示',
    content: '您确认取消绑定该微信号吗？',
    success: function (res) {
      if (res.confirm) {
        wx.request({
          url: app.api_url + '/api/v1/login/qxBindOpenid',
          data: {
            customer_id: customer.id,
            openid: app.openid
          },
          header: {
            'content-type': 'application/x-www-form-urlencoded'
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
    pickerIndex: 0,
    lang: 'zh'
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
    var lang = wx.getStorageSync('lang')
    let title = lang === 'zh' ? '我的设置' : lang === 'en' ? 'Setting' : '我的設置'
    wx.setNavigationBarTitle({
      title: title
    })
  },

  /**
   * 切换语言
  */
  switchLanguage: function (e) {
    var that = this
    let lang = that.data.showArr[e.detail.value].type
    let title = lang === 'zh' ? '我的设置' : lang === 'en' ? 'Setting' : '我的設置'
    that.setData({
      pickerIndex: e.detail.value,
      lg: lang
    })
    wx.setNavigationBarTitle({
      title: title
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
      title: '退出提示',
      content: '确定要退出账号吗',
      success: function (res) {
        if (res.confirm) {
          try {
            wx.clearStorageSync()
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