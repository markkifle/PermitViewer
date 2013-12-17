(function (global) {
    var defaultChartTheme = 'default',
    mobileSkin = "",
    app = global.app = global.app || {};
    
    app.chartsTheme = defaultChartTheme;
 
    document.addEventListener("deviceready", function () {
        navigator.splashscreen.hide();
        StatusBar.overlaysWebView(false); //Turns off web view overlay.
     
        app.application = new kendo.mobile.Application(document.body, { transition: "slide", layout: "mobile-tabstrip" });

        //get device info 
        app.model = device.model;
        app.platform = device.platform;
        app.uuid = device.uuid;
        app.version = device.version;

        //console.log(app.model);
        //console.log(app.platform);
     
        //hide arrdess entry div	
        $('#map-search-wrap').hide();  

        app.application.skin(mobileSkin);
        //initialize settings
        app.settingsService.initSettings();
    }, false);
    
    app.changeSkin = function (e) {
        app.application.skin(mobileSkin);
    };
  
    app.openDrawer = function(e)
    {
        console.log('Open Drawer');
    };
    
    app.emToPx = function (input) {
        var emSize = parseFloat($("body").css("font-size"));
        return (emSize * input);
    }
})(window);