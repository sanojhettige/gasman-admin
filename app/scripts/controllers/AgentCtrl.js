'use strict';
angular.module('gasAdmin').controller('AgentCtrl', AgentCtrl);

AgentCtrl.$inject = [
    'localStorageService',
    '$state',
    'AuthenticationService',
    'Notification',
    'initPageContent',
    'cfpLoadingBar',
    'ngDialog',
    'AgentService',
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

function AgentCtrl(
    localStorageService,
    $state,
    AuthenticationService,
    Notification,
    initPageContent,
    cfpLoadingBar,
    ngDialog,
    AgentService,
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
    PageHtml.setTitle('Administrator | Agents');

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
    vm.showAgentById = _showAgentById;
    vm.agentList = [];
    vm._getAgentList = _getAgentList;
    vm.agentById = {};
    vm.getAgentById = _getAgentById;
    vm.cities = [];
    vm.getCities = _getCities;
    vm.updateAgent = _updateAgent;
    vm.errors = [];
    vm.handleRemoveAgent = _handleRemoveAgent;
    vm.pageData = {
        total: 0
    };

    vm.prodFile = null;
    vm.imageSrc = '';
    vm.vPlayer = [];
    vm.getSetting = {};
    vm.getSettings = _getSettings;
    vm.updateSettings = _updateSettings;

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

    //Get agent list
    function _getAgentList(pageNumber) {
        cfpLoadingBar.start();
        AgentService.GetagentList(0, pageNumber).then(
            function(response) {
                vm.agentList = null;
                vm.agentList = response.data.items;
                vm.totalAgents = response.data.count;
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

    // get cities
    function _getCities() {
        cfpLoadingBar.start();
        AgentService.GetCities().then(
            function(response) {
                vm.cities = null;
                vm.cities = response.cities;
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

    // Get agent by id
    function _getAgentById(agentId) {
        vm.agentById = {};
        if (agentId != 0) {
            cfpLoadingBar.start();
            AgentService.GetAgentById(agentId).then(
                function(response) {
                    vm.agentById = {};
                    vm.agentById = response.data.agent;
                    vm.imageSrc = response.data.agent.image;
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

    //Update agent
    function _updateAgent(agent) {
        cfpLoadingBar.start();
        vm.submitting = true;
        AgentService.UpdateAgent(agent, vm.imageSrc).then(
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
        Notification.error('Please fix the errors to save details.');
        angular.forEach(err, function(value, key) {
            if (value.location === 'name') {
                vm.errors.name = value.message;
            }
            if (value.location === 'address') {
                vm.errors.address = value.message;
            }
            if (value.location === 'image') {
                vm.errors.image = value.message;
            }
            if (value.location === 'contact_person') {
                vm.errors.contact_person = value.message;
            }
            if (value.location === 'contact_number') {
                vm.errors.contact_number = value.message;
            }
            if (value.location === 'delivery_charge') {
                vm.errors.delivery_charge = value.message;
            }
            if (value.location === 'email') {
                vm.errors.email = value.message;
            }
            if (value.location === 'city_id') {
                vm.errors.city_id = value.message;
            }
            if (value.location === 'password') {
                vm.errors.password = value.message;
            }
            if (value.location === 'confirm_password') {
                vm.errors.confirm_password = value.message;
            }
            if (value.location === 'inv_format') {
                vm.errors.inv_format = value.message;
            }
            if (value.location === 'inv_ref') {
                vm.errors.inv_ref = value.message;
            }
            if (value.location === 'invoice_footer') {
                vm.errors.invoice_footer = value.message;
            }
            if (value.location === 'payment_terms') {
                vm.errors.payment_terms = value.message;
            }
            if (value.location === 'delivery_terms') {
                vm.errors.delivery_terms = value.message;
            }
            if (value.location === 'inv_number') {
                vm.errors.inv_number = value.message;
            }
        });

        // console.log(vm.errors);
    }

    //show agnet popup
    function _showAgentById(agentId) {
        cfpLoadingBar.start();
        var templateURL = '';
        var title = 'Add New Agent';
        var saveBtn = 'Add Agent';

        if (agentId) {
            title = 'Update Agent Details';
            saveBtn = 'Update Agent';
        }

        templateURL = '/views/agents/agent_form.html';

        ngDialog.open({
            template: templateURL,
            className: 'ngdialog-theme-default modal-70',
            controller: 'AgentCtrl',
            controllerAs: 'vm',
            data: {
                agentId: agentId,
                title: title,
                saveBtn: saveBtn,
                cities: vm.cities
            }
        });
        cfpLoadingBar.complete();
    }

    // remove agent
    function _handleRemoveAgent(id) {
        $ngConfirm({
            title: 'Confirm! ',
            content: 'Are you sure about this action ?',
            scope: $scope,
            buttons: {
                delete: {
                    text: 'Delete',
                    btnClass: 'btn-danger',
                    action: function(scope, button) {
                        _deleteAgent(id);
                    }
                },
                close: function(scope, button) {
                    // closes the modal
                }
            }
        });
    }

    function _deleteAgent(agentId) {
        cfpLoadingBar.start();
        AgentService.DeleteAgentById(agentId).then(
            function(response) {
                Notification.primary('Agent successfully deleted!');
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

    function _getSettings() {
        cfpLoadingBar.start();
        AgentService.GetSettings().then(
            function(response) {
                vm.getSetting = response.data.setting;
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

    function _updateSettings(setting) {
        cfpLoadingBar.start();
        vm.submitting = true;
        AgentService.UpdateSetting(setting).then(
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
                } else if (err.errors) {
                    _handleValidationErrors(err.errors);
                }
                cfpLoadingBar.complete();
                vm.submitting = false;
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
        AgentService.GetAgentList(params).then(
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
                if (err) {
                    if (err.message) {
                        Notification.error(err.message);
                    }

                    if (err.error === '1' || err.access === 'Unauthorized') {
                        AuthenticationService.ClearCredentials();
                        $state.go('app.login');
                    }
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
        .withOption('rowCallback', rowCallback)
        .withLightColumnFilter({
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
            '4': {},
            '5': {},
            '6': {}
        });

    vm.dtColumns = [
        DTColumnBuilder.newColumn('name', 'Agent Name'),
        DTColumnBuilder.newColumn('address', 'Address'),
        DTColumnBuilder.newColumn('telephone', 'Telephone'),
        DTColumnBuilder.newColumn('email', 'Email'),
        DTColumnBuilder.newColumn('status', 'Status'),
        DTColumnBuilder.newColumn('reg_date', 'Created Date'),
        DTColumnBuilder.newColumn(null, 'Actions')
        .notSortable()
        .renderWith(actionsHtml)
    ];

    function actionsHtml(data, type, full, meta) {
        var content = '';
        content += '<div class=\'btn-group\'>';
        content +=
            '<button class=\'btn btn-sm btn-success\' ng-click=vm.showAgentById(\'' +
            data.id +
            '\')>';
        content += '<i class=\'wb-pencil\'></i></button>';
        content +=
            '<button class=\'btn btn-sm btn-danger\' ng-click=vm.handleRemoveAgent(\'' +
            data.id +
            '\')>';
        content += '<i class=\'wb-trash\'></i></button>';
        content += '</div>';
        return content;
    }
}