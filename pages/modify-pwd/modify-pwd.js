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
    disabled: false
  }),
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    var that = this
    util.resetSetData.call(that, langData)
    var userInfo = wx.getStorageSync('USERINFO')
    var lang = wx.getStorageSync('lang')
    if (lang) {
      that.setData({
        lg: lang
      })
    }
    if (userInfo) {
      that.setData({
        cid: userInfo.id
      })
    }
  },
  onShow: function () {
    var that = this
    wx.setNavigationBarTitle({
      title: i18n[that.data.lg].navigator.password
    })
  },
  // 修改密码提交操作
  formSubmit: function (e) {
    var that = this
    var param = e.detail.value
    var flag = that.checkPassword(param) && that.checkNewPassword(param)
    if (flag) {
      wx.showModal({
        title: i18n[that.data.lg].common.tip,
        content: i18n[that.data.lg].modifyPwd.tip7,
        confirmText: i18n[that.data.lg].common.confirm,
        success: function (res) {
          if (res.confirm) {
            that.setModifyData1()
            that.mySubmit(param)
          } else if (res.cancel) {
            console.log('已取消')
          }
        },
        fail: function (e) {
          console.log(e)
          util.toastMsg(i18n[that.data.lg].common.tip, i18n[that.data.lg].common.network, i18n[that.data.lg].common.confirm)
        }
      })
    }
  },
  // 设置修改按钮状态-修改中
  setModifyData1: function () {
    this.setData({
      disabled: !this.data.disabled,
      btnLoading: !this.data.btnLoading
    });
  },
  // 设置修改按钮状态
  setModifyData2: function () {
    this.setData({
      disabled: !this.data.disabled,
      btnLoading: !this.data.btnLoading
    });
  },
  // 验证密码
  checkPassword: function (param) {
    var password = param.password.trim()
    if (!password) {
      util.toastMsg(i18n[this.data.lg].common.tip, i18n[this.data.lg].modifyPwd.tip1, i18n[this.data.lg].common.confirm)
      return false
    } else if (password.length < 6 || password.length > 20) {
      util.toastMsg(i18n[this.data.lg].common.tip, i18n[this.data.lg].modifyPwd.tip4, i18n[this.data.lg].common.confirm)
      return false
    } else {
      return true
    }
  },
  checkNewPassword: function (param) {
    var password1 = param.password1.trim()
    var password2 = param.password2.trim()
    if (!password1 || !password2) {
      util.toastMsg(i18n[this.data.lg].common.tip, i18n[this.data.lg].modifyPwd.tip2, i18n[this.data.lg].common.confirm)
      return false
    } else if (password1.length < 6 || password1.length > 20) {
      util.toastMsg(i18n[this.data.lg].common.tip, i18n[this.data.lg].modifyPwd.tip5, i18n[this.data.lg].common.confirm)
      return false
    } else if (password2.length < 6 || password2.length > 20) {
      util.toastMsg(i18n[this.data.lg].common.tip, i18n[this.data.lg].modifyPwd.tip5, i18n[this.data.lg].common.confirm)
      return false
    } else if (password1 !== password2) {
      util.toastMsg(i18n[this.data.lg].common.tip, i18n[this.data.lg].modifyPwd.tip6, i18n[this.data.lg].common.confirm)
      return false
    } else {
      return true
    }
  },
  // 提交数据到服务端
  mySubmit: function (param) {
    var password = param.password.trim()
    var password1 = param.password1.trim()
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
        time_stamp: util.getBJDate().getTime(),
        secret_key: util.getMd5()
      },
      method: 'POST',
      success: function (res) {
        if (!res.data.ret) {
          util.toastMsg(i18n[that.data.lg].common.tip, res.data.msg, i18n[that.data.lg].common.confirm)
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
            url: '../mine/mine?lg=' + that.data.lg
          })
        }, 500)
      },
      fail: function (e) {
        console.log(e)
        util.toastMsg(i18n[that.data.lg].common.tip, i18n[that.data.lg].common.network, i18n[that.data.lg].common.confirm)
        that.setModifyData2()
      }
    })
  }
})