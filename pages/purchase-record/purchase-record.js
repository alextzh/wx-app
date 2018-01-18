const app = getApp()
var util = require("../../utils/util.js")
var page = 1
var rows = 10

// 获取申购产品列表
var getPurchaseList = function (that, id) {
  wx.request({
    url: app.api_url + '/api/v1/subscribe/mySubscribes',
    data: {
      page: page,
      rows: rows,
      customer_id: id
    },
    header: {
      'content-type': 'application/x-www-form-urlencoded'
    },
    method: 'POST',
    success: function (res) {
      if (!res.data.ret) {
        wx.showModal({
          title: '提示',
          showCancel: false,
          content: res.data.msg
        })
        that.setData({
          hasData: true
        })
        return false
      }
      var totalPage = res.data.obj.totalPage
      var list = res.data.obj.list
      for (let i = 0; i < list.length; i++) {
        list[i].subscribe_time = util._normalizeDate(list[i].subscribe_time)
        list[i].caopan_time = util._normalizeDate(list[i].caopan_time)
        list[i].subscribe_money = util.rendererZhMoneyWan(list[i].subscribe_money)
        list[i].settlement_time = _normalizeStr(list[i].settlement_time)
      }
      that.setData({
        purchaseList: that.data.purchaseList.concat(list)
      })
      page++
      if (page > totalPage) {
        that.setData({
          hasMore: false
        })
      }
    },
    fail: function (e) {
      console.log(e)
    },
    complete: function () {
      wx.hideLoading()
      if (that.data.fresh) {
        setTimeout(() => {
          wx.hideNavigationBarLoading()
          wx.stopPullDownRefresh()
        }, 1000)
      }
    }
  })
}

function _normalizeStr(str) {
  str = str || ''
  let arr = str.split(',')
  let newArr = arr.map(item => {
    return item
  })
  return newArr
}
Page({
  /**
   * 页面的初始数据
   */
  data: {
    purchaseList: [],
    fresh: false, // 上拉刷新标志
    hasData: false, // 是否有数据
    hasMore: true // 是否下拉加载
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    page = 1
    wx.showLoading({
      title: '加载中',
    })
    var that = this
    try {
      var userInfo = wx.getStorageSync('USERINFO')
      if (userInfo) {
        getPurchaseList(that, userInfo.id)
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
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    wx.showNavigationBarLoading()
    page = 1
    var that = this
    that.setData({
      fresh: true,
      hasMore: true,
      purchaseList: []
    })
    try {
      var userInfo = wx.getStorageSync('USERINFO')
      if (userInfo) {
        getPurchaseList(that, userInfo.id)
      }
    } catch (e) {
      // Do something when catch error
    }
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    var that = this
    if (!that.data.hasMore) {
      return false
    }
    try {
      var userInfo = wx.getStorageSync('USERINFO')
      if (userInfo) {
        getPurchaseList(that, userInfo.id)
      }
    } catch (e) {
      // Do something when catch error
    }
  },
  // 申请赎回操作
  redeemAction: function (e) {
    try {
      wx.setStorageSync('CURPRODUCT', e.currentTarget.dataset.item)
    } catch (e) {
    }
    wx.request({
      url: app.api_url + '/api/v1/redeem/checkStatus/' + e.currentTarget.dataset.item.productid,
      method: 'GET',
      success: function (res) {
        if(!res.data.ret) {
          wx.showModal({
            title: '提示',
            showCancel: false,
            content: res.data.msg
          })
          return false
        }
        wx.navigateTo({
          url: '../redeem/redeem'
        })
      },
      fail: function (e) {
        console.log(e)
      }
    })
  },
  // 增加申购
  addAction: function (e) {
    try {
      wx.setStorageSync('CURPRODUCT', e.currentTarget.dataset.item)
    } catch (e) {
    }
    wx.navigateTo({
      url: '../add-apply/add-apply'
    })
  },
  // 修改申请
  editAction: function (e) {
    try {
      wx.setStorageSync('CURPRODUCT', e.currentTarget.dataset.item)
    } catch (e) {
    }
    wx.navigateTo({
      url: '../edit-apply/edit-apply'
    })
  },
  // 删除申请
  cancelAction: function (e) {
    let customer = wx.getStorageSync("USERINFO")
    let subsid = e.currentTarget.dataset.subsid
    wx.showModal({
      title: '提示',
      content: '您确认要删除当前产品申购请求吗？',
      success: function (res) {
        if (res.confirm) {
          wx.request({
            url: app.api_url + '/api/v1/subscribe/qxApply',
            data: {
              customer_id: customer.id,
              subscribe_id: subsid
            },
            header: {
              'content-type': 'application/x-www-form-urlencoded'
            },
            method: 'POST',
            success: function (res) {
              if (!res.data.ret) {
                wx.showModal({
                  title: '提示',
                  showCancel: false,
                  content: res.data.msg
                })
                return false
              }
              wx.showToast({
                title: res.data.msg,
                icon: 'success',
                duration: 1500
              })
              wx.switchTab({
                url: '../mine/mine'
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
})
