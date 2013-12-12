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
            if ($('input[id$="defaultAppTheme"]').is(':checked')) {
                return "Default"; 
            }
            else if ($('input[id$="flatAppTheme"]').is(':checked')) {
                return "Flat"; 
            }
        },
        
        getCheckedPermitForCharts: function() {
            if ($('input[id$="conChart"]').is(':checked')) {
                return "conChart"; 
            }
            else if ($('input[id$="occChart"]').is(':checked')) {
                return "occChart"; 
            }
        },
        
        isConstPermitChecked: function() {
            if ($('input[name$="btnCon"]').is(':checked')) {
                return true;
            }
            else {
                return false;
            }
        },
        
        isOccupPermitChecked: function() {
            if ($('input[name$="btnOcc"]').is(':checked')) {
                return true;
            }
            else {
                return false;
            }
        },
        
        setChartTheme : function(theme) {
            global.app.chartsTheme = theme;
        },

        
        reloadChart : function() {
            //requery data
            app.chartService.viewModel.queryConstPermit();
            app.chartService.viewModel.queryOccupPermit();  
            //create charts
            app.barChart.createBarChart();
            app.pieChart.createPieChart();
            //app.chartService.viewModel.createBarChart();
            //app.chartService.viewModel.createPieChart();   
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
 
            //initialize ward
            ward = $('#ward').val();  
         
            //wire ward  change
            $("select#ward").change(function() {
                ward = $("#ward").val(); 
                app.settingsService.viewModel.reloadChart();
            });    
            
            //Chart Selector
            $('input:radio[name=chart]').on("click", function() {
                //app.chartService.viewModel.refreshPieChart();
                //app.chartService.viewModel.refreshBarChart();
            });
            
            //Application Theme selector
            $('input:radio[name=apptheme]').on("click", function() {
                var checkedAppTheme = $('input[name=apptheme]:radio:checked');
                app.application.skin(checkedAppTheme.val());
            });
 
            //Chart Theme selector
            $('input:radio[name=charttheme]').on("click", function() {
                var checkedChartTheme = $('input[name=charttheme]:radio:checked');
                app.settingsService.viewModel.setChartTheme(checkedChartTheme.val());
            });

            //setup queries for the charts
            app.chartService.viewModel.queryConstPermit();
            app.chartService.viewModel.queryOccupPermit();
        },
        
        viewModel
        : new SettingsViewModel()
    }
})(window);