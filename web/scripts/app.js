requirejs.config({
    paths: {
        jquery: 'http://apps.bdimg.com/libs/jquery/2.1.4/jquery',
        angular: "http://apps.bdimg.com/libs/angular.js/1.3.13/angular",
        angularResource: "http://apps.bdimg.com/libs/angular.js/1.3.13/angular-resource",
        angularSanitize: "http://apps.bdimg.com/libs/angular.js/1.3.13/angular-sanitize",
        angularRoute: "http://apps.bdimg.com/libs/angular-route/1.3.13/angular-route",
        bootstrap: "http://cdn.bootcss.com/bootstrap/3.3.5/js/bootstrap.min",
        datetimePicker: "lib/bootstrap-datetimepicker.min",
        highcharts: 'lib/highcharts'
    },
    shim: {
        jquery: {exports: '$'},
        angular: {exports: 'angular', deps: ['jquery']},
        angularResource: ['angular'],
        angularSanitize:['angular'],
        angularRoute:['angular'],
        bootstrap:['jquery'],
        datetimePicker: ['jquery', 'bootstrap'],
        highcharts: ['jquery']
    }
});

require(
    ['angular', 'Alikula', './service/commonService'],
    function(angular) {
        angular.bootstrap(document, ['Alikula']);
    }
);