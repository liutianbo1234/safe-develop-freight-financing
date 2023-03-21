var SUCCESS_STATUS = {
   APPLY:"待审核",
   LOAN:"待放款",
   CONFIRM:"待企业确认",
   REPAY:"待还款",
   SETTLED:"已结清",
   UNPAID:"未还款",
   CHECK:"待核验",
   AUDITREJECT:"审核拒绝",
}
var PEDNING_STATUS = {
  APPLY:"待审核(上链中)",
  LOAN:"待放款(上链中)",
  CONFIRM:"待企业确认(上链中)",
  REPAY:"待还款(上链中)",
  SETTLED:"已结清(上链中)",
  UNPAID:"未还款(上链中)",
  CHECK:"待核验(上链中)",
  AUDITREJECT:"审核拒绝(上链中)",
}
var FAIL_STATUS = {
  APPLY:"待审核(上链失败)",
  LOAN:"待放款(上链失败)",
  CONFIRM:"待企业确认(上链失败)",
  REPAY:"待还款(上链失败)",
  SETTLED:"已结清(上链失败)",
  UNPAID:"未还款(上链失败)",
  CHECK:"待核验(上链失败)",
  AUDITREJECT:"审核拒绝(上链失败)",
}
//获取页面参数
function judgePage() {
  var urlParams = window.location.state;
  return urlParams;
}
// 千分位展示
function numFormat(num) {
  var c = (num + "").replace(/(\d{1,3})(?=(\d{3})+(?:$|\.))/g, "$1,");
  return c;
}
// 数字转化为小数点后两位
function decimalStr(str, type) {
  var result;
  if ((str != 0 && !str) || str === "null" || str === "undefined") {
    result = "";
  } else {
    if (isNaN(parseInt(str))) {
      result = "";
    } else {
      if (type == 1) {
        result = (Number(str) / 100).toFixed(2);
      } else if (type == 2) {
        result = numFormat((Number(str) / 100).toFixed(2));
      }
    }
  }
  return result;
}

function numFormat2(numString) {
  var num = numString.replace(/,/gi, "");
  if (num != "") {
    return num;
  }
}

function formStringShow(param) {
  // 表单字符串空值处理
  if (param) {
    if (param === "null" || param === "undefined") {
      return "";
    } else {
      if (typeof param === "string") {
        return $.trim(param);
      } else if (
        typeof param === "number" &&
        param !== Infinity &&
        !isNaN(param)
      ) {
        return param;
      }
    }
  } else {
    return "";
  }
}
//获取loading状态
function getLoading() {
  return location.store.global.getState().isLoading;
}
//获取global store value
function getGlobalStoreValue(key) {
  return location.store.global.getState()[key];
}

function onError(data) {
  //请求error处理
  var layer = layui.layer;
  if (data.status == 403) {
    layer.msg("请重新登录", { icon: 2 });
  } else if (data.status == 406) {
    layer.msg("没有操作权限", { icon: 2 });
  } else {
    layer.msg("系统繁忙，请联系管理员", { icon: 2 });
  }
}
function downloadUrl(url) {
  window.open(url);
}

function IEVersion() {
  var userAgent = navigator.userAgent; //取得浏览器的userAgent字符串
  var isIE =
    userAgent.indexOf("compatible") > -1 && userAgent.indexOf("MSIE") > -1; //判断是否IE<11浏览器
  var isEdge = userAgent.indexOf("Edge") > -1 && !isIE; //判断是否IE的Edge浏览器
  var isIE11 =
    userAgent.indexOf("Trident") > -1 && userAgent.indexOf("rv:11.0") > -1;
  if (isIE) {
    var reIE = new RegExp("MSIE (\\d+\\.\\d+);");
    reIE.test(userAgent);
    var fIEVersion = parseFloat(RegExp["$1"]);
    if (fIEVersion == 7) {
      return 7;
    } else if (fIEVersion == 8) {
      return 8;
    } else if (fIEVersion == 9) {
      return 9;
    } else if (fIEVersion == 10) {
      return 10;
    } else {
      return 6; //IE版本<=7
    }
  } else if (isEdge) {
    return "edge"; //edge
  } else if (isIE11) {
    return 11; //IE11
  } else {
    return -1; //不是ie浏览器
  }
}

//乘法精度计算
function accMul(arg1, arg2) {
  var m = 0,
    s1 = arg1.toString(),
    s2 = arg2.toString();
  try {
    m += s1.split(".")[1].length;
  } catch (e) { }
  try {
    m += s2.split(".")[1].length;
  } catch (e) { }
  return (
    (Number(s1.replace(".", "")) * Number(s2.replace(".", ""))) /
    Math.pow(10, m)
  );
}

function translationPoints(num) {
  return accMul(num, 100);
}

//让数字保留n位小数，且不四舍五入
function formatNum(num, precision) {
  num = num + "";
  var index = num.indexOf("."),
    precision = precision || 2;
  if (index !== -1) {
    num = num.substring(0, index + 1 + precision);
  }
  return parseFloat(num).toFixed(precision);
}
//下载文件封装
function download(url) {
  var link = document.getElementById("link");
  if (!link) {
    link = document.createElement("a");
  }
  link.style.display = "none";
  document.body.appendChild(link);
  link.target = "_blank";
  link.href = url;
  link.click();
}



// 获取币种
function getCurrencyList(scenes) {
  var currencyList;
  $.ajax({
    type: "POST",
    url: "api/common/thirdPartDownload",
    dataType: "json",
    contentType: "application/json; charset=utf-8",
    async: false,
    data: JSON.stringify({
      fileCode: scenes,
    }),
    success: function (res) {
      if (res.code === 200) {
        currencyList = JSON.parse(res.data);
      }
    },
    error: function () {
      currencyList = [];
    },
  });
  return currencyList;
}

//根据币种生成html选项
function renderCurrencyList() {
  var currencyList = getCurrencyList("export"),
    currencyListHtml = '<option value="">请选择申请币种</option>';
  for (var i = 0; i < currencyList.length; i++) {
    currencyListHtml +=
      '<option value="' +
      currencyList[i] +
      '">' +
      currencyList[i] +
      "</option>";
  }
  return currencyListHtml;
}

//根据标签位置生成浮动的提示
function createTipForGDX(content, coordinateX, coordinateY, Elementid) {
  cleanTipForGDX(Elementid);
  var span = document.createElement("span");
  span.id = "errorTip";
  span.innerHTML = content;
  span.style.position = "absolute";
  span.style.zIndex = 1;
  span.style.backgroundColor = "#CCCCCC";
  span.style.top = coordinateY - 30 + "px";
  span.style.left = coordinateX - 50 + "px";
  document.body.appendChild(span);
}
//清除浮动的提示
function cleanTipForGDX(TipId) {
  TipId = TipId || "errorTip";
  $("#errorTip").remove();
}

//获取鼠标的坐标
function getCoordinateForMouse(event) {
  var posX = 0,
    posY = 0;
  var event = event || window.event;
  if (event.pageX || event.pageY) {
    posX = event.pageX;
    posY = event.pageY;
  } else if (event.clientX || event.clientY) {
    posX =
      event.clientX +
      document.documentElement.scrollLeft +
      document.body.scrollLeft;
    posY =
      event.clientY +
      document.documentElement.scrollTop +
      document.body.scrollTop;
  }
  return [posX, posY];
}
function accAdd(arg1, arg2) {
  var r1, r2, m, c;
  try {
    r1 = arg1.toString().split(".")[1].length;
  }
  catch (e) {
    r1 = 0;
  }
  try {
    r2 = arg2.toString().split(".")[1].length;
  }
  catch (e) {
    r2 = 0;
  }
  c = Math.abs(r1 - r2);
  m = Math.pow(10, Math.max(r1, r2));
  if (c > 0) {
    var cm = Math.pow(10, c);
    if (r1 > r2) {
      arg1 = Number(arg1.toString().replace(".", ""));
      arg2 = Number(arg2.toString().replace(".", "")) * cm;
    } else {
      arg1 = Number(arg1.toString().replace(".", "")) * cm;
      arg2 = Number(arg2.toString().replace(".", ""));
    }
  } else {
    arg1 = Number(arg1.toString().replace(".", ""));
    arg2 = Number(arg2.toString().replace(".", ""));
  }
  return (arg1 + arg2) / m;
}

function accSub(arg1, arg2) {
  var r1, r2, m, n;
  try {
    r1 = arg1.toString().split(".")[1].length;
  }
  catch (e) {
    r1 = 0;
  }
  try {
    r2 = arg2.toString().split(".")[1].length;
  }
  catch (e) {
    r2 = 0;
  }
  m = Math.pow(10, Math.max(r1, r2)); //last modify by deeka //动态控制精度长度
  n = (r1 >= r2) ? r1 : r2;
  return ((arg1 * m - arg2 * m) / m).toFixed(n);
}

function message (msg, index) {
    layer.msg((msg ? msg : '内部服务异常，请稍后重试'), {
      icon: index,
      offset: 't',
      anim: 6,
      time: 2500
    });
}


function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
