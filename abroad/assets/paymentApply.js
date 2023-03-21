var form = layui.form,
  laydate = layui.laydate,
  table = layui.table,
  layrouter = layui.layrouter,
  layer = layui.layer;
layer.closeAll("tips");
var safeCode = window.location.store.global.getState().safeCode;
var checkInput = { //校验字段
  paymentEntTaxpayerIdNo: "付汇企业社会统一信用代码",
  paymentEntName: "付汇企业名称",
  receiptEntTaxpayerIdNo: "收汇企业社会统一信用代码",
  receiptEntName: "收汇企业名称",
  receiptBankCode: "收汇金融机构代码",
  receiptBankName: "收汇金融机构名称",
  applyAmount: "付汇申请金额",
  applyCurrency: "付汇申请币种",
  shippingInvoiceList: "发票列表",
  invoiceRegion: '发票归属地',
  invoiceType: "发票类型",
  invoiceNo: "发票号码",
  invoiceCode: "发票代码",
  billDt: "开票日期",
  taxPriceAmount: "税价合计金额",
  buyerTaxpayerIdNo: "购买方纳税人识别号",
  sellerTaxpayerIdNo: "销售方纳税人识别号",
  checkFiled: "查验字段",
  rate: "汇率",
  taxPriceDollarAmount: "税价合计金额(美元)",
  useDollarAmount: "本次使用金额(美元)",
  amount: "金额(人民币)",
  tax: "税额(人民币)",
  amountDollar: "金额(美元)",
  taxDollar: "税额(美元)",
  goodsOrTaxableServiceName: "货物或应税劳务、服务名称",
  buyerName: "购买方名称",
  sellerName: "销售方名称"
},
  checkResult = {
    INVOICE_NO_WRONG: "发票号码错误",
    INVOICE_CODE_WRONG: "发票代码错误",
    SELLER_NO_WRONG: "开票人纳税识别号错误",
    BUYER_NO_WRONG: "收票人纳税识别号错误",
    SUCCESS: "",
  },
  inputRuler = {
    1: "请按要求输入18位数字字母,且不含空格",
    2: "请按要求输入8位数字，且不含空格",
    3: "请按要求输入10或12位数字，且不含空格",
    4: "金额需精度到小数点后两位",
    5: "小数点后最多为六位",
  },
  inputCheckErrorAList = [],
  cnt = 0,
  invoiceInputList = [],
  userDisable = false;
var initParams = judgePage();
function renderDetail() {
  //申请页面银行信息赋值
  var globalState = location.store.global.getState();
  if (!globalState.userContext) {
    layer.msg("数据获取异常，请重试", { icon: 2 });
    setTimeout(function () {
      layrouter.go("/list");
    }, 500);
    return;
  }
  var userInfo = globalState.userContext.userInfo;
  $("#bankOrgCode").val(userInfo.uniqueCode);
  $("#bankName").val(userInfo.entName);
}

//添加新的发票输入行
function addInvoiceInput() {
  if (!userDisable) {
    if (invoiceInputList.length === 300) {
      layer.msg("发票限制300条", { icon: 2 });
    } else {
      var nowDiv = createInvoiceInput();
      cnt++;
      invoiceInputList.push(nowDiv);
      documentAddInvoiceInput();
    }
  }
}
//为发票输入行的首行添加新增按钮
function addBtnForNew() {
  invoiceInputList &&
    invoiceInputList[0]
      .children()
      .last()
      .append($('<a href="javascript:;" onclick="addInvoiceInput()">新增</a>'));
}
//依次为发票输入行赋予序号
function giveInvoiceInputNum() {
  invoiceInputList.forEach(function (value, index) {
    value
      .children()
      .first()
      .text(index + 1 + "");
  });
}
//将发票输入行导入Dom树型结构
function documentAddInvoiceInput() {
  var docFrag = document.createDocumentFragment();
  giveInvoiceInputNum();
  if (invoiceInputList[1]) {
    invoiceInputList[0]
      .children()
      .last()
      .empty()
      .append(
        $(
          '<a href="javascript:;" style="margin-right: 10px;" onclick="delInvoiceInput(this)">删除</a>'
        )
      );
    addBtnForNew();
    invoiceInputList.forEach(function (value) {
      value && docFrag.appendChild(value[0]);
    });
  } else {
    invoiceInputList[0].children().last().empty();
    addBtnForNew();
    docFrag.appendChild(invoiceInputList[0][0]);
  }
  $("#invoiceInfoList thead")
    .empty()
    .append($("#invoice-input-tsingtao").html());
  $(".invoiceInfoList h4").hide();
  $("#invoiceInfoInputList").empty().append($(docFrag));

  $(".invoiceInfoRow").each(function (item) {
    var listCnt = $(this)[0].id.split('invoiceInfoRow-')[1]
    laydate.render({
      elem: "#billDt-" + listCnt, //指定元素
      theme: "#1489DB",
      max: new Date().getTime(),
      trigger: 'click'
    });
    bindGoodsItem('goodsNameDiv-' + listCnt, listCnt, 'goods');
    bindGoodsItem('invoiceTypeDiv-' + listCnt, listCnt, 'invoiceType');
    bindGoodsItem('invoiceRegionDiv-' + listCnt, listCnt, 'invoiceRegion');
  })
}
//生成发票输入行
// ^(([1-9]\d*)(\.\d{1,2})?)$|(0\.0?([1-9]\d?))$
function createInvoiceInput() {
  var display = initParams || "",
    d = $('<tr class="invoiceInfoRow" id="invoiceInfoRow-' + cnt + '"></tr>'),
    d1 = $("<td></td>"), //序号
    d2 = $("<td></td>").append(
      $(
        '<div id="invoiceRegionDiv-' + cnt + '" class="invoiceRegionDiv"><div class="layui-input" id="invoiceRegion-' +
        cnt + '" title="本地" >本地<i class="listEdge"></i></div></div>'
      )
    ), //发票归属地
    d3 = $("<td></td>").append(
      $(
        '<div id="invoiceTypeDiv-' + cnt + '" class="invoiceTypeDiv"><div class="layui-input" id="invoiceType-' +
        cnt + '" title="" ><i class="listEdge"></i></div></div>'
      )
    ), //发票类型
    d4 = $("<td></td>").append(
      $(
        '<input maxlength="8" class="layui-input" onchange="checkContent(/^[0-9]{8}$/g, \'2\', this)" id="invoiceNo-' +
        cnt +
        '">'
      )
    ), //发票号码
    d5 = $("<td></td>").append(
      $(
        '<input maxlength="12" class="layui-input" onchange="checkContent(/^[0-9]{10}$|^[0-9]{12}$/g, \'3\', this)" id="invoiceCode-' +
        cnt +
        '">'
      )
    ), //发票代码
    d6 = $("<td></td>").append(
      $(
        '<input type="text" readonly class="layui-input" autocomplete="off" id="billDt-' +
        cnt +
        '">'
      )
    ), //开票时间
    d7 = $("<td></td>").append(
      $(
        '<input class="layui-input" maxlength="17" onchange="calculateTaxPriceDollarAmount(/^(([1-9]\\d*)|0)(\\.\\d{1,2})?$/, \'4\', this,' + cnt + ')" id="amount-' +
        cnt +
        '">'
      )
    ), //金额(人民币)
    d8 = $("<td></td>").append(
      $(
        '<input class="layui-input" maxlength="17" value="0"  onchange="calculateTaxPriceDollarAmount(/^(([1-9]\\d*)|0)(\\.\\d{1,2})?$/, \'4\', this,' + cnt + ')" id="tax-' +
        cnt +
        '">'
      )
    ), //税额(人民币)
    d9 = $("<td></td>").append(
      $(
        '<input class="layui-input" onchange="calculateTaxPriceDollarAmount(/^(([1-9]\\d*)|0)(\\.\\d{1,6})?$/, \'5\', this, ' +
        cnt +
        ')" id="rate-' +
        cnt +
        '">'
      )
    ), //汇率
    d10 = $("<td></td>").append(
      $(
        '<div class="layui-input calculationDiv"  onchange="calculateTaxPriceDollarAmount(/^(([1-9]\\d*)|0)(\\.\\d{1,2})?$/, \'4\', this,' + cnt + ')" id="amountDollar-' + cnt + '"></div>'
      )
    ), //金额(美元)
    d11 = $("<td></td>").append(
      $(
        '<div class="layui-input calculationDiv"  onchange="calculateTaxPriceDollarAmount(/^(([1-9]\\d*)|0)(\\.\\d{1,2})?$/, \'4\', this,' + cnt + ')" id="taxDollar-' + cnt + '"></div'
      )
    ), //税额(美元)
    d12 = $("<td></td>").append(
      $(
        '<input class="layui-input" maxlength="12"  onchange="checkContent(/^(([1-9]\\d*)|0)(\\.\\d{1,2})?$/, \'4\', this)" id="useDollarAmount-' +
        cnt +
        '">'
      )
    ), //本次使用金额(美元)
    d13 = $("<td></td>").append(
      $(
        '<div id="goodsNameDiv-' + cnt + '" class="goodsNameDiv"><div class="layui-input" id="goodsOrTaxableServiceName-' +
        cnt + '" title="" ><i class="listEdge"></i></div></div>'
      )
    ), //货物或应税劳务、服务名称
    d14 = $("<td></td>").append(
      $(
        '<input class="layui-input buyerTaxpayerIdNo" type="text" maxlength="18" value="'+ $('#paymentEntTaxpayerIdNo').val() +'" onchange="checkContent(/^[A-Za-z0-9]{18}$/g, \'1\', this)" id="buyerTaxpayerIdNo-' +
        cnt +
        '" >'
      )
    ), //购买方名称
    d15 = $("<td></td>").append(
      $(
        '<input class="layui-input sellerTaxpayerIdNo" type="text" value="'+ $('#receiptEntTaxpayerIdNo').val() +'" maxlength="18" onchange="checkContent(/^[A-Za-z0-9]{18}$/g, \'1\', this)" id="sellerTaxpayerIdNo-' +
        cnt +
        '" >'
      )
    ), //销售方名称
    d16 = $("<td style='width:40px'></td>")
      .append(
        $(
          '<a href="javascript:;" style="margin-right: 10px;" onclick="delInvoiceInput(this)">删除</a>'
        )
      )
      .append($('<a href="javascript:;" onclick="addInvoiceInput()">新增</a>'));
  d.append(d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11, d12, d13, d14, d15, d16);
  display && d9.css("display", "") && d10.css("display", "");
  return d;
}

function calculateTaxPriceDollarAmount(re, ruleCode, inputObject, cnt) {
  var itemId = inputObject.id;
  var nowInput = $(inputObject);
  checkContent(re, ruleCode, inputObject);
  if (itemId.indexOf('rate') != -1 && $("#rate-" + cnt).val() == 0) {
    layer.msg("汇率不可为0", { icon: 7 });
  } else {
    if (
      re.test(nowInput.val()) &&
      $("#amount-" + cnt).val() &&
      !isNaN($("#amount-" + cnt).val()) &&
      $("#rate-" + cnt).val() &&
      !isNaN($("#rate-" + cnt).val())
    ) {
      var reNum = formatNum(
        Number(
          $("#amount-" + cnt).val() / $("#rate-" + cnt).val()
        )
      );
      $("#rate-" + cnt).val() && $("#amountDollar-" + cnt).text(reNum);
    }
    if (
      $("#tax-" + cnt).val() &&
      !isNaN($("#tax-" + cnt).val()) &&
      $("#rate-" + cnt).val() &&
      !isNaN($("#rate-" + cnt).val())
    ) {
      var reNum = formatNum(
        Number(
          $("#tax-" + cnt).val() / $("#rate-" + cnt).val()
        )
      );
      $("#rate-" + cnt).val() && $("#taxDollar-" + cnt).text(reNum);
    }
    if ($("#amountDollar-" + cnt).text() && $("#taxDollar-" + cnt).text()) {
      $("#useDollarAmount-" + cnt).removeClass("inputError") &&
        inputCheckErrorAList.indexOf("useDollarAmount-" + cnt) !== -1 &&
        inputCheckErrorAList.splice(
          inputCheckErrorAList.indexOf("useDollarAmount-" + cnt),
          1
        );
      $("#useDollarAmount-" + cnt).val((Number($("#amountDollar-" + cnt).text()) + Number($("#taxDollar-" + cnt).text())).toFixed(2))
    }
  }
}
//删除指定发票输入行
function delInvoiceInput(nowThis) {
  if (!userDisable) {
    var nowDelIndex = "no num",
      p = $(nowThis).parent().parent(),
      id = p[0].id;
    invoiceInputList.forEach(function (value, index) {
      value[0].id === id && (nowDelIndex = index);
    });
    p.remove();
    nowDelIndex !== "no num" && invoiceInputList.splice(nowDelIndex, 1);
    delErrorForInvoiceInput(id);
    documentAddInvoiceInput();
  }
}
//若删除行中有错误提示，删除错误列表中对应的记录
function delErrorForInvoiceInput(id) {
  var copyList = $.extend([], inputCheckErrorAList),
    num = id.split("-")[1];
  inputCheckErrorAList.forEach(function (value) {
    value === "invoiceRegion-" + num && copyList.splice(copyList.indexOf(value), 1);
    value === "invoiceType-" + num && copyList.splice(copyList.indexOf(value), 1);
    value === "invoiceNo-" + num && copyList.splice(copyList.indexOf(value), 1);
    value === "invoiceCode-" + num && copyList.splice(copyList.indexOf(value), 1);
    value === "billDt-" + num && copyList.splice(copyList.indexOf(value), 1);
    value === "amount-" + num && copyList.splice(copyList.indexOf(value), 1);
    value === "tax-" + num && copyList.splice(copyList.indexOf(value), 1);
    value === "amountDollar-" + num && copyList.splice(copyList.indexOf(value), 1);
    value === "goodsOrTaxableServiceName-" + num && copyList.splice(copyList.indexOf(value), 1);
    value === "buyerTaxpayerIdNo-" + num && copyList.splice(copyList.indexOf(value), 1);
    value === "sellerTaxpayerIdNo-" + num && copyList.splice(copyList.indexOf(value), 1);
    value === "taxDollar-" + num && copyList.splice(copyList.indexOf(value), 1);
    value === "rate-" + num && copyList.splice(copyList.indexOf(value), 1);
    value === "useDollarAmount-" + num && copyList.splice(copyList.indexOf(value), 1);
  });
  inputCheckErrorAList = copyList;
}
//根据已有的InvoiceInputList生成列表
function handleInvoiceEXCEL(invoiceList, showError, dealNum) {
  invoiceInputList = [];
  for (var i = 0; i < cnt; i++) {
    delErrorForInvoiceInput("invoiceInfoRow-" + i);
  }
  showError = showError || false;
  dealNum = dealNum || "deal";
  invoiceList.forEach(function (value) {
    var nowInvoiceInputLine = createInvoiceInput(),
      nowInvoiceInputLineChildren = nowInvoiceInputLine.children();
    $(nowInvoiceInputLineChildren[1]).children().first().html('<div class="layui-input" id="invoiceRegion-' + cnt + '" title="' + value.invoiceRegion + '">' + (value.invoiceRegion || "") + '<i class="listEdge"></i></div>' || "");
    $(nowInvoiceInputLineChildren[2]).children().first().html('<div class="layui-input" id="invoiceType-' + cnt + '" title="' + value.invoiceType + '">' + (value.invoiceType || "") + '<i class="listEdge"></i></div>' || "");
    $(nowInvoiceInputLineChildren[3]).children().first().val(value.invoiceNo || "");
    $(nowInvoiceInputLineChildren[4]).children().first().val(value.invoiceCode || "");
    $(nowInvoiceInputLineChildren[5]).children().first().val(value.billDt || "");
    $(nowInvoiceInputLineChildren[6]).children().first().val(value.amount ? dealNum === 'deal' ? Math.floor(value.amount * 100) / 100 : value.amount : '');
    $(nowInvoiceInputLineChildren[7]).children().first().val(Math.floor(value.tax * 100) / 100);
    $(nowInvoiceInputLineChildren[8]).children().first().val(value.rate || "");
    var dealAmountDollar = formatNum(Number((Math.floor(value.amount * 100) / 100) / value.rate));
    var dealTaxDollar = formatNum(Number((Math.floor(value.tax * 100) / 100) / value.rate));
    $(nowInvoiceInputLineChildren[9]).children().first().text(value.amountDollar ? dealNum === 'deal' ? Math.floor(value.amountDollar * 100) / 100 : value.amountDollar : dealAmountDollar);
    $(nowInvoiceInputLineChildren[10]).children().first().text(value.taxDollar ? dealNum === 'deal' ? Math.floor(value.taxDollar * 100) / 100 : value.taxDollar : dealTaxDollar);
    $(nowInvoiceInputLineChildren[11]).children().first().val(value.useDollarAmount ? dealNum === 'deal' ? Math.floor(value.useDollarAmount * 100) / 100 : value.useDollarAmount : "");
    $(nowInvoiceInputLineChildren[12]).children().first().html('<div class="layui-input" id="goodsOrTaxableServiceName-' + cnt + '" title="' + value.goodsOrTaxableServiceName + '">' + (value.goodsOrTaxableServiceName || "") + '<i class="listEdge"></i></div>');
    $(nowInvoiceInputLineChildren[12]).children().first().attr("title", value.goodsOrTaxableServiceName);
    $(nowInvoiceInputLineChildren[13]).children().first().val(value.buyerTaxpayerIdNo || "");
    $(nowInvoiceInputLineChildren[14]).children().first().val(value.sellerTaxpayerIdNo || "");
    cnt++;
    invoiceInputList.push(nowInvoiceInputLine);
  });
  documentAddInvoiceInput();
  return true;
}

//重置页面input参数
function inputInit(data) {
  //初始化付汇信息
  $("#paymentEntTaxpayerIdNo").val(data.paymentEntTaxpayerIdNo);
  $("#paymentEntName").val(data.paymentEntName);
  $("#receiptEntTaxpayerIdNo").val(data.receiptEntTaxpayerIdNo);
  $("#receiptEntName").val(data.receiptEntName);
  $("#bankOrgCode").val(data.bankOrgCode);
  $("#bankName").val(data.bankName);
  $("#receiptBankCode").val(data.receiptBankCode);
  $("#receiptBankName").val(data.receiptBankName);
  $("#applyAmount").val((Number(data.applyAmount) / 100).toFixed(2));
  $("#applyCurrency").val(data.applyCurrency);
  form.render();
  //初始化发票信息
  handleInvoiceEXCEL(data.shippingInvoiceList, true);
}
//页面初始化，并获取数据
function initPage() {
  if (!initParams || getLoading()) {
    return;
  }
  Dispatch("global/changeValue", { isLoading: true });
  layer.load(1, {
    shade: [0.1, "#000"], //0.1透明度的白色背景
  });

  try {
    $.ajax({
      method: "POST",
      url: "api/common/request",
      dataType: "json",
      contentType: "application/json; charset=utf-8",
      data: JSON.stringify({
        requestPath: "/shipping/queryDetail",
        serviceCode: "shippingPayment",
        shippingCode: initParams.shippingCode,
        safeCode:safeCode
      }),
      success: function (data) {
        if (data.code === 200) {
          var checking =
            initParams.paymentState === "APPLYCHECK" &&
            initParams.bizState === "PENDING", //单一窗口是否检查中
            checkPass =
              initParams.paymentState === "APPLYCHECK" &&
              initParams.bizState === "SUCCESS", //单一窗口校验通过
            noPermission =
              data.data.checkResult === "TAXPAYERIDNO_NOT_REGISTER", //企业是否在单一窗口注册
            bronChainDisable = initParams.paymentState === "APPLY", //企业端上链是否失败
            btnBox = $("#btnBox");
          userDisable =
            checking || bronChainDisable || noPermission || checkPass; //是否禁用所有input
          $("#invoiceApplyRe").css("display", "");
          $("#invoiceApply").css("display", "");
          $("#receiptBankName").css("display", "");
          data.data.checkResult === "TAXPAYERIDNO_NOT_EXIST" &&
            $("#paymentEntTaxpayerIdNo").next().css("display", "");
          $("#errorInfoDiv")
            .css("display", "")
            .text(
              (checking && "申请查验中") ||
              (bronChainDisable && "申请上链失败") ||
              (checkPass && "申请校验通过") ||
              "查验失败"
            );
          bronChainDisable &&
            btnBox
              .children()
              .first()
              .css("display", "none")
              .next()
              .css("display", "") &&
            $(".downloadModel").hide();
          noPermission && $(".permissionError").css("display", "");
          inputInit(data.data);
          //select input button disable 设置
          userDisable &&
            $("select").attr("disabled", "disabled") &&
            form.render() &&
            $("input").attr("disabled", "disabled") &&
            btnBox
              .children()
              .first()
              .attr("disabled", "true")
              .addClass("layui-btn-disabled") &&
            $(".receiptBankNameSearch")
              .attr("disabled", "true")
              .addClass("layui-btn-disabled") &&
            $(".invoiceButton")
              .attr("disabled", "true")
              .addClass("layui-btn-disabled");
              initParams.authFlag === 'false' && $('.onChain').hide()
        } else {
          if (data.msg) {
            layer.msg(data.msg, { icon: 2 });
          } else {
            layer.msg("数据获取异常, 请重试!", { icon: 2 });
          }
          exitPaymentApply();
        }
      },
      error: function (jqXHR, textStatus) {
        onError(jqXHR);
      },
      complete: function () {
        layer.closeAll("loading");
        Dispatch("global/changeValue", { isLoading: false });
      },
    });
  } catch (error) {
    console.log(error);
    layer.msg("数据获取异常，请重试", { icon: 2 });
    layer.closeAll("loading");
    Dispatch("global/changeValue", { isLoading: false });
  }
}

function init() {
  var currencyHtml = renderCurrencyList();
  $("#applyCurrency").append($(currencyHtml));
  form.render();
  renderDetail();
  addInvoiceInput();
  initPage();
  $(".submitApplyInfoQD").show();
  $(".submitApplyInfo").hide();
  bindTip("paymentEntTaxpayerIdNoInput", "paymentEntTaxpayerIdNo");
  bindTip("paymentEntNameInput", "paymentEntName");
  bindTip("receiptEntTaxpayerIdNoInput", "receiptEntTaxpayerIdNo");
  bindTip("receiptEntNameInput", "receiptEntName");
}
//Input内容校验
function checkContent(re, ruleCode, inputObject,payM) {
  var nowInput = $(inputObject);
  if(payM == "paymentEntTax"){
     if(inputObject.value.length == 18 || inputObject.value.length == 0){
      $('.buyerTaxpayerIdNo').val(inputObject.value)
     }
  }
  if(payM == "receiptEntNo"){
    if(inputObject.value.length == 18 || inputObject.value.length == 0){
     $('.sellerTaxpayerIdNo').val(inputObject.value)
    }
 }
  setTimeout(function () {
    if (!re.test(nowInput.val())) {
      nowInput.val('')
      layer.msg(inputRuler[ruleCode], { icon: 7 }) &&
        !nowInput.hasClass("inputError") &&
        nowInput.addClass("inputError") &&
        inputCheckErrorAList.push(inputObject.id);
    } else {
      nowInput.removeClass("inputError") &&
        inputCheckErrorAList.indexOf(inputObject.id) !== -1 &&
        inputCheckErrorAList.splice(
          inputCheckErrorAList.indexOf(inputObject.id),
          1
        );
    }
  }, 200);
}

function handleClickBack() {
  //清空页面信息
  window.location.state = undefined;
  initParams = undefined;
  layrouter.go("/list");
}
function exitPaymentApply() {
  //清空页面信息
  window.location.state = undefined;
  initParams = undefined;
  setTimeout(function () {
    layrouter.go("/list");
  }, 500);
}
//提取发票列表信息,并检查是否有空项
function getInvoiceInfo() {
  var invoiceList = [],
    nowLineCnt,
    invoiceType = '',
    invoiceRegion = '',
    invoiceNo,
    invoiceCode,
    billDt,
    amount,
    tax,
    rate = 0,
    amountDollar,
    taxDollar,
    useDollarAmount = 0,
    goodsOrTaxableServiceName,
    buyerTaxpayerIdNo,
    sellerTaxpayerIdNo,
    nullCheck = 0,
    nullInputContent = [];
  invoiceInputList.forEach(function (value, index) {
    nowLineCnt = value[0].id.split("-")[1];
    invoiceRegion =
      $("#invoiceRegion-" + nowLineCnt).text() ||
      ((nullCheck = 1) && nullInputContent.push("invoiceRegion"));
    invoiceType =
      $("#invoiceType-" + nowLineCnt).text() ||
      ((nullCheck = 1) && nullInputContent.push("invoiceType"));
    invoiceNo =
      $("#invoiceNo-" + nowLineCnt).val() ||
      ((nullCheck = 1) && nullInputContent.push("invoiceNo"));
    invoiceCode =
      $("#invoiceCode-" + nowLineCnt).val() ||
      ((nullCheck = 1) && nullInputContent.push("invoiceCode"));
    if (
      $("#billDt-" + nowLineCnt).val() &&
      !isNaN(Date.parse($("#billDt-" + nowLineCnt).val()))
    ) {
      billDt = $("#billDt-" + nowLineCnt).val();
    } else {
      (nullCheck = 1) && nullInputContent.push("billDt");
    }
    amount =
      $("#amount-" + nowLineCnt).val() ||
      ((nullCheck = 1) && nullInputContent.push("amount"));
    tax =
      $("#tax-" + nowLineCnt).val() ||
      ((nullCheck = 1) && nullInputContent.push("tax"));
    rate =
      $("#rate-" + nowLineCnt).val() ||
      ((nullCheck = 1) && nullInputContent.push("rate"));
    amountDollar =
      $("#amountDollar-" + nowLineCnt).text() ||
      ((nullCheck = 1) && nullInputContent.push("amountDollar"));
    taxDollar =
      $("#taxDollar-" + nowLineCnt).text() ||
      ((nullCheck = 1) && nullInputContent.push("taxDollar"));
    useDollarAmount =
      $("#useDollarAmount-" + nowLineCnt).val() ||
      ((nullCheck = 1) && nullInputContent.push("useDollarAmount"));
    goodsOrTaxableServiceName =
      $("#goodsOrTaxableServiceName-" + nowLineCnt).attr('title') ||
      ((nullCheck = 1) && nullInputContent.push("goodsOrTaxableServiceName"));
    buyerTaxpayerIdNo =
      $("#buyerTaxpayerIdNo-" + nowLineCnt).val() ||
      ((nullCheck = 1) && nullInputContent.push("buyerTaxpayerIdNo"));
    sellerTaxpayerIdNo =
      $("#sellerTaxpayerIdNo-" + nowLineCnt).val() ||
      ((nullCheck = 1) && nullInputContent.push("sellerTaxpayerIdNo"));
    if (rate == 0) {
      layer.msg("发票列表第" + (Number(index) + 1) + "行，《汇率》不可以为0", {
        icon: 7,
      });
      throw new Error("自定义错误:发票列表存在空汇率");
    }
    nullCheck &&
      (function () {
        layer.msg(
          "发票列表第" +
          (Number(index) + 1) +
          "行，《" +
          checkInput[nullInputContent[0]] +
          "》内容为空或格式有误",
          { icon: 7 }
        );
        throw new Error("自定义错误:发票列表存在空项");
      })();
    invoiceList.push({
      invoiceType: invoiceType,
      invoiceRegion: invoiceRegion,
      invoiceNo: invoiceNo,
      invoiceCode: invoiceCode,
      billDt: billDt,
      amount: translationPoints(amount),
      rate: rate,
      tax: translationPoints(tax),
      amountDollar: translationPoints(amountDollar),
      taxDollar: translationPoints(taxDollar),
      useDollarAmount: translationPoints(useDollarAmount),
      goodsOrTaxableServiceName: goodsOrTaxableServiceName,
      buyerTaxpayerIdNo: buyerTaxpayerIdNo,
      sellerTaxpayerIdNo: sellerTaxpayerIdNo
    });
  });
  if (!nullCheck) {
    return invoiceList;
  }
}
//收集页面所填内容,并检查必填内容
function collectionInputContent() {
  var paymentEntTaxpayerIdNo = $("#paymentEntTaxpayerIdNo").val(),
    paymentEntName = $("#paymentEntName").val(),
    receiptEntTaxpayerIdNo = $("#receiptEntTaxpayerIdNo").val(),
    receiptEntName = $("#receiptEntName").val(),
    receiptBankCode = $("#receiptBankCode").val(),
    receiptBankName = $("#receiptBankName").val(),
    applyAmount = $("#applyAmount").val(),
    applyCurrency = $("#applyCurrency").val(),
    shippingInvoiceList,
    shippingCode = "",
    initParams = judgePage();
  initParams && (shippingCode = initParams.shippingCode);
  if (!paymentEntTaxpayerIdNo) {
    layer.msg(checkInput.paymentEntTaxpayerIdNo + "不可为空", { icon: 7 });
    return;
  }
  if (!paymentEntName) {
    layer.msg(checkInput.paymentEntName + "不可为空", { icon: 7 });
    return;
  }
  if (!receiptEntTaxpayerIdNo) {
    layer.msg(checkInput.receiptEntTaxpayerIdNo + "不可为空", { icon: 7 });
    return;
  }
  if (!receiptEntName) {
    layer.msg(checkInput.receiptEntName + "不可为空", { icon: 7 });
    return;
  }
  if (!receiptBankCode) {
    layer.msg(checkInput.receiptBankCode + "不可为空", { icon: 7 });
    return;
  }
  if (!receiptBankName) {
    layer.msg(checkInput.receiptBankCode + "不可为空", { icon: 7 });
    return;
  }
  if (!applyAmount) {
    layer.msg(checkInput.applyAmount + "不可为空", { icon: 7 });
    return;
  }
  if (!applyCurrency) {
    layer.msg(checkInput.applyCurrency + "不可为空", { icon: 7 });
    return;
  }
  shippingInvoiceList = getInvoiceInfo();
  if (shippingInvoiceList.length > 300) {
    layer.msg("发票数量超出最大限制");
    return;
  }
  if (shippingInvoiceList[0]) {
    return {
      bankOrgCode: $("#bankOrgCode").val(),
      bankName: $("#bankName").val(),
      paymentEntTaxpayerIdNo: paymentEntTaxpayerIdNo,
      paymentEntName: paymentEntName,
      receiptEntTaxpayerIdNo: receiptEntTaxpayerIdNo,
      receiptEntName: receiptEntName,
      receiptBankCode: receiptBankCode,
      receiptBankName: receiptBankName,
      applyAmount: translationPoints(applyAmount),
      applyCurrency: applyCurrency,
      shippingInvoiceList: shippingInvoiceList,
      shippingCode: shippingCode,
    };
  }
}

//展示excel错误信息
function showExcelErrorInfo(errorList) {
  layer.open({
    title: "EXCEL存在错误，请按要求修改文件后重新上传",
    content: $("#invoice-error").html(),
    offset: "100px",
    success: function (layero, index) {
      var docFrag = document.createDocumentFragment();
      errorList.forEach(function (ele) {
        var tr = $("<tr></tr>");
        tr.append($('<th scope="row"></th>').text(ele.rowNum));
        tr.append($("<th></th>").text(ele.invoiceRegion || "---"));
        tr.append($("<th></th>").text(ele.invoiceType || "---"));
        tr.append($("<th></th>").text(ele.invoiceNo || "---"));
        tr.append($("<th></th>").text(ele.invoiceCode || "---"));
        tr.append($("<th></th>").text(ele.billDt));
        tr.append($("<th></th>").text(ele.amount || "---"));
        tr.append($("<th></th>").text(ele.tax || "---"));
        tr.append($("<th></th>").text(ele.rate || "---"));
        tr.append($("<th></th>").text(ele.useDollarAmount || "---"));
        tr.append($("<th></th>").text(ele.goodsOrTaxableServiceName || "---"));
        tr.append($("<th></th>").text(ele.buyerTaxpayerIdNo || "---"));
        tr.append($("<th></th>").text(ele.sellerTaxpayerIdNo || "---"));
        tr.append($("<th></th>").text(ele.errorMsg || "---"));
        docFrag.appendChild(tr[0]);
      });
      $("#excelErrorInfo").empty().append($(docFrag));
    },
  });
}

//上传发票
function myExcelUpload() {
  layer.open({
    type: 1,
    title: "批量上传发票",
    content: $("#import-invoice").html(),
    btn: ["确定", "取消"], //按钮组
    scrollbar: false, //屏蔽浏览器滚动条
    yes: function (index) {
      //layer.msg('yes');    //点击确定回调
      if (getLoading()) {
        return;
      }
      Dispatch("global/changeValue", { isLoading: true });
      layer.load(1, {
        shade: [0.1, "#000"], //0.1透明度的白色背景
      });
      var obj = $("#invoiceFileInput")[0];
      var suffix = obj.value.substr(obj.value.lastIndexOf(".")).toLowerCase();
      if (!suffix) {
        //ie11会在上传完后，重新执行该方法，判断suffix的值，防止重新上传
        layer.closeAll("loading");
        Dispatch("global/changeValue", { isLoading: false });
        return;
      }
      if (suffix !== ".xlsx" && suffix !== ".xls") {
        layer.closeAll("loading");
        Dispatch("global/changeValue", { isLoading: false });
        layer.msg("文件格式有误，请上传正确格式文件！", { icon: 2 });
      } else {
        try {
          $("#invoiceUploadform").ajaxSubmit({
            type: "post",
            url: "api/common/upload",
            data: {
              serviceCode: "shippingPayment",
              requestPath: "/v1/shipping/qingdao/upload/invoice",

              safeCode: safeCode,
            },
            error: function (jqXHR) {
              onError(jqXHR);
            },
            complete: function (res) {
              layer.closeAll("loading");
              Dispatch("global/changeValue", { isLoading: false });
              if (obj.outerHTML) {
                //重置表单
                obj.outerHTML = obj.outerHTML;
              }
            },
            success: function (data) {
              var DATA = JSON.parse(data);
              if (DATA.code == 200) {
                if (!DATA.data.errorList) {
                  (DATA.data.success &&
                    DATA.data.shippingInvoiceList &&
                    DATA.data.shippingInvoiceList.length <= 300 &&
                    DATA.data.shippingInvoiceList[0] &&
                    layer.msg("上传成功！", { icon: 1 }) &&
                    handleInvoiceEXCEL(
                      DATA.data.shippingInvoiceList,
                      false,
                      "no deal"
                    )) ||
                    layer.msg(
                      "EXCEL无内容，或模板被修改，或发票数量超过300条请检查",
                      { icon: 7 }
                    );
                } else {
                  layer.msg("EXCEL存在错误，请检查", { icon: 7 });
                  showExcelErrorInfo(DATA.data.errorList);
                }
              } else {
                if (DATA.msg) {
                  layer.msg(DATA.msg, { icon: 2 });
                } else {
                  layer.msg("数据获取异常, 请重试!", { icon: 2 });
                }
              }
              layer.close(index);
            },
          });
        } catch (error) {
          console.log(error);
          layer.msg("数据获取异常, 请重试!", { icon: 2 });
          layer.closeAll("loading");
          Dispatch("global/changeValue", { isLoading: false });
        }
      }
    },
  });
}
function openSearchBankModel() {
  layer.open({
    type: 1,
    title: "请选择收汇金融机构",
    content: $("#bank-list").html(),
    btn: ["确定"], //按钮组
    scrollbar: false, //屏蔽浏览器滚动条
    offset: "100px",
    area: "700px",
    success: function (layero, index) {
      table.render({
        elem: "#bankTable",
        even: false, // 开启隔行背景
        id: "idTest",
        data: [],
        width: 650,
        contentType: "application/json",
        text: {
          none: "暂无相关数据，或请先搜索", //默认：无数据
        },
        cols: [
          [
            {
              field: "orgName",
              title: "银行名称",
              align: "center",
              text: "center",
              width: 350,
              templet: function (d) {
                return (
                  '<input type="text" class="layui-input" value="' +
                  d.orgName +
                  '" disabled></input>'
                );
              },
            },
            {
              field: "orgCode",
              title: "银行机构代码",
              align: "center",
              text: "center",
              templet: function (d) {
                return (
                  '<input type="text" class="layui-input" value="' +
                  d.orgCode +
                  '" disabled></input>'
                );
              },
            },
            {
              title: "操作",
              align: "center",
              text: "center",
              width: 60,
              templet: function (d) {
                return (
                  '<a href="javascript:;" onclick=selectBank("' +
                  d.orgName +
                  '","' +
                  d.orgCode +
                  '","' +
                  index +
                  '")>选择</a>'
                );
              },
            },
          ],
        ],
      });
      // queryBank();
    },
  });
}
function queryBank(orgName) {
  var payload = {
    currentPage: 1,
    pageSize: 9999,
  };
  payload.orgName = orgName;
  if (getLoading()) {
    return;
  }
  Dispatch("global/changeValue", { isLoading: true });
  layer.load(1, {
    shade: [0.1, "#000"], //0.1透明度的白色背景
  });
  try {
    $.ajax({
      method: "GET",
      dataType: "json",
      contentType: "application/json; charset=utf-8",
      url: "api/enterprise/getBanksByName",
      data: payload,
      success: function (data) {
        if (data.code === 200) {
          table.reload("idTest", {
            data: data.data.list,
          });
        } else {
          if (data.msg) {
            layer.msg(data.msg, { icon: 2 });
          } else {
            layer.msg("数据获取异常，请重试", { icon: 2 });
          }
        }
      },
      error: function (jqXHR, textStatus) {
        onError(jqXHR);
      },
      complete: function () {
        layer.closeAll("loading");
        Dispatch("global/changeValue", { isLoading: false });
      },
    });
  } catch (error) {
    console.log(error);
    layer.msg("数据获取异常，请重试", { icon: 2 });
    layer.closeAll("loading");
    Dispatch("global/changeValue", { isLoading: false });
  }
}
function selectBank(orgName, orgCode, index) {
  $("#receiptBankName").val(orgName);
  $("#receiptBankCode").val(orgCode);
  layer.close(index);
}
//模糊查询银行
function searchByBank() {
  var orgName = $("#orgName").val();
  queryBank(orgName);
}
//重新上链
function bronChainAgain() {
  if (!initParams || getLoading()) {
    return;
  }
  Dispatch("global/changeValue", { isLoading: true });
  layer.load(1, {
    shade: [0.1, "#000"], //0.1透明度的白色背景
  });
  try {
    $.ajax({
      method: "POST",
      dataType: "json",
      contentType: "application/json; charset=utf-8",
      url: "api/common/request",
      data: JSON.stringify({
        shippingCode: initParams.shippingCode,
        requestPath: "/v1/shipping/retry",
        serviceCode: "shippingPayment",
        safeCode:safeCode,
      }),
      success: function (data) {
        if (data.code === 200) {
          layer.msg("发起重新上链成功", { icon: 1 });
          exitPaymentApply();
        } else {
          layer.msg("重新上链上失败", { icon: 2 });
        }
      },
      error: function (jqXHR, textStatus) {
        onError(jqXHR);
      },
      complete: function () {
        layer.closeAll("loading");
        Dispatch("global/changeValue", { isLoading: false });
      },
    });
  } catch (error) {
    console.log(error);
    layer.msg("数据获取异常，请重试", { icon: 2 });
    layer.closeAll("loading");
    Dispatch("global/changeValue", { isLoading: false });
  }
}
//提交申请信息
function submitApplyInfo() {
  if (inputCheckErrorAList[0] === undefined) {
    var submitValue = collectionInputContent();
    if (!submitValue || getLoading()) {
      return;
    }
    Dispatch("global/changeValue", { isLoading: true });
    layer.load(1, {
      shade: [0.1, "#000"], //0.1透明度的白色背景
    });
    try {
      $.ajax({
        type: "POST",
        dataType: "json",
        contentType: "application/json",
        url: "api/common/apply",
        data: JSON.stringify(
          $.extend(
            {
              safeCode: safeCode,
              requestPath: "/shipping/bankApply",
              serviceCode: "shippingPayment",
            },
            submitValue
          )
        ),
        success: function (data) {
          if (data.code === 200) {
            data.data &&
              layer.msg("提交成功", { icon: 1 }) &&
              exitPaymentApply();
          } else {
            if (data.msg) {
              layer.msg(data.msg, { icon: 2 });
            } else {
              layer.msg("数据获取异常, 请重试!", { icon: 2 });
            }
          }
        },
        error: function (jqXHR, textStatus) {
          onError(jqXHR);
        },
        complete: function () {
          layer.closeAll("loading");
          Dispatch("global/changeValue", { isLoading: false });
        },
      });
    } catch (error) {
      console.log(error);
      layer.msg("数据获取异常，请重试", { icon: 2 });
      layer.closeAll("loading");
      Dispatch("global/changeValue", { isLoading: false });
    }
  } else {
    layer.msg("请先按要求输入相关信息", { icon: 7 });
    $('#' + inputCheckErrorAList[0]).focus();
    $('#' + inputCheckErrorAList[0]).addClass('inputError');
  }
}
function downloadTemplate() {
  download("api/common/download?fileId=QD_FREIGHT&serviceCode=shippingPayment&requestPath=/file/templates/download&safeCode=" + safeCode)
}
function bindTip(pid, itemId) {
  var timer;
  $("#" + pid)
    .css("position", "relative")
    .append($("#input-tip").html());
  $("#" + pid + " input").blur(function () {
    setTimeout(function () {
      $("#" + pid + " .inputTip").hide();
    }, 200);
  });
  $("#" + pid + " input").on("input", function () {
    if (!$("#" + pid + " input").val()) {
      return;
    }
    clearTimeout(timer);
    timer = setTimeout(function () {
      //防抖
      var inputValue = $("#" + pid + " input").val();
      $.ajax({
        type: "POST",
        dataType: "json",
        contentType: "application/json",
        url: "api/common/request",
        //url: "http://192.168.9.4/mock/444/shipping/form-cache",
        data: JSON.stringify({
          name: itemId,
          key: inputValue,
          requestPath: "/shipping/form-cache",
          serviceCode: "shippingPayment",
          safeCode: safeCode,
        }),
        success: function (data) {
          if (data.code === 200 && data.data && data.data.length > 0) {
            var tipListHtml = "";
            data.data.forEach(function (item, index) {
              if (
                pid === "paymentEntTaxpayerIdNoInput" ||
                pid === "receiptEntTaxpayerIdNoInput"
              ) {
                tipListHtml +=
                  '<li key="' +
                  item.entName +
                  '" arra="' +
                  item.idNo +
                  '" onclick=selectTip(this,"' +
                  pid +
                  '")><span>' +
                  item.idNo +
                  '</span><span style="padding-left:12px">' +
                  item.entName +
                  "</span></li>";
              } else {
                tipListHtml +=
                  '<li key="' +
                  item.entName +
                  '" arra="' +
                  item.idNo +
                  '" onclick=selectTip(this,"' +
                  pid +
                  '")><span>' +
                  item.entName +
                  "</span><span>" +
                  item.idNo +
                  "</span></li>";
              }
            });
            $("#" + pid + " .inputTip ul").empty();
            $("#" + pid + " .inputTip ul").append(tipListHtml);
            $("#" + pid + " .inputTip").show();
          } else {
            $("#" + pid + " .inputTip ul").empty();
            $("#" + pid + " .inputTip").hide();
          }
        },
      });
    }, 500);
  });
  $("#" + pid + " input").on("focus", function () {
    if (!$("#" + pid + " input").val()) {
      return;
    }
    var inputValue = $("#" + pid + " input").val();
    $.ajax({
      type: "POST",
      dataType: "json",
      contentType: "application/json",
      url: "api/common/request",
      data: JSON.stringify({
        name: itemId,
        key: inputValue,
        requestPath: "/shipping/form-cache",
        serviceCode: "shippingPayment",
        safeCode: safeCode,
      }),
      success: function (data) {
        if (data.code === 200 && data.data && data.data.length > 0) {
          var tipListHtml = "";
          data.data.forEach(function (item, index) {
            if (
              pid === "paymentEntTaxpayerIdNoInput" ||
              pid === "receiptEntTaxpayerIdNoInput"
            ) {
              tipListHtml +=
                '<li key="' +
                item.entName +
                '" arra="' +
                item.idNo +
                '" onclick=selectTip(this,"' +
                pid +
                '")><span>' +
                item.idNo +
                "</span><span>" +
                item.entName +
                "</span></li>";
            } else {
              tipListHtml +=
                '<li key="' +
                item.entName +
                '" arra="' +
                item.idNo +
                '" onclick=selectTip(this,"' +
                pid +
                '")><span>' +
                item.entName +
                "</span><span>" +
                item.idNo +
                "</span></li>";
            }
          });
          $("#" + pid + " .inputTip ul").empty();
          $("#" + pid + " .inputTip ul").append(tipListHtml);
          $("#" + pid + " .inputTip").show();
        } else {
          $("#" + pid + " .inputTip ul").empty();
          $("#" + pid + " .inputTip").hide();
        }
      },
    });
  });
}
function selectTip(e, pid) {
  if (pid === "paymentEntTaxpayerIdNoInput") {
    $("#paymentEntTaxpayerIdNo").val($(e).attr("arra"));
    $("#paymentEntName").val($(e).attr("key"));
    $('.buyerTaxpayerIdNo').val($(e).attr("arra"))
  } else if (pid === "paymentEntNameInput") {
    $("#paymentEntTaxpayerIdNo").val($(e).attr("arra"));
    $('.buyerTaxpayerIdNo').val($(e).attr("arra"))
    $("#paymentEntName").val($(e).attr("key"));
  } else if (pid === "receiptEntTaxpayerIdNoInput") {
    $("#receiptEntTaxpayerIdNo").val($(e).attr("arra"));
    $('.sellerTaxpayerIdNo').val($(e).attr("arra"))
    $("#receiptEntName").val($(e).attr("key"));
  } else if (pid === "receiptEntNameInput") {
    $("#receiptEntTaxpayerIdNo").val($(e).attr("arra"));
    $('.sellerTaxpayerIdNo').val($(e).attr("arra"))
    $("#receiptEntName").val($(e).attr("key"));
  }
  $("#" + pid + " .inputTip").hide();
}


function bindGoodsItem(pid, itemcnt, type) {
  if (userDisable) {
    $("#" + pid + " .layui-input").css("background", "#FAFAFA");
    return;
  }
  if ($("#" + pid + " .inputGoodsTip").length > 0) {
    return;
  }
  var box = document.querySelector('.invoiceInfoList');
  var innerbox = document.querySelector('#invoiceInfoRow-' + itemcnt);
  if (type === 'goods') {
    $("#" + pid)
      .css("position", "relative")
      .append($("#input-goods-tip").html());
  } else if (type === 'invoiceType') {
    $("#" + pid)
      .css("position", "relative")
      .append($("#input-invoice-tip").html());
  } else {
    $("#" + pid)
      .css("position", "relative")
      .append($("#input-region-tip").html());
  }

  $("#" + pid + " .inputGoodsTip div").attr('datacnt', itemcnt);
  //点击其他元素
  $(document).bind("click", function (e) {
    var target = $(e.target);
    if (target.closest("#" + pid).length == 0) { //点击id为parentId之外的地方触发
      $("#" + pid + " .inputGoodsTip").hide();
    }
  })
  $("#" + pid).on("click", function () {
    var wrapperBoxHeight = box.offsetHeight;// 获取父容器高度
    var innerBoxTop = innerbox.offsetTop;// 获取弹框距离顶部高度
    //右侧溢出
    if (document.body.clientWidth < 1480) {
      $("#" + pid + " .inputGoodsTip").css('right', '0px');
    } else {
      $("#" + pid + " .inputGoodsTip").css('right', null);
    }
    //底部溢出
    if (innerBoxTop + 150 > wrapperBoxHeight) {
      $("#" + pid + " .inputGoodsTip").css('bottom', '0px');
    } else {
      $("#" + pid + " .inputGoodsTip").css('bottom', null);
    }
    $("#" + pid + " .inputGoodsTip").show();
  });
}
function selectGoods(e, item, type) {
  window.event.cancelBubble = true;
  var itemCnt = $(e).attr('datacnt');
  if (item === 'hzzcother') {
    layer.open({
      type: 1,
      title: "请输入货物或应税劳务、服务名称",
      content: '<textarea maxlength="300" class="goodsText layui-textarea" rows="5" id="goodsTextarea"></textarea>',
      btn: ["确定", "取消"], //按钮组
      scrollbar: false, //屏蔽浏览器滚动条
      offset: "100px",
      area: "700px",
      id: "goodsText",
      btnAlign: 'c',
      fixed: true,
      success: function () {
        $('#goodsTextarea').val($('#goodsOrTaxableServiceName-' + itemCnt).attr('title'))
      },
      yes: function (index, layero) {
        if (!$('#goodsTextarea').val().toString()) {
          layer.msg('货物或应税劳务、服务名称不能为空', { icon: 7 })
        } else {
          $('#goodsOrTaxableServiceName-' + itemCnt).html($('#goodsTextarea').val());
          $('#goodsOrTaxableServiceName-' + itemCnt).append($('<i class="listEdge"></i>'))
          $('#goodsOrTaxableServiceName-' + itemCnt).attr("title", $('#goodsTextarea').val());
          layer.close(index)
        }
      }
    });
  } else {
    if (type === "goods") {
      $('#goodsOrTaxableServiceName-' + itemCnt).html(item);
      $('#goodsOrTaxableServiceName-' + itemCnt).append($('<i class="listEdge"></i>'))
      $('#goodsOrTaxableServiceName-' + itemCnt).attr('title', item);
    } else if (type === 'invoiceType') {
      $('#invoiceType-' + itemCnt).html(item);
      $('#invoiceType-' + itemCnt).append($('<i class="listEdge"></i>'))
      $('#invoiceType-' + itemCnt).attr('title', item);
    } else {
      $('#invoiceRegion-' + itemCnt).html(item);
      $('#invoiceRegion-' + itemCnt).append($('<i class="listEdge"></i>'))
      $('#invoiceRegion-' + itemCnt).attr('title', item);
    }
  }
  $(e).parent().hide()
}

init();
