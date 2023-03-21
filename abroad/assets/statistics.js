// 设置菜单树高度
var treeDiv = $("#orgTree").css("height", screen.availHeight - 250);
var form = layui.form,
  laydate = layui.laydate,
  layrouter = layui.layrouter,
  layer = layui.layer;
var TREE_DATE = undefined,
  currentTreeCode = undefined;
  var safeCode = window.location.store.global.getState().safeCode;
function init() {
  renderSearchItem();
  var globalState = location.store.global.getState();
  if (globalState.userContext && globalState.userContext.showOrganizationTree) {
    queryTree();
    if (globalState.userContext.userInfo.headFlag != 0) {
      $(".refreshTree").hide();
    }
  } else {
    $(".tree-container").hide();
    $(".list-container").removeClass(
      "layui-col-md10 layui-col-xs10 layui-col-sm10"
    );
  }
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
          queryList();
        },
      },
    };
    //调用此方法渲染树型
    function renderTreeData() {
      $.fn.zTree.init($("#orgTree"), setting, TREE_DATE);
    }
    //获取树型,并渲染树型.
    function getTreeDate(isManual) {
      isManual = isManual || false;
      if (!TREE_DATE || isManual) {
        if (window.location.store.global.getState().treeData.code) {
          TREE_DATE = JSON.parse(
            JSON.stringify(window.location.store.global.getState().treeData)
              .replace(/code/g, "id")
              .replace(/nodes/g, "children")
              .replace(/text/g, "name")
          );
          // console.log('data->', parseTreeDate);
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
              // console.log(res);
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
    // 无树型
    $(".tree-container").hide();
    $(".list-container").removeClass(
      "layui-col-md10 layui-col-xs10 layui-col-sm10"
    );
    $(".list-container").addClass("layui-col-md12");
  }
}

function renderSearchItem() {
  laydate.render({
    elem: "#startDate", //指定元素
    type: "date",
    format: "yyyy-MM-dd",
    theme: "#1489DB",
    done: function (value, data, endData) {
      var startDate = new Date(
        $("#endDate").val().replace(/-/g, "/")
      ).getTime();
      var endTime = new Date(value.replace(/-/g, "/")).getTime();
      if (endTime > startDate) {
        layer.msg("开始时间不能大于结束时间!", { icon: 2 });
      }
    },
  });
  laydate.render({
    elem: "#endDate", //指定元素
    type: "date",
    format: "yyyy-MM-dd",
    theme: "#1489DB",
    done: function (value, date) {
      var startDate = new Date(
        $("#startDate").val().replace(/-/g, "/")
      ).getTime();
      var endTime = new Date(value.replace(/-/g, "/")).getTime();
      if (endTime < startDate) {
        layer.msg("开始时间不能大于结束时间!", { icon: 2 });
      }
    },
  });

  //监听提交
  form.on("submit(formList)", function (data) {
    if (
      data.field.startDate &&
      data.field.endDate &&
      new Date(data.field.startDate.replace(/-/g, "/")).getTime() >
      new Date(data.field.endDate.replace(/-/g, "/")).getTime()
    ) {
      layer.msg("开始时间不能大于结束时间!", { icon: 2 });
      return false;
    }
    var payload = {
      shippingCode: data.field.shippingCode,
      requestPath: "/shipping/statistics",
      serviceCode: "shippingPayment",
      entName: data.field.entName,
      endDate: data.field.endDate,
      entSocialCode: data.field.entSocialCode,
      startDate: data.field.startDate,
      bankCode: location.store.global.getState().treeBankCode,
      safeCode: location.store.global.getState().safeCode,
    };
    Dispatch("statistics/changeValue", { searchItem: payload });
    queryList({
      entName: data.field.entName,
      endDate: data.field.endDate,
      startDate: data.field.startDate,
      entSocialCode: data.field.entSocialCode,
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
        if (data.code == "200" || d.code == 0) {
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
    console.log(error);
    layer.msg("数据获取异常，请重试", { icon: 2 });
    layer.closeAll("loading");
    Dispatch("global/changeValue", { isLoading: false });
  }
}
form.val("formListArea", {
  entName: location.store.statistics.getState().searchItem.entName,
  endDate: location.store.statistics.getState().searchItem.endDate,
  startDate: location.store.statistics.getState().searchItem.startDate,
  bankCode: location.store.global.getState().treeBankCode,
  treeBankCode: location.store.global.getState().treeBankCode,
  entSocialCode: location.store.global.getState().entSocialCode,
});
function queryList(data) {
  if (getLoading()) {
    return;
  }
  data = $.extend(
    {
      entName: location.store.statistics.getState().searchItem.entName,
      endDate: location.store.statistics.getState().searchItem.endDate,
      startDate: location.store.statistics.getState().searchItem.startDate,
      bankCode: location.store.global.getState().treeBankCode,
      treeBankCode: location.store.global.getState().treeBankCode,
      entSocialCode: location.store.global.getState().entSocialCode,
      requestPath: "/shipping/statistics",
      serviceCode: "shippingPayment",
      safeCode: location.store.global.getState().safeCode,
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
    console.log(error);
    layer.msg("数据获取异常，请重试", { icon: 2 });
    layer.closeAll("loading");
    Dispatch("global/changeValue", { isLoading: false });
  }
}

function renderTable(data) {
  $("#tbodyList").html("");
  var list = data.statisticsList;
  if (list.length > 0) {
    for (var i = 0; i < list.length; i++) {
      var m = i + 1;
      html = "<tr><td>" + m + "</td>";
      html += "<td>" + list[i].entSocialCode + "</td>";
      html += "<td>" + list[i].entName + "</td>";
      html += "<td>" + list[i].paymentCount + "</td>";
      html += "<td>" + list[i].invoiceCount + "</td>";
      html +=
      "<td>" +
          numFormat(Number(list[i].amount / 100).toFixed(2))
          +
      "</td>";
      html += "</tr>";
      $("#tbodyList").append(html);
    }
    html = "<tr><td>合计: </td><td></td><td></td>";
    html += "<td>" + data.totalPaymentCount + "</td>";
    html += "<td>" + data.totalInvoiceCount + "</td>";
    html +=
      "<td>" +
      numFormat(Number(data.totalAmount / 100).toFixed(2)) +
      "</td></tr>";
    $("#tbodyList").append(html);
  } else {
    html = '<tr><td colspan="6">暂无数据</td></tr>';
    $("#tbodyList").append(html);
  }
}

function exportHandle() {
  Dispatch("statistics/changeValue");
  var link = document.getElementById("link");
  if (!link) {
    link = document.createElement("a");
  }
  link.style.display = "none";
  document.body.appendChild(link);
  link.target = "_blank";
  link.href =
    "api/common/download?serviceCode=shippingPayment&requestPath=/shipping/statistics/download&bankCode=" +
    encodeURI(
      location.store.global.getState().treeBankCode +
      "&treeBankCode=" + location.store.global.getState().treeBankCode +
      "&startDate=" +
      (location.store.statistics.getState().searchItem.startDate
        ? location.store.statistics.getState().searchItem.startDate
        : "") +
      "&endDate=" +
      (location.store.statistics.getState().searchItem.endDate
        ? location.store.statistics.getState().searchItem.endDate
        : "") +
      "&entName=" +
      (location.store.statistics.getState().searchItem.entName
        ? location.store.statistics.getState().searchItem.entName
        : "") +
      "&entSocialCode=" +
      (location.store.statistics.getState().searchItem.entSocialCode
        ? location.store.statistics.getState().searchItem.entSocialCode
        : "") +
        "&safeCode=" + safeCode
    );
  link.click();
}
init();
