aptShopModule.config(['$routeProvider',
    function ($routeProvider) {
        $routeProvider
            .when('/home', {
                template: '<home></home>'
            })
            .when('/confirm-registed', {
                template: ''
            })
            .when('/login', {
                template: '<login></login>'
            })
            .when('/register', {
                template: '<register></register>'
            })
            .when('/category', {
                template: '<products></products>'
            })
            .when('/forgotPassword', {
                template: '<forgot></forgot>'
            })
            .when('/updatePassword', {
                template: '<update-password></update-password>'
            })
            .otherwise('/home');
    }
]);
