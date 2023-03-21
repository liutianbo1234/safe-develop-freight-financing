var STORE_LIST = [
  {
    namespace: "global",
    state: {  //声明全局的变量
      userContext: {},
      isLoading: false,
      treeData: {},
      treeBankCode: undefined, //树形选择行
      uniqueCode: undefined, //当前登录行账号
      safeCode: undefined, //场景区分
      changeValue: undefined,
      entName: undefined,
      entSocialCode: undefined,
      headFlag: undefined,
    },
    reducers: {
      changeValue: function (state, payload) {
        return Object.assign(state, payload)
      }
    },
    subscribe: {
      subscribe01: function () {
        // console.log("--触发监听--");
      }
    }
  },
  {
    namespace: "list", //列表全局变量名
    state: {
      searchItem: {
        requestPath: '/shipping/queryList',
        serviceCode: 'shippingPayment',
        pageSize: 10,
        pageNum: 1,
        shippingCode: undefined,
        paymentEntTaxpayerIdNo: undefined,
        paymentEntName: undefined,
        paymentState: undefined,
        createStartDate: undefined,
        createEndDate: undefined,
        invoiceNo: undefined,
        invoiceCode: undefined,
        bankOrgCode: undefined,
        treeBankCode: undefined,
        invoiceErrorState: undefined,
        safeCode: undefined
      }
    },
    reducers: {
      changeValue: function (state, payload) {
        return Object.assign(state, payload)
      },
      changeSearchItem: function (state, payload) {
        return Object.assign(state, { searchItem: Object.assign(state.searchItem, payload) })
      },
      searchItemInit: function (state, payload) {
        return Object.assign(state, {
          searchItem: {
            requestPath: '/shipping/queryList',
            serviceCode: 'shippingPayment',
            pageSize: 10,
            currentPage: 1,
            shippingCode: undefined,
            paymentEntTaxpayerIdNo: undefined,
            paymentEntName: undefined,
            paymentState: undefined,
            createStartDate: undefined,
            createEndDate: undefined,
            invoiceNo: undefined,
            invoiceCode: undefined,
            bankOrgCode: undefined,
            treeBankCode: undefined,
            invoiceErrorState: undefined,
            safeCode: state.searchItem.safeCode
          }
        })
      }
    },
    subscribe: {
      subscribe01: function () {
        // console.log("--触发监听--");
      }
    }
  },
  {
    namespace: "statistics",
    state: {
      searchItem: {
        requestPath: '/shipping/statistics',
        serviceCode: 'shippingPayment',
        entName: undefined,
        entSocialCode: undefined,
        endDate: undefined,
        startDate: undefined,
        safeCode: undefined,
        entSocialCode: undefined
      }
    },
    reducers: {
      changeValue: function (state, payload) {
        return Object.assign(state, payload)
      }
    },
    subscribe: {
      subscribe01: function () {
        // console.log("--触发监听--");
      }
    }
  }
];
