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
                app.chartService.viewModel.queryConstPermit();
                app.chartService.viewModel.queryOccupPermit();
                app.chartService.viewModel.createBarChart();
                app.chartService.viewModel.createPieChart();
            });           
            
            $('input:radio[name=theme]').on("click", function() {
                var radioChecked = $('input[name=theme]:radio:checked');
                app.application.skin(radioChecked.val());
            });
            
            ////wire on effectivedate change
            //$("#effectivedate").change(function() {
            //    var d = $("#effectivedate").val();
            //    var y = d.split('-');
            //    var selectedDate = new Date(y[0], y[1] - 1, y[2]);
            //    var today = new Date();
            //    today.setDate(today.getDate() - 45);
            //    var back45Date = today;
            //    var todaysDate = new Date();
            //    //get UTC Dates
            //    var todaysDateUTC = Date.UTC(todaysDate.getUTCFullYear(), todaysDate.getUTCMonth(), todaysDate.getUTCDate(), 0, 0, 0, 0);
            //    var selectedDateUTC = Date.UTC(selectedDate.getUTCFullYear(), selectedDate.getUTCMonth(), selectedDate.getUTCDate(), 0, 0, 0, 0);
            //    var fback45DateUTC = Date.UTC(back45Date.getUTCFullYear(), back45Date.getUTCMonth(), back45Date.getUTCDate(), 0, 0, 0, 0);
            
            //    //check selected date is more than 45 days ago
            //    if (selectedDateUTC < fback45DateUTC) {
            //        navigator.notification.alert('Effective date cannot be more than 45 days ago.', null, 'Error', 'Ok');
            //        today = new Date();
            //        today.setDate(today.getDate() - 7);
            //        $("#effectivedate").val(today.toISOString().slice(0, 10));
            //    }
            //    else if (selectedDateUTC > todaysDateUTC) {
            //        navigator.notification.alert('Effective date cannot be a date in future.', null, 'Error', 'Ok');
            //        today = new Date();
            //        today.setDate(today.getDate() - 7);
            //        $("#effectivedate").val(today.toISOString().slice(0, 10));
            //    }
            //    else {
            //        effectiveDate = selectedDate;
            //        //setup queries for the charts
            //        app.chartService.viewModel.queryConstPermit();
            //        app.chartService.viewModel.queryOccupPermit();
            //    }
            //});
    
            //setup queries for the charts
            app.chartService.viewModel.queryConstPermit();
            app.chartService.viewModel.queryOccupPermit();
        },
        
        viewModel
        : new SettingsViewModel()
    }
})(window);