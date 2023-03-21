// 设置菜单树高度
var treeDiv = $("#orgTree").css("height", screen.availHeight - 250);
var form = layui.form,
  laydate = layui.laydate,
  layrouter = layui.layrouter,
  laypage = layui.laypage,
  layer = layui.layer;
var treeDate = undefined,
  currentTreeCode = undefined;
var beforePaging = 10;
var safeCode = window.location.store.global.getState().safeCode;
//成功业务状态
var STATUS_SUCCSESS = {
  APPLY :"待核验",
  CANCEL:"拒绝付汇",
  CHECK:"待付汇",
  CONFIRM:"已付汇",
  RETURNED:"核验取消",
  APPLYCHECK:"付汇信息核验通过",
  CORRECT:"已撤销",
};
//失败业务状态
var STATUS_FAIL = {
  APPLY :"付汇信息上链失败",
  CANCEL:"上链失败(拒绝付汇)",
  CHECK:"上链失败(待付汇)",
  CONFIRM:"上链失败(已付汇)",
  RETURNED:"上链失败(核验取消)",
  APPLYCHECK:"付汇信息错误",
  CORRECT:"上链失败(已撤销)",
};
// pending业务状态
var STATUS_PENDING = {
  APPLY :"上链中(付汇申请)",
  CANCEL:"上链中(拒绝付汇)",
  CHECK:"待付汇",
  CONFIRM:"上链中(已付汇)",
  RETURNED:"上链中(核验取消)",
  APPLYCHECK:"付汇信息校验中",
  CORRECT:"上链中(已撤销)",
};


//为业务编号添加label，区分单一通道发起还是银行发起
function labelForPaymentNo(value) {
  if (value === "SOLEWIN") {
    return '<span class="layui-badge layui-bg-blue" style="margin-left:5px;"> 单 </span>';
  } else if (value === "BANK" || value === "BANK_DIRECT_LINK") {
    return '<span class="layui-badge layui-bg-orange" style="margin-left:5px;"> 银 </span>';
  } else if (value === "ENT") {
    return '<span class="layui-badge layui-bg-orange" style="margin-left:5px;"> 企 </span>';
  } else {
    return "";
  }
}
function init() {
  if (getGlobalStoreValue('treeBankCode') != getGlobalStoreValue('uniqueCode')) {
    $('.searchExplain').hide();
  }
    $("#paymentState").empty();

  form.render();
  var globalState = location.store.global.getState();
  if (globalState.userContext && globalState.userContext.showOrganizationTree) {  //权限接口 是否展示树形
    queryTree();
    if (globalState.userContext.userInfo.headFlag != 0) {
      $(".refreshTree").hide();
    }
  } else {
    //隐藏树形
    $(".tree-container").hide();
    $(".list-container").removeClass(
      "layui-col-md10 layui-col-xs10 layui-col-sm10"
    );
  }
  renderSearchItem();
  queryList();
}

function renderTree() {
  var userInfo = window.location.store.global.getState().userContext;
  if (userInfo.showOrganizationTree || userInfo.userInfo.headFlag == "0") {
    //有树型
    var setting = {
      view: {
        fontCss: {
          color: "#555",
          "font-size": "13px",
        },
        showIcon: false,
      },
      callback: {
        onClick: function (event, treeId, treeNode) {
          currentTreeCode = treeNode.id;
          Dispatch("global/changeValue", { treeBankCode: currentTreeCode });
          $("#paymentState").empty();
          queryList();
        },
      },
    };
    //调用此方法渲染树型
    function renderTreeData() {
      $.fn.zTree.init($("#orgTree"), setting, treeDate);
    }
    //获取树型,并渲染树型.
    function getTreeDate(isManual) {
      isManual = isManual || false;
      if (!treeDate || isManual) {
        if (window.location.store.global.getState().treeData.code) {
          treeDate = JSON.parse(
            JSON.stringify(window.location.store.global.getState().treeData)
              .replace(/code/g, "id")
              .replace(/nodes/g, "children")
              .replace(/text/g, "name")
          );
          //渲染树型
          renderTreeData();
        }
      } else {
        renderTreeData();
      }
    }
    getTreeDate();
    //刷新树型
    $(".refreshTree").click(function () {
      layer.confirm(
        "您确定要刷新组织结构吗？该功能24h内只能使用一次",
        {
          icon: 3,
          title: false,
          closeBtn: 0,
          btnAlign: "c",
          area: "350px",
        },
        function (index) {
          $.ajax({
            method: "GET",
            url: "api/bank/refreshOrganizationTree",
            async: true,
            success: function (res) {
              if (res.code === 200) {
                layer.msg(
                  "刷新申请已提交，请稍候...",
                  {
                    time: 1000,
                    icon: 1,
                  },
                  getTreeDate(true)
                );
              } else {
                layer.msg(res.msg, {
                  icon: 2,
                });
              }
            },
            error: function (res) {
              layer.msg("组织结构刷新异常,请重试", {
                icon: 2,
              });
            },
          });
          layer.close(index);
        }
      );
    });
  } else {
    // 隐藏树形，内容布局调整
    $(".tree-container").hide();
    $(".list-container").removeClass(
      "layui-col-md10 layui-col-xs10 layui-col-sm10"
    );
    $(".list-container").addClass("layui-col-md12");
  }
}

function renderSearchItem() {
  laydate.render({
    elem: "#createStartDate", //指定元素
    type: "date",
    format: "yyyy-MM-dd",
    theme: "#1489DB",
    done: function (value, data, endData) {
      var startDate = new Date(
        $("#createEndDate").val().replace(/-/g, "/")
      ).getTime();
      var endTime = new Date(value.replace(/-/g, "/")).getTime();
      if (endTime > startDate) {
        layer.msg("开始时间不能大于结束时间!", { icon: 2 });
      }
    },
  });
  laydate.render({
    elem: "#createEndDate", //指定元素
    type: "date",
    format: "yyyy-MM-dd",
    theme: "#1489DB",
    done: function (value, date) {
      var startDate = new Date(
        $("#createStartDate").val().replace(/-/g, "/")
      ).getTime();
      var endTime = new Date(value.replace(/-/g, "/")).getTime();
      if (endTime < startDate) {
        layer.msg("开始时间不能大于结束时间!", { icon: 2 });
      }
    },
  });
  form.render();
  form.on("select(changeStatus)", function (data) {
    var val = data.value;
    Dispatch("list/changeSearchItem", { paymentState: val, currentPage: 1 });
    queryList({
      paymentState: val
    });
  });
  //监听提交
  form.on("submit(formList)", function (data) {
    if (
      data.field.createStartDate &&
      data.field.createEndDate &&
      new Date(data.field.createStartDate.replace(/-/g, "/")).getTime() >
      new Date(data.field.createEndDate.replace(/-/g, "/")).getTime()
    ) {
      layer.msg("开始时间不能大于结束时间!", { icon: 2 });
      return false;
    }
    var payload = {
      shippingCode: data.field.shippingCode,
      invoiceNo: data.field.invoiceNo,
      invoiceCode: data.field.invoiceCode,
      paymentState: data.field.paymentState,
      paymentEntName: data.field.paymentEntName,
      createStartDate: data.field.createStartDate,
      createEndDate: data.field.createEndDate,
      paymentEntTaxpayerIdNo: data.field.paymentEntTaxpayerIdNo,
      bankOrgCode: location.store.global.getState().treeBankCode,
      treeBankCode: location.store.global.getState().treeBankCode,
      safeCode: location.store.global.getState().safeCode,
      requestPath: "/shipping/queryList",
      serviceCode: "shippingPayment",
      currentPage: 1,
      pageSize: 10,
      invoiceErrorState: data.field.invoiceErrorState,
      safeCode:safeCode,
    };
    Dispatch("list/changeValue", { searchItem: payload });
    queryList({
      shippingCode: data.field.shippingCode,
      invoiceNo: data.field.invoiceNo,
      invoiceCode: data.field.invoiceCode,
      paymentState: data.field.paymentState,
      paymentEntName: data.field.paymentEntName,
      createStartDate: data.field.createStartDate,
      createEndDate: data.field.createEndDate,
      paymentEntTaxpayerIdNo: data.field.paymentEntTaxpayerIdNo,
      currentPage: 1,
      pageSize: 10,
      invoiceErrorState: data.field.invoiceErrorState,
      safeCode: window.location.store.global.getState().safeCode,
    });
  });
  // 提交校验
  form.verify({
    entName: function (value, item) {
      if (!new RegExp("^[a-zA-Z0-9_\u4e00-\u9fa5\\s·]*$").test(value)) {
        return "企业名称不能有特殊字符";
      }
    },
  });
  form.val("formListArea", {
    shippingCode: location.store.list.getState().searchItem.shippingCode,
    invoiceNo: location.store.list.getState().searchItem.invoiceNo,
    invoiceCode: location.store.list.getState().searchItem.invoiceCode,
    paymentEntName: location.store.list.getState().searchItem.paymentEntName,
    createStartDate:
      location.store.list.getState().searchItem.createStartDate,
    createEndDate: location.store.list.getState().searchItem.createEndDate,
    paymentEntTaxpayerIdNo:
      location.store.list.getState().searchItem.paymentEntTaxpayerIdNo,
    paymentState: location.store.list.getState().searchItem.paymentState,
    invoiceErrorState:
      location.store.list.getState().searchItem.invoiceErrorState,
  });
}

function queryTree() {
  layer.load(1, {
    shade: [0.1, "#000"], //0.1透明度的白色背景
  });
  try {
    $.ajax({
      type: "GET",
      dataType: "json",
      contentType: "application/json",
      url: "api/bank/organizationTree",
      success: function (data) {
        if (data.code == "200" || data.code == 0) {
          Dispatch("global/changeValue", { treeData: data.data });
          renderTree();
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
      },
    });
  } catch (error) {
    layer.msg("数据获取异常，请重试", { icon: 2 });
    layer.closeAll("loading");
    Dispatch("global/changeValue", { isLoading: false });
  }
}

function queryList(data) {
  if (getLoading()) {
    return;
  }
  data = $.extend(
    {
      shippingCode: location.store.list.getState().searchItem.shippingCode,
      invoiceNo: location.store.list.getState().searchItem.invoiceNo,
      invoiceCode: location.store.list.getState().searchItem.invoiceCode,
      paymentEntName: location.store.list.getState().searchItem.paymentEntName,
      createStartDate:
        location.store.list.getState().searchItem.createStartDate,
      createEndDate: location.store.list.getState().searchItem.createEndDate,
      paymentEntTaxpayerIdNo:
        location.store.list.getState().searchItem.paymentEntTaxpayerIdNo,
      paymentState: location.store.list.getState().searchItem.paymentState,
      bankOrgCode: location.store.global.getState().treeBankCode,
      treeBankCode: location.store.global.getState().treeBankCode,
      pageSize: location.store.list.getState().searchItem.pageSize,
      currentPage: location.store.list.getState().searchItem.currentPage,
      safeCode: location.store.list.getState().searchItem.safeCode,
      requestPath: "/shipping/queryList",
      serviceCode: "shippingPayment",
      invoiceErrorState:
        location.store.list.getState().searchItem.invoiceErrorState,
    },
    data
  );
  Dispatch("global/changeValue", { isLoading: true });
  layer.load(1, {
    shade: [0.1, "#000"], //0.1透明度的白色背景
  });
  try {
    $.ajax({
      type: "POST",
      dataType: "json",
      contentType: "application/json",
      url: "api/common/request",
      data: JSON.stringify(data),
      success: function (data) {
        if (data.code == "200" || data.code == 0) {
          renderTable(data.data);
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
    layer.msg("数据获取异常，请重试", { icon: 2 });
    layer.closeAll("loading");
    Dispatch("global/changeValue", { isLoading: false });
  }
}
//列表遍历
function renderTable(data) {
  $("#tbodyList").html("");
  var list = data.list;
  if (list.length > 0) {
    for (var i = 0; i < list.length; i++) {
      var m = i + 1;
      var STATE = list[i].paymentState;
      html = "<tr><td>" + m + "</td>";
      html +=
        "<td>" +
        list[i].shippingCode +
        labelForPaymentNo(list[i].applyType) +
        "</td>";
      html += "<td>" + list[i].paymentEntTaxpayerIdNo + "</td>";
      html += '<td style="width:300px;">' + list[i].paymentEntName + "</td>";
      html += "<td>" + (list[i].currency ? list[i].currency : "--") + "</td>";
      html +=
        "<td>" +
        (list[i].amount
          ? numFormat(Number(list[i].amount / 100).toFixed(2))
          : "--") +
        "</td>";
      html +=
        "<td>" + (list[i].paymentDate ? list[i].paymentDate : "--") + "</td>";
        if(list[i].bizState === "SUCCESS"){
          html += "<td>"+STATUS_SUCCSESS[STATE]+"</td>";
        } else if(list[i].bizState === "FAIL"){
          html += "<td>"+STATUS_FAIL[STATE]+"</td>";
        }else if(list[i].bizState === "PENDING"){
          html += "<td>"+STATUS_PENDING[STATE]+"</td>";
        } else if (
        list[i].paymentState == "CHECK" &&
        list[i].bizState == "INIT"
      ) {
        html += "<td>待付汇</td>";
      }
      html +=
        "<td>" +
        appenDages(
          list[i].shippingCode,
          list[i].paymentState,
          list[i].bizState,
          list[i].authFlag,
          list[i].applyType,
          list[i].assetType
        ) +
        "</td></tr>";
      $("#tbodyList").append(html);
    }
  } else {
    html = '<tr><td colspan="9">暂无数据</td></tr>';
    $("#tbodyList").append(html);
  }
  pageRender(data.totalCount, data.currentPage, data.pageSize);
}
//详情跳转  authFlag是否可以操作办理业务   上链失败和上链中只能查看
function appenDages(shippingCode, paymentState, bizState, authFlag, applyType, assetType) {
  if (bizState === "SUCCESS" && authFlag && (paymentState === "APPLY"  || paymentState === "CHECK" || paymentState === "CONFIRM")) {
    return (
      '<a onclick=toDetail("detail","' + bizState + '","' + paymentState + '","' + shippingCode + '","' + authFlag + '","' + applyType + '","' + assetType + '") class="btn btn-primary">处理</a>'
    );
  }  else if (paymentState === "APPLYCHECK" || (paymentState === "APPLY" && bizState === "FAIL")) {
    return (
      '<a onclick=toDetail("apply","' + bizState + '","' + paymentState + '","' + shippingCode + '","' + authFlag + '","' + applyType + '","' + assetType + '") class="btn btn-primary">查看</a>'
    );
  } else {
    return (
      '<a onclick=toDetail("detail","' + bizState + '","' + paymentState + '","' + shippingCode + '","' + authFlag + '","' + applyType + '","' + assetType + '") class="btn btn-primary">查看</a>'
    );
  }
}
//分页
function pageRender(count, curr, limit) {
  laypage.render({
    elem: "page",
    count: count, //数据总数，从服务端得到
    curr: curr,
    layout: ["count", "prev", "page", "next", "limit", "refresh", "skip"],
    theme: "#1489DB",
    limit: limit,
    limits: [5, 10, 15, 20],
    jump: function (obj, first) {
      if (!first) {
        if (beforePaging != obj.limit) {
          beforePaging = obj.limit;
          queryList({
            currentPage: 1,
            pageSize: obj.limit,
            safeCode: window.location.store.global.getState().safeCode,
          });
          Dispatch("list/changeSearchItem", { pageSize: obj.limit });
        } else {
          queryList({
            currentPage: obj.curr,
            pageSize: obj.limit,
            safeCode: window.location.store.global.getState().safeCode,
          });
          Dispatch("list/changeSearchItem", { pageSize: obj.limit, currentPage: obj.curr });
        }
      }
    },
  });
}
function toDetail(
  layEvent,
  bizState,
  paymentState,
  shippingCode,
  authFlag,
  applyType,
  assetType
) {
  if (layEvent === "apply") {
    layrouter.go("/apply", {
      bizState: bizState,
      paymentState: paymentState,
      shippingCode: shippingCode,
      authFlag: authFlag,
    });
  } else if (layEvent === "detail") {
    layrouter.go("/detail", {
      shippingCode: shippingCode,
      authFlag: authFlag,
      applyType: applyType,
    });
  }
}

function toApply() {
  //清空页面信息
  window.location.state = undefined;
  var layrouter = layui.layrouter;
  layrouter.go("/apply");
}

function searchItemInit() {
  Dispatch("list/searchItemInit"); //更新请求值
  form.val("formListArea", {
    shippingCode: '',
    invoiceNo: '',
    invoiceCode: '',
    paymentEntName: '',
    createStartDate: '',
    createEndDate: '',
    paymentEntTaxpayerIdNo: '',
    paymentState: '',
    invoiceErrorState: '',
  });
  queryList();
}

init();
