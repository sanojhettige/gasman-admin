'use strict';
angular.module('gasAdmin').controller('UserCtrl', UserCtrl);

UserCtrl.$inject = [
    'localStorageService',
    '$state',
    'AuthenticationService',
    'Notification',
    'initPageContent',
    'cfpLoadingBar',
    'ngDialog',
    'UserService',
    '$ngConfirm',
    '$scope',
    'DTOptionsBuilder',
    'DTColumnBuilder',
    '$http',
    '$q',
    '$compile',
    '$rootScope',
    'PageHtml'
];

function UserCtrl(
    localStorageService,
    $state,
    AuthenticationService,
    Notification,
    initPageContent,
    cfpLoadingBar,
    ngDialog,
    UserService,
    $ngConfirm,
    $scope,
    DTOptionsBuilder,
    DTColumnBuilder,
    $http,
    $q,
    $compile,
    $rootScope,
    PageHtml
) {
    var vm = this;

    vm.pageContent = initPageContent;
    $rootScope.PageHtml = PageHtml;
    PageHtml.setTitle('Administrator | Users');

    let appAccessRoles = $state.$current.data.applicationAccess;

    vm.applicationAccessView = AuthenticationService.CheckAuthentication(
        appAccessRoles
    );

    vm.splitType = 1;

    //Definitions
    vm.closePopUp = _closePopUp;
    vm.redirectToUrl = _redirectToUrl;
    vm.refreshMainPageData = _refreshMainPageData;
    vm.currentYear = new Date().getFullYear();
    vm.showUserById = _showUserById;
    vm.userList = [];
    vm._getUserList = _getUserList;
    vm.userById = {};
    vm.getUserById = _getUserById;
    vm.updateUser = _updateUser;
    vm.errors = [];
    vm.handleRemoveUser = _handleRemoveUser;
    vm.pageData = {
        total: 0
    };

    vm.prodFile = null;
    vm.imageSrc = '';

    vm.onFileChanged = function(event) {
        vm.prodFile = event.target.files[0];
    };

    vm.submitting = false;

    function _refreshMainPageData() {}

    function _closePopUp() {
        ngDialog.close();
    }

    function _redirectToUrl(route) {
        $state.go(route);
    }

    //Get user list
    function _getUserList(pageNumber) {
        cfpLoadingBar.start();
        UserService.GetUserList(0, pageNumber).then(
            function(response) {
                vm.userList = null;
                vm.userList = response.data.items;
                vm.totalUsers = response.data.count;
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

    // Get user by id
    function _getUserById(userId) {
        vm.userById = {};
        if (userId != 0) {
            cfpLoadingBar.start();
            UserService.GetUserById(userId).then(
                function(response) {
                    vm.userById = {};
                    vm.userById = response.data.user;
                    vm.imageSrc = response.data.user.image;
                },
                function(err) {
                    if (err.message) {
                        Notification.error(err.message);
                    }

                    if (err.error === '1' || err.access === 'Unauthorized') {
                        AuthenticationService.ClearCredentials();
                        ngDialog.close();
                        $state.go('app.login');
                    }
                    cfpLoadingBar.complete();
                }
            );
            cfpLoadingBar.complete();
        }
    }

    //Update user
    function _updateUser(user) {
        cfpLoadingBar.start();
        vm.submitting = true;
        UserService.UpdateUser(user).then(
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
                    $state.go('app.login');
                    ngDialog.close();
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
        vm.errors = [];
        Notification.error('Please fix above errors to save user details.');
        angular.forEach(err, function(value, key) {
            if (value.location === 'name') {
                vm.errors.name = value.message;
            }
            if (value.location === 'email') {
                vm.errors.email = value.message;
            }
            if (value.location === 'telephone') {
                vm.errors.telephone = value.message;
            }
            if (value.location === 'role_id') {
                vm.errors.name = value.message;
            }
            if (value.location === 'username') {
                vm.errors.username = value.message;
            }
            if (value.location === 'password') {
                vm.errors.password = value.message;
            }
            if (value.location === 'password_confirmation') {
                vm.errors.password_confirmation = value.message;
            }
        });
    }

    //show user popup
    function _showUserById(userId) {
        cfpLoadingBar.start();
        var templateURL = '';
        var title = 'Add New User';
        var saveBtn = 'Add User';

        if (userId) {
            title = 'Update User Details';
            saveBtn = 'Update User';
        }

        templateURL = '/views/users/user_form.html';

        ngDialog.open({
            template: templateURL,
            className: 'ngdialog-theme-default modal-70',
            controller: 'UserCtrl',
            controllerAs: 'vm',
            data: {
                userId: userId,
                title: title,
                saveBtn: saveBtn,
                roles: [{ id: 1, name: 'Admin' }, { id: 2, name: 'Manager' }, { id: 5, name: 'Staff' }]
            }
        });
        cfpLoadingBar.complete();
    }

    // remove user
    function _handleRemoveUser(id) {
        $ngConfirm({
            title: 'Confirm! ',
            content: 'Are you sure about this action ?',
            scope: $scope,
            buttons: {
                delete: {
                    text: 'Delete',
                    btnClass: 'btn-danger',
                    action: function(scope, button) {
                        _deleteUser(id);
                    }
                },
                close: function(scope, button) {
                    // closes the modal
                }
            }
        });
    }

    function _deleteUser(userId) {
        cfpLoadingBar.start();
        UserService.DeleteUserById(userId).then(
            function(response) {
                Notification.primary('User was successfully deleted!');
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

    // this function used to get all leads
    var get = function(sSource, aoData, fnCallback, oSettings) {
        var draw = aoData[0].value;
        var order = aoData[2].value;
        var start = aoData[3].value;
        var length = aoData[4].value;
        var search = aoData[5].value;
        var params = {
            offset: start,
            limit: length,
            order: order,
            draw: draw,
            search: search.value
        };
        UserService.GetUserList(params).then(
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
        .withFnServerData(get) // method name server call
        .withDataProp('data') // parameter name of list use in getLeads Fuction
        .withOption('processing', true) // required
        .withOption('serverSide', true) // required
        .withOption('paging', true) // required
        .withPaginationType('full_numbers')
        .withDisplayLength(10)
        .withOption('rowCallback', rowCallback);

    vm.dtColumns = [
        DTColumnBuilder.newColumn('name', 'Full Name'),
        DTColumnBuilder.newColumn('email', 'Email'),
        DTColumnBuilder.newColumn('telephone', 'Phone Number'),
        DTColumnBuilder.newColumn('role_name', 'Role').notSortable(),
        DTColumnBuilder.newColumn('reg_date', 'Registered Date'),
        DTColumnBuilder.newColumn(null, 'Actions')
        .notSortable()
        .renderWith(actionsHtml)
    ];

    function actionsHtml(data, type, full, meta) {
        var content = '';
        content += '<div class=\'btn-group\'>';
        content +=
            '<button class=\'btn btn-sm btn-success\' ng-click=vm.showUserById(\'' +
            data.id +
            '\')>';
        content += '<i class=\'wb-pencil\'></i></button>';
        content +=
            '<button class=\'btn btn-sm btn-danger\' ng-click=vm.handleRemoveUser(\'' +
            data.id +
            '\')>';
        content += '<i class=\'wb-trash\'></i></button>';
        content += '</div>';
        return content;
    }
}