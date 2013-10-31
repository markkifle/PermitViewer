(function (global) {
    var ChartViewModel,
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

        createBarChart: function() {
            if ((app.settingsService.viewModel.getCheckedPermitForCharts()==="conChart" && conPermitDS) || 
                (app.settingsService.viewModel.getCheckedPermitForCharts()==="occChart" && ocuPermitDS)) {
                $("#barchart").kendoChart({
                    dataSource: conPermitDS, 
                    title: {
                        text: "Construction permits in Ward " + ward,
                        font:"0.79em sans-serif",
                        position: "top",
                    },
                    seriesDefaults: {
                        labels: {
                            visible: true,
                            font: "0.6em sans-serif",
                            background: "transparent",
                            //position: "top",
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
                    legend: {
                        position: "bottom",
                        labels: {
                            font: "0.7em sans-serif",
                        },
                        margin: {
                            bottom:20
                        }
                    },
                    categoryAxis: {
                        //title: {
                        //    text: "Status",
                        //    font: "0.7em  sans-serif",
                        //},
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
                });
            }

            else {
                return;
            }

            var barChart = $("#barchart").data("kendoChart");

            //check which permit is checked for charting
            if (app.settingsService.viewModel.getCheckedPermitForCharts()==="conChart") {
                barChart.options.datasource = conPermitDS;
                barChart.options.title.text = "Construction permits in Ward " + ward;
                barChart.refresh();
            }
            else if (app.settingsService.viewModel.getCheckedPermitForCharts()==="occChart") {
                barChart.options.datasource = ocuPermitDS;
                barChart.options.title.text = "Occupancy permits in Ward " + ward;
                barChart.refresh();
            }
        },
 
        createPieChart: function() {
            if ((app.settingsService.viewModel.getCheckedPermitForCharts()==="conChart" && conPermitDS) ||
                (app.settingsService.viewModel.getCheckedPermitForCharts()==="occChart" && ocuPermitDS)) {
                $("#piechart").kendoChart({
                    dataSource : {
                        data: conPermits
                    },
                    title: {
                        text: "Construction permits in Ward " + ward,
                        font:"0.79em  sans-serif",
                        position: "top",
                    },
                    legend: {
                        visible: true,
                        position:"bottom",
                        labels: {
                            font: "0.7em sans-serif",
                        },
                        margin: {
                            bottom:20
                        }

 
                    },
                    seriesDefaults: {
                        labels: {
                            visible: true,
                            background: "transparent",
                            position: "center",
                            //template: "#= category  #: #= value #",
                            template: "#= value #"
                        },
                    },   
                    series: [
                        { 
                            type: "pie",
                            field :"Count",
                            categoryField: "Status",
                        }
                    ],
                });
            }
            else {
                return;
            }
            var pieChart = $("#piechart").data("kendoChart");
            //check which permit is checked for charting
            if (app.settingsService.viewModel.getCheckedPermitForCharts()==="conChart") {
                pieChart.options.datasource = conPermitDS;
                pieChart.options.title.text = "Construction permits in Ward " + ward;
                pieChart.refresh();
            }
            else if (app.settingsService.viewModel.getCheckedPermitForCharts()==="occChart") {
                pieChart.options.datasource = ocuPermitDS;
                pieChart.options.title.text = "Occupancy permits in Ward " + ward;
                pieChart.refresh();
            }
        },
        
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
                        app.chartService.viewModel.createBarChart();
                    }
                    else if (this.selectedIndex === 1) {
                        $('#barchart').hide();
                        $('#piechart').show();
                        app.chartService.viewModel.createPieChart();
                    }
                },
                index: 0
            });
   
            //initialize charts
            app.chartService.viewModel.createBarChart();
        },
        
        viewModel
        : new ChartViewModel()
    }
}
)(window);