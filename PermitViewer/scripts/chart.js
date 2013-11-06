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
            that.bindPieResizeEvent();
        },
  
        drawPieChart: function () {
            var $pieChart;

            if (pieChart !== null) {
                pieChart.destroy();
            }

            $pieChart = $("#piechart").empty();
           
            if ((app.settingsService.viewModel.getCheckedPermitForCharts()==="conChart" && conPermitDS) ||
                (app.settingsService.viewModel.getCheckedPermitForCharts()==="occChart" && ocuPermitDS)) {
                pieChart = $pieChart.kendoChart({
                    theme: global.app.chartsTheme,
                    renderAs: "svg",
                    dataSource:{
                        data:conPermits  
                    },                 
                    title: {
                        position: "top",
                        font:"0.79em sans-serif",
                        text: "Construction Permits in Ward " + ward,
                    },
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
            }
        },
        
        refreshPieChart: function() {
            if (app.settingsService.viewModel.getCheckedPermitForCharts()==="conChart") {
                pieChart.setOptions({
                    dataSource:{
                        data:conPermits  
                    }
                });
                pieChart.options.title.text = "Construction Permits in Ward " + ward;
                pieChart.refresh();
            }
            else if (app.settingsService.viewModel.getCheckedPermitForCharts()==="occChart") {
                pieChart.setOptions({
                    dataSource:{
                        data:ocuPermits  
                    }
                });
                pieChart.options.title.text = "Occupancy Permits in Ward " + ward;
                pieChart.refresh();
            }
        },
        
        bindPieResizeEvent: function () {
            var that = this;           
            //as the dataviz-s are complex elements they need redrow after window resize 
            //in order to position themselve on the right place and right size
            $(window).on("resize.pieChart", $.proxy(that.drawPieChart, app.pieChart));
        },

        createBarChart: function () {
            var that = this;
            that.drawBarChart();
            that.bindBarResizeEvent();
        },
    
        drawBarChart: function () {
            var $barChart;

            if (barChart !== null) {
                barChart.destroy();
            }
            $barChart = $("#barchart").empty();
            if ((app.settingsService.viewModel.getCheckedPermitForCharts()==="conChart" && conPermitDS) || 
                (app.settingsService.viewModel.getCheckedPermitForCharts()==="occChart" && ocuPermitDS)) {
                barChart = $barChart.kendoChart({
                    theme: global.app.chartsTheme,
                    renderAs: "svg",
                    dataSource: conPermitDS, 
                    title: {
                        position: "top",
                        font:"0.79em sans-serif",
                        text: "Construction Permits in Ward " + ward,
                       
                    },
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
            }
        },
        
        refreshBarChart: function() {
            if (app.settingsService.viewModel.getCheckedPermitForCharts()==="conChart") {
                barChart.setDataSource(conPermitDS);
                barChart.options.title.text = "Construction Permits in Ward " + ward;
                barChart.refresh();
            }
            else if (app.settingsService.viewModel.getCheckedPermitForCharts()==="occChart") {
                barChart.setDataSource(ocuPermitDS);
                barChart.options.title.text = "Occupancy Permits in Ward " + ward;
                barChart.refresh();
            }
        },

        bindBarResizeEvent : function () {
            var that = this;         
            //as the dataviz-s are complex elements they need redrow after window resize 
            //in order to position themselve on the right place and right size
            $(window).on("resize.barChart", $.proxy(that.drawBarChart, app.barChart));
        },

        unbindResizeEvent: function () {
            //unbind the "resize event" to prevent redudntant calculations when the tab is not active
            $(window).off("resize.pieChart");
            $(window).off("resize.barChart");
        },
        
        setChartTheme : function(theme) {
            var that = this;
            global.app.chartsTheme = theme;
            that.createPieChart();
            that.createBarChart();
         }

    });
    
    app.chartService = {
        initChart: function () { 
            loaderElement = app.application.pane.loader.element.find("h1");            
            //wire chart selection
            $("#select-chart").kendoMobileButtonGroup({
                select: function() {
                    if (this.selectedIndex === 0) {
                        $('#barchart').show();
                        $('#piechart').hide();
                    }
                    else if (this.selectedIndex === 1) {
                        $('#barchart').hide();
                        $('#piechart').show();
                     }
                },
                index: 0
            });
   
            //initialize charts
            app.chartService.viewModel.createBarChart();
            app.chartService.viewModel.createPieChart();
        },
        
        viewModel
        : new ChartViewModel()
    }
}
)(window);