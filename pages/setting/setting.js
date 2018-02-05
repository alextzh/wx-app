const app = getApp()

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
              // that.setData({
              //   bind_status: "Y"
              // })
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
              // that.setData({
              //   bind_status: "N"
              // })
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

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // bind_status: 'N',
    isChecked: false,
    isFirstAction: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    try {
      var userInfo = wx.getStorageSync('USERINFO')
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
        // that.setData({
        //   bind_status: userInfo.bind_status
        // })
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