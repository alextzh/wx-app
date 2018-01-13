const app = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    userAvatar: '/images/avatar.png',
    mobile: '',
    bind_status:'N',
    username: ''
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
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
    // 从缓存取手机号、姓名
    try {
      var userInfo = wx.getStorageSync('USERINFO')
      if(userInfo) {
        that.setData({
          username: userInfo.name,
          mobile: userInfo.phone,
          bind_status:userInfo.bind_status
        })
      }
    } catch (e) {
      // Do something when catch error
    }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },
  // 跳转到赎回记录页面
  toRedeemRecord: function () {
    wx.navigateTo({
      url: '../redeem-record/redeem-record'
    })
  },
  // 跳转到申购记录页面
  toPurchaseRecord: function () {
    wx.navigateTo({
      url: '../purchase-record/purchase-record'
    })
  },
  // 跳转到修改密码页面
  toModifyPwd: function () {
    wx.navigateTo({
      url: '../modify-pwd/modify-pwd'
    })
  },
  // 跳转到风险提示页面
  toRiskTip: function () {
    wx.navigateTo({
      url: '../risk-tip/risk-tip'
    })
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
  },
  //绑定微信
  bindWx: function(){
    bindWx(this)
  },
  //取消绑定微信
  qxBindWx:function(){
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


// 绑定微信
function bindWx(that){
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
            if(res.data.ret){
              customer.bind_status="Y";
              wx.setStorageSync("USERINFO", customer);
              that.setData({
                bind_status: "Y"
              })
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
        console.log('已取消')
      }
    }
  })
}

//取消绑定微信

function qxBindWx(that){
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
              that.setData({
                bind_status: "N"
              })
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
        console.log('已取消')
      }
    }
  })
}
