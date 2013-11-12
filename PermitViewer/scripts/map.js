(function (global) {
    var map,
    homeButton,
    ds,
    geoLocate,
    loaderElement,
    basemapToggle,
    LocationViewModel,
    addressViewModel,
    popup,
    mapGraphicsLayer,
    constPermitLayer,
    occupPermitLayer, 
    conPermitDetail = "<table>" + "<tr><td class='txtLabel'>Address</td><td class='txtDetail'>${WorkLocationFullAddress}</td></tr>" + "<tr><td class='txtLabel'>Tracking Number</td><td class='txtDetail'>${TrackingNumber}</td></tr>" + "<tr><td class='txtLabel'>Permit Number</td><td class='txtDetail'>${PermitNumber}</td></tr>" + "<tr><td class='txtLabel'>Intake Date</td><td class='txtDetail'>${IntakeDate:DateFormat}</td></tr>" + "<tr><td class='txtLabel'>Application Date</td><td class='txtDetail'>${ApplicationDate:DateFormat}</td></tr>" + "<tr><td class='txtLabel'>Effective Date</td><td class='txtDetail'>${EffectiveDate:DateFormat}</td></tr>" + "<tr><td class='txtLabel'>Expiration Date</td><td class='txtDetail'>${ExpirationDate:DateFormat}</td></tr>" + "<tr><td class='txtLabel'>Issue Date</td><td class='txtDetail'>${IssueDate:DateFormat}</td></tr>" + "<tr><td class='txtLabel'>Status</td><td class='txtDetail'>${StatusDescription}</td></tr>" + "<tr><td class='txtLabel'>Permit Type</td><td class='txtDetail'>${PermitTypeDescription}</td></tr>" + "<tr><td class='txtLabel'>Work Detail</td><td class='txtDetail' style='text-align:justify'>${WorkDetail}</td></tr>" + "<tr><td class='txtLabel'>Contractor Name</td><td class='txtDetail'>${ContrctorName}</td></tr>" + "<tr><td class='txtLabel'>Owner Name</td><td class='txtDetail'>${OwnerName}</td></tr>" + "<tr><td class='txtLabel'>Permittee Name</td><td class='txtDetail'>${PermitteeName}</td></tr>" + "</table>",
    occPermitDetail = "<table>" + "<tr><td class='txtLabel'>Address</td><td class='txtDetail'>${WorkLocationFullAddress}</td></tr>" + "<tr><td class='txtLabel'>Tracking Number</td><td class='txtDetail'>${TrackingNumber}</td></tr>" + "<tr><td class='txtLabel'>Permit Number</td><td class='txtDetail'>${PermitNumber}</td></tr>" + "<tr><td class='txtLabel'>Application Date</td><td class='txtDetail'>${ApplicationDate:DateFormat}</td></tr>" + "<tr><td class='txtLabel'>Effective Date</td><td class='txtDetail'>${EffectiveDate:DateFormat}</td></tr>" + "<tr><td class='txtLabel'>Expiration Date</td><td class='txtDetail'>${ExpirationDate:DateFormat}</td></tr>" + "<tr><td class='txtLabel'>Issue Date</td><td class='txtDetail'>${IssueDate:DateFormat}</td></tr>" + "<tr><td class='txtLabel'>Status</td><td class='txtDetail'>${StatusDescription}</td></tr>" + "<tr><td class='txtLabel'>Event</td><td class='txtDetail' style='text-align:justify'>${EventTypeDescription}</td></tr>" + "<tr><td class='txtLabel'>Owner Name</td><td class='txtDetail'>${OwnerName}</td></tr>" + "<tr><td class='txtLabel'>Permittee Name</td><td class='txtDetail'>${PermitteeName}</td></tr>" + "</table>",
    supportsOrientationChange = "onorientationchange" in window,
    orientationEvent = supportsOrientationChange ? "orientationchange" : "resize",
    app = global.app = global.app || {};
    
    LocationViewModel = kendo.data.ObservableObject.extend({
        
        isLoading: true,
        watchID : null,
         
        onNavigateHome: function () {
            var that = this,
            position;

            that.isLoading = true;
            that.showLoading();
            
            navigator.geolocation.getCurrentPosition(
                function (location) {
                    require(["esri/geometry/webMercatorUtils", "esri/geometry/Point"], function(webMercatorUtils, Point) {
                        position = webMercatorUtils.geographicToWebMercator(new Point(location.coords.longitude, location.coords.latitude));
                    });
                    curLoc = true;
                    that.addGraphic(position, true);
                    that.isLoading = false;
                    that.hideLoading();
                },
                function (error) {
                    //default map coordinates    
                    require(["esri/geometry/webMercatorUtils", "esri/geometry/Point", "esri/SpatialReference"], function(webMercatorUtils, Point, SpatialReference) {
                        position = webMercatorUtils.geographicToWebMercator(new Point(-77.032, 38.906, new esri.SpatialReference({ wkid: 4326 })));
                    });
                    map.centerAndZoom(position, 16);
                    that.isLoading = false;
                    that.hideLoading();

                    navigator.notification.alert("Unable to determine current location. Cannot connect to GPS satellite.",
                                                 function () {
                                                 }, "Location failed", 'OK');
                },
                {
                timeout: 30000,
                enableHighAccuracy: true
            });
        },

        showLoading: function () {
            if (this.isLoading) {
                if (app.application) {
                    app.application.showLoading();
                }
            }
        },

        hideLoading: function () {
            app.application.hideLoading();
            loaderElement.removeClass("loaderHeading").text("Loading...");
        },
        
        onToggleGeocoder: function() {
            $("#map-address").toggle();
            $("#infoTap").hide();
        },
        
        onClearGraphics: function() {
            mapGraphicsLayer.clear();
            map.infoWindow.hide();
            constPermitLayer.clearSelection();
            occupPermitLayer.clearSelection();
        },
        
        addGraphic: function(pt, isCusLoc) {
            require([
                "esri/graphic", "esri/symbols/SimpleMarkerSymbol", "esri/symbols/SimpleLineSymbol", "esri/symbols/PictureMarkerSymbol",
                "dojo/_base/Color"
            ], function (Graphic, SimpleMarkerSymbol, SimpleLineSymbol, PictureMarkerSymbol, Color) {
                var symbol;
                if (isCusLoc) {
                    symbol = new PictureMarkerSymbol("styles/images/bluedot.png", 40, 40);
                }
                else {
                    symbol = new PictureMarkerSymbol("styles/images/redPushpin.png", 25, 25);
                    //  symbol = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_CIRCLE, 12, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([210, 105, 30, 0.5]), 8), new Color([210, 105, 30, 0.9]));
                }
                var graphic = new Graphic(pt, symbol);
                mapGraphicsLayer.add(graphic);
                map.centerAndZoom(pt, 16);
                // console.log(pt);
                // console.log(map.spatialReference);
            });
        },
        
        onLocate: function() {
            var that = this;
            
            require(["dojo/dom"], function (dom) {
                if (dom.byId("address").value === "") {
                    navigator.notification.alert('Enter a valid address!', null, 'Error', 'Ok');
                }
                else {
                    that.marGeolocate(dom.byId("address").value);
                }
            });
        },     
 
        marGeolocate: function (searchText) {
            var that = this;
            loaderElement.text('Searching...').addClass("loaderHeading");  
            that.showLoading();
            
            var url = appConfig.marURL + "findLocation?str=" + searchText + "&callback=?";
            var hasReturnValue = false;
            var recordCount = 0;
            var add = '';
            var lat = 0.0;
            var lon = 0.0;
            var score = 0;
            require(["esri/geometry/Point","esri/geometry/webMercatorUtils"], function(Point, webMercatorUtils) {
                $.ajax(url, {
                    dataType: "xml text mydatatype",
                    cache: false,
                    converters: {
                        "xml text": function(xmlValue) {
                            // Extract relevant text from the xml document
                            $(xmlValue).find('NewDataSet').each(function() {
                                hasReturnValue = true;
                            });
                            if (hasReturnValue) {
                                that.onToggleGeocoder();
                                
                                $(xmlValue).find('NewDataSet').each(function() {
                                    $(this).find('Table1').each(function() {
                                        recordCount = recordCount + 1;
                                    });
                                });
                                if (recordCount === 1) {
                                    $(xmlValue).find('NewDataSet').each(function() {
                                        $(this).find('Table1').each(function() {
                                            if ($(this).find('FULLADDRESS')) {
                                                add = $(this).find('FULLADDRESS').text();
                                            }
                                            else if ($(this).find('FULLINTERSECTION')) {
                                                add = $(this).find('FULLINTERSECTION').text();
                                            }
                                            else if ($(this).find('FULLBLOCK')) {
                                                add = $(this).find('FULLBLOCK').text();
                                            }
                                            lat = $(this).find('LATITUDE').text();
                                            lon = $(this).find('LONGITUDE').text();
                                            score = $(this).find('ConfidenceLevel').text();
                                            $('#address').val(add);
                                        });
                                    });
                                    //add point to map
                                    var pt = webMercatorUtils.geographicToWebMercator(new Point(lon, lat));
                                    curLoc = false;
                                    that.addGraphic(pt, false);
                                    that.bufferLocation(pt);
                                }
                                else {// returned records
                                    //Create address view model
                                    addressViewModel = kendo.observable({
                                        dcAddress: [
                                            {
                                                Address: add,
                                                Latitude: lat,
                                                Longitude: lon,
                                                Score: score
                                            }
                                        ]
                                    });
                                    //remove the record
                                    addressViewModel.dcAddress.pop();
                                    
                                    $(xmlValue).find('NewDataSet').each(function() {
                                        $(this).find('Table1').each(function() {
                                            if ($(this).find('FULLADDRESS')) {
                                                add = $(this).find('FULLADDRESS').text();
                                            }
                                            else if ($(this).find('FULLINTERSECTION')) {
                                                add = $(this).find('FULLINTERSECTION').text();
                                            }
                                            else if ($(this).find('FULLBLOCK')) {
                                                add = $(this).find('FULLBLOCK').text();
                                            }
                                            lat = $(this).find('LATITUDE').text();
                                            lon = $(this).find('LONGITUDE').text();
                                            score = $(this).find('ConfidenceLevel').text();
                                            //add address to the view model
                                            var addressCandidates = {
                                                Address: add,
                                                Latitude: lat,
                                                Longitude: lon,
                                                Score: score
                                            };
                                            recordCount = addressViewModel.dcAddress.push(addressCandidates);
                                        });
                                    });
                                    
                                    //bind address model view to the list
                                    ds = new kendo.data.DataSource.create({
                                        data: addressViewModel.dcAddress
                                    });
                                   
                                    $("#addressList").kendoMobileListView({
                                        dataSource: ds,
                                        template: $("#addressesList-template").html(),
                                        click: function(e) {
                                            if (e.dataItem) {
                                                loaderElement.text('Locating...').addClass("loaderHeading");  
                                                that.showLoading();
                                                var add1 = e.dataItem.Address;
                                                var lat1 = e.dataItem.Latitude;
                                                var lon1 = e.dataItem.Longitude;
                                                $('#address').val(add1);
                                                //add point to map
                                                var pt = webMercatorUtils.geographicToWebMercator(new Point(lon1, lat1));
                                                curLoc = false;
                                                that.addGraphic(pt, false);
                                                that.bufferLocation(pt);
                                                app.application.navigate("#drawer-map");
                                            }
                                            else {
                                            }
                                        }
                                    });                                   
                                    that.hideLoading();
                                    $("#recordLabel").html(recordCount + " records found.");
                                    app.application.navigate("#drawer-addresslist");
                                }
                            }
                            else {
                                that.hideLoading();
                                navigator.notification.alert('Address not found!', null, // callback
                                                             'Information', // title
                                                             'Ok');
                            }
                        }
                    }
                })
            });
        },
             
        bufferLocation: function(point) {
            var that = this;
            loaderElement.text('Buffering...').addClass("loaderHeading");  
            that.showLoading();
            require([
                "esri/tasks/BufferParameters","esri/tasks/GeometryService","esri/symbols/PictureMarkerSymbol","esri/symbols/SimpleFillSymbol","esri/symbols/SimpleLineSymbol", "esri/layers/FeatureLayer",
                "dojo/_base/Color","esri/graphic", "esri/tasks/query","esri/tasks/QueryTask", "dojo/DeferredList", "dojo/promise/all", "dojo/_base/array"
            ], function (BufferParameters, GeometryService, PictureMarkerSymbol, SimpleFillSymbol, SimpleLineSymbol, FeatureLayer, Color, Graphic, Query, QueryTask, DeferredList, all, array) {
                var params = new BufferParameters();
                params.geometries = [point];
                var bufferSize = app.settingsService.viewModel.getBufferSize();
                params.distances = [bufferSize];
                params.unit = GeometryService.UNIT_STATUTE_MILE;
                params.outSpatialReference = map.spatialReference;
                //Geometry Service Endpoint
                var gsvc = new GeometryService(appConfig.gsvcURL);
                gsvc.buffer(params, 
                            function (geometries) {
                                var symbol = new SimpleFillSymbol(
                                    SimpleFillSymbol.STYLE_SOLID, new SimpleLineSymbol(
                                        SimpleLineSymbol.STYLE_SOLID, new Color([0, 0, 255, 0.5]), 2), new Color([0, 0, 255, 0.3]));
                                var graphic = new Graphic(geometries[0], symbol);
                                mapGraphicsLayer.clear();
                                mapGraphicsLayer.add(graphic);
                                map.centerAndZoom(geometries[0], 16);
                                //set extent  
                                var qGeom = geometries[0];
                                var bufferExtent = geometries[0].getExtent();
                                map.setExtent(bufferExtent, true);
                                 
                                var today = new Date();
                                today.setDate(today.getDate() - 30);
                                var aMonthAgo = today;
                                var aMonthAgoStr = aMonthAgo.getMonth() + '/' + aMonthAgo.getDate() + '/' + aMonthAgo.getFullYear();
                                
                                // use the extent for the query geometry
                                var conQuery = new Query();
                                conQuery.returnGeometry = true;
                                conQuery.spatialRelationship = Query.SPATIAL_REL_CONTAINS;
                                conQuery.outSpatialReference = map.spatialReference;
                                conQuery.geometry = qGeom;
                                conQuery.outFields = ['*']
                                conQuery.where = "Status = 9 OR (Status = 8 AND ExpirationDate >= '" + aMonthAgoStr + "')";
                                
                                var occQuery = new Query();
                                occQuery.returnGeometry = true;
                                occQuery.spatialRelationship = Query.SPATIAL_REL_CONTAINS;
                                occQuery.outSpatialReference = map.spatialReference;
                                occQuery.geometry = qGeom;
                                occQuery.outFields = ['*']
                                occQuery.where = "Status = 'ISSUED' OR (Status = 'EXPIRED' AND ExpirationDate >= '" + aMonthAgoStr + "')";
                               
                                var dConstruction, dOccupancy, dList;
                            
                                //Query Layers
                                var constQTask = new QueryTask(appConfig.opLayer1MSURL);
                                var occupQTask = new QueryTask(appConfig.opLayer2MSURL);
                                loaderElement.text('Searching...').addClass("loaderHeading");  
                                that.showLoading();
                                if (app.settingsService.viewModel.isConstPermitChecked) {
                                    dConstruction = constQTask.execute(conQuery, null, function(err) {
                                        navigator.notification.alert(err.message, null, 'Error', 'Ok');
                                        that.hideLoading();
                                    });
                                }
                                if (app.settingsService.viewModel.isOccupPermitChecked) {
                                    dOccupancy = occupQTask.execute(occQuery, null, function(err) {
                                        navigator.notification.alert(err.message, null, 'Error', 'Ok');
                                        that.hideLoading();
                                    });
                                }
                                // console.log("deferreds: ", dConstruction, dOccupancy);
                                dList = new DeferredList([dConstruction, dOccupancy]);
                                dList.then(function (results) {
                                    var constructionPermits, occupancyPermits;
                                    // make sure both queries finished successfully, loop through the results and add the results to the map
                                    if (! results[0][1].hasOwnProperty("features")) {
                                        console.log("Construction Permits query failed.");
                                    }
                                    else {
                                        constructionPermits = results[0][1].features; 
                                        array.forEach(constructionPermits, function(feat) {
                                            feat.setSymbol(new PictureMarkerSymbol('styles/images/cone.png', 25, 25))
                                            mapGraphicsLayer.add(feat);
                                        });
                                    }
                                    if (! results[1][1].hasOwnProperty("features")) {
                                        conosle.log("Occupancy Permits query failed.");
                                    }
                                    else {
                                        occupancyPermits = results[1][1].features;  
                                        array.forEach(occupancyPermits, function(feat) {
                                            feat.setSymbol(new PictureMarkerSymbol('styles/images/roadworks.png', 25, 25))                                            
                                            mapGraphicsLayer.add(feat);
                                        });
                                    }
                                    that.hideLoading();
                                });
                            }, 
                            function (error) {
                                console.log(error);
                                that.hideLoading();
                            }
                );
            });
        },

        // Start watching the acceleration
        startWatch: function() {
            // Only start testing if watchID is currently null.
            var that = this;
            if (that.watchID === null) {
                // Update acceleration every 1 second
                var options = { frequency: 1000 };
                that.watchID = navigator.accelerometer.watchAcceleration(function() { 
                    that.onAccelerometerSuccess.apply(that, arguments)
                }, function(error) { 
                    that.onAccelerometerError.apply(that, arguments)
                }, options);
            }
        },
     
        // Stop watching the acceleration
        stopWatch: function() {
            var that = this;
            if (that.watchID !== null) {
                navigator.accelerometer.clearWatch(that.watchID);
                that.watchID = null;
            }
        },
 
        //resize map on success
        onAccelerometerSuccess: function(acceleration) {
            var that = this;
            that.resizeMap();
        },
    
        //Failed to get the acceleration
        onAccelerometerError: function(error) {
            //check if we're running in simulator
            if (device.uuid == "e0101010d38bde8e6740011221af335301010333" || device.uuid == "e0908060g38bde8e6740011221af335301010333") {
                // navigator.notification.alert(error, null, 'Error', 'Ok');
                this.stopWatch.apply(this, arguments);
            }
            else 
                navigator.notification.alert('Failed to get device orientation! Error Code: ' + error.code, null, 'Error', 'Ok');
        },
        
        resizeMap: function() {
            if (map) {
                $("#map-canvas").css("height", $("#mapcontent").css("height"));
                $('#map-canvas').css("width", $("#mapcontent").css("width"));
                map.reposition();
                map.resize();
            }  
        }
        
    });
      
    app.locationService = {
     
        initLocation: function () { 
            require([
                "dojo/dom","dojo/_base/lang","dojo/parser","dojo/_base/connect", "esri/map", "esri/dijit/HomeButton", "esri/dijit/BasemapToggle",
                "esri/config","dojo/dom-construct","esri/dijit/PopupMobile","esri/InfoTemplate","esri/geometry/Extent","esri/geometry/Point", "esri/tasks/locator",
                "esri/dijit/Geocoder", "esri/dijit/LocateButton","esri/SpatialReference","esri/symbols/PictureMarkerSymbol","esri/graphic",
                "esri/layers/GraphicsLayer","esri/layers/FeatureLayer", "dojo/on","dojo/_base/array","esri/symbols/SimpleLineSymbol", "esri/symbols/SimpleFillSymbol",
                "esri/symbols/SimpleMarkerSymbol","dojo/_base/Color","esri/geometry/webMercatorUtils","esri/tasks/query","esri/tasks/QueryTask","dojo/Deferred","dojo/domReady!"
            ], function (dom, lang, parser, connect, Map, HomeButton, BasemapToggle, esriConfig, domConstruct, PopupMobile, InfoTemplate, Extent, Point,
                         Locator, Geocoder, LocateButton, SpatialReference, PictureMarkerSymbol, Graphic, GraphicsLayer, FeatureLayer, on,
                         array, SimpleLineSymbol, SimpleFillSymbol, SimpleMarkerSymbol, Color, webMercatorUtils, Query, QueryTask, Deferred) {
                loaderElement = app.application.pane.loader.element.find("h1");
                parser.parse();
                
                esriConfig.defaults.io.useCors = true; 
                esriConfig.defaults.io.corsEnabledServers.push("maps2.dcgis.dc.gov");
                           
                // fallback to proxy for non-CORS capable browsers
                esriConfig.defaults.io.proxyUrl = "http://mobile.primesource.com/proxy.ashx";
                //esriConfig.defaults.io.proxyUrl = "http://ddotwebfm01/proxy/proxy.ashx";
                //esriConfig.defaults.io.proxyUrl = "http://mobile.ddot.dc.gov/proxy.ashx";
                
                //create a mobile popup
                popup = new PopupMobile(null, domConstruct.create("div"));

                map = new Map("map-canvas", {
                    basemap: "topo",
                    center: [-77.032, 38.906],
                    zoom: 16,
                    infoWindow: popup,
                    logo:false,
                    slider:false
                });
                     
                geoLocate = new LocateButton({
                    map: map
                }, "map-near-me");
                geoLocate.startup();
                
                homeButton = new HomeButton({
                    map: map
                }, "map-home");
                homeButton.startup();

                basemapToggle = new BasemapToggle({
                    map: map,
                    basemap: "satellite"
                }, "map-toggle");
                basemapToggle.startup();
                basemapToggle.hide();
               
                on(map, "load", function() {
                    //add Feature Layers
                    var conInfoTemplate = new InfoTemplate('<b>Construction Permit</b>', conPermitDetail);
                    constPermitLayer = new FeatureLayer(appConfig.opLayer1FSURL, {
                        mode: FeatureLayer.MODE_SELECTION,
                        infoTemplate: conInfoTemplate,
                        outFields: ["*"]
                    });
                    var occInfoTemplate = new InfoTemplate('<b>Occupancy Permit</b>', occPermitDetail);
                    occupPermitLayer = new FeatureLayer(appConfig.opLayer2FSURL, {
                        mode: FeatureLayer.MODE_SELECTION,
                        infoTemplate: occInfoTemplate,
                        outFields: ["*"]
                    });
                    
                    var selectionSymbol = new PictureMarkerSymbol('styles/images/centerOnTarget.png', 40, 40);
                    constPermitLayer.setSelectionSymbol(selectionSymbol);
                    occupPermitLayer.setSelectionSymbol(selectionSymbol);
                   
                    //Add layers
                    map.addLayers([constPermitLayer, occupPermitLayer]);
                    mapGraphicsLayer = new GraphicsLayer();
                    map.addLayer(mapGraphicsLayer); 
 
                    function pointToExtent(themap, point, toleranceInPixel) {
                        var pixelWidth = themap.extent.getWidth() / themap.width;
                        var toleraceInMapCoords = toleranceInPixel * pixelWidth;
                        return new Extent(point.x - toleraceInMapCoords, point.y - toleraceInMapCoords, point.x + toleraceInMapCoords, point.y + toleraceInMapCoords, map.spatialReference);
                    }
      
                    var settings = lang.mixin({
                        holdThreshold: 300,
                        doubleTapTimeout: 350,
                        tapRadius: 10,
                        type: "tap"
                    }, settings);
              
                    map.on("click", function(e) {
                        $("#infoTap").hide();
                        //if there are features in mapGraphicsLayer and the touch is with in the extent of the buffer
                        //query the feature layer
                        if (mapGraphicsLayer.graphics.length > 1) {
                            if (mapGraphicsLayer.graphics[0].geometry.type === 'polygon') {
                                var buffExtent = mapGraphicsLayer.graphics[0].geometry._extent;
                                var tapHoldPoint = map.toMap(new Point(e.clientX - map.position.x, e.clientY - map.position.y));
                                //compare if the point extent is within the buffer extent
                                if ((Math.abs(buffExtent.xmax) <= Math.abs(tapHoldPoint.x) <= Math.abs(buffExtent.xmin)) && 
                                    (Math.abs(buffExtent.ymin) <= Math.abs(tapHoldPoint.y) <= Math.abs(buffExtent.ymax))) {
                                    var ptExtent = pointToExtent(map, tapHoldPoint, 10); 
                                                                               
                                    var today = new Date();
                                    today.setDate(today.getDate() - 30);
                                    var aMonthAgo = today;
                                    var aMonthAgoStr = aMonthAgo.getMonth() + '/' + aMonthAgo.getDate() + '/' + aMonthAgo.getFullYear();
                                        
                                    var conQuery = new Query();
                                    conQuery.returnGeometry = true;
                                    conQuery.spatialRelationship = Query.SPATIAL_REL_CONTAINS;
                                    conQuery.outSpatialReference = map.spatialReference;
                                    conQuery.geometry = ptExtent;
                                    conQuery.outFields = ['*']
                                    conQuery.where = "Status = 9 OR (Status = 8 AND ExpirationDate >= '" + aMonthAgoStr + "')";
                                
                                    var occQuery = new Query();
                                    occQuery.returnGeometry = true;
                                    occQuery.spatialRelationship = Query.SPATIAL_REL_CONTAINS;
                                    occQuery.outSpatialReference = map.spatialReference;
                                    occQuery.geometry = ptExtent;
                                    occQuery.outFields = ['*']
                                    occQuery.where = "Status = 'ISSUED' OR (Status = 'EXPIRED' AND ExpirationDate >= '" + aMonthAgoStr + "')";
                                        
                                    constPermitLayer.clearSelection();
                                    occupPermitLayer.clearSelection();
                                        
                                    var conDeferred,occDeferred;
                                    if (app.settingsService.viewModel.isConstPermitChecked) {
                                        conDeferred = constPermitLayer.selectFeatures(conQuery, FeatureLayer.SELECTION_ADD);
                                        conDeferred.then(function(features) {
                                            // This will be called when the deferred is resolved
                                            if (features.length > 0) {
                                                map.infoWindow.setFeatures([conDeferred]); 
                                                map.infoWindow.show(tapHoldPoint);
                                            }
                                        }, function(err) {
                                            console.log(err);
                                        });
                                    }
                                    if (app.settingsService.viewModel.isOccupPermitChecked) {
                                        occDeferred = occupPermitLayer.selectFeatures(occQuery, FeatureLayer.SELECTION_ADD);
                                        occDeferred.then(function(features) {
                                            // This will be called when the deferred is resolved
                                            if (features.length > 0) {
                                                map.infoWindow.setFeatures([occDeferred]); 
                                                map.infoWindow.show(tapHoldPoint);
                                            }
                                        }, function(err) {
                                            console.log(err);
                                        });
                                    }
                                }
                            }
                        }
                    });
                    
                    map.on("dbl-click", function(e) {
                        $("#infoTap").hide();
                        app.locationService.viewModel.onClearGraphics();
                        app.locationService.viewModel.addGraphic(e.mapPoint, false);
                        //buffer location
                        app.locationService.viewModel.bufferLocation(e.mapPoint);
                    });
                    
                    map.disableDoubleClickZoom();
                });
               
                $("#map-clearGraphics").on("touchend", function() {
                    app.locationService.viewModel.onClearGraphics();   
                });
                             
                // Listen for orientation changes
                window.addEventListener(orientationEvent, function () {
                    // Announce the new orientation number
                    if (map) {
                        map.reposition();
                        map.resize();
                    }
                }, false);
                //Detect device and OS if android sart waching the accelerometer ...
                var deviceOs = kendo.support.mobileOS.name; //Returns the current os name identificator, can be "ios", "android", "blackberry", "windows", "webos", "meego".
                //var deviceName = kendo.support.mobileOS.device; //Returns the current mobile device identificator, can be "fire", "android", "iphone", "ipad", "meego", "webos", "blackberry", "playbook", "winphone", "windows".
                var isTablet = kendo.support.mobileOS.tablet; //Returns the current mobile device identificator, can be "fire", "android", "iphone", "ipad", "meego", "webos", "blackberry", "playbook", "winphone", "windows".
                //console.log(deviceOs);
                //console.log(deviceName);
                //console.log(isTablet);             
                
                //detect if it is android tablet
                if (deviceOs === "android" && isTablet === "android") {
                    app.locationService.viewModel.startWatch();
                }                             
                             
                navigator.splashscreen.hide();
            });
        },

        show: function () {
        },

        hide: function () {
        },

        viewModel : new LocationViewModel()
    };
}
)(window);