var form = layui.form,
  laydate = layui.laydate,
  table = layui.table,
  layrouter = layui.layrouter,
  layer = layui.layer;
var initParams = judgePage();
var judge = true; //控制发票列表是否全选
var confirmDge = false; //全选是否禁用
var tdconfirmDge = false; //添加全选的td
var invoiceLists = []; //备份发票列表数据
var shippingInvoiceList = []; //发票列表数据
var paymentDetail = {}; //付汇信息
var InvoiceUsedTotal = 0; //税价合计金额(美元)
var InvoiceTaxTotal = 0; //税价合计金额(人民币)
var useDollarAmountTotal = 0; //本次使用金额(美元)
var amountTotal = 0; //金额（人民币）
var taxTotal = 0; //税额（人民币）
var amountDollarTotal = 0;//金额（美元）
var taxDollarTotal = 0;//税额（美元）

var safeCode = window.location.store.global.getState().safeCode; //青岛
var cancelNoteValue; //拒绝付汇，核验取消字段
layer.closeAll("tips");
//初始化展示币种 增减全选事件功能
function detailInit() {
  var currencyHtml = renderCurrencyList();
  $("#currency").append($(currencyHtml));
  form.render();
  $("#a1").click(function () {
    var flag = $(this).prop("checked"); // 获得点击的按钮的选中状态 ，true /false.
    $("#a1,.a2").prop("checked", flag);
    if (flag) {
      shippingInvoiceList.forEach(function (item, index) {
        if (item.invoiceCheckResult == 1) {
          item["tableChecked"] = true;
        }
      });
      invoiceLists = [];
      for (var i = 0; i < shippingInvoiceList.length; i++) {
        if (shippingInvoiceList[i].invoiceCheckResult == 1) {
          invoiceLists.push(paymentDetail.shippingInvoiceList[i]);
        }
      }
      $("#checkAmount").text(amountTotal ? decimalStr(amountTotal, 1) : '');
      $("#checkTax").text(decimalStr(taxTotal, 1));
      $("#checkAmountDollar").text(amountDollarTotal ? decimalStr(amountDollarTotal, 1) : '');
      $("#checkTaxDollar").text(decimalStr(taxDollarTotal, 1));
      $("#checkUseDollarAmount").text(useDollarAmountTotal ? decimalStr(useDollarAmountTotal, 1) : '');
    } else {
      shippingInvoiceList.forEach(function (item, index) {
        item["tableChecked"] = false;
      });
      $("#checkAmount").text('0.00');
      $("#checkTax").text('0.00');
      $("#checkAmountDollar").text('0.00');
      $("#checkTaxDollar").text('0.00');
      $("#checkUseDollarAmount").text('0.00');
    }
  });
  initPage();
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
      // url: 'http://yapi.zcbrop.com/mock/444/shipping/queryDetail',
      dataType: "json",
      contentType: "application/json; charset=utf-8",
      data: JSON.stringify({
        requestPath: "/shipping/queryDetail",
        serviceCode: "shippingPayment",
        shippingCode: initParams.shippingCode,
        safeCode: safeCode,
      }),
      success: function (data) {
        if (data.code === 200) {
          var shippingInvoice = 1;
          paymentDetail = data.data;
          for (var i = 0; i < paymentDetail.shippingInvoiceList.length; i++) {
            if (paymentDetail.shippingInvoiceList[i].invoiceCheckResult == 1) {
              invoiceLists.push(paymentDetail.shippingInvoiceList[i]);
            }
          }
          shippingInvoiceList = data.data.shippingInvoiceList;
          shippingInvoiceList.forEach(function (item, index) {
            item["serialId"] = index + 1;
            item["tableChecked"] = false;
            item["invoiceCheckResult"] == 1 && (shippingInvoice = 0);
          });
          (shippingInvoice &&
            $(".canForeign")
              .addClass("layui-btn-disabled")
              .attr("disabled", "disabled")) ||
            $(".canForeign")
              .removeClass("layui-btn-disabled")
              .attr("disabled", false);
          data.data.paymentState == "CONFIRM" &&
            data.data.bizState == "SUCCESS" &&
            $(".recall").show();
          statusRender(paymentDetail);
          QingRender(shippingInvoiceList, paymentDetail);

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
    exitPaymentApply();
  }
}
function handleClickBack() {
  //清空页面信息
  window.location.state = undefined;
  initParams = undefined;
  Dispatch("global/changeValue", { isLoading: false });
  layer.closeAll();
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

//发票核验后超额以及发票真实展示
function QingRender(data, paymentDetail) {
  var list = data;
  if (
    paymentDetail.paymentState == "CONFIRM" &&
    paymentDetail.bizState == "SUCCESS"
  ) {
    renderList(data, paymentDetail);
    $(".excessD").show();
  } else if (
    paymentDetail.paymentState == "CHECK" &&
    paymentDetail.bizState == "SUCCESS"
  ) {
    $(".excessD").show();
    renderList(data, paymentDetail);
  } else if (
    paymentDetail.paymentState == "CORRECT" &&
    paymentDetail.bizState == "SUCCESS"
  ) {
    $(".excessD").show();
    renderList(data, paymentDetail);
  } else if (
    paymentDetail.paymentState == "CANCEL" &&
    paymentDetail.bizState == "SUCCESS" && (list[0].invoiceCheckResult || list[0].invoiceCheckResult == '0')
  ) {
    $(".excessD").show();
    renderList(data, paymentDetail);
  } else {
    chenckList(data, paymentDetail);
  }
}
//发票核验后信息列表
function renderList(list, paymentDetail) {
  InvoiceTaxTotal = 0;
  InvoiceUsedTotal = 0;
  useDollarAmountTotal = 0;
  var html = "";
  var checkAmount = 0;
  var checkTax = 0;
  var checkAmountDollar = 0;
  var checkTaxDollar = 0;
  var checkUseDollarAmount = 0;
  invoiceLists = [];
  var unOverFlowNum = 0;
  for (var i = 0; i < list.length; i++) {
    if (judge) {
      $(".checkAll").show();
      if (list[i].invoiceCheckResult == 1) {
        html += '<tr class="parent">';
        if ((paymentDetail.paymentEntTaxpayerIdNo == list[i].buyerTaxpayerIdNo || paymentDetail.receiptEntTaxpayerIdNo == list[i].sellerTaxpayerIdNo) && list[i].checkStatus == "UN_OVERFLOW") {
          unOverFlowNum += 1;
          //未超额发票默认勾选
          invoiceLists.push(paymentDetail.shippingInvoiceList[i]);
          shippingInvoiceList[list[i]["serialId"] - 1].tableChecked = true;
          html +=
            '<td><input class="a2" checked id="' +
            list[i].serialId +
            '-checked" onchange="sonClick(\'' +
            list[i].serialId +
            '\')" type="checkbox"></td>';

          checkAmount += Number(list[i].amount ? list[i].amount / 100 : 0);
          checkTax += Number(list[i].tax ? list[i].tax / 100 : 0);
          checkAmountDollar += Number(list[i].amountDollar ? list[i].amountDollar / 100 : 0);
          checkTaxDollar += Number(list[i].taxDollar ? list[i].taxDollar / 100 : 0);
          checkUseDollarAmount += Number(list[i].useDollarAmount ? list[i].useDollarAmount / 100 : 0);
        } else {
          html +=
            '<td><input class="a2" id="' +
            list[i].serialId +
            '-checked" onchange="sonClick(\'' +
            list[i].serialId +
            '\')" type="checkbox"></td>';
        }
        amountTotal += Number(list[i].amount ? list[i].amount : 0);
        taxTotal += Number(list[i].tax ? list[i].tax : 0);
        amountDollarTotal += Number(list[i].amountDollar ? list[i].amountDollar : 0);
        taxDollarTotal += Number(list[i].taxDollar ? list[i].taxDollar : 0);
        useDollarAmountTotal += Number(list[i].useDollarAmount ? list[i].useDollarAmount : 0);
      } else {
        html += '<tr class="parent untrue">';
        html += '<td><input disabled  type="checkbox"></td>';
      }
    } else {
      html += '<tr class="parent">';
    }
    if (confirmDge) {
      $(".checkAll").show();
      $("#a1").attr("disabled", true);
      if (list[i].useStatus == "USED") {
        checkAmount += Number(list[i].amount ? list[i].amount / 100 : 0);
        checkTax += Number(list[i].tax ? list[i].tax / 100 : 0);
        checkAmountDollar += Number(list[i].amountDollar ? list[i].amountDollar / 100 : 0);
        checkTaxDollar += Number(list[i].taxDollar ? list[i].taxDollar / 100 : 0);
        checkUseDollarAmount += Number(list[i].useDollarAmount ? list[i].useDollarAmount / 100 : 0);
        html +=
          '<td><input class="a2" id="' +
          list[i].serialId +
          '-checked" disabled checked onchange="sonClick(\'' +
          list[i].serialId +
          '\')" type="checkbox"></td>';
      } else {
        html +=
          '<td><input class="a2" id="' +
          list[i].serialId +
          '-checked" disabled onchange="sonClick(\'' +
          list[i].serialId +
          '\')" type="checkbox"></td>';
      }
    }
    html += "<td>" + list[i].serialId + "</td>";
    html += '<td class="invoiceRegion">' + (list[i].invoiceRegion || "--") + "</td>";
    html += '<td class="invoiceType">' + (list[i].invoiceType || "--") + "</td>";
    html += '<td class="invoiceNo">' + (list[i].invoiceNo || "--") + "</td>";
    html += '<td class="invoiceCode">' + (list[i].invoiceCode || "--") + "</td>";
    html += "<td>" + list[i].billDt + "</td>";
    html += '<td class="texP">' + (list[i].amount ? decimalStr(list[i].amount, 1) : "0") + "</td>";
    html += '<td class="texP">' + (list[i].tax ? decimalStr(list[i].tax, 1) : "0") + "</td>";
    html += "<td>" + (list[i].rate || "--") + "</td>";
    html += "<td>" + (list[i].amountDollar ? decimalStr(list[i].amountDollar, 1) : "0") + "</td>";
    html += "<td>" + (list[i].taxDollar ? decimalStr(list[i].taxDollar, 1) : "0") + "</td>";
    html += "<td>" + (list[i].useDollarAmount ? decimalStr(list[i].useDollarAmount, 1) : "0") + "</td>";
    if (list[i].checkStatus == "OVERFLOW") {
      html += '<td class="overflow">超额</td>';
    } else if (list[i].checkStatus == "UN_OVERFLOW") {
      html += "<td>未超额</td>";
    } else {
      html += "<td>--</td>";
    }
    if (list[i].invoiceCheckResult == 1) {
      html += "<td>是</td>";
    } else {
      html += "<td class='overflow'>否</td>";
    }
    html += "<td><div class='goodsOrTaxableServiceName' title=" + (list[i].goodsOrTaxableServiceName || "") + ">" + (list[i].goodsOrTaxableServiceName || "") + "</div></td>";
    if (paymentDetail.paymentEntTaxpayerIdNo != list[i].buyerTaxpayerIdNo) {
      $(".explain").show();
      html += '<td style="color: red">' + (list[i].buyerTaxpayerIdNo || "--") + "</td>";
    } else {
      html += '<td>' + (list[i].buyerTaxpayerIdNo || "--") + "</td>";
    }
    if (paymentDetail.receiptEntTaxpayerIdNo != list[i].sellerTaxpayerIdNo) {
      $(".explain").show();
      html += '<td style="color:red">' + (list[i].sellerTaxpayerIdNo || "--") + "</td>";
    } else {
      html += '<td>' + (list[i].sellerTaxpayerIdNo || "--") + "</td>";
    }
    html += "</tr>";
  }
  if (
    paymentDetail.paymentState == "CONFIRM" &&
    paymentDetail.bizState == "SUCCESS"
  ) {
    if (confirmDge && unOverFlowNum == list.length) {
      $("#a1").attr("checked", true);
    }
  }
  //合计
  html += "<tr><td><span>合计</span> </td><td></td><td></td><td></td><td></td><td></td>";
  if (tdconfirmDge || judge || confirmDge) {
    html += "<td></td>";
  }
  if (judge || confirmDge) {
    html += '<td id="checkAmount">' + (checkAmount ? Number(checkAmount).toFixed(2) : '0.00') + "</td>";
    html += '<td id="checkTax">' +  (checkTax ? Number(checkTax).toFixed(2) : '0.00') + "</td>";
    html += "<td></td>"
    html += '<td id="checkAmountDollar">' + (checkAmountDollar ? Number(checkAmountDollar).toFixed(2) : '0.00') + "</td>";
    html += '<td id="checkTaxDollar">' + (checkTaxDollar ? Number(checkTaxDollar).toFixed(2) : '0.00') + "</td>";
    html += '<td id="checkUseDollarAmount">' + (checkUseDollarAmount ? Number(checkUseDollarAmount).toFixed(2) : '0.00') + "</td>";
    html += '<td></td><td></td><td></td><td></td>';
  } else {
    //无选择框的合计
    html += '<td id="checkAmount">' + decimalStr(amountTotal, 1) + "</td>";
    html += '<td id="checkTax">' + decimalStr(taxTotal, 1)  + "</td>";
    html += "<td></td>"
    html += '<td id="checkAmountDollar">' + decimalStr(amountDollarTotal, 1) + "</td>";
    html += '<td id="checkTaxDollar">' + decimalStr(taxDollarTotal, 1) + "</td>";
    html += '<td id="checkUseDollarAmount">' + decimalStr(useDollarAmountTotal, 1) + "</td>";
    html += '<td></td><td></td><td></td><td></td>'
  }
  if (list.length > 0) {
    if (
      list[0].checkStatus == "OVERFLOW" ||
      list[0].checkStatus == "UN_OVERFLOW"
    ) {
      //超额
      html += "<td></td>";
    }
  }

  html += "</tr>";
  $("#Invoice").html(html);
  // $('.overflow').parent().addClass('overflowTr');
}

//发票核验前列表
function chenckList(list, paymentDetail) {
  amountTotal = 0;
  taxTotal = 0;
  amountDollarTotal = 0;
  taxDollarTotal = 0;
  useDollarAmountTotal = 0;
  var html = "";
  for (var i = 0; i < list.length; i++) {
    amountTotal += Number(list[i].amount ? list[i].amount : 0);
    taxTotal += Number(list[i].tax ? list[i].tax : 0);
    amountDollarTotal += Number(list[i].amountDollar ? list[i].amountDollar : 0);
    taxDollarTotal += Number(list[i].taxDollar ? list[i].taxDollar : 0);
    useDollarAmountTotal += Number(list[i].useDollarAmount ? list[i].useDollarAmount : 0);
    html += '<tr class="parent">';
    html += "<td>" + list[i].serialId + "</td>";
    html += '<td class="invoiceRegion">' + (list[i].invoiceRegion || "--") + "</td>";
    html += '<td class="invoiceType">' + (list[i].invoiceType || "--") + "</td>";
    html += '<td class="invoiceNo">' + list[i].invoiceNo + "</td>";
    html += '<td class="invoiceCode">' + list[i].invoiceCode + "</td>";
    html += "<td>" + list[i].billDt + "</td>";
    html += '<td class="texP">' + (list[i].amount ? decimalStr(list[i].amount, 1) : "0") + "</td>";
    html += '<td class="texP">' + (list[i].tax ? decimalStr(list[i].tax, 1) : "0") + "</td>";
    html += "<td>" + (list[i].rate || "--") + "</td>";
    html += "<td>" + (list[i].amountDollar ? decimalStr(list[i].amountDollar, 1) : "0") + "</td>";
    html += "<td>" + (list[i].taxDollar ? decimalStr(list[i].taxDollar, 1) : "0") + "</td>";
    html += "<td>" + (list[i].useDollarAmount ? decimalStr(list[i].useDollarAmount, 1) : "0") + "</td>";
    html += "<td><div class='goodsOrTaxableServiceName' title=" + (list[i].goodsOrTaxableServiceName || "") + ">" + (list[i].goodsOrTaxableServiceName || "--") + "</div></td>";
    html += '<td class="buyerTaxpayerIdNo">' + (list[i].buyerTaxpayerIdNo || "--") + "</td>";
    html += '<td class="sellerTaxpayerIdNo">' + (list[i].sellerTaxpayerIdNo || "--") + "</td>";
    html += "</tr>";
  }
  //合计
  html += "<tr><td><span>合计</span> </td><td></td><td></td><td></td><td></td><td></td>";
  if (tdconfirmDge) {
    html += "<td></td>";
  }
  html += '<td id="checkAmount">' + (amountTotal ? decimalStr(amountTotal, 1) : '') + "</td> ";
  html += '<td id="checkTax">' + decimalStr(taxTotal, 1) + "</td> ";
  html += '<td></td>';
  html += '<td id="checkAmountDollar">' + (amountDollarTotal ? decimalStr(amountDollarTotal, 1) : '') + "</td> ";
  html += '<td id="checkTaxDollar">' + (taxDollarTotal ? decimalStr(taxDollarTotal, 1) : '') + "</td> ";
  html += '<td id="checkUseDollarAmount">' + (useDollarAmountTotal ? decimalStr(useDollarAmountTotal, 1) : '') + "</td> ";
  html += '<td></td><td></td><td></td>';
  html += "</tr>";
  $("#Invoice").html(html);
}

function sonClick(serialId) {
  //单选
  var checkAmount = $("#checkAmount").text() * 100;
  var checkTax = $("#checkTax").text() * 100;
  var checkAmountDollar = $("#checkAmountDollar").text() * 100;
  var checkTaxDollar = $("#checkTaxDollar").text() * 100;
  var checkUseDollarAmount = $("#checkUseDollarAmount").text() * 100;

  var thisItem = shippingInvoiceList.filter(function (item) {
    return item.serialId == serialId;
  });
  if (thisItem.length == 0) {
    return;
  }

  if ($("#" + serialId + "-checked").is(":checked")) {
    shippingInvoiceList[serialId - 1].tableChecked = true;
    checkAmount = accAdd(checkAmount, (thisItem[0].amount ? thisItem[0].amount : 0));
    checkTax = accAdd(checkTax, (thisItem[0].tax ? thisItem[0].tax : 0));
    checkAmountDollar = accAdd(checkAmountDollar, (thisItem[0].amountDollar ? thisItem[0].amountDollar : 0));
    checkTaxDollar = accAdd(checkTaxDollar, (thisItem[0].taxDollar ? thisItem[0].taxDollar : 0));
    checkUseDollarAmount = accAdd(checkUseDollarAmount, (thisItem[0].useDollarAmount ? thisItem[0].useDollarAmount : 0));
  } else {
    shippingInvoiceList[serialId - 1].tableChecked = false;
    checkAmount = accSub(checkAmount, (thisItem[0].amount ? thisItem[0].amount : 0));
    checkTax = accSub(checkTax, (thisItem[0].tax ? thisItem[0].tax : 0));
    checkAmountDollar = accSub(checkAmountDollar, (thisItem[0].amountDollar ? thisItem[0].amountDollar : 0));
    checkTaxDollar = accSub(checkTaxDollar, (thisItem[0].taxDollar ? thisItem[0].taxDollar : 0));
    checkUseDollarAmount = accSub(checkUseDollarAmount, (thisItem[0].useDollarAmount ? thisItem[0].useDollarAmount : 0));
  }

  $("#checkAmount").text(checkAmount && checkAmount >= 0.01 ? decimalStr(checkAmount, 1) : "0.00");
  $("#checkTax").text(checkTax && checkTax >= 0.01 ? decimalStr(checkTax, 1) : "0.00");
  $("#checkAmountDollar").text(checkAmountDollar && checkAmountDollar >= 0.01 ? decimalStr(checkAmountDollar, 1) : "0.00");
  $("#checkTaxDollar").text(checkTaxDollar && checkTaxDollar >= 0.01 ? decimalStr(checkTaxDollar, 1) : "0.00");
  $("#checkUseDollarAmount").text(checkUseDollarAmount && checkUseDollarAmount >= 0.01 ? decimalStr(checkUseDollarAmount, 1) : "0.00");
}
//数据
function statusRender(data) {
  if (data.paymentState == "CHECK" && data.bizState == "SUCCESS") {
    layer.closeAll();
  } else if (data.paymentState == "CHECK" && data.bizState == "FAIL") {
    layer.closeAll();
  }
  data.confirmNote &&
    $(".confirmNote").show() &&
    $("#confirmNoteText").text(data.confirmNote);
  data.cancelNote &&
    $(".cancelNote").show() &&
    $("#cancelNoteText").text(data.cancelNote);
  data.correctNote &&
    $(".correctNote").show() &&
    $("#correctNoteText").text(data.correctNote);
  //paymentState: APPLY": 申请; "CHECK": 发票检验; "CANCEL": 付汇取消; "CONFIRM": 付汇已确认 "RETURNED":退回 "APPLYCHECK":申请校验
  //bizState: 业务状态 （成功:SUCCESS，等待:PENDING，失败:FAILs）
  if (data.paymentState == "APPLY" && data.bizState == "SUCCESS") {
    $("#paystatus").text("待核验");
  } else if (data.paymentState == "APPLY" && data.bizState == "PENDING") {
    $("#paystatus").text("付汇申请上链中");
  } else if (data.paymentState == "CANCEL" && data.bizState == "SUCCESS") {
    $("#paystatus").text("拒绝付汇");
  } else if (data.paymentState == "RETURNED" && data.bizState == "SUCCESS") {
    $("#paystatus").text("核验取消");
  } else if (
    (data.paymentState == "CANCEL" || data.paymentState == "RETURNED") &&
    data.bizState == "FAIL"
  ) {
    $("#paystatus").text("付汇取消上链失败");
  } else if (
    (data.paymentState == "CANCEL" || data.paymentState == "RETURNED") &&
    data.bizState == "PENDING"
  ) {
    $("#paystatus").text("付汇取消上链中");
  } else if (data.paymentState == "CONFIRM") {
    if (data.bizState == "SUCCESS") {
      $("#paystatus").text("已付汇");
    } else if (data.bizState == "FAIL") {
      $("#paystatus").text("付汇确认失败");
    } else if (data.bizState == "PENDING") {
      $("#paystatus").text("付汇确认中");
    }
  } else if (data.paymentState == "CHECK" && data.bizState == "SUCCESS") {
    $(".remarks").show();
    $("#paystatus").text("待付汇");
  } else if (data.paymentState == "CHECK" && data.bizState == "PENDING") {
    $("#paystatus").text("待付汇");
  } else if (data.paymentState == "CHECK" && data.bizState == "FAIL") {
    $("#paystatus").text("待付汇（上链失败）");
  } else if (data.paymentState == "CHECK" && data.bizState == "INIT") {
    $("#paystatus").text("发票核验中");
    $(".invoiceButton")
      .addClass("layui-btn-disabled")
      .attr("disabled", "disabled"); //禁用核验按钮
    $(".forCancel").hide();
    $(".foreign").hide();
    $(".forDown").hide();
    $(".recall").hide();
    $(".onChain").hide();
  } else if (data.paymentState == "CORRECT") {
    if (data.bizState == "SUCCESS") {
      $("#paystatus").text("已撤销");
    } else if (data.bizState == "FAIL") {
      $("#paystatus").text("撤销上链失败");
    } else if ((data.bizState == "PENDING")) {
      $("#paystatus").text("撤销上链中");
    }
  }
  if (initParams.authFlag == "true") {
    if (data.paymentState == "APPLY" && data.bizState == "SUCCESS") {
      judge = false;
      exforeign = false;
      $(".refreshButton")
        .addClass("layui-btn-disabled")
        .attr("disabled", "disabled"); //禁用刷新按钮
      $(".foreign").hide(); //付汇取消
      $(".onChain").hide();
      $(".forDown").hide();
      $(".recall").hide();
    } else if (
      (data.paymentState == "CANCEL" && data.bizState == "SUCCESS") ||
      (data.paymentState == "CANCEL" && data.bizState == "PENDING")
    ) {
      judge = false;
      $(".refreshButton")
        .addClass("layui-btn-disabled")
        .attr("disabled", "disabled"); //禁用刷新按钮
      $(".invoiceButton")
        .addClass("layui-btn-disabled")
        .attr("disabled", "disabled"); //禁用核验按钮
      $(".verBefore").show();
      $(".foreign").hide();
      $(".forCancel").hide();
      $(".onChain").hide();
      $(".recall").hide();
    } else if (data.paymentState == "CANCEL" && data.bizState == "FAIL") {
      judge = false;
      $(".refreshButton")
        .addClass("layui-btn-disabled")
        .attr("disabled", "disabled"); //禁用刷新按钮
      $(".invoiceButton")
        .addClass("layui-btn-disabled")
        .attr("disabled", "disabled"); //禁用核验按钮
      $(".verBefore").show();
      $(".foreign").hide();
      $(".forCancel").hide();
      $(".onChain").show();
      $(".recall").hide();
    } else if (data.paymentState == "CORRECT" && data.bizState == "FAIL") {
      judge = false;
      $(".refreshButton")
        .addClass("layui-btn-disabled")
        .attr("disabled", "disabled"); //禁用刷新按钮
      $(".invoiceButton")
        .addClass("layui-btn-disabled")
        .attr("disabled", "disabled"); //禁用核验按钮
      $(".verBefore").show();
      $(".foreign").hide();
      $(".forCancel").hide();
      $(".onChain").show();
      $(".recall").hide();
    } else if (
      data.paymentState == "RETURNED" &&
      (data.bizState == "SUCCESS" ||
        data.bizState == "FAIL" ||
        data.bizState == "PENDING")
    ) {
      judge = false;
      $(".refreshButton")
        .addClass("layui-btn-disabled")
        .attr("disabled", "disabled"); //禁用刷新按钮
      $(".invoiceButton")
        .addClass("layui-btn-disabled")
        .attr("disabled", "disabled"); //禁用核验按钮
      $(".foreign").hide();
      $(".forCancel").hide();
      $(".forDown").hide();
      $(".onChain").hide();
      $(".recall").hide();
      if (data.bizState === "FAIL") {
        $(".onChain").show();
      }
    } else if (data.paymentState == "CONFIRM" && data.bizState == "SUCCESS") {
      tdconfirmDge = true;
      confirmDge = true;
      judge = false;
      $(".remarks").show();
      $(".verBefore").show();
      $(".refreshButton")
        .addClass("layui-btn-disabled")
        .attr("disabled", "disabled"); //禁用刷新按钮
      $(".invoiceButton")
        .addClass("layui-btn-disabled")
        .attr("disabled", "disabled"); //禁用核验按钮
      $(".onChain").hide();
      $(".forCancel").hide();
      $(".foreign").hide();
      $(".recall").show()
    } else if (data.paymentState == "CORRECT" && data.bizState == "SUCCESS") {
      tdconfirmDge = true;
      confirmDge = true;
      judge = false;
      $(".verBefore").show();
      $(".refreshButton")
        .addClass("layui-btn-disabled")
        .attr("disabled", "disabled"); //禁用刷新按钮
      $(".invoiceButton")
        .addClass("layui-btn-disabled")
        .attr("disabled", "disabled"); //禁用核验按钮
      $(".onChain").hide();
      $(".forCancel").hide();
      $(".foreign").hide();
      $(".recall").hide();
    } else if (data.paymentState == "CONFIRM" && data.bizState == "FAIL") {
      judge = false;
      $(".foreign").hide();
      $(".onChain").show();
      $(".forCancel").hide();
      $(".recall").hide();
      $(".refreshButton")
        .addClass("layui-btn-disabled")
        .attr("disabled", "disabled"); //禁用刷新按钮
      $(".invoiceButton")
        .addClass("layui-btn-disabled")
        .attr("disabled", "disabled"); //禁用核验按钮
      $(".verBefore").show();
    } else if (data.paymentState == "CONFIRM" && data.bizState == "PENDING") {
      judge = false;
      $(".foreign").hide();
      $(".forCancel").hide();
      $(".recall").hide();
      $(".verBefore").show();
      $(".refreshButton")
        .addClass("layui-btn-disabled")
        .attr("disabled", "disabled"); //禁用刷新按钮
      $(".invoiceButton")
        .addClass("layui-btn-disabled")
        .attr("disabled", "disabled"); //禁用核验按钮
    } else if (data.paymentState == "CHECK" && data.bizState == "SUCCESS") {
      tdconfirmDge = true;
      judge = true;
      $(".refreshButton")
        .addClass("layui-btn-disabled")
        .attr("disabled", "disabled"); //禁用刷新按钮
      $(".invoiceButton")
        .addClass("layui-btn-disabled")
        .attr("disabled", "disabled"); //禁用核验按钮
      $(".forCancel").hide();
      $(".verAfter").show();
      $(".recall").hide();
      $(".foreign").show();
    } else if (data.paymentState == "CHECK" && data.bizState == "FAIL") {
      $(".foreign").hide();
      $(".forCancel").hide();
      $(".forDown").hide();
      $(".onChain").show();
      $(".recall").hide();
      $("#checkButtons").hide();
      judge = false;
    } else if (data.paymentState == "CHECK" && data.bizState == "PENDING") {
      $(".forCancel").hide();
      $(".recall").hide();
      $(".forDown").hide();
      judge = false;
      $(".foreign").hide();
      $(".refreshButton")
        .removeClass("layui-btn-disabled")
        .removeAttr("disabled");
      $(".invoiceButton")
        .addClass("layui-btn-disabled")
        .attr("disabled", "disabled"); //禁用核验按钮
    } else if (data.bizState == "FAIL") {
      $(".foreign").hide();
      $(".onChain").show();
      $(".forCancel").hide();
      $("#checkButtons").hide();
      $(".recall").hide();
    } else if (data.bizState == "PENDING") {
      $(".forCancel").hide();
      if(data.paymentState != "APPLY"){
        $(".verBefore").show();
      }
      if(data.paymentState == "APPLY"){
        $('.forDown').hide()
      }
      $(".recall").hide();
      judge = false;
      $(".foreign").hide();
      $(".refreshButton")
        .addClass("layui-btn-disabled")
        .attr("disabled", "disabled"); //禁用刷新按钮
      $(".invoiceButton")
        .addClass("layui-btn-disabled")
        .attr("disabled", "disabled"); //禁用核验按钮
    } else {
      $(".verAfter").show();
    }
  } else if (initParams.authFlag == "false") {
    judge = false;
    $(".foreign").hide();
    $(".forCancel").hide();
    $(".forDown").hide();
    $(".recall").hide();
    $(".refreshButton")
      .addClass("layui-btn-disabled")
      .attr("disabled", "disabled"); //禁用刷新按钮
    $(".invoiceButton")
      .addClass("layui-btn-disabled")
      .attr("disabled", "disabled"); //禁用核验按钮
    if (data.paymentState == "CONFIRM") {
      $(".verBefore").show();
    }
    if (data.paymentState == "CONFIRM" && data.bizState == "SUCCESS") {
      confirmDge = true;
      tdconfirmDge = true;
    }
  }
  $("#paymentEntTaxpayerIdNo").text(data.paymentEntTaxpayerIdNo);
  $("#freightChargePaymentNo").text(data.freightChargePaymentNo);
  $("#shippingCode").text(data.shippingCode);
  $("#paymentEntName").text(data.paymentEntName);
  $("#receiptEntTaxpayerIdNo").text(data.receiptEntTaxpayerIdNo);
  $("#receiptEntName").text(data.receiptEntName);
  $("#paymentBankCode").text(data.bankOrgCode);
  $("#paymentBankName").text(data.bankName);
  $("#receiptBankCode").text(data.receiptBankCode);
  $("#applyAmount").text(
    data.applyAmount ? decimalStr(data.applyAmount, 2) : ""
  );
  $("#applyCurrency").text(data.applyCurrency);
  $("#receiptBankName").text(data.receiptBankName);
  $("#shippingCode").text(data.shippingCode);
  $("#amount").text(data.amount ? decimalStr(data.amount, 2) : "");
  $("#currCY").text(data.currency ? data.currency : "");
}
function amtFocus(e) {
  var num = $(e).val().replace(/,/gi, "");
  if (num != "") {
    $(e).val(num);
  }
}
function amtBlur(e, flag, serialId, useAmount) {
  var num = e.value;
  var isError = false;
  if (!useAmount) {
    useAmount = 0;
  }
  if (isNaN(num)) {
    $(e).val(decimalStr(useAmount, 1));
    layer.msg("请输入正确的金额", { icon: 7 });
    isError = true;
  } else {
    if (num != "") {
      var b = parseFloat(num).toFixed(3).slice(0, -1);
      if (b.length > 15) {
        layer.msg("金额位数超限", { icon: 7 });
        $(e).val(decimalStr(useAmount, 1));
        isError = true;
      } else if (parseFloat(b) <= 0) {
        layer.msg("金额必须大于0", { icon: 7 });
        $(e).val(decimalStr(useAmount, 1));
        isError = true;
      } else {
        $(e).val(b);
      }
    }
  }
  if (flag == 2) {
    //修改table数据源 更新合计结果
    var total = 0;
    if (!b) {
      b = 0;
    }
    if (isError) {
      b = useAmount / 100;
    }
    shippingInvoiceList.forEach(function (item) {
      if (item.serialId == serialId) {
        total = total + b * 100;
        item.useAmount = b * 100;
      } else {
        total = total + item.useAmount;
      }
    });
    $("#useMoney").html(decimalStr(total, 1));
  }
}
function checkManifest(e) {
  //发票核验
  layer.open({
    type: 1,
    title: false, //不显示标题栏
    closeBtn: false,
    offset: "100px",
    id: "LAY_layuipro", //设定一个id，防止重复弹出
    btnAlign: "c",
    scrollbar: true,
    moveType: 0, //拖拽模式，0或者1
    content: $("#check-invoice").html(),
    success: function (layero) {
      var invoiceCodeList = [],
        shippingInvoice = 0;
      paymentDetail.shippingInvoiceList.forEach(function (item) {
        item["invoiceCheckResult"] == 1 && (shippingInvoice = 1);
        invoiceCodeList.push({
          invoiceNo: item.invoiceNo,
          invoiceCode: item.invoiceCode,
        });
      });
      shippingInvoice &&
        $(".canForeign")
          .removeClass("layui-btn-disabled")
          .attr("disabled", false); //启用付汇确认

      if (!initParams || getLoading()) {
        return;
      }
      Dispatch("global/changeValue", { isLoading: true });
      try {
        $.ajax({
          method: "POST",
          dataType: "json",
          contentType: "application/json; charset=utf-8",
          url: "api/common/request",
          data: JSON.stringify({
            shippingCode: initParams.shippingCode,
            requestPath: "/v1/shipping/invoiceCheckForQD",
            serviceCode: "shippingPayment",
            invoiceCodeList: invoiceCodeList,
            safeCode: safeCode,
          }),
          success: function (data) {
            if (data.code === 200) {
              Dispatch("global/changeValue", { isLoading: false });
              queryDetail();
            } else {
              layer.closeAll();
              if (data.msg) {
                layer.msg(data.msg, { icon: 2 });
              } else {
                layer.msg("发票核验失败", { icon: 2 });
              }
            }
          },
          error: function (jqXHR, textStatus) {
            onError(jqXHR);
            layer.closeAll();
          },
          complete: function () {
            Dispatch("global/changeValue", { isLoading: false });
          },
        });
      } catch (error) {
        console.log(error);
        layer.msg("数据获取异常，请重试", { icon: 2 });
        layer.closeAll();
        Dispatch("global/changeValue", { isLoading: false });
      }
    },
  });
}
function cancelMtion(type) {
  //付汇取消
  if (!type) {
    return;
  }
  var requestPath = "";
  if (type == 1) {
    requestPath = "/shipping/paymentReturn";
    cancelNoteValue = "您确定要核验取消？";
  } else if (type == 2) {
    requestPath = "/shipping/paymentCancel";
    cancelNoteValue = "您确定要拒绝付汇？";
  }
  layer.confirm(
    cancelNoteValue,
    {
      btn: ["确定", "取消"], //按钮
      btnAlign: "c",
      title: false,
      icon: 3,
      closeBtn: 0,
    },
    function () {
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
            requestPath: requestPath,
            serviceCode: "shippingPayment",
            safeCode: safeCode,
            note: $("#note").val(),
          }),
          success: function (data) {
            if (data.code === 200) {
              layer.msg("付汇取消成功", { icon: 1 });
              exitPaymentApply();
            } else {
              if (data.msg) {
                layer.msg(data.msg, { icon: 2 });
              } else {
                layer.msg("付汇取消失败", { icon: 2 });
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
  );
}

function confirmation() {
  //付汇确认按钮事件
  var currency = $("#currency").val();
  var amount = $("#amountOK").val();
  var invoiceCodeList = [];
  if (!currency) {
    layer.msg("付汇币种不可为空", { icon: 2 });
    $("#currency").focus();
    return;
  }
  if (!amount) {
    layer.msg("付汇金额不可为空", { icon: 2 });
    $("#amountOK").focus();
    return;
  }
  amount = accMul(amount, 100);
  // amount = Number(amount) * 100;
  if (amount == 0) {
    layer.msg("付汇金额必须大于0", { icon: 2 });
    $("#amountOK").focus();
    return;
  }
  var data = shippingInvoiceList.filter(function (item) {
    return item.tableChecked == true;
  });
  if (data.length == 0) {
    layer.confirm("请先勾选发票", {
      btn: ["确定"], //按钮
      btnAlign: "c",
      title: false,
      icon: 7,
      closeBtn: 0,
    });
    return;
  }
  data.forEach(function (item) {
    invoiceCodeList.push({
      invoiceNo: item.invoiceNo,
      invoiceCode: item.invoiceCode,
    });
  });
  var payload = {
    amount: amount,
    currency: currency,
    invoiceCodeList: invoiceCodeList,
  };
  paymentConfirmCheck(payload);
}
function paymentConfirmCheck(payload) {
  //付汇确认检查
  if (!initParams || getLoading()) {
    return;
  }
  Dispatch("global/changeValue", { isLoading: true });
  layer.load(1, {
    shade: [0.1, "#000"], //0.1透明度的白色背景
  });
  $.extend(payload, {
    shippingCode: initParams.shippingCode,
    requestPath: "/shipping/paymentConfirmRateCheck",
    serviceCode: "shippingPayment",
    safeCode: safeCode,
    useAmount:$('#checkUseDollarAmount').text() * 100
  });
  try {
    $.ajax({
      method: "POST",
      dataType: "json",
      contentType: "application/json; charset=utf-8",
      url: "api/common/request",
      data: JSON.stringify(payload),
      success: function (data) {
        if (data.code === 200) {
          layer.closeAll("loading");
          Dispatch("global/changeValue", { isLoading: false });
          if (data.data.rateFlag == true) {
            layer.confirm(
              "本次付汇金额和发票核验使用折美金额差额已超过10%",
              {
                btn: ["确定", "取消"], //按钮
                title: false,
                icon: 7,
                closeBtn: 0,
                btnAlign: "c",
                area: "400px",
              },
              function () {
                paymentConfirm(payload);
              }
            );
          } else {
            paymentConfirm(payload);
          }
        } else {
          if (data.msg) {
            layer.msg(data.msg, { icon: 2 });
          } else {
            layer.msg("付汇确认失败", { icon: 2 });
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
function paymentConfirm(payload) {
  //付汇确认
  payload.requestPath = "/shipping/paymentConfirm";
  payload.note = $("#note").val();
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
      data: JSON.stringify(payload),
      success: function (data) {
        if (data.code === 200) {
          layer.msg("付汇确认成功", { icon: 1 });
          exitPaymentApply();
        } else {
          if (data.msg) {
            layer.msg(data.msg, { icon: 2 });
          } else {
            layer.msg("付汇确认失败", { icon: 2 });
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
    layer.msg("数据获取异常，请重试", { icon: 2 });
    layer.closeAll("loading");
    Dispatch("global/changeValue", { isLoading: false });
  }
}
function downloadInvoiceResult() {
  //下载发票核验结果
  download(
    "api/common/download?requestPath=/shipping/downloadInvoiceResult&serviceCode=shippingPayment&shippingCode=" +
    initParams.shippingCode +
    "&safeCode=" +
    safeCode
  );
}
function onChain() {
  //重新上链
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
        requestPath: "/shipping/retry",
        serviceCode: "shippingPayment",
        safeCode: safeCode,
      }),
      success: function (data) {
        if (data.code === 200) {
          layer.msg("重新上链成功", { icon: 1 });
          exitPaymentApply();
        } else {
          if (data.msg) {
            layer.msg(data.msg, { icon: 2 });
          } else {
            layer.msg("重新上链失败", { icon: 2 });
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
function recall() {
  //付汇撤销
  layer.confirm(
    "您确定要撤销吗?",
    {
      icon: 3,
      title: false,
      closeBtn: 0,
      btnAlign: "c",
      area: "350px",
    },
    function (index) {
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
            requestPath: "/v1/shipping/correct",
            serviceCode: "shippingPayment",
            note: $("#note").val(),
            safeCode: safeCode,
          }),
          success: function (data) {
            if (data.code === 200) {
              layer.msg("付汇撤销成功", { icon: 1 });
              exitPaymentApply();
            } else {
              if (data.msg) {
                layer.msg(data.msg, { icon: 2 });
              } else {
                layer.msg("付汇撤销失败", { icon: 2 });
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
      layer.close(index);
    }
  );
}
function pageReload() {
  layer.open({
    type: 1,
    title: false, //不显示标题栏
    closeBtn: false,
    offset: "100px",
    id: "LAY_layuipro", //设定一个id，防止重复弹出
    btnAlign: "c",
    scrollbar: true,
    moveType: 0, //拖拽模式，0或者1
    content: $("#check-invoice").html(),
    success: function (layero) {
      queryDetail();
    },
  });
}
function errorTipsEvent(event, content) {
  var coordinate = getCoordinateForMouse(event);
  createTipForGDX(content, coordinate[0], coordinate[1]);
}
function queryDetail() {
  try {
    $.ajax({
      method: "POST",
      url: "api/common/request",
      // url: 'http://yapi.zcbrop.com/mock/444/shipping/queryDetail',
      dataType: "json",
      contentType: "application/json; charset=utf-8",
      data: JSON.stringify({
        requestPath: "/shipping/queryDetail",
        serviceCode: "shippingPayment",
        shippingCode: initParams.shippingCode,
        safeCode: safeCode,
      }),
      success: function (data) {
        if (data.code === 200) {
          if (data.data.bizState === 'PENDING' || data.data.bizState === 'INIT') {
            setTimeout(function () {
              queryDetail();
            }, 6000)
          } else {
            layer.closeAll();
            layrouter.refresh();
          }
        }
      }
    });
  } catch (error) {
    console.log(error);
  }
}
detailInit();
