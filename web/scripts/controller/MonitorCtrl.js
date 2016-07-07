define(['../Alikula', 'jquery'], function(module, $) {
    module.controller("MonitorCtrl", function($scope, $http, $location, $timeout, $interval, commonService) {
        $scope.myForm = "one";
        $scope.oneForm = true;
        $scope.twoForm = false;
        $scope.myClass = "baseClass";
        var state = true;
        $scope.compare = function(){
            if(state == false){
                state = true;
            }else if(state == true){
                state = false;
            }
            if(state){
                $scope.oneForm = true;
                $scope.twoForm = false;
                $scope.myClass = "baseClass";
            }else{
                $scope.oneForm = false;
                $scope.twoForm = true;
                $scope.myClass = "newClass";
            }

        };
        $scope.movieHights = 0.42*window.screen.height;
        $scope.movieHight = 0.84*window.screen.height;
        console.log($scope.movieHight);
        $scope.NamespaceOptions = [
            {value: "acs_ecs", label: "云服务:acs_ecs"},
            //{value: "acs_rds", label: "云服务:acs_rds"}
            //"acs/ocs": "开放缓存服务:acs/ocs",
            //"acs/rds": "云数据库:acs/rds",
            //"acs/slb": "负载均衡:acs/slb"
        ];
        $scope.instanceIdOptions = [
            {value: "i-236pp2bne", label: "TestingServer", checked: true},
            {value: "i-23orv50er", label: "inCarDev", checked: true},
            {value: "AY140402102724524c92", label: "INCAR01", checked: true}
        ];
        $scope.MetricNameOptions = [
            {value: "CPUUtilization", label: "CPU使用率(%):CPUUtilization"},
            {value: "vm.MemoryUtilization", label: "内存使用率(%):vm.MemoryUtilization"},
            {value: "vm.DiskIOReadNew", label: "磁盘IO读(KB/s):vm.DiskIOReadNew"},
            {value: "vm.DiskIOWriteNew", label: "磁盘IO写(KB/s):vm.DiskIOWriteNew"},
            {value: "InternetInRateNew", label: "网络上行(入)流量(Kb/s):InternetInRateNew"},
            {value: "InternetOutRateNew", label: "网络下行(出)流量(Kb/s):InternetOutRateNew"}
        ];
        $scope.PeriodOptions = [
            {value: "60", label: "1分钟"},
            {value: "300", label: "5分钟"},
            {value: "500", label: "15分钟"}
        ];
        $scope.StatisticsOptions = [
            {value: "Average", label: "平均值:Average"},
            {value: "Sum", label: "合计值:Sum"},
            {value: "SampleCount", label: "采样值:SampleCount"},
            {value: "Maximum", label: "最大值:Maximum"},
            {value: "Minimum", label: "最小值:Minimum"}
        ];
        $scope.options = {
            InstanceId:'i-236pp2bne',
            Namespace: 'acs_ecs',
            MetricName: 'CPUUtilization',
            Period: '60',
            Statistics: 'Average',
            StartTime: commonService.dateFormat(new Date(new Date().getTime() - 24*3600*1000), "yyyy-MM-dd HH:mm"),
            EndTime: commonService.dateFormat(new Date(), "yyyy-MM-dd HH:mm")
        };
        /* 更新标题 */
        $scope.$watch('options', function() {
            var MetricName = $scope.options.MetricName;
            var instanceName = $scope.options.InstanceId;
            for (var i = 0; i < $scope.MetricNameOptions.length; i++) {
                if (MetricName == $scope.MetricNameOptions[i].value) {
                    $scope.title = $scope.MetricNameOptions[i].label.split(":")[0];
                }
            }
        }, true);

        $scope.drawChart = function() {
            $(".modal").modal('hide');

            if ($scope.heartBeats && $scope.heartBeats.length) {
                for (var i = 0; i < $scope.heartBeats.length; i++) {
                    $interval.cancel($scope.heartBeats[i]);
                }
            }
            $scope.heartBeats = [];

            while($scope.chart.series.length > 0) $scope.chart.series[0].remove(true);

            for (var i = 0; i < $scope.instanceIdOptions.length; i++) {
                if ($scope.instanceIdOptions[i].checked) {
                    var opt = $.extend({}, $scope.options);
                    opt.instanceId = $scope.instanceIdOptions[i].value;
                    drawLine(opt, $scope.instanceIdOptions[i].label);
                }
            }
        };

        function drawLine(thisOptions, title) {
            $http.get('/api/alicms', {params: thisOptions}).success(function(json) {
                if (json.Message) {
                    alert(json.Message);
                    return;
                }
                var data = json.Datapoints.Datapoint;
                var converted = [];
                for (var i = 0; i < data.length; i++) {
                    var item = data[i];
                    converted.push([new Date(item.timestamp).getTime() + 8*3600*1000, Number(item[$scope.options.Statistics])]);
                }
                converted.sort(function(i, j) {return i > j ? 1 : -1;});
                var thisSeries = $scope.chart.addSeries({name: title, data: converted});

                //每隔5分钟自动刷新数据
                $scope.heartBeats.push($interval(function() {
                    var opt = thisOptions;
                    opt.StartTime = thisOptions.EndTime;
                    opt.EndTime = new Date();
                    $http.get('/api/alicms', {params: opt}).success(function(json) {
                        if (json.Message) {
                            console.log(json.Message);
                            return;
                        }
                        var data = json.Datapoints.Datapoint;
                        for (var i = 0; i < data.length; i++) {
                            var item = data[i];
                            thisSeries.addPoint([new Date(item.timestamp).getTime() + 8*3600*1000, Number(item[$scope.options.Statistics])], true, true);
                        }
                    });
                }, 5*60*1000));
            }).error(function(msg, code) {
                alert(msg);
            });
        }

        $timeout(function() {
            $("input.form-control.datetimepicker").after("<span style='position: absolute; top: 12px; left: 25px;' class='glyphicon glyphicon-calendar'></span>");

            $("input.datetimepicker")
                .datetimepicker({startView: "day", minView: "hour", maxView: "month", format: "yyyy-mm-dd hh:ii", language: "zh-CN", autoclose: true})
                .on('show', function(ev) {
                    $("input.datetimepicker").not(this).datetimepicker('hide');
                });

            Highcharts.setOptions({
                global: {useUTC: false},
                lang: {resetZoom: "重置缩放"}
            });
            $scope.chart = new Highcharts.Chart({
                credits: {enabled: false},
                exporting: {enabled: false},
                chart: {renderTo: $("#chart-container")[0], zoomType: 'x', type: 'line'},
                title: {text: ''},
                xAxis: {
                    type: 'datetime',
                    labels: {style: {color: "#aaa"}, step: 1, formatter: function() {
                            return Highcharts.dateFormat('%H:%M', this.value);
                        }
                    }
                },
                yAxis: {
                    title: {text: ''},
                    gridLineColor: '#eee',
                    labels: {style: {color: '#aaa'}},
                    stackLabels: {enabled: true, style: {fontWeight: 'bold', color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray'}}
                },
                tooltip: {
                    shared: true,
                    backgroundColor: '#000000',
                    borderColor: '#000000',
                    style: {color: '#aaa'},
                    crosshairs: {color: '#aaa', dashStyle: 'ShortDot'},
                    formatter: function() {
                        var s = Highcharts.dateFormat("%Y-%m-%d %H:%M", this.x);
                        $.each(this.points, function(i, point) {
                            s += '<br><span style="color: ' + point.series.color + ';">' + point.series.name
                                + ': <b>' + point.y + '</b></span>';
                        });
                        return s;
                    }
                },
                legend: {
                    border: 0, borderRadius: 5, backgroundColor: '#eee', fontSize: 10, itemHoverStyle: {color: '#D00'}, enabled: true
                },
                plotOptions: {
                    series: {lineWidth: 7, states: {hover: {enabled: true, lineWidth: 7}}},
                    area: {lineWidth: 2, marker: {enabled: false, radius: 4}, shadow: false, states: {hover: {lineWidth: 2}}, dataLabels: {enabled: true, color: "#ccc"}},
                    line: {lineWidth: 2, marker: {enabled: false, radius: 4}, dataLabels: {enabled: false, color: "#ccc"}, states: {hover: {lineWidth: 2}}},
                    column: {stacking: 'normal', dataLabels: {enabled: false, color: (Highcharts.theme && Highcharts.theme.dataLabelsColor) || 'white', style: { textShadow: '0 0 2px black, 0 0 2px black'}}}
                }
            });

        });
    });
});