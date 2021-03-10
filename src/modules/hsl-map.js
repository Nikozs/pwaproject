/**
 * Renders map with given coordinates
 * @param {number} latitude
 * @param {number} longitude
 */
const renderMap = (latitude, longitude) => {
var map = L.map("map").setView([latitude, longitude], 15);

L.tileLayer('https://cdn.digitransit.fi/map/v1/{id}/{z}/{x}/{y}.png', {
  attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
    '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
  maxZoom: 19,
  id: 'hsl-map'}).addTo(map);

var latlngStart = L.latLng(latitude, longitude);

var marker = L.marker(latlngStart, { draggable: true}).addTo(map);
getAddress(latlngStart);
marker.addEventListener('moveend', function(e) {
  getAddress(marker.getLatLng());
});

function getAddress(latlng) {
  marker.draggable = false;
  fetch("https://api.digitransit.fi/geocoding/v1/reverse?point.lat="+latlng.lat+"&point.lon="+latlng.lng+"&size=1")
      .then(function(response) {
        return response.json();
      })
      .then(function(geojson) {
        marker.bindPopup(geojson.features[0].properties.label);
        marker.draggable = true;
      });
}
};

const mapApi = {renderMap};
export default mapApi;
