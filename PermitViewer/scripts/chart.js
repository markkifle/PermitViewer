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
        /*    createPieChart: function() {
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
        },
        */
        
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
                    //theme: global.app.chartsTheme,
                    renderAs: "svg",
                    dataSource: conPermitDS,                  
                    title: {
                        position: "top",
                        font:"0.79em sans-serif",
                        text: "Construction permits in Ward " + ward,
                    },
                    legend: {
                        visible: true,
                        position:"bottom",
                        labels: {
                            font: "0.7em sans-serif",
                        },
                        margin: {
                            bottom:20
                        },
                    },
                    /* chartArea: {
                    background: "",
                    width: $(window).width(),
                    margin: app.emToPx(1)
                    },*/
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
                    tooltip: {
                        visible: true,
                        format: "{0}"
                    }
                }).data("kendoChart");
            }
            else {
                return
            }
            //check which permit is checked for charting
            var piechart = $pieChart.data("kendoChart");
            if (app.settingsService.viewModel.getCheckedPermitForCharts()==="conChart") {
                piechart.options.datasource = conPermitDS;
                piechart.options.title.text = "Construction permits in Ward " + ward;
                piechart.refresh();
            }
            else if (app.settingsService.viewModel.getCheckedPermitForCharts()==="occChart") {
                piechart.options.datasource = ocuPermitDS;
                piechart.options.title.text = "Occupancy permits in Ward " + ward;
                piechart.refresh();
            }
        },

        bindPieResizeEvent: function () {
            var that = this;           
            //as the dataviz-s are complex elements they need redrow after window resize 
            //in order to position themselve on the right place and right size
            $(window).on("resize.pieChart", $.proxy(that.drawPieChart, app.pieChart));
        },

        unbindPieResizeEvent: function () {
            //unbind the "resize event" to prevent redudntant calculations when the tab is not active
            $(window).off("resize.pieChart");
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
                $barChart.kendoChart({
                    //theme: global.app.chartsTheme,
                    renderAs: "svg",
                    dataSource: conPermitDS,   
                    title: {
                        position: "top",
                        font:"0.79em sans-serif",
                        text: "Construction permits in Ward " + ward,
                       
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
                    /*  chartArea: {
                    background: "",
                    width: $(window).width(),
                    margin: app.emToPx(1)
                    },*/
                    legend: {
                        visible: true,
                        position: "bottom",
                        labels: {
                            font: "0.7em sans-serif",
                        },
                        margin: {
                            bottom:20
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
                    ]
                });
            }
            else {
                return;
            }
            
            //check which permit is checked for charting
            var barchart = $barChart.data("kendoChart");
            if (app.settingsService.viewModel.getCheckedPermitForCharts()==="conChart") {
                barchart.options.datasource = conPermitDS;
                barchart.options.title.text = "Construction permits in Ward " + ward;
                barchart.refresh();
            }
            else if (app.settingsService.viewModel.getCheckedPermitForCharts()==="occChart") {
                barchart.options.datasource = ocuPermitDS;
                barchart.options.title.text = "Occupancy permits in Ward " + ward;
                barchart.refresh();
            }
        },

        bindBarResizeEvent : function () {
            var that = this;         
            //as the dataviz-s are complex elements they need redrow after window resize 
            //in order to position themselve on the right place and right size
            $(window).on("resize.barChart", $.proxy(that.drawBarChart, app.barChart));
        },

        unbindBarResizeEvent : function () {
            //unbind the "resize event" to prevent redudntant calculations when the tab is not active
            $(window).off("resize.barChart");
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