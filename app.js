//app.js
App({
  server_url: 'https://api.zhiyuancaopan.com',
  api_url: 'https://wx.yanysdd.com',
  onLaunch: function() {
    var that = this
    wx.login({
      success: function (res) {
        if (res.code) {
          //发起网络请求
          wx.request({
            url: that.api_url + '/api/v1/weixin/getOpenid',
            data: {
              js_code: res.code
            },
            header: {
              'content-type': 'application/x-www-form-urlencoded'
            },
            method: 'POST',
            success: function (res) {
              that.openid = res.data.obj.openid
              getCustomerInfo(that,res.data.obj.openid)
            },
            fail: function (e) {
              console.log(e)
            }
          })
        } else {
          console.log('获取用户登录态失败！' + res.errMsg)
        }
      }
    })
  },
  getUserInfo: function(cb) {
    var that = this
    if (this.globalData.userInfo) {
      typeof cb == "function" && cb(this.globalData.userInfo)
    } else {
      //调用登录接口
      wx.getUserInfo({
        withCredentials: false,
        success: function(res) {
          that.globalData.userInfo = res.userInfo
          typeof cb == "function" && cb(that.globalData.userInfo)
        }
      })
    }
  },
  globalData: {
    userInfo: null
  }
})
//根据openId获取用户信息
function getCustomerInfo(that,openid){
  wx.request({
    url: that.api_url + '/api/v1/login/infoByOpenId',
    data: {
      openid: openid
    },
    header: {
      'content-type': 'application/x-www-form-urlencoded'
    },
    method: 'POST',
    success: function (res) {
      if (res.data.ret) {
        wx.setStorageSync("USERINFO", res.data.obj)
        if(res.data.obj.type === '游客') {
          wx.redirectTo({
            url: '/pages/c-mine/c-mine'
          })
        } else {
          wx.redirectTo({
            url: '/pages/mine/mine'
          })
        }
      }
    },
    fail: function (e) {
      console.log(e)
    }
  })
}
