const app = getApp()
const util = require('../../utils/util')
const i18n = require('../../utils/i18n')
const langData = require('../../utils/langData')

Page({
  /**
   * 页面的初始数据
   */
  data: Object.assign({}, langData.data, {
    btnLoading: false,
    disabled: false,
    img_logo: '../../images/logo.png'
  }),
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    var that = this
    util.resetSetData.call(that, langData)
    var lang = wx.getStorageSync('lang')
    if (lang) {
      that.setData({
        lg: lang
      })
    }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onShow: function () {
  },
  // 登录提交操作
  formSubmit: function (e) {
    var param = e.detail.value
    var flag = this.checkUserName(param) && this.checkPassword(param)
    if (flag) {
      this.setLoginData1()
      this.mySubmit(param)
    }
  },
  // 设置登录中按钮状态
  setLoginData1: function () {
    this.setData({
      disabled: !this.data.disabled,
      btnLoading: !this.data.btnLoading
    });
  },
  // 设置登录按钮状态
  setLoginData2: function () {
    this.setData({
      disabled: !this.data.disabled,
      btnLoading: !this.data.btnLoading
    });
  },
  // 验证手机号
  checkUserName: function (param) {
    var userName = param.username.trim()
    if (userName.length === 11) {
      return true;
    } else {
      util.toastMsg(i18n[this.data.lg].common.tip, i18n[this.data.lg].login.tip1, i18n[this.data.lg].common.confirm)
      return false;
    }
  },
  // 验证密码
  checkPassword: function (param) {
    var password = param.password.trim()
    if (password.length <= 0) {
      util.toastMsg(i18n[this.data.lg].common.tip, i18n[this.data.lg].login.tip2, i18n[this.data.lg].common.confirm)
      return false
    } else if (password.length < 6 || password.length >20) {
      util.toastMsg(i18n[this.data.lg].common.tip, i18n[this.data.lg].login.tip3, i18n[this.data.lg].common.confirm)
      return false
    } else {
      return true
    }
  },
  // 登录提交数据到后台
  mySubmit: function (param, value) {
    var username = param.username.trim()
    var password = param.password.trim()
    var that = this
    wx.request({
      url: app.api_url + '/api/v1/login/login4Wx',
      data: {
        phone: username,
        pwd: password,
        openid: app.openid
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        time_stamp: util.getBJDate().getTime(),
        secret_key: util.getMd5()
      },
      method: 'POST',
      success: function (res) {
        if (!res.data.ret) {
          console.log(that.data.lg)
          util.toastMsg(i18n[that.data.lg].common.tip, res.data.msg, i18n[that.data.lg].common.confirm)
          that.setLoginData2()
          return false
        }
        try {
          wx.setStorageSync('USERINFO', res.data.obj)
        } catch (e) {
        }
        wx.getLocation({
          type: 'gcj02',
          success: function (res) {
            try {
              var value = wx.getStorageSync('USERINFO')
              if (value) {
                // Do something with return value
                that.setData({
                  cid: value.id
                })
              }
            } catch (e) {
              // Do something when catch error
            }
            var latitude = res.latitude
            var longitude = res.longitude
            getUserLocation(that, latitude, longitude)
          }
        })
        wx.showToast({
          title: res.data.msg,
          icon: 'success',
          duration: 1500
        })
        setTimeout(() => {
          that.setLoginData2()
          if(res.data.obj.type === '游客') {
            wx.redirectTo({
              url: '../c-mine/c-mine'
            })
          } else {
            wx.redirectTo({
              url: '../mine/mine?lg=' + that.data.lg
            })
          }
        }, 500)
      },
      fail: function (e) {
        console.log(e)
        util.toastMsg(i18n[that.data.lg].common.tip, i18n[that.data.lg].common.network, i18n[that.data.lg].common.confirm)
        that.setLoginData2()
      }
    })
  }
})
function getUserLocation(that, latitude, longitude) {
  wx.request({
    url: app.api_url + '/api/v1/location/report',
    data: {
      customer_id: that.data.cid,
      latitude: latitude,
      longitude: longitude
    },
    header: {
      'content-type': 'application/x-www-form-urlencoded',
      time_stamp: util.getBJDate().getTime(),
      secret_key: util.getMd5()
    },
    method: 'POST',
    success: function (res) {
      console.log(res)
    },
    fail: function (e) {
      console.log(e)
    }
  })
}