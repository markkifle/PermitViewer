(function (global) {
    var pieChart = null,
    barChart = null,
    ChartViewModel,
    loaderElement,
    conPermits = [],
    ocuPermits = [],
    conPermitDS,
    ocuPermitDS,
    ward,  
    permitChart,
    app = global.app = global.app || {};
    
    ChartViewModel = kendo.data.ObservableObject.extend({
        
        queryConstPermit: function () {
            require([
                "esri/tasks/query","esri/tasks/QueryTask","esri/tasks/StatisticDefinition","dojo/_base/array",
            ], function (Query, QueryTask, StatisticDefinition, array) {
                loaderElement = app.application.pane.loader.element.find("h1");            
                loaderElement.text('Selecting...').addClass("loaderHeading"); 
                ward = app.settingsService.viewModel.getWard();
                app.locationService.viewModel.showLoading();
                
                ward = app.settingsService.viewModel.getWard();//get ward

                var queryTask = new QueryTask(appConfig.opLayer1MSURL);//Construction Permit
                var query = new Query();
                query.returnGeometry = false;
                query.where = "WorkLocationWard = '" + ward + "' AND (Status = 0 OR Status = 1 OR Status = 2 OR Status = 5 OR Status = 9 OR Status = 12)";
                query.outFields = ["StatusDescription"];
                query.groupByFieldsForStatistics = ["StatusDescription"];
                var statisticDefinition = new StatisticDefinition();
                statisticDefinition.statisticType = "count";
                statisticDefinition.onStatisticField = "StatusDescription";
                statisticDefinition.outStatisticFieldName = "Count";
                query.outStatistics = [statisticDefinition];
                
                //execute query
                queryTask.execute(query, function(results) {
                    var features = results.features;
                    conPermits = [];
                    array.map(features, function(item) {
                        if (item) {
                            var conPermit = {};
                            conPermit.Status = item.attributes.StatusDescription;
                            conPermit.Count = item.attributes.Count;
                            conPermit.Date = new Date();
                            conPermits.push(conPermit);
                        }
                    });
                    conPermitDS = new kendo.data.DataSource({
                        data :conPermits,
                        group: {
                            field: "Status"
                        },

                        sort: {
                            field: "Date",
                            dir: "asc"
                        },

                        schema: {
                            model: {
                                fields: {
                                    date: {
                                        type: "Date"
                                    }
                                }
                            }
                        }
                    });
                    app.locationService.viewModel.hideLoading();
                }, function(err) {
                    console.log(err);
                    app.locationService.viewModel.hideLoading();
                });
            }
            );
        },

        queryOccupPermit: function () {
            require([
                "esri/tasks/query","esri/tasks/QueryTask","esri/tasks/StatisticDefinition","dojo/_base/array",
            ], function (Query, QueryTask, StatisticDefinition, array) {
                loaderElement = app.application.pane.loader.element.find("h1");            
                loaderElement.text('Selecting...').addClass("loaderHeading"); 
                ward = app.settingsService.viewModel.getWard();
                app.locationService.viewModel.showLoading();
          
                ward = app.settingsService.viewModel.getWard();//get ward

                var queryTask = new QueryTask(appConfig.opLayer2MSURL);//Construction Permit
                var query = new Query();
                query.returnGeometry = false;
                query.where = "WorkLocationWard = '" + ward + "' AND (Status ='APPROVED' OR Status = 'ISSUED' OR Status = 'PENDING' OR Status = 'PENDING' OR Status = 'PENDINGDOC' OR Status = 'REJECTED' OR Status = 'REVOKED')";
                query.outFields = ["StatusDescription"];
                query.groupByFieldsForStatistics = ["StatusDescription"];
                var statisticDefinition = new StatisticDefinition();
                statisticDefinition.statisticType = "count";
                statisticDefinition.onStatisticField = "StatusDescription";
                statisticDefinition.outStatisticFieldName = "Count";
                query.outStatistics = [statisticDefinition];
                
                //execute query
                queryTask.execute(query, function(results) {
                    var features = results.features;
                    ocuPermits = [],
                    array.map(features, function(item) {
                        if (item) {
                            var ocuPermit = {};
                            ocuPermit.Status = item.attributes.StatusDescription;
                            ocuPermit.Count = item.attributes.Count;
                            ocuPermit.Date = new Date();
                            ocuPermits.push(ocuPermit);
                        }
                    });
                    ocuPermitDS = new kendo.data.DataSource({
                        data :ocuPermits,
                        group: {
                            field: "Status"
                        },

                        sort: {
                            field: "Date",
                            dir: "asc"
                        },

                        schema: {
                            model: {
                                fields: {
                                    date: {
                                        type: "Date"
                                    }
                                }
                            }
                        }
                    });
                  
                    app.locationService.viewModel.hideLoading();
                }, function(err) {
                    console.log(err);
                    app.locationService.viewModel.hideLoading();
                });
            }
            );
        },
        
        createPieChart: function () {
            var that = this;
            that.drawPieChart();
           // that.bindPieResizeEvent();
        },
        
        drawPieChart: function () {
            var that = this;
            var $pieChart;

            if (pieChart !== null) {
                pieChart.destroy();
            }
            $pieChart = $("#piechart").empty();
    
            permitChart = app.settingsService.viewModel.getCheckedPermitForCharts();
            
            if ((permitChart==="conChart" && conPermits != null) ||
                (permitChart==="occChart" && ocuPermits != null)) {
                pieChart = $pieChart.kendoChart({
                    theme: global.app.chartsTheme,
                    renderAs: "svg",
                    legend: {
                        visible: true,
                        position:"bottom",
                        labels: {
                            font: "0.7em sans-serif",
                        },
                        margin: {
                            bottom:30
                        },
                    },
                    chartArea: {
                        // background: "",
                        width: $(window).width(),
                        margin: app.emToPx(0.5)
                    },
                    seriesDefaults: {
                        labels: {
                            visible: true,
                            font: "0.58em sans-serif",
                            color: "rgb(255, 255, 255)",
                            background: "transparent",
                            position: "center",
                            template: "#= value #"
                        },
                    },    
                    series: [
                        {
                            type: "pie",
                            startAngle: 150,  
                            field :"Count",
                            categoryField: "Status",
                        }
                    ],
                    tooltip: {
                        visible: true,
                        format: "{0}"
                    }
                }).data("kendoChart");
                    
                if (pieChart)
                    that.refreshPieChart();
            }
        },
        
        refreshPieChart: function() {
            permitChart = app.settingsService.viewModel.getCheckedPermitForCharts();
            if (permitChart==="conChart" && conPermits != null) {
                pieChart.setOptions({
                    dataSource:{
                        data:conPermits  
                    }, title: {
                        
                        position: "top",
                        font:"0.79em sans-serif",
                        text: "Construction Permits in Ward " + ward
                    }
                        
                });
            }
            else if (permitChart==="occChart" && ocuPermits != null) {
                pieChart.setOptions({
                    dataSource:{
                        data:ocuPermits  
                    }, title: {
                        position: "top",
                        font:"0.79em sans-serif",
                        text: "Occupancy Permits in Ward " + ward,
                    }
                });
            }
            pieChart.refresh();
        },
        
        bindPieResizeEvent: function () {
            var that = this;           
            //as the dataviz-s are complex elements they need redrow after window resize 
            //in order to position themselve on the right place and right size
            $(window).on("resize.pieChart", $.proxy(that.drawPieChart, app.chartService));
        },

        createBarChart: function () {
            var that = this;
            that.drawBarChart();
          //  that.bindBarResizeEvent();
        },
    
        drawBarChart: function () {
            var that = this;
            var $barChart;

            if (barChart !== null) {
                barChart.destroy();
            }
            $barChart = $("#barchart").empty();
            
            permitChart = app.settingsService.viewModel.getCheckedPermitForCharts();
 
            if ((permitChart==="conChart" && conPermitDS != null) || 
                (permitChart==="occChart" && ocuPermitDS != null)) {
                barChart = $barChart.kendoChart({
                    theme: global.app.chartsTheme,
                    renderAs: "svg",
                    seriesDefaults: {
                        labels: {
                            visible: true,
                            font: "0.6em sans-serif",
                            background: "transparent",
                            template: "#= value #"
                        },
                    },
                    series: [
                        {
                            type: "column",
                            field :"Count",
                            categoryField: "Status",
                            name: "#= group.value #"
                        },
                    ],
                    chartArea: {
                        //background: "",
                        width: $(window).width(),
                        margin: app.emToPx(0.5)
                    },
                    legend: {
                        visible: true,
                        position: "bottom",
                        labels: {
                            font: "0.7em sans-serif",
                        },
                        margin: {
                            bottom:30
                        }
                    },
                    categoryAxis: {
                        labels: {
                            visible: false,
                            font : "0.7em  sans-serif",
                            rotation: 45
                        },
                        field:"Date",
                        labels : {
                            visible:  false,
                            format: "MMM"
                        }
                    },
                    valueAxis: [
                        {
                            title: {
                                text: "Count",
                                font: "0.7em  sans-serif",
                            },
                            labels: {
                                font: "0.7em  sans-serif",
                                skip: 2,
                                step: 2
                            }
                        }
                    ],
                    tooltip: {
                        visible: true,
                        format: "{0}"
                    }
                    
                }).data("kendoChart");
                    
                if (barChart)
                    that.refreshBarChart();
            }
        },
        
        refreshBarChart: function() {
            if (permitChart==="conChart" && conPermitDS != null) {
                barChart.setOptions({
                    dataSource: conPermitDS,  
                    title: {
                        position: "top",
                        font:"0.79em sans-serif",
                        text: "Construction Permits in Ward " + ward
                    }
                });
            }
            else if (permitChart==="occChart" && ocuPermitDS != null) {
                barChart.setOptions({
                    dataSource:ocuPermitDS,
                    title: {
                        position: "top",
                        font:"0.79em sans-serif",
                        text: "Occupancy Permits in Ward " + ward
                       
                    }
                });
            } 
            barChart.refresh();  
        },

        bindBarResizeEvent : function () {
            var that = this;         
            //as the dataviz-s are complex elements they need redrow after window resize 
            //in order to position themselve on the right place and right size
            $(window).on("resize.barChart", $.proxy(that.drawBarChart, app.chartService));
        },

        unbindResizeEvent: function () {
            //unbind the "resize event" to prevent redudntant calculations when the tab is not active
            $(window).off("resize.pieChart");
            $(window).off("resize.barChart");
        },
        
        setChartTheme : function(theme) {
            global.app.chartsTheme = theme;
        }

    });
    
    app.chartService = {
        initChart: function () { 
            loaderElement = app.application.pane.loader.element.find("h1");            
            //wire chart selection
            $("#select-chart").kendoMobileButtonGroup({
                select: function() {
                    if (this.selectedIndex === 0) {
                        app.chartService.viewModel.createBarChart();
                        $('#barchart').show();
                        $('#piechart').hide();
                    }
                    else if (this.selectedIndex === 1) {
                        app.chartService.viewModel.createPieChart();
                        $('#barchart').hide();
                        $('#piechart').show();
                    }
                },
                index: 0
            });
            //Initialize chart
            app.chartService.viewModel.createBarChart();
            app.chartService.viewModel.createPieChart();
        },
        
        viewModel
        : new ChartViewModel()
    }
}
)(window);