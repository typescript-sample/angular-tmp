var toggleErrorDetail = function () {
  if (sysErrorDetailCaret.classList.contains('fa-caret-up')) {
    sysErrorDetailCaret.classList.remove('fa-caret-up');
    sysErrorDetailCaret.classList.add('fa-caret-down');
    sysErrorDetail.classList.add('show');
  }
  else if (sysErrorDetailCaret.classList.contains('fa-caret-down')) {
    sysErrorDetailCaret.classList.remove('fa-caret-down');
    sysErrorDetailCaret.classList.add('fa-caret-up');
    sysErrorDetail.classList.remove('show');
  }
};
var toggleMenu = function () {
  sysBody.classList.toggle('menu-on');
};
var toggleSearch = function () {
  sysBody.classList.toggle('search');
};
var clearSearch = function (event) {
  var target = event.currentTarget;
  if (ctrl.parentElement.parentElement.classList.contains('input-group')) {
  }
};
var toggleSidebar = function () {
  sysBody.classList.toggle('sidebar-off');
};
var toggleMenuItem = function (event) {
  var target = event.currentTarget;
  if (target.nodeName == 'A')
    target = target.parentElement;
  if (target.nodeName == 'LI')
    target.classList.toggle('open');
};

var isOnkeyPress = false;
var isOnblur = false;
var _ddreg = /\d/;
function meaningfulTextOnKeyPress(e) {
  if (isOnkeyPress) {
    isOnkeyPress = false;
    return false;
  }

  if (detectCtrlKeyCombination(e)) {
    return true;
  }

  var key = window.event ? e.keyCode : e.which;
  var keychar = String.fromCharCode(key);
  if (!isSpecialCharacter(keychar))
    return key;
  return _ddreg.test(keychar);
}
var specialCharacters = "<>=[]";
function isSpecialCharacter(c) {
  var length = specialCharacters.length;
  for (var i = 0; i < length; i++) {
    var s = specialCharacters.charAt(i);
    if (s == c)
      return true;
  }
  return false;
}
function faxOnKeyPress(e) {
  return phoneOnKeyPress(e);e
}
function phoneOnKeyPress(e) {
  if (isOnkeyPress) {
    isOnkeyPress = false;
    return false;
  }

  if (detectCtrlKeyCombination(e)) {
    return true;
  }

  var key = window.event ? e.keyCode : e.which;
  var keychar = String.fromCharCode(key);
  if (key == 13 || key == 8 || key == 9 || key == 11 || key == 127 || key == 32 || keychar == '+' || keychar == '-') {
    return key;
  }
  return _ddreg.test(keychar);
}
function digitOnKeyPress(e) {
  if (isOnkeyPress) {
    isOnkeyPress = false;
    return false;
  }

  if (detectCtrlKeyCombination(e)) {
    return true;
  }

  var key = window.event ? e.keyCode : e.which;
  var keychar = String.fromCharCode(key);
  if (key == 13 || key == 8 || key == 9 || key == 11 || key == 127) {
    return key;
  }
  return _ddreg.test(keychar);
}
function intOnKeyPress(e) {
  if (isOnkeyPress) {
    isOnkeyPress = false;
    return false;
  }

  if (detectCtrlKeyCombination(e)) {
    return true;
  }

  var key = window.event ? e.keyCode : e.which;
  //up/down
	/*
	 if (key == 38) {
	 }
	 else if (key == 40) {
	 }*/
  var ctrl = e.srcElement;
  var keychar = String.fromCharCode(key);
  var min = ctrl.getAttribute('min');
  if (!min) {
    min = ctrl.getAttribute('greater-than');
  }
  if (min && !isNaN(min)) {
    min = parseInt(min);
  }
  if (min >= 0) {
    if (key == 13 || key == 8 || key == 9 || key == 11 || key == 127) {
      return key;
    }
  } else {
    if (key == 13 || key == 8 || key == 9 || key == 11 || key == 127 || keychar == '-') {
      return key;
    }
  }
  return _ddreg.test(keychar);
}
function currencyOnKeyPress(e) {
  return numberOnKeyPress(e);
}
function numberOnKeyPress(e) {
  if (isOnkeyPress) {
    isOnkeyPress = false;
    return false;
  }

  if (detectCtrlKeyCombination(e)) {
    return true;
  }

  var key = window.event ? e.keyCode : e.which;
  var keychar = String.fromCharCode(key);
  var scale = -1;
  var ctrl = e.srcElement;
  var min = ctrl.getAttribute('min');
  if (!min) {
    min = ctrl.getAttribute('greater-than');
  }
  var numFormat = ctrl.getAttribute('number-format');
  if (numFormat != null && numFormat.length > 0) {
    if (numFormat.indexOf('number') == 0) {
      var strNums = numFormat.split(':');
      if (strNums.length > 0 && StringUtil.isULong(strNums[1])) {
        scale = parseInt(strNums[1]);
      }
    }
  }
  if (min && !isNaN(min)) {
    if (scale <= 0)
      min = parseInt(min);
    else
      min = parseFloat(min);
  }
  if (scale == 0) {
    if (min >= 0) {
      if (key == 13 || key == 8 || key == 9 || key == 11 || key == 127)
        return key;
    } else {
      if (key == 13 || key == 8 || key == 9 || key == 11 || key == 127 || keychar == '-') {
        return key;
      }
    }
  } else {
    if (min >= 0) {
      if (key == 13 || key == 8 || key == 9 || key == 11 || key == 127) {
        return key;
      }
    } else {
      if (key == 13 || key == 8 || key == 9 || key == 11 || key == 127 || keychar == '-') {
        return key;
      }
    }
    if (keychar == '.') {
      var str = ctrl.value;
      if (str != '' && str.indexOf('.') < 0)
        return key;
    }
  }
  return _ddreg.test(keychar);
}
function dateOnKeyPress(e) {
  if (isOnkeyPress) {
    isOnkeyPress = false;
    return false;
  }

  if (detectCtrlKeyCombination(e)) {
    return true;
  }

  var key = window.event ? e.keyCode : e.which;
  var keychar = String.fromCharCode(key);
  var ctrl = e.srcElement;
  var dateFormat = ctrl.getAttribute('date-format');
  if (!dateFormat || dateFormat.length == 0)
    dateFormat = ctrl.getAttribute('uib-datepicker-popup');
  if (!dateFormat || dateFormat.length == 0)
    dateFormat = ctrl.getAttribute('datepicker-popup');

  if (!dateFormat || dateFormat.length == 0 || dateFormat.indexOf("MMM") >= 0 || dateFormat.indexOf("{{") >= 0)
    return key;

  var chr = null;
  if (dateFormat.indexOf('/') >= 0) {
    chr = '/';
  }
  else if (dateFormat.indexOf('-') >= 0) {
    chr = '-';
  }
  else if (dateFormat.indexOf('.') >= 0) {
    chr = '.';
  }

  if (!chr) {
    if (key == 13 || key == 8 || key == 9 || key == 11 || key == 127) {
      return key;
    }
  } else {
    if (key == 13 || key == 8 || key == 9 || key == 11 || key == 127 || keychar == chr) {
      return key;
    }
  }
  return _dreg.test(keychar);
}

//detect Ctrl + [a, v, c, x]
function detectCtrlKeyCombination(e) {
  // list all CTRL + key combinations
  var forbiddenKeys = new Array('v', 'a', 'x', 'c');
  var key;
  var isCtrl;
  var browser = navigator.appName;

  if (browser == "Microsoft Internet Explorer") {
    key = e.keyCode;
    // IE
    if (e.ctrlKey) {
      isCtrl = true;
    } else {
      isCtrl = false;
    }
  }
  else {
    if (browser == "Netscape") {
      key = e.which;
      // firefox, Netscape
      if (e.ctrlKey)
        isCtrl = true;
      else
        isCtrl = false;
    } else
      return true;
  }

  // if ctrl is pressed check if other key is in forbidenKeys array
  if (isCtrl) {
    var chr = String.fromCharCode(key).toLowerCase();
    for (i = 0; i < forbiddenKeys.length; i++) {
      if (forbiddenKeys[i] == chr) {
        return true;
      }
    }
  }
  return false;
}
var _dreg = /\.|-/g;

function registerEvents(form) {
  setTimeout(function () {
    for (var j = 0; j < form.length; j++) {
      var ctrl = form[j];
      if (ctrl.nodeName == 'INPUT') {
        var type = ctrl.getAttribute('type');
        if (type != null)
          type = type.toLowerCase();
        if (type != 'checkbox'
          && type != 'radio'
          && type != 'button'
          && type != 'submit'
          && type != 'reset') {
          if (ctrl.getAttribute('onblur') == null && ctrl.getAttribute('(blur)') == null)
            ctrl.onblur = materialOnBlur;
          else
            console.log('name:' + ctrl.getAttribute('name'));
          if (ctrl.getAttribute('onfocus') == null && ctrl.getAttribute('(focus)') == null)
            ctrl.onfocus = materialOnFocus;
          else
            console.log('name:' + ctrl.getAttribute('name'));
        }
      }
    }
  }, 0);
}
function materialOnFocus(event) {
  var ctrl = event.currentTarget;
  if (ctrl.disable || ctrl.readOnly) {
    return;
  }
  handleFocus(ctrl);
}
function handleFocus(control) {
  setTimeout(function () {
    if (control.nodeName === 'INPUT' || control.nodeName === 'SELECT'
      || control.classList.contains('form-control')
      || control.parentElement.classList.contains('form-control')) {
      const container = getControlContainer(control);
      if (container && !container.classList.contains('focused')) {
        container.classList.add('focused');
      }
    }
  }, 0);
}
function getControlContainer(control) {
  const p = control.parentElement;
  if (p.nodeName === 'LABEL' || p.classList.contains('form-group')) {
    return p;
  } else {
    const p1 = p.parentElement;
    if (p.nodeName === 'LABEL' || p1.classList.contains('form-group')) {
      return p1;
    } else {
      const p2 = p1.parentElement;
      if (p.nodeName === 'LABEL' || p2.classList.contains('form-group')) {
        return p2;
      } else {
        const p3 = p2.parentElement;
        if (p.nodeName === 'LABEL' || p3.classList.contains('form-group')) {
          return p3;
        } else {
          return null;
        }
      }
    }
  }
}
function materialOnBlur(event) {
  var ctrl = event.currentTarget;
  handleBlur(ctrl);
}
function handleBlur(ctrl) {
  setTimeout(function () {
    if (ctrl.classList.contains('form-control')
      || ctrl.parentElement.classList.contains('form-control')) {
      if (ctrl.parentElement.classList.contains('form-group'))
        ctrl.parentElement.classList.remove('focused');
      else if (ctrl.parentElement.parentElement.classList.contains('form-group'))
        ctrl.parentElement.parentElement.classList.remove('focused');
    }
  }, 0);
}
function trim(s) {
  if (s == null || s == undefined)
    return;
  s = s.trim();
  let i;
  i = s.length - 1;
  while (i >= 0 && (s.charAt(i) == ' ' || s.charAt(i) == '\t' || s.charAt(i) == '\r' || s.charAt(i) == '\n'))
    i--;
  s = s.substring(0, i + 1);
  i = 0;
  while (i < s.length && (s.charAt(i) == ' ' || s.charAt(i) == '\t' || s.charAt(i) == '\r' || s.charAt(i) == '\n'))
    i++;
  return s.substring(i);
}

var Base64 = { _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=", encode: function (e) { var t = ""; var n, r, i, s, o, u, a; var f = 0; e = Base64._utf8_encode(e); while (f < e.length) { n = e.charCodeAt(f++); r = e.charCodeAt(f++); i = e.charCodeAt(f++); s = n >> 2; o = (n & 3) << 4 | r >> 4; u = (r & 15) << 2 | i >> 6; a = i & 63; if (isNaN(r)) { u = a = 64 } else if (isNaN(i)) { a = 64 } t = t + this._keyStr.charAt(s) + this._keyStr.charAt(o) + this._keyStr.charAt(u) + this._keyStr.charAt(a) } return t }, decode: function (e) { var t = ""; var n, r, i; var s, o, u, a; var f = 0; e = e.replace(/[^A-Za-z0-9+/=]/g, ""); while (f < e.length) { s = this._keyStr.indexOf(e.charAt(f++)); o = this._keyStr.indexOf(e.charAt(f++)); u = this._keyStr.indexOf(e.charAt(f++)); a = this._keyStr.indexOf(e.charAt(f++)); n = s << 2 | o >> 4; r = (o & 15) << 4 | u >> 2; i = (u & 3) << 6 | a; t = t + String.fromCharCode(n); if (u != 64) { t = t + String.fromCharCode(r) } if (a != 64) { t = t + String.fromCharCode(i) } } t = Base64._utf8_decode(t); return t }, _utf8_encode: function (e) { e = e.replace(/rn/g, "n"); var t = ""; for (var n = 0; n < e.length; n++) { var r = e.charCodeAt(n); if (r < 128) { t += String.fromCharCode(r) } else if (r > 127 && r < 2048) { t += String.fromCharCode(r >> 6 | 192); t += String.fromCharCode(r & 63 | 128) } else { t += String.fromCharCode(r >> 12 | 224); t += String.fromCharCode(r >> 6 & 63 | 128); t += String.fromCharCode(r & 63 | 128) } } return t }, _utf8_decode: function (e) { var t = ""; var n = 0; var c1, c2, c3; var r = c1 = c2 = 0; while (n < e.length) { r = e.charCodeAt(n); if (r < 128) { t += String.fromCharCode(r); n++ } else if (r > 191 && r < 224) { c2 = e.charCodeAt(n + 1); t += String.fromCharCode((r & 31) << 6 | c2 & 63); n += 2 } else { c2 = e.charCodeAt(n + 1); c3 = e.charCodeAt(n + 2); t += String.fromCharCode((r & 15) << 12 | (c2 & 63) << 6 | c3 & 63); n += 3 } } return t } };