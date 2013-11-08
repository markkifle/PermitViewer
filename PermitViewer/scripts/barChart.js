(function (global) {
    var barChart = null,
        app = global.app = global.app || {};


    app.barChart = {
        createPieChart: function () {
            app.barChart.drawBarChart();
            app.barChart.bindResizeEvent();
        },

        drawBarChart: function () {
            var $barChart;

            if (barChart !== null) {
                barChart.destroy();
            }
            $barChart = $("#barchart").empty();
    
            permitChart = app.settingsService.viewModel.getCheckedPermitForCharts();
            
            //if ((permitChart==="conChart" && conPermits != null) ||
            //    (permitChart==="occChart" && ocuPermits != null)) {
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