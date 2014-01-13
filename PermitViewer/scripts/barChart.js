(function (global) {
    var barChart = null,
    permitChart, 
    conPermitDS,
    ocuPermitDS,
    ward,  
    app = global.app = global.app || {};

    app.barChart = {
        createBarChart: function () {
            app.barChart.drawBarChart();
            app.barChart.bindResizeEvent();
        },

        drawBarChart: function () {
            var $barChart, that;
            
            that = this;
 
            if (barChart !== null) {
                barChart.destroy();
            }
            $barChart = $("#barchart").empty();
    
            permitChart = app.settingsService.viewModel.getCheckedPermitForCharts();
            conPermitDS = app.chartService.viewModel.getConPermitDSForCharts();
            ocuPermitDS = app.chartService.viewModel.getOcuPermitDSForCharts();
            ward = app.settingsService.viewModel.getWard();//get ward
            
            if ((permitChart==="conChart" && conPermitDS != null) ||
                (permitChart==="occChart" && ocuPermitDS != null)) {
                barChart = $barChart.kendoChart({
                    theme: global.app.chartsTheme,
                    renderAs: "svg",
                    seriesDefaults: {
                        labels: {
                            visible: true,
                            font: "0.75em sans-serif",
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
                            font: "0.8em sans-serif",
                        },
                        margin: {
                            bottom:35
                        }
                    },
                    categoryAxis: {
                        labels: {
                            visible: false,
                            font : "0.9em  sans-serif",
                            rotation: 45,
                            format: "MMM"
                        },
                        field:"Date"
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
                        format: "{0}",
                        font: "1em sans-serif"
                    }
                    
                }).data("kendoChart");
                    
                if (barChart)
                    that.refreshBarChart();
            }
        },

        refreshBarChart: function() {
             permitChart = app.settingsService.viewModel.getCheckedPermitForCharts();
            if (permitChart==="conChart" && conPermitDS != null) {
                barChart.setOptions({
                    dataSource: conPermitDS,  
                    title: {
                        position: "top",
                        font:"1em sans-serif",
                        text: "Construction Permits in Ward " + ward
                    }
                });
            }
            else if (permitChart==="occChart" && ocuPermitDS != null) {
                barChart.setOptions({
                    dataSource:ocuPermitDS,
                    title: {
                        position: "top",
                        font:"1em sans-serif",
                        text: "Occupancy Permits in Ward " + ward
                       
                    }
                });
            } 
            barChart.refresh();  
        },

        bindResizeEvent: function () {
            //as the dataviz-s are complex elements they need redrow after window resize 
            //in order to position themselve on the right place and right size
            $(window).on("resize.barChart", $.proxy(app.barChart.drawBarChart, app.barChart));
        },

        unbindResizeEvent: function () {
            //unbind the "resize event" to prevent redudntant calculations when the tab is not active
            $(window).off("resize.barChart");
        }
    };
})(window);