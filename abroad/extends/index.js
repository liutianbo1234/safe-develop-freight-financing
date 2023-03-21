window.onload = function () {
  layui
.config({
      base: "./extends/"  //引入layuiRouter.js
    })
    .extend({
      layrouter: "layuiRouter"  //设置模块别名
    })
    .use("layrouter", function () {  //使用模块名的方法
      var layrouter = layui.layrouter,
        $ = layui.jquery,
        layer = layui.layer;
       //rudux注入服务
      ReduxInitStore();
       //点击菜单获取权限接口
       $.ajax({
        method: "GET",
        //权限字段设计 yapi地址http://yapi.zcbrop.com/project/16/interface/api/21773
        // url: "http://yapi.zcbrop.com/mock/731/userInfo",
        url: "api/common/userContext",
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        cache: false,
        success: function (res) {
          if (res.code === 200) {
            var userContext = res.data.userInfo;
            window.location.userInfo = res.data;
            window.location.searchParams = $.extend(
              {},
              { bankCode: res.data.orgCode }
            );
            routerList()
            layrouter.go('/list');
          } else {
            layer.msg(res.msg);
          }
        },
        error: function () {
          layer.msg("网络错误，请稍后重试");
        }
      });
      function routerList(){
        var routerList = [
          { path:'/list', component:"./src/views/payment.html", title:'list' },
          { path:'/apply', component:"./src/views/paymentApply.html", title:'apply' },
          { path:'/detail', component:"./src/views/paymentDetail.html", title:'detail' },
        ]
        routerList.forEach(function(ele){
          ele && layrouter.register(ele)
        })
      }
      // 注册路由,并初始化
      layrouter.init();
    });
};
