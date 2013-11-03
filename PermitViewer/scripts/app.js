(function (global) {
    var defaultChartTheme = 'silver',
    mobileSkin = "",
    app = global.app = global.app || {};
    
    app.chartsTheme = defaultChartTheme;
 
    document.addEventListener("deviceready", function () {
        var os = kendo.support.mobileOS;
        var statusBarStyle = os.ios && os.flatVersion >= 700 ? "black-translucent" : "black";
      
        navigator.splashscreen.hide();
        app.application = new kendo.mobile.Application(document.body, { transition: "slide", layout: "mobile-tabstrip", statusBarStyle : statusBarStyle });
        //app.application = new kendo.mobile.Application(document.body, { layout: "drawer-layout" });
        //hide arrdess entry div
        $('#map-address').hide();  

        app.application.skin(mobileSkin);
        //initialize settings
        app.settingsService.initSettings();
    }, false);
    
    app.changeSkin = function (e) {
        //if (e.sender.element.text() === "Flat") {
        //    e.sender.element.text("Native");
        //    mobileSkin = "flat";
        //}
        //else {
        //    e.sender.element.text("Flat");
        //    mobileSkin = "";
        //}
        app.application.skin(mobileSkin);
    };
  
    app.emToPx = function (input) {
        var emSize = parseFloat($("body").css("font-size"));
        return (emSize * input);
    }
})(window);