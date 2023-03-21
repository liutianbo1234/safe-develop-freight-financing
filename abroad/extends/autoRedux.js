function ReduxInitStore() {
  window.location.store = {};
  STORE_LIST.forEach(function (value) {
    var nowStore;
    function counterReducer(state, action, payload) {
      action = action.type;
      if (typeof value.reducers[action] !== "function") {
        state = state;
      } else {
        state = value.reducers[action](state, payload);
      }
      return state;
    }
    nowStore = Redux.createStore(counterReducer, value.state);
    if (value.subscribe) {
      for (var f in value.subscribe) {
        if (value.subscribe[f] && typeof value.subscribe[f] !== "function") {
          throw new Error(value.namespace + "的subscribe中存在非函数对象");
        }
        nowStore.subscribe(value.subscribe[f]);
      }
    }
    window.location.store[value.namespace] = nowStore;
  });
}

function Dispatch(type, payload) {
  var namespace = type.split("/")[0],
    action = type.split("/")[1];
  if (window.location.store[namespace]) {
    try {
      window.location.store[namespace].dispatch({
        type: action,
        payload: payload
      });
    } catch (err) {
      throw new Error("dispatch调用异常:\n" + err);
    }
  } else {
    throw new Error("无法查到名为 " + namespace + " 的仓库.");
  }
}
