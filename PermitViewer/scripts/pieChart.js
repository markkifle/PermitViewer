(function (global) {
    var pieChart = null,
    permitChart, 
    conPermits = [],
    ocuPermits = [],
    ward,  
    app = global.app = global.app || {};

    app.pieChart = {
        createPieChart: function () {
            app.pieChart.drawPieChart();
            app.pieChart.bindResizeEvent();
        },

        drawPieChart: function () {
            var $pieChart, that;
            
            that = this;

            if (pieChart !== null) {
                pieChart.destroy();
            }
            $pieChart = $("#piechart").empty();
    
            permitChart = app.settingsService.viewModel.getCheckedPermitForCharts();
            conPermits = app.chartService.viewModel.getConPermitForCharts();
            ocuPermits = app.chartService.viewModel.getOcuPermitForCharts();
            ward = app.settingsService.viewModel.getWard();//get ward
            
            if ((permitChart==="conChart" && conPermits != null) ||
                (permitChart==="occChart" && ocuPermits != null)) {
                pieChart = $pieChart.kendoChart({
                    theme: global.app.chartsTheme,
                    renderAs: "svg",
                    legend: {
                        visible: true,
                        position:"bottom",
                        labels: {
                            font: "0.8em sans-serif",
                        },
                        margin: {
                            bottom:35
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
                            font: "0.75em sans-serif",
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
                        format: "{0}",
                        font: "1em sans-serif"

                    }
                }).data("kendoChart");
            }
            if (pieChart)
                that.refreshPieChart();
        },
        
        refreshPieChart: function() {
            permitChart = app.settingsService.viewModel.getCheckedPermitForCharts();
            if (permitChart==="conChart" && conPermits != null) {
                pieChart.setOptions({
                    dataSource:{
                        data:conPermits  
                    }, title: {
                        
                        position: "top",
                        font:"1em sans-serif",
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
                        font:"1em sans-serif",
                        text: "Occupancy Permits in Ward " + ward,
                    }
                });
            }
            pieChart.refresh();
        },
 
        
        bindResizeEvent
        : function () {
            //as the dataviz-s are complex elements they need redrow after window resize 
            //in order to position themselve on the right place and right size
            $(window).on("resize.pieChart", $.proxy(app.pieChart.drawPieChart, app.pieChart));
        },

        unbindResizeEvent
        : function () {
            //unbind the "resize event" to prevent redudntant calculations when the tab is not active
            $(window).off("resize.pieChart");
        }
    };
})(window);