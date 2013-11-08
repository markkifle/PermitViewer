(function (global) {
    var pieChart = null,
        app = global.app = global.app || {};


    app.pieChart = {
        createPieChart: function () {
            app.pieChart.drawPieChart();
            app.pieChart.bindResizeEvent();
        },

        drawPieChart: function () {
            var $pieChart;

            if (pieChart !== null) {
                pieChart.destroy();
            }
            $pieChart = $("#piechart").empty();
    
            permitChart = app.settingsService.viewModel.getCheckedPermitForCharts();
            
            //if ((permitChart==="conChart" && conPermits != null) ||
            //    (permitChart==="occChart" && ocuPermits != null)) {
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
                    
            //if (pieChart)
            //    that.refreshPieChart();
            //}
        },

        bindResizeEvent: function () {
            //as the dataviz-s are complex elements they need redrow after window resize 
            //in order to position themselve on the right place and right size
            $(window).on("resize.pieChart", $.proxy(app.pieChart.drawPieChart, app.pieChart));
        },

        unbindResizeEvent: function () {
            //unbind the "resize event" to prevent redudntant calculations when the tab is not active
            $(window).off("resize.pieChart");
        }
    };
})(window);