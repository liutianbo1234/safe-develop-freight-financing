//IE8兼容bind函数
if (!Function.prototype.bind) {
  Function.prototype.bind = function () {
    if (typeof this !== "function") {
      throw new TypeError(
        "Function.prototype.bind - what is trying to be bound is not callable"
      );
    }
    var _this = this;
    var obj = arguments[0];
    var ags = Array.prototype.slice.call(arguments, 1);
    return function () {
      _this.apply(obj, ags);
    };
  };
}

if (!Array.prototype.indexOf) {
  Array.prototype.indexOf = function (el, star) {
    for (var i = (star | 0), n = this.length; i < n; i++) {
      if (this[i] === el) {
        return i;
      }
    }
    return -1;
  }
}

//IE8兼容Array的forEach
if (!Array.prototype.forEach) {
  Array.prototype.forEach = function forEach(callback, thisArg) {
    var T, k;
    if (this == null) {
      throw new TypeError("this is null or not defined");
    }
    var O = Object(this);
    var len = O.length >>> 0;
    if (typeof callback !== "function") {
      throw new TypeError(callback + " is not a function");
    }
    if (arguments.length > 1) {
      T = thisArg;
    }
    k = 0;
    while (k < len) {
      var kValue;
      if (k in O) {
        kValue = O[k];
        // IE8列表自带undefined
        kValue !== undefined && callback.call(T, kValue, k, O);
      }
      k++;
    }
  };
}

//IE8兼容Object.getPrototypeOf
if (typeof Object.getPrototypeOf !== "function") {
  Object.getPrototypeOf =
    "".__proto__ === String.prototype
      ? function (object) {
        return object.__proto__;
      }
      : function (object) {
        // May break if the constructor has been tampered with
        return object.constructor.prototype;
      };
}

//IE8兼容Object.assign
if (typeof Object.assign != 'function') {
  (function () {
    Object.assign = function (target) {
      'use strict';
      if (target === undefined || target === null) {
        throw new TypeError('Cannot convert undefined or null to object');
      }

      var output = Object(target);
      for (var index = 1; index < arguments.length; index++) {
        var source = arguments[index];
        if (source !== undefined && source !== null) {
          for (var nextKey in source) {
            if (source.hasOwnProperty(nextKey)) {
              output[nextKey] = source[nextKey];
            }
          }
        }
      }
      return output;
    };
  })();
}

//IE8兼容Array.filter
Array.prototype.filter = Array.prototype.filter || function (func) {
  var arr = this;
  var r = [];
  for (var i = 0; i < arr.length; i++) {
    if (func(arr[i], i, arr)) {
      r.push(arr[i]);
    }
  }
  return r;
}

$(function () {//input maxlength兼容
  $("input[maxlength]").on('keyup', function () {
    var area = $(this)
      , max = parseInt(area.attr("maxlength"), 10); //获取maxlength的值
    if (max > 0) {
      if (area.val().length > max) { //textarea的文本长度大于maxlength
        area.val(area.val().substr(0, max)); //截断textarea的文本重新赋值
      }
    }
  }).on('blur', function () {
    //复制的字符处理问题
    var area = $(this)
      , max = parseInt(area.attr("maxlength"), 10); //获取maxlength的值
    if (max > 0) {
      if (area.val().length > max) { //textarea的文本长度大于maxlength
        area.val(area.val().substr(0, max)); //截断textarea的文本重新赋值
      }
    }
  });
})
if (!document.querySelectorAll) {
  document.querySelectorAll = function (selectors) {
    var style = document.createElement('style'), elements = [], element;
    document.documentElement.firstChild.appendChild(style);
    document._qsa = [];

    style.styleSheet.cssText = selectors + '{x-qsa:expression(document._qsa && document._qsa.push(this))}';
    window.scrollBy(0, 0);
    style.parentNode.removeChild(style);

    while (document._qsa.length) {
      element = document._qsa.shift();
      element.style.removeAttribute('x-qsa');
      elements.push(element);
    }
    document._qsa = null;
    return elements;
  };
}

if (!document.querySelector) {
  document.querySelector = function (selectors) {
    var elements = document.querySelectorAll(selectors);
    return (elements.length) ? elements[0] : null;
  };
}

// 用于在IE6和IE7浏览器中，支持Element.querySelectorAll方法
var qsaWorker = (function () {
  var idAllocator = 10000;

  function qsaWorkerShim(element, selector) {
    var needsID = element.id === "";
    if (needsID) {
      ++idAllocator;
      element.id = "__qsa" + idAllocator;
    }
    try {
      return document.querySelectorAll("#" + element.id + " " + selector);
    }
    finally {
      if (needsID) {
        element.id = "";
      }
    }
  }

  function qsaWorkerWrap(element, selector) {
    return element.querySelectorAll(selector);
  }

  // Return the one this browser wants to use
  return document.createElement('div').querySelectorAll ? qsaWorkerWrap : qsaWorkerShim;
})();


