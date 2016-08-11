parismetromap.directive('leaflet', function () {
  return {
    restrict: "A",
    scope: {
      lat: '=',
      lon: '=',
      center: '=',
      newLocation: '=',
      locations: '=',
      showControls: '=',
      deleteButtonVisible: '=',
      activeLocation: '=',
      didGeolocate: '=',
      statusText: '='
    },

    controller: function($scope, $element, $window, $rootScope, $http, $timeout) {

      var map = L.map("map", {
        trackResize: true,
        maxBounds: [
          [48.937845, 2.164307],
          [39.659669, 2.532349]
        ]
      });



      var userPointsGroup = L.layerGroup();
      var userPoints;
      var userLocationMarker;
      var newMarker;
      var mapZoom = { start:map.getZoom(), end:map.getZoom() };
      L.AwesomeMarkers.Icon.prototype.options.prefix = 'fa';


      map.setView([0,0], 12);
      L.tileLayer('tiles/{z}/{x}/{y}.png', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery (c) <a href="http://cloudmade.com">CloudMade</a>, Icon Map Created by <a href="http://thenounproject.com/term/map/32153/">Simple Icons</a>',
        maxZoom: 13,
        minZoom: 11,
        errorTileUrl: "img/error_tile.png"
      }).addTo(map);


      map.on('popupopen', function(e) {
        $timeout(function () {
          $scope.activeLocation = e.popup._source;
          $scope.deleteButtonVisible = userPoints.hasLayer($scope.activeLocation);
        });
      });


      map.on('popupclose', function(e) {
        $timeout(function () {
          $scope.activeLocation = null;
          $scope.deleteButtonVisible = false;
        });
      });


      map.on('zoomstart', function (e) {
        mapZoom.start = map.getZoom();
      });


      map.on('zoomend', function(e) {
        mapZoom.end = map.getZoom();
        var diff = mapZoom.start - mapZoom.end;

        if (userLocationMarker) {
          if (diff > 0) {
            userLocationMarker.setRadius(userLocationMarker.getRadius() * 2);
          } else if (diff < 0) {
            userLocationMarker.setRadius(userLocationMarker.getRadius() / 2);
          }
        }
      });


      map.on('layeradd', function () {
        if (map.hasLayer(userPoints)) {
          userPoints.bringToFront();
        }
        if (map.hasLayer(userLocationMarker)) {
          userLocationMarker.bringToFront();
        }
      });


      map.on('moveend', function () {
        $timeout(function () {
          $scope.center = map.getCenter();
        });
      });


      var museumIcon = L.AwesomeMarkers.icon({
        "icon": "university", "markerColor": "blue"
      });
      var museums = L.geoJson(null, {
        "pointToLayer": function(feature, latlng) {
          return L.marker(latlng, {"icon": museumIcon});
        },
        "onEachFeature": function(feature, layer) {
          layer.bindPopup(feature.properties.name);
        }
      });
      var museumUrl = 'paris_museums.geojson';
      $http.get(museumUrl, {"responseType": "json"})
        .success(function(data) {
          museums.addData(data); //.addTo(map)
        })
        .error(function() {
          console.log('failed to load airport data from ' + museumUrl);
        });


      var attractionsIcon = L.AwesomeMarkers.icon({
        "icon": "flag", "markerColor": "red"
      });
      var attractions = L.geoJson(null, {
        "pointToLayer": function(feature, latlng) {
          return L.marker(latlng, {"icon": attractionsIcon});
        },
        "onEachFeature": function(feature, layer) {
          layer.bindPopup(feature.properties.name);
        }
      });
      var attractionsUrl = 'paris_attractions.geojson';
      $http.get(attractionsUrl, {"responseType": "json"})
        .success(function(data) {
          attractions.addData(data); //.addTo(map)
        })
        .error(function() {
          console.log('failed to load airport data from ' + attractionsUrl);
        });


      // color the metro lines
      var railways = L.geoJson(null, {
        "style": function(feature) {
          switch (feature.properties.name) {
            case 'Métro 1': return {color: "#F3CA0E", weight: 8, opacity: 0.75};
            case 'Métro 2': return {color: "#1A6CB6", weight: 8, opacity: 0.75};
            case 'Métro 3': return {color: "#9A9A38", weight: 8, opacity: 0.75};
            case 'Métro 4': return {color: "#BD4A99", weight: 8, opacity: 0.75};
            case 'Métro 5': return {color: "#F88F44", weight: 8, opacity: 0.75};
            case 'Métro 6': return {color: "#75C795", weight: 8, opacity: 0.75};
            case 'Métro 7': return {color: "#F79DB3", weight: 8, opacity: 0.75};
            case 'Métro 8': return {color: "#C6A2CD", weight: 8, opacity: 0.75};
            case 'Métro 9': return {color: "#CECA03", weight: 8, opacity: 0.75};
            case 'Métro 10': return {color: "#E1B129", weight: 8, opacity: 0.75};
            case 'Métro 11': return {color: "#8F6534", weight: 8, opacity: 0.75};
            case 'Métro 12': return {color: "#008E59", weight: 8, opacity: 0.75};
            case 'Métro 13': return {color: "#86D3DF", weight: 8, opacity: 0.75};
            case 'Métro 3bis': return {color: "#86D3DF", weight: 8, opacity: 0.75};
            case 'Métro 7b': return {color: "#75C795", weight: 8, opacity: 0.75};
            case 'Métro 1': return {color: "#682A91", weight: 8, opacity: 0.75};
            default: return {color: "#061", weight: 8};
          }
        },
        "onEachFeature": function(feature, layer) {
          layer.bindPopup(feature.properties.name);
        }
      });


      var railwaysUrl = 'paris_metro.geojson';
      $http.get(railwaysUrl, {"responseType": "json"})
        .success(function(data) {
          railways.addData(data);
        })
        .error(function() {
          console.log('failed to load national parks data from ' + railwaysUrl);
        });


      var tiles = null;
      var features = {
        "My Points": userPointsGroup,
        "Museums": museums,
        "Attractions": attractions,
        "Metro Lines": railways
      };
      L.control.layers(tiles, features).addTo(map);

      var configureFeature = function (feature, layer) {
        layer.bindPopup(feature.properties.text);
      };


      $scope.$watch("lat", function () {
        console.log("Leaflet Directive: Lat changed " + $scope.lat);
        $scope.updateMapLocation();
      });


      $scope.$watch("lon", function() {
        console.log("Leaflet Directive: Lon changed " + $scope.lon);
        $scope.updateMapLocation();
      });

      $scope.$watch("newLocation", function() {
        console.log("Leaflet Directive: newLocation changed: ", $scope.newLocation);
        if ($scope.newLocation.geometry) {
          console.log("Leaflet Directive: newLocation changed with lat:" + $scope.newLocation.geometry.coordinates[0] + " lon: " + $scope.newLocation.geometry.coordinates[1]);
          newMarker = L.marker([$scope.newLocation.geometry.coordinates[1], $scope.newLocation.geometry.coordinates[0]], {
            draggable: true, icon: L.AwesomeMarkers.icon({icon: 'fa-plus', markerColor: 'green'}), zIndexOffset: 1000
          })
            .on('dragstart', function(e) {
              $scope.$apply(function() {
                $scope.showControls = false;
              });
              newMarker.closePopup();
            })
            .on('dragend', function(e) {
              newMarker.openPopup();
              $scope.$apply(function(s) {
                console.log("marker new location: ", newMarker.getLatLng());
                $scope.showControls = true;
                $scope.newLocation.geometry.coordinates = [newMarker.getLatLng().lng, newMarker.getLatLng().lat];
                console.log("drag end: ", $scope.newLocation);
              })
            })
            .addTo(map).bindPopup("Drag me where you like").openPopup();
          $scope.showControls = true;
        } else if (map.hasLayer(newMarker)) {
          map.removeLayer(newMarker);
        }
      });


      $scope.$watch("locations", function() {
        console.log("Leaflet Directive: locations changed ", $scope.locations);
        if ($scope.locations) {
          userPointsGroup.clearLayers();
          if (map.hasLayer(newMarker)) {
            map.removeLayer(newMarker);
          }

          userPoints = L.geoJson($scope.locations, {
            pointToLayer: function(feature, latlng) {
              return L.marker(latlng,
                  {icon: L.AwesomeMarkers.icon(
                    {icon:'circle', markerColor: 'cadetblue'}
                  )});
            },
            onEachFeature: configureFeature
          });

          userPointsGroup.addLayer(userPoints).addTo(map);
        }
      }, true);


      $scope.updateMapLocation = function () {
        if ($scope.lat != 0 && $scope.lon !=0 && $scope.lon > 2.164307 && $scope.lat < 48.937845 && $scope.lon < 2.532349 && $scope.lat > 39.659669) {
          console.log("Leaflet Directive: Changing map view lat: " + $scope.lat + " lon: " + $scope.lon);
          map.setView([$scope.lat, $scope.lon], 12);
          $scope.center = {lat: $scope.lat, lon: $scope.lon};

          if (map.hasLayer(userLocationMarker)) {
            map.removeLayer(userLocationMarker);
          }

          if ($scope.didGeolocate) {
            userLocationMarker = L.circle([$scope.lat, $scope.lon], 250,  {
            color: 'blue',
            fillColor: '#22f',
            fillOpacity: 0.5,
          }).addTo(map);
          }
        } else {
          $scope.statusText = "You are outside of Paris, we are unable to show your location on the map."
        }
      }
    } // end of controller
  } // end of return
});
