layui.define(["jquery"], function (exports) {
  var $ = layui.jquery;
  var layrouter = {
    // 路由表
    routes: {},
    // 当前 hash
    currentHash: "",
    // 注册路由
    register: function (ele) {
      var that = this;
      filePath = ele.component || "/";
      viewId = ele.viewId || "root";
      title = ele.title || '';
      if (!ele.path) {
        return;
      }
      // 给不同的 hash 设置不同的视图
      (typeof ele.path === "string" && (that.routes[ele.path] = [filePath, viewId, title])) ||
        (function f() {
          throw new Error("注册的Hash必须为String类型");
        })();
      return that;
    },
    // 刷新
    refresh: function () {
      var that = this;
      // 获取相应的 hash 值
      // 如果存在 hash 则获取, 否则为 /
      that.currentHash = location.hash.slice(1) || "/";
      if (that.currentHash && this.currentHash != "/") {
        // 根据当前 hash 加载对应的视图
        if (!that.routes[that.currentHash]) {
          throw new Error("路由'" + that.currentHash + "'不存在");
        }
        that.routes[that.currentHash][2] && (document.title = that.routes[that.currentHash][2])
        $("#" + that.routes[that.currentHash][1]).load(
          that.routes[that.currentHash][0]
        );
      }
    },
    // 跳转
    go: function (hash, state) {
      state && (window.location.state = state);
      window.location.hash = "#".concat(hash || "");
    },
    //加载多个子组件
    loadComponents: function (hashList) {
      var that = this;
      hashList[0] &&
        hashList.forEach(function (ele) {
          window.location[ele.hash] = ele.data;
          $("#" + that.routes[ele.hash][1]).load(that.routes[ele.hash][0]);
        });
    },
    // 跳转到指定url
    href: function (url) {
      window.location.href = url;
    },
    // 强制加载
    reload: function () {
      window.location.reload();
    },
    // 初始化
    init: function () {
      var that = this;
      if (window.addEventListener) {
        window.addEventListener("hashchange", that.refresh.bind(that));
      } else {
        window.attachEvent("onhashchange", that.refresh.bind(that));
      }
      return that;
    }
  };
  exports("layrouter", layrouter);
});
