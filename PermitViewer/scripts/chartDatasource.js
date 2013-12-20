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
                    //console.log(err);
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
                    //console.log(err);
                    app.locationService.viewModel.hideLoading();
                });
            }
            );
        },
        
        getConPermitDSForCharts : function () {
            return  conPermitDS;
        },
        
        getOcuPermitDSForCharts : function () {
            return ocuPermitDS;
        },

        getConPermitForCharts : function () {
             return  conPermits;
        },
        
        getOcuPermitForCharts : function () {
             return ocuPermits;
        },

    });
    
    app.chartService = {
        initChart: function () { 
            loaderElement = app.application.pane.loader.element.find("h1");            
            //Initialize chart
            app.chartService.viewModel.createBarChart();
            app.chartService.viewModel.createPieChart();
        },
        
        viewModel
        : new ChartViewModel()
    }
}
)(window);