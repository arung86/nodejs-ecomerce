aptAdminModule.config(['$routeProvider',
		function ($routeProvider) {
			$routeProvider
			.when('/login', {
				template : '<login></login>'
			})
			.when('/dashboard', {
				template : '<apt-header></apt-header><dashboard></dashboard><apt-footer></apt-footer>'
			})
			.when('/user', {
				template : '<apt-header></apt-header><user></user><apt-footer></apt-footer>'
			})
			.when('/usergroup', {
				template : '<apt-header></apt-header><usergroup></usergroup><apt-footer></apt-footer>'
			})
            .when('/useronline', {
                template : '<apt-header></apt-header><useronline></useronline><apt-footer></apt-footer>'
            })
			.otherwise('/login');
		}
	]);
