var util = require("../../utils/util.js")
const app = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    modifyBtnTxt: "修改",
    btnLoading: false,
    disabled: false
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    var that = this
    try {
      var userInfo = wx.getStorageSync('USERINFO')
      if (userInfo) {
        that.setData({
          cid: userInfo.id
        })
      }
    } catch (e) {
      // Do something when catch error
    }
  },
  // 修改密码提交操作
  formSubmit: function (e) {
    var param = e.detail.value
    var flag = this.checkPassword(param) && this.checkNewPassword(param)
    if (flag) {
      this.setModifyData1()
      this.mySubmit(param)
    }
  },
  // 设置修改按钮状态-修改中
  setModifyData1: function () {
    this.setData({
      modifyBtnTxt: "修改中",
      disabled: !this.data.disabled,
      btnLoading: !this.data.btnLoading
    });
  },
  // 设置修改按钮状态
  setModifyData2: function () {
    this.setData({
      modifyBtnTxt: "修改",
      disabled: !this.data.disabled,
      btnLoading: !this.data.btnLoading
    });
  },
  // 验证密码
  checkPassword: function (param) {
    var password = param.password.trim()
    if (!password) {
      util.toastMsg('提示', '请输入原密码')
      return false
    } else if (password.length < 6 || password.length > 20) {
      util.toastMsg('提示', '请输入6-20位原密码')
      return false
    } else {
      return true
    }
  },
  checkNewPassword: function (param) {
    var password1 = param.password1.trim()
    var password2 = param.password2.trim()
    if (!password1 || !password2) {
      util.toastMsg('提示', '请输入新密码')
      return false
    } else if (password1.length < 6 || password1.length > 20) {
      util.toastMsg('提示', '请输入6-20位新密码')
      return false
    } else if (password2.length < 6 || password2.length > 20) {
      util.toastMsg('提示', '请输入6-20位新密码')
      return false
    } else if (password1 !== password2) {
      util.toastMsg('提示', '两次新密码输入不一致')
      return false
    } else {
      return true
    }
  },
  // 提交数据到服务端
  mySubmit: function (param) {
    var password = param.password.trim()
    var password1 = param.password1.trim()
    const time_stamp = util.getBJDate()
    const secret_key = util.getMd5()
    var that = this
    wx.request({
      url: app.api_url + '/api/v1/login/updatePwd',
      data: {
        old_pwd: password,
        new_pwd: password1,
        customer_id: that.data.cid
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        time_stamp: time_stamp,
        secret_key: secret_key
      },
      method: 'POST',
      success: function (res) {
        if (!res.data.ret) {
          util.toastMsg('提示', res.data.msg)
          that.setModifyData2()
          return false
        }
        wx.showToast({
          title: res.data.msg,
          icon: 'success',
          duration: 1500
        })
        setTimeout(() => {
          that.setModifyData2()
          wx.reLaunch({
            url: '../c-mine/c-mine'
          })
        }, 500)
      },
      fail: function (e) {
        console.log(e)
        util.toastMsg('提示', '网络异常')
        that.setModifyData2()
      }
    })
  }
})