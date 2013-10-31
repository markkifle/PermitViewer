(function (global) {
    var mobileSkin = "",
    app = global.app = global.app || {};
 
    document.addEventListener("deviceready", function () {
        navigator.splashscreen.show();
        app.application = new kendo.mobile.Application(document.body, { layout: "drawer-layout" });
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
})(window);