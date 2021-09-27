'use strict';

var brandPrimary = '#20a8d8';
var brandSuccess = '#4dbd74';
var brandInfo = '#63c2de';
var brandWarning = '#f8cb00';
var brandDanger = '#f86c6b';

var grayDark = '#2a2c36';
var gray = '#55595c';
var grayLight = '#818a91';
var grayLighter = '#d1d4d7';
var grayLightest = '#f8f9fa';

angular
    .module('gasAdmin', [
        'ngAnimate',
        'ngCookies',
        'ngResource',
        'ui.router',
        'ngSanitize',
        'ngTouch',
        'LocalStorageModule',
        'ui-notification',
        'base64',
        'angular-loading-bar',
        'oc.lazyLoad',
        'ncy-angular-breadcrumb',
        'ngDialog',
        'moment-picker',
        'vsGoogleAutocomplete',
        '720kb.tooltips',
        'ngDragToReorder',
        'angular-toArrayFilter',
        'customFilter',
        'ui.timepicker',
        'validation',
        'validation.rule',
        'dx',
        'ngMask',
        'checklist-model',
        'naif.base64',
        'angular.filter',
        'ng.confirmField',
        'angularUtils.directives.dirPagination',
        'ngImageCompress',
        'internationalPhoneNumber',
        'ngIntlTelInput',
        'chart.js',
        'datatables',
        'datatables.columnfilter',
        'datatables.light-columnfilter',
        '720kb.datepicker',
        'angularjs-dropdown-multiselect',
        'ngTagsInput',
        'cp.ngConfirm',
        'base64',
        'angularTrix',
        'ui.calendar',
        'datatables.buttons'
    ])

.config(function(NotificationProvider) {
    NotificationProvider.setOptions({
        delay: 5000,
        startTop: 20,
        startRight: 10,
        verticalSpacing: 20,
        horizontalSpacing: 20,
        positionX: 'right',
        positionY: 'top'
    });
})

.config(function(cfpLoadingBarProvider) {
    cfpLoadingBarProvider.includeSpinner = false;
    cfpLoadingBarProvider.includeBar = true;
    cfpLoadingBarProvider.loadingBarTemplate =
        '<div id="loading-bar"><div class="bar"><div class="peg"></div></div></div>';
})

.config(function($httpProvider) {
    $httpProvider.defaults.useXDomain = true;
    $httpProvider.defaults.headers.common['X-Requested-With'] =
        'XMLHttpRequest';
    $httpProvider.defaults.headers.common['Accept'] = 'application/json';
})

.config(function($locationProvider) {
    $locationProvider.html5Mode(true);
})

.config(function(ngIntlTelInputProvider) {
    ngIntlTelInputProvider.set({
        initialCountry: 'nz',
        separateDialCode: true
    });
})

.config(function(ChartJsProvider) {
    ChartJsProvider.setOptions({
        global: {
            colors: [
                '#8E5EA2',
                '#3CBA9F',
                '#0E948C',
                '#FDB45C',
                '#F45B00',
                '#803690',
                '#00ADF9'
            ]
        }
    });
})

.config([
    '$qProvider',
    function($qProvider) {
        $qProvider.errorOnUnhandledRejections(true);
    }
])

.provider('initPageContent', function() {
    var defPageContent = {
        customHeaderUrl: 'views/tmpls/default-header.template.html',
        navbar: 'views/tmpls/navbar.template.html',
        sidebar_left: 'views/tmpls/sidebar-left.template.html',
        sidebar_right: 'views/tmpls/sidebar-right.template.html',
        breadcrumbUrl: 'views/tmpls/breadcrumb-bar.template.html',
        customFooterUrl: 'views/tmpls/default-footer.template.html',
        currentYear: new Date().getFullYear(),
        appName: 'GasMan',
        footerText: 'Copyright ' +
            new Date().getFullYear() +
            ' © GasMan All rights reserved.'
    };

    var currPageContent = angular.copy(defPageContent);

    return {
        $get: function($rootScope) {
            $rootScope.$on('$viewContentLoading', function() {
                angular.extend(currPageContent, defPageContent);
            });
            return currPageContent;
        }
    };
})

.run([
    '$rootScope',
    '$state',
    '$stateParams',
    '$transitions',
    'AuthenticationService',
    'UserService',
    'Notification',
    'localStorageService',
    'cfpLoadingBar',
    'ngDialog',
    '$http',
    'PageHtml',
    function(
        $rootScope,
        $state,
        $stateParams,
        $transitions,
        AuthenticationService,
        UserService,
        Notification,
        localStorageService,
        cfpLoadingBar,
        ngDialog,
        $http,
        PageHtml
    ) {
        $transitions.onBefore({
                to: 'app.login'
            },
            function($transitions) {
                if (localStorageService.get('authData') != null) {
                    return $transitions.router.stateService.target('app.main');
                }
            }
        );
        $transitions.onSuccess({}, function() {
            document.body.scrollTop = document.documentElement.scrollTop = 0;

            var state_roles = $state.$current.data.roles;
            if (state_roles.length > 0) {
                if (!AuthenticationService.CheckAuthentication(state_roles)) {
                    Notification.error(
                        'Access denied!<br/>Please contact system administrator.'
                    );
                    AuthenticationService.ClearCredentials();
                    $rootScope.returnToState = $rootScope.toState;
                    $rootScope.returnToStateParams = $rootScope.toStateParams;
                    $state.go('app.login');
                }
            }

            $rootScope.userNotifications = [];
            var params = {
                limit: 5,
                offset: 0,
                status: 1
            };
            UserService.GetNotifications(params).then(
                function(response) {
                    // console.log(response);
                    $rootScope.userNotifications = response;
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

            $rootScope.showNotification = function(data) {
                if (data.order_id > 0) {
                    $state.go('app.view-order', { id: data.order_key });
                }
            };

            var authData = localStorageService.get('authData');

            if (authData) {
                $rootScope.userProfile = authData.role;
            }

            var appAccessRoles = $state.get('app.main').data.applicationAccess;
            var agentAccessRoles = $state.get('app.main').data.agentAccess;
            var productAccessRoles = $state.get('app.main').data.productAccess;
            var userAccessRoles = $state.get('app.main').data.userAccess;
            var orderAccessRoles = $state.get('app.main').data.orderAccess;
            var categoryAccessRoles = $state.get('app.main').data.categoryAccess;
            var agentSettingsRoles = $state.get('app.main').data
                .agentSettingsAccess;
            var reportAccessRoles = $state.get('app.main').data.reportAccess;

            var applicationAccess = AuthenticationService.CheckAuthentication(
                appAccessRoles
            );
            var agentAccess = AuthenticationService.CheckAuthentication(
                agentAccessRoles
            );
            var productAccess = AuthenticationService.CheckAuthentication(
                productAccessRoles
            );
            var userAccess = AuthenticationService.CheckAuthentication(
                userAccessRoles
            );
            var orderAccess = AuthenticationService.CheckAuthentication(
                orderAccessRoles
            );
            var categoryAccess = AuthenticationService.CheckAuthentication(
                categoryAccessRoles
            );

            var agentSettingsAccess = AuthenticationService.CheckAuthentication(
                agentSettingsRoles
            );

            var reportAccess = AuthenticationService.CheckAuthentication(reportAccessRoles);

            $rootScope.agentAccessFlag = agentAccess;

            $rootScope.applicationAccessFlag = applicationAccess;

            $rootScope.productAccessFlag = productAccess;

            $rootScope.userAccessFlag = userAccess;

            $rootScope.categoryAccessFlag = categoryAccess;

            $rootScope.orderAccessFlag = orderAccess;

            $rootScope.agentSettingsFlag = agentSettingsAccess;

            $rootScope.reportAccessFlag = reportAccess;

            $rootScope.$state = $state;

            $rootScope.$stateParams = $stateParams;
        });

        $rootScope.logout = function() {
            cfpLoadingBar.start();

            AuthenticationService.SignOut();
            PageHtml.setTitle('Login');
            PageHtml.setHtmlClass('js-menubar');
            PageHtml.setBodyClass('page-login layout-full page-dark');
            cfpLoadingBar.complete();
        };

        $rootScope.sideMenuOpen = false;
        $rootScope.toggleSideMenu = function() {
            if ($rootScope.sideMenuOpen) {
                $rootScope.sideMenuOpen = false;
                PageHtml.setHtmlClass('js-menubar');
                PageHtml.setBodyClass('site-menubar-fold');
            } else {
                $rootScope.sideMenuOpen = true;
                PageHtml.setHtmlClass('js-menubar');
                PageHtml.setBodyClass('site-menubar-unfold');
            }
        };

        if (localStorageService.get('authData')) {
            if (!$rootScope.sideMenuOpen) {
                PageHtml.setHtmlClass('js-menubar');
                PageHtml.setBodyClass('site-menubar-fold');
            } else {
                PageHtml.setHtmlClass('js-menubar');
                PageHtml.setBodyClass('site-menubar-unfold');
            }
        } else {
            PageHtml.setTitle('Login');
            PageHtml.setHtmlClass('js-menubar');
            PageHtml.setBodyClass('page-login layout-full page-dark');
        }

        $rootScope.imgUrl = '';
        $rootScope.currentYear = new Date().getFullYear();
    }
]);