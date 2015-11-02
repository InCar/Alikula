define(['../Alikula', 'jquery'], function(module, $) {
    module.controller("MonitorCtrl", function($scope, $http, $location, $timeout, commonService) {
        $scope.NamespaceOptions = [
            {key: "acs/ecs", value: "云服务:acs/ecs"}
            //"acs/ocs": "开放缓存服务:acs/ocs",
            //"acs/rds": "云数据库:acs/rds",
            //"acs/slb": "负载均衡:acs/slb"
        ];
        $scope.MetricNameOptions = [
            {key: "vm.CPUUtilization", value: "CPU使用率(%):vm.CPUUtilization"},
            {key: "vm.MemoryUtilization", value: "内存使用率(%):vm.MemoryUtilization"},
            {key: "vm.DiskIORead", value: "磁盘IO读(KB/s):vm.DiskIORead"},
            {key: "vm.DiskIOWrite", value: "磁盘IO写(KB/s):vm.DiskIOWrite"},
            {key: "vm.InternetNetworkRX", value: "网络上行(入)流量(Kb/s):vm.InternetNetworkRX"},
            {key: "vm.InternetNetworkTX", value: "网络下行(出)流量(Kb/s):vm.InternetNetworkTX"}
        ];
        $scope.PeriodOptions = [
            {key: "5m", value: "5分钟"},
            {key: "15m", value: "15分钟"},
            {key: "30m", value: "30分钟"},
            {key: "1h", value: "1小时"},
            {key: "1d", value: "1天"}
        ];
        $scope.StatisticsOptions = [
            {key: "Average", value: "平均值:Average"},
            {key: "Sum", value: "合计值:Sum"},
            {key: "SampleCount", value: "采样值:SampleCount"},
            {key: "Maximum", value: "最大值:Maximum"},
            {key: "Minimum", value: "最小值:Minimum"}
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
                if (MetricName == $scope.MetricNameOptions[i].key) {
                    $scope.title = $scope.MetricNameOptions[i].value.split(":")[0];
                }
            }
        });

        $scope.drawChart = function() {
            $(".modal").modal('hide');
            $http.get('/api/alicms', {params: $scope.options}).success(function(json) {
                console.log(json)
                var data = json.Datapoints.Datapoint;
                var converted = [];
                for (var i = 0; i < data.length; i++) {
                    var item = JSON.parse(data[i]);
                    converted.push([new Date(item.timestamp).getTime() + 8*3600, Number(item[$scope.options.Statistics])]);
                }
                if ($scope.chart.series.length) {
                    $scope.chart.series[0].remove();
                }
                $scope.chart.addSeries({name: $scope.title, data: converted});
            }).error(function(msg, code) {
                alert(msg);
                $log.error(msg, code);
            });
        };

        $timeout(function() {
            $("input.form-control.datetimepicker").after("<span style='position: absolute; top: 12px; right: 25px;' class='glyphicon glyphicon-calendar'></span>");

            $(document).on("focus click", "input.datetimepicker", function(e) {
                $(this).datetimepicker({startView: "day", minView: "hour", maxView: "month", format: "yyyy-mm-dd hh:ii", language: "zh-CN", autoclose: true});
            });

            $(document).on("blur", "input.datetimepicker", function(e) {
                $(this).datetimepicker('hide');
            });

            Highcharts.setOptions({
                global: {useUTC: false},
                lang: {resetZoom: "重置缩放"},
                colors: ['#4AD1E8', '#00CC00', '#FFBB33', '#DC0000', '#24CBE5', '#64E572', '#FF9655', '#FFF263', '#6AF9C4']
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
                    border: 0, borderRadius: 5, backgroundColor: '#eee', itemHoverStyle: {color: '#D00'}, enabled: true
                },
                plotOptions: {
                    area: {lineWidth: 1, marker: {enabled: false, radius: 4}, shadow: false, states: {hover: {lineWidth: 1}}, dataLabels: {enabled: true, color: "#ccc"}},
                    line: {lineWidth: 1, marker: {enabled: false, radius: 4}, dataLabels: {enabled: false, color: "#ccc"}, states: {hover: {lineWidth: 1}}},
                    column: {stacking: 'normal', dataLabels: {enabled: false, color: (Highcharts.theme && Highcharts.theme.dataLabelsColor) || 'white', style: { textShadow: '0 0 2px black, 0 0 2px black'}}}
                }
            });

        });
    });
});