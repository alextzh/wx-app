import md5 from './md5.js'

function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()


  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

/*截取年月日*/
function _normalizeDate(date) {
  if (date) {
    return date.substr(0, 10)
  }
}
/*数字千分符*/
function rendererZhMoney(v) {
  if (isNaN(v)) {
    return v;
  }
  v = (Math.round((v - 0) * 100)) / 100;
  v = (v == Math.floor(v)) ? v + ".00" : ((v * 10 == Math.floor(v * 10)) ? v
    + "0" : v);
  v = String(v);
  var ps = v.split('.');
  var whole = ps[0];
  var sub = ps[1] ? '.' + ps[1] : '.00';
  var r = /(\d+)(\d{3})/;
  while (r.test(whole)) {
    whole = whole.replace(r, '$1' + ',' + '$2');
  }
  v = whole;

  return v;
}
/*数字千分符转数字*/
function rendertoNumber(num) {
  num = num.split(',').join("");
  return num;
}

/*转为以万为单位*/
function rendererZhMoneyWan(v) {
  if (isNaN(v)) {
    return v;
  }
  v = v * 0.0001;//10000;  
  v = parseInt(v); 
  rendererZhMoney(v);
  return v;
}

/*手机号校验规则*/
function regexConfig() {
  var reg = {
    phone: /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1}))+\d{8})$/
  }
  return reg;
}
/*showToast*/
function toastMsg(tit, txt, confirmText) {
  wx.showModal({
    title: tit,
    showCancel: false,
    content: txt,
    confirmText: confirmText
  })
}

/*拼接url*/
function jointUrl(url, data) {
  return url += (url.indexOf('?') < 0 ? '?' : '&') + param(data)
}
function param(data) {
  let url = ''
  for (var i in data) {
    let value = data[i] !== undefined ? data[i] : ''
    url += `&${i}=${encodeURIComponent(value)}`
  }
  return url ? url.substring(1) : ''
}

function getMd5() {
  const timestamp = getBJDate().getTime()
  const key = 'zhiyuancp'
  const str = `${timestamp}${key}`
  return md5(str)
}

function time_range(beginTime, endTime) {
  var strb = beginTime.split(':')
  if (strb.length !== 2) {
    return false
  }

  var stre = endTime.split(':')
  if (stre.length !== 2) {
    return false
  }

  var b = getBJDate()
  var e = getBJDate()
  var n = getBJDate()

  b.setHours(strb[0])
  b.setMinutes(strb[1])
  e.setHours(stre[0])
  e.setMinutes(stre[1])

  if (n.getTime() - b.getTime() > 0 && n.getTime() - e.getTime() < 0) {
    return true
  } else {
    return false
  }
}

function getBJDate() {
  var d = new Date()
  var currentDate = new Date()
  var tmpHours = currentDate.getHours()
  // 算得时区
  var time_zone = -d.getTimezoneOffset() / 60
  // 少于0的是西区 西区应该用时区绝对值加京八区 重新设置时间（西区时间比东区时间早 所以加时区间隔）
  if (time_zone < 0) {
    time_zone = Math.abs(time_zone) + 8
    currentDate.setHours(tmpHours + time_zone)
  } else {
    // 大于0的是东区  东区时间直接跟京八区相减
    time_zone -= 8
    currentDate.setHours(tmpHours - time_zone)
  }
  return currentDate
}

/**
 * 代理小程序的 setData，在更新数据后，翻译传参类型的字符串
 *
 * @param {object} langData 当页的翻译模块
 */
function resetSetData(langData) {
  let self = this

  /**
   * 在小程序中，使用子组件的页面， this.setData configurable 和 writable 都是 false
   * 所以不能重置 setData 方法，只能另起一个函数名，这里用了 setComData，
   * 另外，由于在 langData.js 中 setTransData 方法调用的是 setData，
   * 所以，另外给使用子组件的页面，定义了个 setComTransData 方法，去调用 setComData
   */

  let isUsingComponents = !self.__proto__.hasOwnProperty('setData') && self.__proto__.__proto__.hasOwnProperty('setData')
  let _ = self.setData

  if (!isUsingComponents) {
    self.setData = function (data, isSetTrans = false) {
      _.call(self, data)
      if (isSetTrans) {/* 阻止翻译循环调用 setData  */return; }
      langData.setTransData && langData.setTransData.call(self)
    }
  } else {
    self.setComData = function (data, isSetTrans = false) {
      _.call(self, data)
      if (isSetTrans) {/* 阻止翻译循环调用 setData  */return; }
      langData.setComTransData && langData.setComTransData.call(self)
    }
  }

}

module.exports = {
  formatTime: formatTime,
  regexConfig: regexConfig,
  _normalizeDate: _normalizeDate,
  rendererZhMoneyWan: rendererZhMoneyWan,
  rendererZhMoney: rendererZhMoney,
  rendertoNumber: rendertoNumber,
  jointUrl: jointUrl,
  toastMsg: toastMsg,
  resetSetData,
  getMd5,
  time_range,
  getBJDate
}
