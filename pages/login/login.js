var util = require("../../utils/util.js")
var app = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    loginBtnTxt: "登录",
    btnLoading: false,
    disabled: false,
    img_logo: '../../images/logo.png'
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },
  // 登录提交操作
  formSubmit: function (e) {
    console.log(e.detail.formId)
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
      loginBtnTxt: "登录中",
      disabled: !this.data.disabled,
      btnLoading: !this.data.btnLoading
    });
  },
  // 设置登录按钮状态
  setLoginData2: function () {
    this.setData({
      loginBtnTxt: "登录",
      disabled: !this.data.disabled,
      btnLoading: !this.data.btnLoading
    });
  },
  // 验证手机号
  checkUserName: function (param) {
    var phone = util.regexConfig().phone
    var userName = param.username.trim()
    if (phone.test(userName)) {
      return true;
    } else {
      util.toastMsg('提示', '请输入有效的手机号码')
      return false;
    }
  },
  // 验证密码
  checkPassword: function (param) {
    var password = param.password.trim()
    if (password.length <= 0) {
      util.toastMsg('提示', '请输入密码')
      return false
    } else if (password.length < 6 || password.length >20) {
      util.toastMsg('提示', '请输入6-20位密码')
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
        'content-type': 'application/x-www-form-urlencoded'
      },
      method: 'POST',
      success: function (res) {
        if (!res.data.ret) {
          util.toastMsg('提示', res.data.msg)
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
            console.log(res)
            var latitude = res.latitude
            var longitude = res.longitude
            getUserLocation(that, latitude, longitude)
          }
        })
        setTimeout(() => {
          wx.showToast({
            title: res.data.msg,
            icon: 'success',
            duration: 1500
          })
          setTimeout(() => {
            that.setLoginData2()
            wx.switchTab({
              url: '../index/index'
            })
          }, 500)
        }, 2000)
      },
      fail: function (e) {
        console.log(e)
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
      'content-type': 'application/x-www-form-urlencoded'
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