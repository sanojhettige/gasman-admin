'use strict';
angular.module('gasAdmin').controller('ReportCtrl', ReportCtrl);

ReportCtrl.$inject = [
    'localStorageService',
    '$state',
    'AuthenticationService',
    'Notification',
    'initPageContent',
    'cfpLoadingBar',
    'ngDialog',
    'ReportService',
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
];

function ReportCtrl(
    localStorageService,
    $state,
    AuthenticationService,
    Notification,
    initPageContent,
    cfpLoadingBar,
    ngDialog,
    ReportService,
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
    $stateParams
) {
    var vm = this;

    vm.pageContent = initPageContent;
    $rootScope.PageHtml = PageHtml;
    PageHtml.setTitle('Administrator | Reports');

    let appAccessRoles = $state.$current.data.applicationAccess;

    vm.applicationAccessView = AuthenticationService.CheckAuthentication(
        appAccessRoles
    );

    var role = AuthenticationService.GetUserRole();

    vm.splitType = 1;
    vm.reportSelected = $stateParams.reportName ?
        $stateParams.reportName :
        'sales';

    //Definitions
    vm.closePopUp = _closePopUp;
    vm.redirectToUrl = _redirectToUrl;
    vm.refreshMainPageData = _refreshMainPageData;
    vm.currentYear = new Date().getFullYear();
    vm.errors = [];
    vm.pageData = {
        total: 0
    };
    vm.submitting = false;
    vm.search = {};
    vm.getOrderTypes = _getOrderTypes;
    vm.searchResult = _searchResult;

    function _refreshMainPageData() {}

    function _closePopUp() {
        ngDialog.close();
    }

    function _redirectToUrl(route) {
        $state.go(route);
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

    function _searchResult() {
        cfpLoadingBar.start();
        console.log(vm.search);
        ReportService.GetSalesReport(vm.search).then(
            function(response) {},
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

    // sales report
    var getSales = function(sSource, aoData, fnCallback, oSettings) {
        var draw = aoData[0].value;
        var order = aoData[2].value;
        var start = 0; //aoData[3].value;
        var length = 10000; //aoData[4].value;
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
            values: [{
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
            values: [{
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
        DTColumnBuilder.newColumn('created_date', 'Created Date')
    ];

    if ($state.current.name == 'app.pending') {
        filters = {
            '0': {
                type: 'select',
                values: [{
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
            DTColumnBuilder.newColumn('created_date', 'Created Date')
        ];
    }
    vm.dtOptionsSales = DTOptionsBuilder.newOptions()
        .withFnServerData(getSales)
        .withDataProp('data')
        // .withOption('searching', false)
        .withOption('processing', true)
        .withOption('serverSide', true)
        .withOption('paging', false)
        .withPaginationType('full_numbers')
        .withButtons([
            'copy',
            'print',
            {
                extend: 'csvHtml5',
                messageBottom: null,
                title: 'orders'
            },
            {
                extend: 'pdfHtml5',
                title: 'orders'
            }
        ])
        .withOption('rowCallback', rowCallback)
        .withLightColumnFilter(filters);


    vm.dtColumnsSales = columns;


    // Customer report
    var getCustomers = function(sSource, aoData, fnCallback, oSettings) {
        var draw = aoData[0].value;
        var order = aoData[2].value;
        var start = 0; //aoData[3].value;
        var length = 10000; //aoData[4].value;
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
        ReportService.GetCustomerList(params).then(
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

    // function rowCallback(nRow, aData, iDisplayIndex, iDisplayIndexFull) {
    //     $compile(nRow)($scope);
    // }
    var customerFilters = {
        '0': {
            type: 'text'
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
        '4': {
            type: 'text'
        },
        '5': {
            type: 'text'
        },
        '6': {
            type: 'text'
        },
    };
    var customerColumns = [
        DTColumnBuilder.newColumn('name', 'Name'),
        DTColumnBuilder.newColumn('email', 'Email'),
        DTColumnBuilder.newColumn('reg_date', 'Registered Date'),
        DTColumnBuilder.newColumn('nic_pp', 'NIC/PP'),
        DTColumnBuilder.newColumn('contact_number', 'Phone Number'),
        DTColumnBuilder.newColumn('address', 'Address'),
        DTColumnBuilder.newColumn('no_orders', 'Total Orders')
    ];

    vm.dtOptionsCustomer = DTOptionsBuilder.newOptions()
        .withFnServerData(getCustomers)
        .withDataProp('data')
        // .withOption('searching', true)
        .withOption('processing', true)
        .withOption('serverSide', true)
        .withOption('paging', false)
        .withPaginationType('full_numbers')
        .withButtons([
            'copy',
            'print',
            {
                extend: 'csvHtml5',
                messageBottom: null,
                title: 'customers'
            },
            {
                extend: 'pdfHtml5',
                title: 'customers'
            }
        ])
        .withOption('rowCallback', rowCallback)
        .withLightColumnFilter(customerFilters);

    vm.dtColumnsCustomer = customerColumns;


}