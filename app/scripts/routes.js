angular.module('gasAdmin').config([
    '$stateProvider',
    '$urlServiceProvider',
    '$locationProvider',
    '$breadcrumbProvider',
    function(
        $stateProvider,
        $urlServiceProvider,
        $locationProvider,
        $breadcrumbProvider
    ) {
        $urlServiceProvider.rules.otherwise({
            state: 'app.404'
        });

        $stateProvider
            .state('app', {
                abstract: true,
                ncyBreadcrumb: {
                    label: 'Admin Dashboard',
                    skip: false
                }
            })
            .state('app.login', {
                url: '/login',
                templateUrl: '/views/login.html',
                controller: 'LoginCtrl',
                controllerAs: 'vm',
                data: {
                    roles: []
                },
                ncyBreadcrumb: {
                    label: 'Login page',
                    skip: true
                }
            })
            .state('app.reset-password', {
                url: '/reset-password/:token',
                templateUrl: '/views/resetPassword.html',
                controller: 'LoginCtrl',
                controllerAs: 'vm',
                data: {
                    roles: []
                },
                ncyBreadcrumb: {
                    label: 'Password reset page',
                    skip: true
                }
            })
            .state('app.create-password', {
                url: '/create-password/:token',
                templateUrl: '/views/resetPassword.html',
                controller: 'LoginCtrl',
                controllerAs: 'vm',
                data: {
                    roles: []
                },
                ncyBreadcrumb: {
                    label: 'Password reset page',
                    skip: true
                }
            })
            .state('app.main', {
                url: '/',
                templateUrl: '/views/main.html',
                controller: 'MainCtrl',
                controllerAs: 'vm',
                data: {
                    roles: ['administrator', 'manager', 'agent', 'admin_staff'],
                    applicationAccess: ['administrator', 'manager'],
                    agentAccess: ['administrator', 'manager', 'admin_staff'],
                    productAccess: ['administrator', 'manager', 'agent', 'admin_staff'],
                    userAccess: ['administrator', 'manager'],
                    categoryAccess: ['administrator', 'manager'],
                    orderAccess: ['administrator', 'manager', 'agent', 'admin_staff'],
                    reportAccess: ['administrator', 'manager', 'agent'],
                    agentSettingsAccess: ['agent']
                },
                ncyBreadcrumb: {
                    label: 'Admin Dashboard',
                    skip: true
                }
            })
            .state('app.profile', {
                url: '/profile',
                templateUrl: 'views/userProfile.html',
                controller: 'MainCtrl',
                controllerAs: 'vm',
                data: {
                    roles: ['administrator', 'manager', 'agent', 'admin_staff']
                },
                ncyBreadcrumb: {
                    label: 'Profile',
                    skip: false
                }
            })
            .state('app.agents', {
                url: '/agents',
                templateUrl: 'views/agents/agents.html',
                controller: 'AgentCtrl',
                controllerAs: 'vm',
                data: {
                    roles: ['administrator', 'manager', 'admin_staff']
                },
                ncyBreadcrumb: {
                    label: 'Agents',
                    skip: false
                }
            })
            .state('app.products', {
                url: '/products',
                templateUrl: 'views/products/products.html',
                controller: 'ProductCtrl',
                controllerAs: 'vm',
                data: {
                    roles: ['administrator', 'manager', 'agent', 'admin_staff']
                },
                ncyBreadcrumb: {
                    label: 'Products',
                    skip: false
                }
            })
            .state('app.users', {
                url: '/users',
                templateUrl: 'views/users/users.html',
                controller: 'UserCtrl',
                controllerAs: 'vm',
                data: {
                    roles: ['administrator', 'manager']
                },
                ncyBreadcrumb: {
                    label: 'Users',
                    skip: false
                }
            })
            .state('app.categories', {
                url: '/categories',
                templateUrl: 'views/categories/categories.html',
                controller: 'CategoryCtrl',
                controllerAs: 'vm',
                data: {
                    roles: ['administrator', 'manager']
                },
                ncyBreadcrumb: {
                    label: 'Categories',
                    skip: false
                }
            })
            .state('app.orders', {
                url: '/orders',
                templateUrl: 'views/orders/orders.html',
                controller: 'OrderCtrl',
                controllerAs: 'vm',
                data: {
                    roles: ['administrator', 'manager', 'agent', 'admin_staff']
                },
                ncyBreadcrumb: {
                    label: 'Orders',
                    skip: false
                }
            })
            .state('app.pending', {
                url: '/pending-orders',
                templateUrl: 'views/orders/orders.html',
                controller: 'OrderCtrl',
                controllerAs: 'vm',
                data: {
                    roles: ['administrator', 'manager', 'agent', 'admin_staff']
                },
                ncyBreadcrumb: {
                    label: 'Pending Orders',
                    skip: false
                }
            })
            .state('app.create-order', {
                url: '/orders/new',
                templateUrl: 'views/orders/order_form.html',
                controller: 'OrderCtrl',
                controllerAs: 'vm',
                data: {
                    roles: ['administrator', 'manager', 'agent', 'admin_staff']
                },
                ncyBreadcrumb: {
                    label: 'Orders',
                    skip: false
                }
            })
            .state('app.view-order', {
                url: '/orders/view/:id',
                templateUrl: 'views/orders/view_order.html',
                controller: 'OrderCtrl',
                controllerAs: 'vm',
                data: {
                    roles: ['administrator', 'manager', 'agent', 'admin_staff']
                },
                ncyBreadcrumb: {
                    label: 'Orders',
                    skip: false
                }
            })
            .state('app.receipt', {
                url: '/orders/receipt/:id',
                templateUrl: 'views/orders/receipt.html',
                controller: 'OrderCtrl',
                controllerAs: 'vm',
                data: {
                    roles: ['administrator', 'manager', 'agent', 'admin_staff']
                },
                ncyBreadcrumb: {
                    label: 'Orders',
                    skip: false
                }
            })
            .state('app.invoice', {
                url: '/orders/invoice/:id',
                templateUrl: 'views/orders/invoice.html',
                controller: 'OrderCtrl',
                controllerAs: 'vm',
                data: {
                    roles: ['administrator', 'manager', 'agent', 'admin_staff']
                },
                ncyBreadcrumb: {
                    label: 'Orders',
                    skip: false
                }
            })
            .state('app.reports', {
                url: '/reports',
                templateUrl: 'views/reports/index.html',
                controller: 'ReportCtrl',
                controllerAs: 'vm',
                data: {
                    roles: ['administrator', 'manager', 'agent']
                },
                ncyBreadcrumb: {
                    label: 'Reports',
                    skip: false
                }
            })
            .state('app.custom-reports', {
                url: '/reports/:reportName',
                templateUrl: 'views/reports/index.html',
                controller: 'ReportCtrl',
                controllerAs: 'vm',
                data: {
                    roles: ['administrator', 'manager', 'agent']
                },
                ncyBreadcrumb: {
                    label: 'Reports',
                    skip: false
                }
            })
            .state('app.settings', {
                url: '/settings',
                templateUrl: 'views/settings/settings.html',
                controller: 'MainCtrl',
                controllerAs: 'vm',
                data: {
                    roles: ['administrator', 'manager']
                },
                ncyBreadcrumb: {
                    label: 'Settings',
                    skip: false
                }
            })
            .state('app.agent-settings', {
                url: '/my-account/settings',
                templateUrl: 'views/settings/agent_settings.html',
                controller: 'AgentCtrl',
                controllerAs: 'vm',
                data: {
                    roles: ['agent']
                },
                ncyBreadcrumb: {
                    label: 'Settings',
                    skip: false
                }
            })
            .state('app.404', {
                url: '/page-not-found',
                templateUrl: 'views/404.html',
                controller: 'ErrorCtrl',
                controllerAs: 'vm',
                data: {
                    roles: []
                },
                ncyBreadcrumb: {
                    label: 'Page not found',
                    skip: false
                }
            });

        $locationProvider.html5Mode(true);

        $breadcrumbProvider.setOptions({
            prefixStateName: 'wm',
            includeAbstract: true,
            template: '<li class="breadcrumb-item" ng-repeat="step in steps" ng-class="{active: $last}" ng-switch="$last || !!step.abstract"><a ng-switch-when="false" href="{{step.ncyBreadcrumbLink}}">{{step.ncyBreadcrumbLabel}}</a><span ng-switch-when="true">{{step.ncyBreadcrumbLabel}}</span></li>'
        });
    }
]);