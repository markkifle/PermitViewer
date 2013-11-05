(function (global) {
    var ward,
    bufferSize,
    SettingsViewModel,
    app = global.app = global.app || {};
    
    SettingsViewModel = kendo.data.ObservableObject.extend({
    
        getWard: function () {
            return ward;
        },
         
        getBufferSize: function () {
            return bufferSize;
        },
       
        getApplicationTheme: function() {
            if ($('input[id$="defaultTheme"]').is(':checked')) {
                return "Default"; 
            }
            if ($('input[id$="flatTheme"]').is(':checked')) {
                return "Flat"; 
            }
        },
        
        getCheckedPermitForCharts: function() {
            if ($('input[id$="conChart"]').is(':checked')) {
                return "conChart"; 
            }
            if ($('input[id$="occChart"]').is(':checked')) {
                return "occChart"; 
            }
        },
        
        isConstPermitChecked: function() {
            if ($('input[name$="btnCon"]').is(':checked')) {
                //isConPermitChecked = true;
                return true;
            }
            else {
                //isConPermitChecked = false;
                return false;
            }
        },
        
        isOccupPermitChecked: function() {
            if ($('input[name$="btnOcc"]').is(':checked')) {
                // isOccPermitChecked = true;
                return true;
            }
            else {
                //isOccPermitChecked = false;
                return false;
            }
        },
        
        reloadChart : function(chart) {
            if (chart === "conChart") { 
                app.chartService.viewModel.queryConstPermit();
            }  
            else if (chart === "occChart") {
                app.chartService.viewModel.queryOccupPermit();    
            }
            app.chartService.viewModel.refreshBarChart();
            app.chartService.viewModel.refreshPieChart();   
        }

    });
    
    app.settingsService = {
        initSettings: function () { 
            //initialize Buffer size
            bufferSize = kendo.parseFloat($('#bufferSize').val());  
            
            //wire bufer size change
            $("select#bufferSize").change(function() {
                bufferSize = kendo.parseFloat($("#bufferSize").val());  
            });
 
            //initialize Buffer size
            ward = $('#ward').val();  
         
            //wire ward  change
            $("select#ward").change(function() {
                ward = $("#ward").val();  
                var chart = app.settingsService.viewModel.getCheckedPermitForCharts();
                app.settingsService.viewModel.reloadChart(chart);
                //app.chartService.viewModel.queryConstPermit();
                //app.chartService.viewModel.queryOccupPermit();
                //if (chart === "conChart") { 
                //    app.chartService.viewModel.queryConstPermit();
                //}  
                //else if (chart === "occChart") {
                //    app.chartService.viewModel.queryOccupPermit();    
                //}
                //app.chartService.viewModel.refreshBarChart();
                //app.chartService.viewModel.refreshPieChart();
            });    
            
            //Chart Selector
            $('input:radio[name=chart]').on("click", function() {
                var radioChecked = $('input[name=chart]:radio:checked');
                app.settingsService.viewModel.reloadChart(radioChecked.val());
                console.log(radioChecked.val());
                //if (radioChecked.val() === "conChart") { 
                //    app.chartService.viewModel.queryConstPermit();
                //}  
                //else if (radioChecked.val() === "occChart") {
                //    app.chartService.viewModel.queryOccupPermit();    
                //}
                //app.chartService.viewModel.refreshBarChart();
                //app.chartService.viewModel.refreshPieChart();
            });
            
            //Application Theme selector
            $('input:radio[name=theme]').on("click", function() {
                var radioChecked = $('input[name=theme]:radio:checked');
                app.application.skin(radioChecked.val());
            });
 
            //Chart Theme selector
            $('input:radio[name=charttheme]').on("click", function() {
                var radioChecked = $('input[name=charttheme]:radio:checked');
               app.chartService.viewModel.setChartTheme(radioChecked.val());
                
            });

            //setup queries for the charts
            app.chartService.viewModel.queryConstPermit();
            app.chartService.viewModel.queryOccupPermit();
        },
        
        viewModel
        : new SettingsViewModel()
    }
})(window);