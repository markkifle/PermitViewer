(function (global) {
    var defaultChartTheme = 'default',
    mobileSkin = "",
    app = global.app = global.app || {};
    app.chartsTheme = defaultChartTheme;
    document.addEventListener("orientationchange", app.locationService.viewModel.resizeMap);
   
    document.addEventListener("deviceready", function () {
        navigator.splashscreen.hide();
        StatusBar.overlaysWebView(false); //Turns off web view overlay.
        app.application = new kendo.mobile.Application(document.body, { transition: "slide" });
/*
        //get device info 
        app.cordova = device.cordova;
        app.platform = device.platform;
        app.uuid = device.uuid;
        app.version = device.version;
        app.model = device.model;
       
        console.log(app.cordova);
        console.log(app.platform);
        console.log(app.uuid);
        console.log(app.version);
        console.log(app.model);*/
  
        //hide arrdess entry div	
        //$('#map-search-wrap').hide();  

        app.application.skin(mobileSkin);
        //initialize settings
        app.settingsService.initSettings();
        
    }, false);
    
    app.changeSkin = function () {
        app.application.skin(mobileSkin);
    };
 
    app.emToPx = function (input) {
        var emSize = parseFloat($("body").css("font-size"));
        return (emSize * input);
    }
})(window);