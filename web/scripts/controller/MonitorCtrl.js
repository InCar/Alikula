define(['../Alikula', 'jquery'], function(module, $) {
    module.controller("MonitorCtrl", function($scope, $http, $location, $timeout, $interval, commonService) {
        $scope.NamespaceOptions = [
            {value: "acs/ecs", label: "云服务:acs/ecs"}
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
            {value: "vm.CPUUtilization", label: "CPU使用率(%):vm.CPUUtilization"},
            {value: "vm.MemoryUtilization", label: "内存使用率(%):vm.MemoryUtilization"},
            {value: "vm.DiskIORead", label: "磁盘IO读(KB/s):vm.DiskIORead"},
            {value: "vm.DiskIOWrite", label: "磁盘IO写(KB/s):vm.DiskIOWrite"},
            {value: "vm.InternetNetworkRX", label: "网络上行(入)流量(Kb/s):vm.InternetNetworkRX"},
            {value: "vm.InternetNetworkTX", label: "网络下行(出)流量(Kb/s):vm.InternetNetworkTX"}
        ];
        $scope.PeriodOptions = [
            {value: "5m", label: "5分钟"},
            {value: "15m", label: "15分钟"},
            {value: "30m", label: "30分钟"},
            {value: "1h", label: "1小时"},
            {value: "1d", label: "1天"}
        ];
        $scope.StatisticsOptions = [
            {value: "Average", label: "平均值:Average"},
            {value: "Sum", label: "合计值:Sum"},
            {value: "SampleCount", label: "采样值:SampleCount"},
            {value: "Maximum", label: "最大值:Maximum"},
            {value: "Minimum", label: "最小值:Minimum"}
        ];
        $scope.options = {
            Namespace: 'acs/ecs',
            MetricName: 'vm.CPUUtilization',
            Period: '5m',
            Statistics: 'Average',
            StartTime: commonService.dateFormat(new Date(new Date().getTime() - 3*24*3600*1000), "yyyy-MM-dd HH:mm"),
            EndTime: commonService.dateFormat(new Date(), "yyyy-MM-dd HH:mm")
        };
        /* 更新标题 */
        $scope.$watch('options.MetricName', function() {
            var MetricName = $scope.options.MetricName;
            for (var i = 0; i < $scope.MetricNameOptions.length; i++) {
                if (MetricName == $scope.MetricNameOptions[i].value) {
                    $scope.title = $scope.MetricNameOptions[i].label.split(":")[0];
                }
            }
        });

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
                    var item = JSON.parse(data[i]);
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
                            var item = JSON.parse(data[i]);
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
                lang: {resetZoom: "重置缩放"},
            });
            $scope.chart = new Highcharts.Chart({
                credits: {enabled: false},
                exporting: {enabled: false},
                chart: {renderTo: $("#chart-container")[0], zoomType: 'x', type: 'line'},
                title: {text: ''},
                xAxis: {
                    type: 'datetime',
                    labels: {style: {color: "#aaa", fontSize: "18px"}, step: 1, formatter: function() {
                            return Highcharts.dateFormat('%H:%M', this.value);
                        }
                    }
                },
                yAxis: {
                    title: {text: ''},
                    gridLineColor: '#eee',
                    labels: {style: {color: '#aaa', fontSize: "18px"}},
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
                    border: 0, borderRadius: 5, backgroundColor: '#eee', itemStyle: {fontSize: "18px"}, itemHoverStyle: {color: '#D00'}, enabled: true
                },
                plotOptions: {
                    series: {lineWidth: 2, states: {hover: {enabled: true, lineWidth: 2}}},
                    area: {lineWidth: 1, marker: {enabled: false, radius: 4}, shadow: false, states: {hover: {lineWidth: 1}}, dataLabels: {enabled: true, color: "#ccc"}},
                    line: {lineWidth: 1, marker: {enabled: false, radius: 4}, dataLabels: {enabled: false, color: "#ccc"}, states: {hover: {lineWidth: 1}}},
                    column: {stacking: 'normal', dataLabels: {enabled: false, color: (Highcharts.theme && Highcharts.theme.dataLabelsColor) || 'white', style: { textShadow: '0 0 2px black, 0 0 2px black'}}}
                }
            });

        });
    });
});