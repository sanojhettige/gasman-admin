'use strict';
angular.module('gasAdmin').controller('OrderCtrl', OrderCtrl);

OrderCtrl.$inject = [
  'localStorageService',
  '$state',
  'AuthenticationService',
  'Notification',
  'initPageContent',
  'cfpLoadingBar',
  'ngDialog',
  'OrderService',
  '$ngConfirm',
  '$scope',
  'DTOptionsBuilder',
  'DTColumnBuilder',
  '$http',
  '$q',
  '$compile',
  '$rootScope',
  'PageHtml',
  'configs',
  '$stateParams',
  '$filter'
];

function OrderCtrl(
  localStorageService,
  $state,
  AuthenticationService,
  Notification,
  initPageContent,
  cfpLoadingBar,
  ngDialog,
  OrderService,
  $ngConfirm,
  $scope,
  DTOptionsBuilder,
  DTColumnBuilder,
  $http,
  $q,
  $compile,
  $rootScope,
  PageHtml,
  configs,
  $stateParams,
  $filter
) {
  var vm = this;

  vm.pageContent = initPageContent;
  $rootScope.PageHtml = PageHtml;
  PageHtml.setTitle('Administrator | Orders');
  vm.constants = configs;

  let appAccessRoles = $state.$current.data.applicationAccess;
  vm.userRole = AuthenticationService.GetUserRole();

  vm.applicationAccessView = AuthenticationService.CheckAuthentication(
    appAccessRoles
  );

  vm.selectedOrderId = $stateParams.id;
  vm.orderById = {};

  vm.itemList = [];
  vm.orderById.items = [];

  vm.findItem = _findItem;
  vm.selectItem = _selectItem;
  vm.initOrder = _initOrder;
  vm.calculateOrder = _calculateOrder;
  vm.removeCartItem = _removeCartItem;

  vm.splitType = 1;

  //Definitions
  vm.closePopUp = _closePopUp;
  vm.redirectToUrl = _redirectToUrl;
  vm.refreshMainPageData = _refreshMainPageData;
  vm.currentYear = new Date().getFullYear();
  vm.showOrderById = _showOrderById;
  vm.orderList = [];
  vm.getOrderList = _getOrderList;
  vm.bookById = {};
  vm.getOrderById = _getOrderById;
  vm.updateOrder = _updateOrder;
  vm.errors = [];
  vm.handleRemoveOrder = _handleRemoveOrder;
  vm.handleCancelOrder = _handleCancelOrder;
  vm.handleAssignAgent = _handleAssignAgent;
  vm.handleAcceptOrder = _handleAcceptOrder;
  vm.handleDispatchOrder = _handleDispatchOrder;
  vm.handleCompleteOrder = _handleCompleteOrder;
  vm.assignAgent = _assignAgent;
  vm.orderAccept = _orderAccept;
  vm.orderDispatch = _orderDispatch;
  vm.orderComplete = _orderComplete;
  vm.pageData = {
    total: 0
  };
  vm.submitting = false;
  vm.prodFile = null;
  vm.imageSrc = '';
  vm.selectedOrderType = 'all';

  if ($state.current.name == 'app.pending') {
    vm.selectedOrderType = 'pending';
  }

  vm.onFileChanged = function(event) {
    vm.prodFile = event.target.files[0];
  };

  vm.orderById = {};
  vm.orderTypes = [];
  vm.getOrderTypes = _getOrderTypes;
  vm.agents = [];
  vm.getAgents = _getAgents;
  vm.getCustomers = _getCustomers;
  vm.customers = [];
  vm.addCustomerForm = _addCustomerForm;
  vm.submitCustomer = _submitCustomer;
  vm.customerById = {};
  vm.newCusId = '';
  vm.customerAddresses = [];
  vm.findCustomerAddress = _findCustomerAddress;
  vm.setAddrees = _setAddrees;
  vm.selectedAddress = '';

  vm.createOrder = _createOrder;
  vm.storeOrderData = _storeOrderData;

  function _refreshMainPageData() {}

  function _closePopUp() {
    ngDialog.close();
  }

  function _redirectToUrl(route) {
    $state.go(route);
  }

  function _createOrder(order) {
    if (order.delivery_time) {
      var time = '';
      time = order.delivery_time.toString().split(' ');
      order.delivery_time = time[4];
    }

    if (!order.source_id) {
      order.source_id = 1;
    }
    cfpLoadingBar.start();
    OrderService.UpdateOrder(order).then(
      function(response) {
        if (response.data.success === 1) {
          Notification.success(response.data.message);
          localStorageService.remove('cart');
          localStorageService.remove('order');
          $state.go('app.view-order', {
            id: response.data.order.id
          });
        }
      },
      function(err) {
        if (err.message) {
          Notification.error(err.message);
        }
        if (err.error === '1' || err.access === 'Unauthorized') {
          AuthenticationService.ClearCredentials();
          ngDialog.close();
          $state.go('app.login');
        } else if (err.errors) {
          _handleValidationErrors(err.errors);
        }
        cfpLoadingBar.complete();
        vm.submitting = false;
      }
    );
    cfpLoadingBar.complete();
  }

  //Get Order list
  function _getOrderList(pageNumber) {
    vm.orderList = null;
    cfpLoadingBar.start();
    OrderService.GetOrderList(0, pageNumber).then(
      function(response) {
        vm.orderList = response.data.items ? response.data.items : [];
        vm.totalOrder = response.data.count;
      },
      function(err) {
        Notification.error(err.message);
        if (err.error === '1' || err.access === 'Unauthorized') {
          AuthenticationService.ClearCredentials();
          $state.go('app.login');
        }
        cfpLoadingBar.complete();
      }
    );
    cfpLoadingBar.complete();
  }

  // Get Order by id
  function _getOrderById(orderId) {
    vm.bookById = {};
    if (orderId != 0) {
      cfpLoadingBar.start();
      OrderService.GetOrderById(orderId).then(
        function(response) {
          vm.orderById = {};
          vm.orderById = response.data.order;
        },
        function(err) {
          Notification.error(err.message);
          if (err.error === '1' || err.access === 'Unauthorized') {
            AuthenticationService.ClearCredentials();
            ngDialog.close();
            $state.go('app.login');
          }
          cfpLoadingBar.complete();
        }
      );
      cfpLoadingBar.complete();
    } else {
      // vm.orderById = {};
      // var cusId = localStorageService.get("newCusId");
      // vm.orderById.customer_id = cusId;
      // var address = localStorageService.get("selectedAddress");
      // vm.orderById.delivery_address = address;
    }
  }

  function _updateOrder(order) {
    vm.submitting = true;
    cfpLoadingBar.start();
    OrderService.UpdateOrder(order).then(
      function(response) {
        Notification.primary(response.data.message);
        ngDialog.close();
        $state.go($state.current.name, $state.params, {
          reload: true
        });
      },
      function(err) {
        if (err.message) {
          Notification.error(err.message);
        }
        if (err.error === '1' || err.access === 'Unauthorized') {
          AuthenticationService.ClearCredentials();
          ngDialog.close();
          $state.go('app.login');
        } else if (err.errors) {
          _handleValidationErrors(err.errors);
        }
        cfpLoadingBar.complete();
        vm.submitting = false;
      }
    );
    cfpLoadingBar.complete();
  }

  //handle validation errors
  function _handleValidationErrors(err) {
    Notification.error('Please fix above errors to save order details.');
    vm.errors = [];
    angular.forEach(err, function(value, key) {
      if (value.location === 'customer_id') {
        vm.errors.customer_id = value.message;
      }
      if (value.location === 'agent_id') {
        vm.errors.agent_id = value.message;
      }
      if (value.location === 'delivery_address') {
        vm.errors.delivery_address = value.message;
      }
      if (value.location === 'gross_amount') {
        vm.errors.gross_amount = value.message;
      }
      if (value.location === 'net_amount') {
        vm.errors.net_amount = value.message;
      }
      if (value.location === 'order_date') {
        vm.errors.order_date = value.message;
      }
      if (value.location === 'order_discount') {
        vm.errors.order_discount = value.message;
      }
      if (value.location === 'order_type') {
        vm.errors.order_type = value.message;
      }
      if (value.location === 'items') {
        vm.errors.items = value.message;
      }
      if (value.location === 'remarks') {
        vm.errors.remarks = value.message;
      }
    });
  }

  //show order
  function _showOrderById(orderId) {
    $state.go('app.view-order', {
      id: orderId
    });
  }

  function _addCustomerForm() {
    cfpLoadingBar.start();
    var templateURL = '';
    var title = 'Add New Customer';
    var saveBtn = 'Save Customer';

    templateURL = '/views/orders/customer_form.html';

    ngDialog.open({
      template: templateURL,
      className: 'ngdialog-theme-default modal-70',
      controller: 'OrderCtrl',
      controllerAs: 'vm',
      data: {
        title: title,
        saveBtn: saveBtn
      }
    });
    cfpLoadingBar.complete();
  }

  function _submitCustomer(customer) {
    vm.submitting = true;
    cfpLoadingBar.start();
    OrderService.AddCustomer(customer).then(
      function(response) {
        Notification.primary(response.data.message);
        ngDialog.close();
        vm.newCusId = response.data.row[0].newCusId;
        localStorageService.set('newCusId', vm.newCusId);
        $state.go($state.current.name, $state.params, {
          reload: true
        });
      },
      function(err) {
        if (err.message) {
          Notification.error(err.message);
        }
        if (err.error === '1' || err.access === 'Unauthorized') {
          AuthenticationService.ClearCredentials();
          ngDialog.close();
          $state.go('app.login');
        } else if (err.errors) {
          _handleValidationErrors(err.errors);
        }
        cfpLoadingBar.complete();
        vm.submitting = false;
      }
    );
    cfpLoadingBar.complete();
  }

  // remove order
  function _handleRemoveOrder(id) {
    $ngConfirm({
      title: 'Confirm! ',
      content: 'Are you sure about this action ?',
      scope: $scope,
      buttons: {
        delete: {
          text: 'Delete',
          btnClass: 'btn-danger',
          action: function(scope, button) {
            _deleteOrder(id);
          }
        },
        close: function(scope, button) {
          // closes the modal
        }
      }
    });
  }

  function _deleteOrder(orderId) {
    cfpLoadingBar.start();
    OrderService.DeleteOrderById(orderId).then(
      function(response) {
        Notification.primary('Order successfully deleted!');
        $state.go($state.current.name, $state.params, {
          reload: true
        });
      },
      function(err) {
        Notification.error(err.message);
        if (err.error === '1' || err.access === 'Unauthorized') {
          AuthenticationService.ClearCredentials();
          $state.go('app.login');
        }
        cfpLoadingBar.complete();
      }
    );
    cfpLoadingBar.complete();
  }

  // Cancel order
  function _handleCancelOrder(id) {
    $ngConfirm({
      title: 'Confirm! ',
      content: 'Are you sure about this action ?',
      scope: $scope,
      buttons: {
        delete: {
          text: 'Cancel Order',
          btnClass: 'btn-danger',
          action: function(scope, button) {
            _cancelOrder(id);
          }
        },
        close: function(scope, button) {
          // closes the modal
        }
      }
    });
  }

  function _cancelOrder(orderId) {
    cfpLoadingBar.start();
    OrderService.CancelOrderById(orderId).then(
      function(response) {
        Notification.primary('Order successfully cancelled!');
        $state.go($state.current.name, $state.params, {
          reload: true
        });
      },
      function(err) {
        Notification.error(err.message);
        if (err.error === '1' || err.access === 'Unauthorized') {
          AuthenticationService.ClearCredentials();
          $state.go('app.login');
        }
        cfpLoadingBar.complete();
      }
    );
    cfpLoadingBar.complete();
  }

  function _handleAssignAgent(orderId) {
    var templateURL = '';
    var title = 'Assign Agent';

    templateURL = '/views/orders/assign_agent_form.html';

    ngDialog.open({
      template: templateURL,
      className: 'ngdialog-theme-default modal-70',
      controller: 'OrderCtrl',
      controllerAs: 'vm',
      data: {
        title: title,
        orderId: orderId,
        saveBtn: 'Assign Agent',
        agents: vm.agents
      }
    });
  }

  function _assignAgent(orderId) {
    cfpLoadingBar.start();
    OrderService.AssignOrderAgentById(orderId).then(
      function(response) {
        Notification.primary('Agent successfully assigned.');
        ngDialog.close();
        $state.go($state.current.name, $state.params, {
          reload: true
        });
      },
      function(err) {
        Notification.error(err.message);
        if (err.error === '1' || err.access === 'Unauthorized') {
          AuthenticationService.ClearCredentials();
          $state.go('app.login');
        }
        cfpLoadingBar.complete();
      }
    );
    cfpLoadingBar.complete();
  }

  // Accept Order
  function _handleAcceptOrder(orderId) {
    var templateURL = '';
    var title = 'Order Details';

    templateURL = '/views/orders/order_accept_form.html';

    ngDialog.open({
      template: templateURL,
      className: 'ngdialog-theme-default modal-70',
      controller: 'OrderCtrl',
      controllerAs: 'vm',
      data: {
        title: title,
        orderId: orderId,
        saveBtn: 'Accept Order',
        agents: vm.agents
      }
    });
  }

  function _orderAccept(orderId) {
    cfpLoadingBar.start();
    OrderService.AcceptOrderById(orderId).then(
      function(response) {
        Notification.primary('Order Accepted.');
        ngDialog.close();
        $state.go($state.current.name, $state.params, {
          reload: true
        });
      },
      function(err) {
        Notification.error(err.message);
        if (err.error === '1' || err.access === 'Unauthorized') {
          AuthenticationService.ClearCredentials();
          $state.go('app.login');
        }
        cfpLoadingBar.complete();
      }
    );
    cfpLoadingBar.complete();
  }

  // Distpatch order
  function _handleDispatchOrder(orderId) {
    var templateURL = '';
    var title = 'Order Details';

    templateURL = '/views/orders/order_dispatch_form.html';

    ngDialog.open({
      template: templateURL,
      className: 'ngdialog-theme-default modal-70',
      controller: 'OrderCtrl',
      controllerAs: 'vm',
      data: {
        title: title,
        orderId: orderId,
        saveBtn: 'Dispatch Order',
        agents: vm.agents
      }
    });
  }

  function _orderDispatch(orderId) {
    cfpLoadingBar.start();
    OrderService.DispatchOrderById(orderId).then(
      function(response) {
        Notification.primary('Order Dispatched.');
        ngDialog.close();
        $state.go($state.current.name, $state.params, {
          reload: true
        });
      },
      function(err) {
        Notification.error(err.message);
        if (err.error === '1' || err.access === 'Unauthorized') {
          AuthenticationService.ClearCredentials();
          $state.go('app.login');
        }
        cfpLoadingBar.complete();
      }
    );
    cfpLoadingBar.complete();
  }

  // Complete Order
  function _handleCompleteOrder(orderId) {
    var templateURL = '';
    var title = 'Order Details';

    templateURL = '/views/orders/order_complete_form.html';

    ngDialog.open({
      template: templateURL,
      className: 'ngdialog-theme-default modal-70',
      controller: 'OrderCtrl',
      controllerAs: 'vm',
      data: {
        title: title,
        orderId: orderId,
        saveBtn: 'Complete Order',
        agents: vm.agents
      }
    });
  }

  function _orderComplete(orderId) {
    cfpLoadingBar.start();
    OrderService.CompleteOrderById(orderId).then(
      function(response) {
        Notification.primary('Order Completed.');
        ngDialog.close();
        $state.go($state.current.name, $state.params, {
          reload: true
        });
      },
      function(err) {
        Notification.error(err.message);
        if (err.error === '1' || err.access === 'Unauthorized') {
          AuthenticationService.ClearCredentials();
          $state.go('app.login');
        }
        cfpLoadingBar.complete();
      }
    );
    cfpLoadingBar.complete();
  }

  function _getOrderTypes() {
    cfpLoadingBar.start();
    OrderService.GetOrderTypes().then(
      function(response) {
        vm.orderTypes = [];
        vm.orderTypes = response.categories;
      },
      function(err) {
        Notification.error(err.message);
        if (err.error === '1' || err.access === 'Unauthorized') {
          AuthenticationService.ClearCredentials();
          $state.go('app.login');
        }
        cfpLoadingBar.complete();
      }
    );
    cfpLoadingBar.complete();
  }

  function _getAgents() {
    cfpLoadingBar.start();
    OrderService.GetAgents().then(
      function(response) {
        vm.agents = [];
        vm.agents = response.agents;
      },
      function(err) {
        Notification.error(err.message);
        if (err.error === '1' || err.access === 'Unauthorized') {
          AuthenticationService.ClearCredentials();
          $state.go('app.login');
        }
        cfpLoadingBar.complete();
      }
    );
    cfpLoadingBar.complete();
  }

  function _getCustomers() {
    cfpLoadingBar.start();
    OrderService.GetCustomers().then(
      function(response) {
        vm.customers = [];
        vm.customers = response.customers;
      },
      function(err) {
        Notification.error(err.message);
        if (err.error === '1' || err.access === 'Unauthorized') {
          AuthenticationService.ClearCredentials();
          $state.go('app.login');
        }
        cfpLoadingBar.complete();
      }
    );
    cfpLoadingBar.complete();
  }

  function _findCustomerAddress(cusId) {
    cfpLoadingBar.start();
    OrderService.GetCustomersAddresses(cusId).then(
      function(response) {
        vm.customerAddresses = [];
        angular.forEach(response.addresses, function(value, key) {
          vm.customerAddresses.push({ address: value });
        });
        // vm.customerAddresses = response.addresses;

        var templateURL = '';
        var title = 'Select Address';

        templateURL = '/views/orders/user_address_list.html';

        ngDialog.open({
          template: templateURL,
          className: 'ngdialog-theme-default modal-70',
          controller: 'OrderCtrl',
          controllerAs: 'vm',
          data: {
            title: title,
            customerAddresses: vm.customerAddresses
          }
        });
      },
      function(err) {
        Notification.error(err.message);
        if (err.error === '1' || err.access === 'Unauthorized') {
          AuthenticationService.ClearCredentials();
          $state.go('app.login');
        }
        cfpLoadingBar.complete();
      }
    );
    cfpLoadingBar.complete();
  }

  function _setAddrees(address) {
    localStorageService.set('selectedAddress', address);

    if (localStorageService.get('order')) {
      vm.orderById = localStorageService.get('order');
    }

    vm.orderById.delivery_address = address;
    localStorageService.set('order', vm.orderById);

    // _getOrderById(0);
    ngDialog.close();
    $state.reload();
  }

  function _findItem(string) {
    vm.itemList = [];
    cfpLoadingBar.start();
    var filters = {
      search: 1,
      name: string,
      agent_id: vm.orderById.agent_id
    };
    OrderService.GetProductSuggetions(filters).then(
      function(response) {
        vm.itemList = response.data.items ? response.data.items : [];

        if (response.data.items.length <= 0) {
          Notification.error('No products available.');
        }
      },
      function(err) {
        Notification.error(err.message);
        if (err.error === '1' || err.access === 'Unauthorized') {
          AuthenticationService.ClearCredentials();
          $state.go('app.login');
        }
        cfpLoadingBar.complete();
      }
    );
    cfpLoadingBar.complete();
  }

  function _selectItem(string) {
    // localStorageService.remove("cart");
    // vm.orderById = localStorageService.remove("order");
    vm.item = string.name;
    vm.itemList = [];
    string.qty = 1;
    if (localStorageService.get('cart')) {
      vm.orderById.items = localStorageService.get('cart');
    } else {
      vm.orderById.items = [];
    }

    let index = vm.orderById.items.findIndex(
      record => record.name === string.name
    );
    if (index >= 0) {
      vm.orderById.items[index].qty++;
      localStorageService.set('cart', vm.orderById.items);
      vm.calculateOrder();
      vm.item = '';
    } else {
      vm.orderById.items.push(string);
      localStorageService.set('cart', vm.orderById.items);
      vm.calculateOrder();
    }

    vm.item = '';
  }

  function _initOrder() {
    if (localStorageService.get('order')) {
      vm.orderById = localStorageService.get('order');
    }

    if (localStorageService.get('cart')) {
      vm.orderById.items = localStorageService.get('cart');
    }

    vm.orderById.order_discount = 0;
    vm.orderById.delivery_charge = 0;
    vm.orderById.order_deposit = 0;

    if (vm.orderById.delivery_time) {
      vm.orderById.delivery_time = new moment(
        vm.orderById.delivery_time,
        'hh:mm A'
      );
    }

    if (!vm.orderById.order_date) {
      vm.orderById.order_date = $filter('date')(new Date(), 'yyyy-mm-dd');
    }
    vm.calculateOrder();
  }

  function _calculateOrder() {
    const items = vm.orderById.items;
    var gross_amount = 0;
    var net_amount = 0;
    angular.forEach(items, function(val, key) {
      gross_amount += val.price * val.qty;
    });

    vm.orderById.gross_amount = gross_amount;
    net_amount =
      gross_amount -
      vm.orderById.order_discount +
      (vm.orderById.delivery_charge + vm.orderById.order_deposit);
    vm.orderById.net_amount = net_amount;
  }

  function _storeOrderData(field, val) {
    if (localStorageService.get('order')) {
      vm.orderById = localStorageService.get('order');
    }

    switch (field) {
      case 'order_date':
        vm.orderById.order_date = val;
        break;
      case 'order_type':
        vm.orderById.order_type = val;
        if (val === 5) {
          vm.orderById.delivery_address = '';
          vm.orderById.delivery_time = null;
          vm.orderById.delivery_date = '';
          vm.orderById.delivery_instructions = '';
        }
        break;
      case 'customer_id':
        vm.orderById.customer_id = val;
        vm.orderById.delivery_address = '';
        break;
      case 'agent_id':
        vm.orderById.agent_id = val;
        break;
      case 'delivery_address':
        vm.orderById.delivery_address = val;
        break;
      case 'delivery_date':
        vm.orderById.delivery_date = val;
        break;
      case 'delivery_time':
        val = val.toString().split(' ');
        vm.orderById.delivery_time = new moment(val[4], 'hh:mm A');
        break;
      case 'delivery_instructions':
        vm.orderById.delivery_instructions = val;
        break;
      case 'order_discount':
        vm.orderById.order_discount = val;
        break;
      case 'remarks':
        vm.orderById.remarks = val;
        break;
    }

    localStorageService.set('order', vm.orderById);
    vm.initOrder();
  }

  function _removeCartItem(item) {
    var index = vm.orderById.items.indexOf(item);
    vm.orderById.items.splice(index, 1);
    localStorageService.remove('cart');
    localStorageService.set('cart', vm.orderById.items);
    // $state.reload();
  }

  // this function used to get all orders
  var get = function(sSource, aoData, fnCallback, oSettings) {
    var draw = aoData[0].value;
    var order = aoData[2].value;
    var start = aoData[3].value;
    var length = aoData[4].value;
    var search = aoData[5].value;
    var colums = aoData[1];
    var params = {
      offset: start,
      limit: length,
      order: order,
      draw: draw,
      search: search.value,
      colums: colums.value,
      type: vm.selectedOrderType
    };
    OrderService.GetOrderList(params).then(
      function(response) {
        var records = {
          draw: 0,
          recordsTotal: 0,
          recordsFiltered: 0,
          data: []
        };
        if (response.data) {
          records = {
            draw: draw,
            recordsTotal: response.data.count,
            recordsFiltered: response.data.count,
            data: response.data.items
          };
        }
        vm.pageData.total = response.data.total;
        fnCallback(records);
      },
      function(err) {
        Notification.error(err.message);
        if (err.error === '1' || err.access === 'Unauthorized') {
          AuthenticationService.ClearCredentials();
          $state.go('app.login');
        }
        cfpLoadingBar.complete();
      }
    );
  };

  function rowCallback(nRow, aData, iDisplayIndex, iDisplayIndexFull) {
    $compile(nRow)($scope);
  }
  var filters = {
    '0': {
      type: 'text'
    },
    '1': {
      type: 'select',
      values: [
        {
          value: 4,
          label: 'Scheduled Delivery'
        },
        {
          value: 5,
          label: 'TakeAway'
        },
        {
          value: 6,
          label: 'ASAP Delivery'
        }
      ]
    },
    '2': {
      type: 'text'
    },
    '3': {
      type: 'text'
    },
    '4': {
      type: 'select',
      values: [
        {
          value: 1,
          label: 'Pending'
        },
        {
          value: 2,
          label: 'Assigned'
        },
        {
          value: 3,
          label: 'Accepted'
        },
        {
          value: 4,
          label: 'Dispatched'
        },
        {
          value: 5,
          label: 'Delivered'
        },
        {
          value: 6,
          label: 'Cancelled'
        }
      ]
    },
    '5': {
      type: 'text'
    },
    '6': {}
  };
  var columns = [
    DTColumnBuilder.newColumn('order_ref', 'Order Ref'),
    DTColumnBuilder.newColumn('order_type', 'Order Type'),
    DTColumnBuilder.newColumn('agent_name', 'Agent Name'),
    DTColumnBuilder.newColumn('net_total', 'Order Total'),
    DTColumnBuilder.newColumn('status', 'Order Status'),
    DTColumnBuilder.newColumn('created_date', 'Created Date'),
    DTColumnBuilder.newColumn(null, 'Actions')
      .notSortable()
      .renderWith(actionsHtml)
  ];

  if ($state.current.name == 'app.pending') {
    filters = {
      '0': {
        type: 'select',
        values: [
          {
            value: 4,
            label: 'Scheduled Delivery'
          },
          {
            value: 5,
            label: 'TakeAway'
          },
          {
            value: 6,
            label: 'ASAP Delivery'
          }
        ]
      },
      '1': {
        type: 'text'
      },
      '2': {
        type: 'text'
      },
      '3': {
        type: 'text'
      },
      '4': {}
    };

    columns = [
      DTColumnBuilder.newColumn('order_type', 'Order Type'),
      DTColumnBuilder.newColumn('net_total', 'Order Total'),
      DTColumnBuilder.newColumn('address', 'Customer Location'),
      DTColumnBuilder.newColumn('created_date', 'Created Date'),
      DTColumnBuilder.newColumn(null, 'Actions')
        .notSortable()
        .renderWith(actionsHtml)
    ];
  }
  vm.dtOptions = DTOptionsBuilder.newOptions()
    .withFnServerData(get)
    .withDataProp('data')
    .withOption('processing', true)
    .withOption('serverSide', true)
    .withOption('paging', true)
    .withPaginationType('full_numbers')
    .withDisplayLength(10)
    .withOption('rowCallback', rowCallback)
    .withLightColumnFilter(filters);

  vm.dtColumns = columns;

  function actionsHtml(data, type, full, meta) {
    var content = '';
    content += '<div class=\'btn-group\'>';
    content +=
      '<button class=\'btn btn-sm btn-info\' title=\'Print Invoice\' ng-click=vm.showOrderById(\'' +
      data.id +
      '\')>';
    content += '<i class=\'wb-eye\'></i></button>';

    if (data.actions.canCancel === 1) {
      content +=
        '<button class=\'btn btn-sm btn-warning\' title=\'Cancel Order\' ng-click=vm.handleCancelOrder(\'' +
        data.id +
        '\')>';
      content += '<i class=\'wb-close\'></i></button>';
    }

    if (data.actions.canAccept === 1 && vm.userRole === 'agent') {
      content +=
        '<button class=\'btn btn-sm btn-success\' title=\'Accept Order\' ng-click=vm.handleAcceptOrder(\'' +
        data.id +
        '\')>';
      content += '<i class=\'wb-check\'></i></button>';
    }

    if (data.actions.canDispatch === 1 && vm.userRole === 'agent') {
      content +=
        '<button class=\'btn btn-sm btn-primary\' title=\'Dispatch Order\' ng-click=vm.handleDispatchOrder(\'' +
        data.id +
        '\')>';
      content += '<i class=\'wb-shopping-cart\'></i></button>';
    }

    if (data.actions.canDeliver === 1 && vm.userRole === 'agent') {
      content +=
        '<button class=\'btn btn-sm btn-success\' title=\'Complete Order\' ng-click=vm.handleCompleteOrder(\'' +
        data.id +
        '\')>';
      content += '<i class=\'wb-emoticon\'></i></button>';
    }

    if (vm.userRole === 'administrator') {
      if (data.actions.canAssign === 1) {
        content +=
          '<button class=\'btn btn-sm btn-success\' title=\'Assign Agent\' ng-click=vm.handleAssignAgent(\'' +
          data.id +
          '\')>';
        content += '<i class=\'wb-user-add\'></i></button>';
      }

      if (data.actions.canDelete === 1) {
        content +=
          '<button class=\'btn btn-sm btn-danger\' title=\'Delete Sale\' ng-click=vm.handleRemoveOrder(\'' +
          data.id +
          '\')>';
        content += '<i class=\'wb-trash\'></i></button>';
      }
    }

    content += '</div>';
    return content;
  }
}
