//树形
window.renderBankTree = function (treeId, userInfo, tableObject) {
  if (userInfo.headFlag === "1") {
    $("#newTreeBtn").hide();
  }
  var setting = {
    view: {
      fontCss: { color: "#555", "font-size": "13px" },
      showIcon: false,
    },
    callback: {
      onClick: function (_, _, node) {
        window.location.searchParams.bankCode = node.id || "";
        window.location.selectNode = node;
        window.location.pageNum = 1;
        window.location.pageSize = 10;
        tableObject.reload({
          where: window.location.searchParams || {},
          page: {
            curr: 1,
            limit: 10,
          },
        });
      },
    },
  };
  //调用此方法渲染树型
  function renderTree(data) {
    return $.fn.zTree.init($("#" + treeId), setting, data);
  }
  //获取树型,并渲染树型
  function getTreeDate(isManual) {
    isManual = isManual || false;
    if (isManual || !window.TREE_DATE) {
      $.ajax({
        method: "POST",
        // url: "api/bank/v1/bank/organizationTree",
        url: "http://yapi.zcbrop.com/mock/731/tree",
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        cache: false,
        data: JSON.stringify({ orgCode: userInfo.orgCode }),
        success: function (res) {
          if (res.code === 200) {
            if (res.data) {
              var parseTreeDate;
              parseTreeDate = JSON.stringify(res.data);
              parseTreeDate = JSON.parse(
                parseTreeDate
                  .replace(/code/g, "id")
                  .replace(/nodes/g, "children")
                  .replace(/text/g, "name")
              );
              window.TREE_DATE = parseTreeDate; //缓存树数据
              //渲染树型
              renderTree(window.TREE_DATE);
            }
          } else {
            layer.msg(res.msg || "银行树数据获取响应失败");
          }
        },
        error: function (jqXHR, textStatus) {
          if (jqXHR.status === 403) {
            layer.msg("用户未登录，请登录后重试");
          } else {
            layer.msg("网络错误，请联系管理员，或稍后重试");
          }
        },
      });
    } else {
      var obj = renderTree(window.TREE_DATE);
      window.location.selectNode &&
        obj.selectNode(window.location.selectNode); //树形选中历史记录
    }
  }
  getTreeDate();
  //刷新树型
  $("#newTreeBtn").click(function () {
    layer.confirm(
      "您确定要刷新组织结构吗?该功能24h内只能使用一次",
      { icon: 3 },
      function (index) {
        $.ajax({
          method: "GET",
          url: "api/bank/refreshOrganizationTree",
          async: true,
          success: function (res) {
            if (res.code === 0) {
              layer.msg(
                "刷新申请已提交，请稍候...",
                { time: 1000 },
                getTreeDate(true)
              );
            } else {
              layer.msg(res.msg);
            }
          },
          error: function (jqXHR, textStatus) {
            if (jqXHR.status === 403) {
              layer.msg("用户未登录，请登录后重试");
            } else {
              layer.msg("网络错误，请联系管理员，或稍后重试");
            }
          },
        });
        layer.close(index);
      }
    );
  });
  // } else {
  //   //无树型
  //   $(".treeCol").css("display", "none").next().attr("class", "layui-col-md12");
  // }
};
