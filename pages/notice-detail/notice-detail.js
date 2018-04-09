const util = require('../../utils/util')
const i18n = require('../../utils/i18n')
const langData = require('../../utils/langData')

const handleStr = function(that, str) {
  const _str = str.trim()
  const arr = _str.split('&').slice(1)
  const _arr = arr.map((item) => {
    return item.split('|')
  })
  for (let i = 0; i < _arr.length; i++) {
    if (_arr[i][0].length > 6) {
      _arr[i][0] = cutStr(_arr[i][0])
    } else {
      _arr[i][0] = toArray(_arr[i][0])
    }
  }
  that.setData({
    content: _arr
  })
}

const cutStr = function(str) {
  let _str = str.substr(0, 2) + '|' + str.slice(2)
  return _str.split('|')
}

const toArray = function(str) {
  let _str = '|' + str
  return _str.split('|').slice(1)
}

Page({

  /**
   * 页面的初始数据
   */
  data: Object.assign({}, langData.data, {
    curNotice: null,
    content: []
  }),

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    util.resetSetData.call(that, langData)
    var lang = wx.getStorageSync('lang')
    if (lang) {
      that.setData({
        lg: lang
      })
    }
    var value = wx.getStorageSync('CURNOTICE')
    that.setData({
      curNotice: value
    })
    if (value.type === 'JZGG') {
      handleStr(that, value.content)
    } else {
      that.setData({
        content: value.content
      })
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var that = this
    wx.setNavigationBarTitle({
      title: i18n[that.data.lg].navigator.noticeDetail
    })
  }
})