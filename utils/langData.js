//动态切换语言处理
const i18n = require('./i18n');
const lang = wx.getStorageSync('lang');

module.exports = {
  data: {
    i18n: i18n[lang]
  },

  // 有参数会变化的翻译放下面的尾部函数里
  setTransData() {
    //读取index.js文件中data的lg属性进行语言切换
    var language = this.data.lg;
    wx.setStorageSync('lang', language);
    let self = this
    self.setData({
      i18n: i18n[language]
    }, true)
  }
}