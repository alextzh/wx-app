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
function toastMsg(tit, txt) {
  wx.showModal({
    title: tit,
    showCancel: false,
    content: txt
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

module.exports = {
  formatTime: formatTime,
  regexConfig: regexConfig,
  _normalizeDate: _normalizeDate,
  rendererZhMoneyWan: rendererZhMoneyWan,
  rendererZhMoney: rendererZhMoney,
  rendertoNumber: rendertoNumber,
  jointUrl: jointUrl,
  toastMsg: toastMsg
}
