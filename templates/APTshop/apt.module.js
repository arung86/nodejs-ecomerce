var aptShopModule = angular.module('aptShopModule',
    ['ngResource', 'ngRoute', 'aptShopHomeModule', 'aptShopLoginModule',
        'aptShopRegisterModule', 'ngCookies', 'base64', 'aptShopForgotModule',
        'aptProductsModule'
    ]);
aptShopModule.provider('aptShopAuthenticate', [function () {
    this.$get = ['$cookies', '$base64', function ($cookies, $base64) {
        var $auth = {};
        $auth.isLogin = function () {
            return (typeof $cookies.get('apt_session_user') != 'undefined')
        };
        $auth.getCurrentUser = function (jsonParse) {
            if (typeof jsonParse == 'undefined') jsonParse = true;
            if (typeof $cookies.get('apt_session_user') == 'undefined') {
                return {};
            }
            return (jsonParse) ? JSON.parse($base64.decode($cookies.get('apt_session_user')))
                : $base64.decode($cookies.get('apt_session_user'));
        };

        return $auth;
    }
    ];
}
]).run(function ($rootScope, $location, $http, aptShopAuthenticate, $cookies) {
    var socket = io();
    $rootScope.$on('refresh_header', function () {
        if (aptShopAuthenticate.isLogin()) {
            console.log();
            socket.emit('user_is_logging', aptShopAuthenticate.getCurrentUser(false));
        }
    });
    $rootScope.$on('$locationChangeStart',
        function () {
            var path = $location.path().replace('/', '');
            switch (path) {
                case 'home':
                    $rootScope.title = 'Home';
                    break;
                case 'login':
                    if (aptShopAuthenticate.isLogin()) {
                        $location.path('/home');
                    }
                    $rootScope.title = 'Login';
                    break;
                case 'register':
                    $rootScope.title = 'Register';
                    break;
                case 'forgotPassword':
                    $rootScope.title = 'Forgot Password';
                    break;
                case 'logout':
                    $cookies.remove('apt_session_user');
                    $rootScope.$emit('refresh_header');
                    $location.path('/home');
                    socket.emit('forceDisconnect');
                    break;
                case 'confirmRegisted':
                    var param = $location.search();
                    if (!aptShopAuthenticate.isLogin()) {
                        $http.get("/confirmRegisted", {
                            params: param
                        }).then(function (response) {
                            if (response.data.success) {
                                $cookies.put('apt_session_user', response.data.hash);
                                $rootScope.$emit('refresh_header', true);
                                $location.search({}).path('/home');
                            } else {
                                $location.search({}).path('/login');
                            }
                        });
                    } else {
                        $rootScope.$emit('refresh_header');
                        $location.search({}).path('/home');
                    }
                    break;
                case 'updatePassword':
                    $rootScope.title = 'Update password';
                    break;
            }
        });
}).service('aptShopService', ['$http', '$q', function ($http, $q) {
    this.validate = function (fieldName, fieldValue, rules, fieldLabel) {
        var ruleArr = rules.split("|");
        var deferred = $q.defer();
        var param = {};
        var notification;
        param[fieldName] = fieldValue;
        fieldLabel = (typeof fieldLabel == 'undefined') ? fieldName : fieldLabel;
        if (jQuery.inArray('required', ruleArr) != -1) {
            notification = (!fieldValue) ? fieldLabel + ' is required' : '';
        }
        $http.get("/validate-user", {
            params: param
        }).then((response) => {
            if (jQuery.inArray('existed', ruleArr) != -1 && fieldValue) {
                
            }
        });


        // if (jQuery.inArray('existed', ruleArr) != -1 && fieldValue && !notification) {
        //     $http.get("/validate-user", {
        //         params: param
        //     }).then((response) => {
        //         notification = (response.data.isNotValid) ? response.data.message : '';
        //         console.log(notification);
        //     });
        //     console.log(notification);
        // }
        // if (jQuery.inArray('email', ruleArr) != -1 && fieldValue && !notification) {
        //     $http.get("/validate-user", {
        //         params: param
        //     }).then(function (response) {
        //         notification = (response.data.isNotValid) ? response.data.message : '';
        //     });
        // }
        // if (jQuery.inArray('phone', ruleArr) != -1 && fieldValue && !notification) {
        //     $http.get("/validate-user", {
        //         params: param
        //     }).then(function (response) {
        //         notification = (response.data.isNotValid) ? response.data.message : '';
        //     });
        // }
        // if (jQuery.inArray('alphanumberic', ruleArr) != -1 && fieldValue && !notification) {
        //     $http.get("/validate-user", {
        //         params: param
        //     }).then(function (response) {
        //         notification = (response.data.isNotValid) ? response.data.message : '';
        //     });
        // }
        // deferred.resolve(notification);

        return deferred.promise;
    };
}
]);
