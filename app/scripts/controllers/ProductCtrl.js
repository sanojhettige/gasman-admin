'use strict';
angular.module('gasAdmin').controller('ProductCtrl', ProductCtrl);

ProductCtrl.$inject = [
    'localStorageService',
    '$state',
    'AuthenticationService',
    'Notification',
    'initPageContent',
    'cfpLoadingBar',
    'ngDialog',
    'ProductService',
    '$ngConfirm',
    '$scope',
    'DTOptionsBuilder',
    'DTColumnBuilder',
    '$http',
    '$q',
    '$compile',
    '$rootScope',
    'PageHtml',
    'configs'
];

function ProductCtrl(
    localStorageService,
    $state,
    AuthenticationService,
    Notification,
    initPageContent,
    cfpLoadingBar,
    ngDialog,
    ProductService,
    $ngConfirm,
    $scope,
    DTOptionsBuilder,
    DTColumnBuilder,
    $http,
    $q,
    $compile,
    $rootScope,
    PageHtml,
    configs
) {
    var vm = this;

    vm.pageContent = initPageContent;
    $rootScope.PageHtml = PageHtml;
    PageHtml.setTitle('Administrator | Products');

    let appAccessRoles = $state.$current.data.applicationAccess;

    vm.applicationAccessView = AuthenticationService.CheckAuthentication(
        appAccessRoles
    );

    vm.userRole = AuthenticationService.GetUserRole();

    vm.splitType = 1;

    //Definitions
    vm.closePopUp = _closePopUp;
    vm.redirectToUrl = _redirectToUrl;
    vm.refreshMainPageData = _refreshMainPageData;
    vm.currentYear = new Date().getFullYear();
    vm.showProductById = _showProductById;
    vm.productList = [];
    vm.getProductList = _getProductList;
    vm.productById = {};
    vm.getProductById = _getProductById;
    vm.updateProduct = _updateProduct;
    vm.setProductName = _setProductName;
    vm.errors = [];
    vm.handleRemoveProduct = _handleRemoveProduct;
    vm.pageData = {
        total: 0
    };
    vm.submitting = false;
    vm.prodFile = null;
    vm.imageSrc = '';
    vm.getProductBrands = _getProductBrands;
    vm.productBrands = [];
    vm.getProductSizes = _getProductsizes;
    vm.productSizes = [];
    vm.mainProducts = [];
    vm.getMainProducts = _getMainProducts;

    vm.onFileChanged = function(event) {
        vm.prodFile = event.target.files[0];
    };

    function _refreshMainPageData() {}

    function _closePopUp() {
        ngDialog.close();
    }

    function _redirectToUrl(route) {
        $state.go(route);
    }

    function _setProductName(size) {
        vm.productById.name = size.name;
    }

    //Get Product list
    function _getProductList(pageNumber) {
        cfpLoadingBar.start();
        ProductService.GetProductList(0, pageNumber).then(
            function(response) {
                vm.productList = null;
                vm.productList = response.data.items;
                vm.totalProducts = response.data.count;
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

    // Get Product by id
    function _getProductById(productId) {
        vm.productById = {};
        if (productId != 0) {
            cfpLoadingBar.start();
            ProductService.GetProductById(productId).then(
                function(response) {
                    vm.productById = {};
                    vm.productById = response.data.product;
                    vm.imageSrc = response.data.product.image;
                },
                function(err) {
                    if (err.message) {
                        Notification.error(err.message);
                    }

                    if (err.error === '1' || err.access === 'Unauthorized') {
                        ngDialog.close();
                        AuthenticationService.ClearCredentials();
                        $state.go('app.login');
                    }
                    cfpLoadingBar.complete();
                }
            );
            cfpLoadingBar.complete();
        }
    }

    function _getProductBrands() {
        cfpLoadingBar.start();
        ProductService.GetProductBrands().then(
            function(response) {
                vm.productBrands = [];
                vm.productBrands = response.categories;
            },
            function(err) {
                if (err.message) {
                    Notification.error(err.message);
                }

                if (err.error === '1' || err.access === 'Unauthorized') {
                    ngDialog.close();
                    AuthenticationService.ClearCredentials();
                    $state.go('app.login');
                }
                cfpLoadingBar.complete();
            }
        );
        cfpLoadingBar.complete();
    }

    function _getProductsizes() {
        cfpLoadingBar.start();
        ProductService.GetProductSizes().then(
            function(response) {
                vm.productSizes = [];
                vm.productSizes = response.categories;
            },
            function(err) {
                if (err.message) {
                    Notification.error(err.message);
                }

                if (err.error === '1' || err.access === 'Unauthorized') {
                    ngDialog.close();
                    AuthenticationService.ClearCredentials();
                    $state.go('app.login');
                }
                cfpLoadingBar.complete();
            }
        );
        cfpLoadingBar.complete();
    }

    //Update Product profile
    function _updateProduct(product) {
        cfpLoadingBar.start();
        vm.submitting = true;
        ProductService.UpdateProduct(product, vm.imageSrc).then(
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
        Notification.error('Please fix the errors to save product details.');
        vm.errors = [];
        angular.forEach(err, function(value, key) {
            if (value.location === 'size_id') {
                vm.errors.size_id = value.message;
            }
            if (value.location === 'description') {
                vm.errors.description = value.message;
            }
            if (value.location === 'image') {
                vm.errors.image = value.message;
            }
            if (value.location === 'price') {
                vm.errors.price = value.message;
            }
            if (value.location === 'delivery_charge') {
                vm.errors.delivery_charge = value.message;
            }
            if (value.location === 'deposit_amount') {
                vm.errors.deposit_amount = value.message;
            }
            if (value.location === 'product_id') {
                vm.errors.product_id = value.message;
            }
            if (value.location === 'category_id') {
                vm.errors.category_id = value.message;
            }
        });
    }

    //show product popup
    function _showProductById(productId) {
        cfpLoadingBar.start();
        var templateURL = '';
        var title = 'Add New Product';
        var saveBtn = 'Add Product';

        if (productId) {
            title = 'Update Product Details';
            saveBtn = 'Update Product';
        }

        templateURL = '/views/products/product_form.html';

        // if (role === "agent") {
        //   templateURL = "/views/products/agent_product_form.html";
        // } else {
        //   templateURL = "/views/products/product_form.html";
        // }

        templateURL = '/views/products/product_form.html';

        ngDialog.open({
            template: templateURL,
            className: 'ngdialog-theme-default modal-80',
            controller: 'ProductCtrl',
            controllerAs: 'vm',
            data: {
                productId: productId,
                title: title,
                saveBtn: saveBtn,
                productBrands: vm.productBrands,
                productSizes: vm.productSizes,
                mainProducts: vm.mainProducts
            }
        });
        cfpLoadingBar.complete();
    }

    // remove product
    function _handleRemoveProduct(id) {
        $ngConfirm({
            title: 'Confirm! ',
            content: 'Are you sure about this action ?',
            scope: $scope,
            buttons: {
                delete: {
                    text: 'Delete',
                    btnClass: 'btn-danger',
                    action: function(scope, button) {
                        _deleteProduct(id);
                    }
                },
                close: function(scope, button) {
                    // closes the modal
                }
            }
        });
    }

    function _deleteProduct(productId) {
        cfpLoadingBar.start();
        ProductService.DeleteProductById(productId).then(
            function(response) {
                Notification.primary('Product was successfully deleted!');
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

    function _getMainProducts() {
        cfpLoadingBar.start();
        ProductService.GetMainProducts().then(
            function(response) {
                vm.mainProducts = [];
                vm.mainProducts = response.products;
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
    // this function used to get all leads
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
            colums: colums.value
        };
        ProductService.GetProductList(params).then(
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

    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withFnServerData(get)
        .withDataProp('data')
        .withOption('processing', true)
        .withOption('serverSide', true)
        .withOption('paging', true)
        .withPaginationType('full_numbers')
        .withDisplayLength(10)
        .withOption('rowCallback', rowCallback)
        .withLightColumnFilter({
            '0': {},
            '1': {
                type: 'text'
            },
            '2': {
                type: 'text'
            },
            '3': {
                type: 'text'
            },
            '4': {},
            '5': {}
        });

    vm.dtColumns = [
        DTColumnBuilder.newColumn(null, 'Image')
        .notSortable()
        .renderWith(imageRender),
        DTColumnBuilder.newColumn('name', 'Name'),
        DTColumnBuilder.newColumn('price', 'Retail price'),
        DTColumnBuilder.newColumn('category', 'Brand'),
        DTColumnBuilder.newColumn('modified_date', 'Last Updated'),
        DTColumnBuilder.newColumn(null, 'Actions')
        .notSortable()
        .renderWith(actionsHtml)
    ];

    function imageRender(data, type, full, meta) {
        var content = '';
        content += '<img width=\'32\' height=\'32\' src=\'' + data.image + '\'>';
        return content;
    }

    function actionsHtml(data, type, full, meta) {
        var content = '';
        content += '<div class=\'btn-group\'>';
        content +=
            '<button class=\'btn btn-sm btn-success\' ng-click=vm.showProductById(\'' +
            data.id +
            '\')>';
        content += '<i class=\'wb-pencil\'></i></button>';
        content +=
            '<button class=\'btn btn-sm btn-danger\' ng-click=vm.handleRemoveProduct(\'' +
            data.id +
            '\')>';
        content += '<i class=\'wb-trash\'></i></button>';
        content += '</div>';
        return content;
    }
}