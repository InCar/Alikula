define([], function() {
    return {
        defaultRoutePath: '/web/notFound',
        routes: {
            '/': {
                templateUrl: '/view/main.html'
            },
            '/alicms': {
                templateUrl: '/view/alicms.html',
                dependencies: [
                    'controller/MonitorCtrl'
                ]
            },
            '/alicms`': {
                templateUrl: '/view/alicms`.html',
                dependencies: [
                    'controller/MonitorCtrl'
                ]
            },
            '/alicmsMain': {
                templateUrl: '/view/alicmsMain.html',
                dependencies: [
                    'controller/MonitorCtrl'
                ]
            },
            '/web/notFound': {
                templateUrl: '/view/notFound.html'
            }
        }
    };
});