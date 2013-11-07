(function (global) {
    var defaultChartTheme = 'default',
    mobileSkin = "",
    app = global.app = global.app || {};
    
    app.chartsTheme = defaultChartTheme;
 
    document.addEventListener("deviceready", function () {
        var os = kendo.support.mobileOS;
        var statusBarStyle = os.ios && os.flatVersion >= 700 ? "black-translucent" : "black";
      
        navigator.splashscreen.hide();
        app.application = new kendo.mobile.Application(document.body, { transition: "slide", layout: "mobile-tabstrip", statusBarStyle : statusBarStyle });

        //get device info 
        app.model = device.model;
        app.platform = device.platform;

        app.uuid = device.uuid;
        app.version = device.version;

        console.log(app.model);
        console.log(app.platform);
     
        //hide arrdess entry div	
        $('#map-address').hide();  

        app.application.skin(mobileSkin);
        //initialize settings
        app.settingsService.initSettings();
    }, false);
    
    app.changeSkin = function (e) {
        app.application.skin(mobileSkin);
    };
  
    app.emToPx = function (input) {
        var emSize = parseFloat($("body").css("font-size"));
        return (emSize * input);
    }
})(window);