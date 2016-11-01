import {Component} from 'angular2/core';
import $ from '../node_modules/jquery/dist/jquery.min.js'
import L from '../node_modules/leaflet/dist/leaflet.js'
@Component({
    selector: 'my-app',
    templateUrl: 'app/app.html'
})
export class AppComponent {
    constructor() {
        var tripId = 0
    }

    renderTripsFromLocalStorage() {
        var tripsAsArray = JSON.parse(window.localStorage.getItem('trips'))
        var tripsInTable = ''
        tripsAsArray.forEach(function (trip) {
            var tableRow = '<td>' + trip.date + '</td> <td>' + trip.name + '</td> <td>' + '<button class="btn btn-info editTrip" data-toggle="modal" data-target="#newTripModal" data-id=' + trip.id + '>Edit</button><button class="btn btn-info deleteTrip" id=' + trip.id + '>Delete</button>'
            tripsInTable += tableRow
        })
        $('.tripTable').html(tripsInTable)
    }

    deleteTripFromLocalStorage(id) {
        var tripsAsArray = JSON.parse(window.localStorage.getItem('trips'))
        var tripToDelete = tripsAsArray.findIndex(function (trip) {
            return trip.id == id
        })
        tripsAsArray.splice(tripToDelete, 1)
        window.localStorage.setItem('trips', JSON.stringify(tripsAsArray))
    }

    ngAfterContentInit() {
        this.renderTripsFromLocalStorage()

    }

    ngAfterContentChecked() {
        var thisView = this
        $('.editTrip').unbind('click').on('click', function (e) {
            if ($('#mapid').prop('outerHTML') === '<div id="mapid"></div>') {
                var mymap = L.map('mapid').setView([51.505, -0.09], 13);


            }
        })
        $('.newTripBtn').unbind('click').on('click', function (e) {
            if ($('#mapid').prop('outerHTML') === '<div id="mapid"></div>') {
                var initialLatLng = [51.505, -0.09]
                var mymap = L.map('mapid').setView(initialLatLng, 13);
                mymap.panTo(initialLatLng)
                var newMarkers = []
                var newMarkerId = 0
                var allTrips = JSON.parse(window.localStorage.getItem('trips'))
                var newTripId = ++(allTrips[allTrips.length - 1].id)

                L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpandmbXliNDBjZWd2M2x6bDk3c2ZtOTkifQ._QA7i5Mpkd_m30IGElHziw', {
                    maxZoom: 18,
                    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
                    '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
                    'Imagery © <a href="http://mapbox.com">Mapbox</a>',
                    id: 'mapbox.streets'
                }).addTo(mymap);
                mymap.on('click', function (e) {
                    var intervalId = setInterval(function(){
                        
                        if(e.lating){
                            var newMarker = new L.marker(e.lating).addTo(mymap);
                            newMarkers.push(e.lating)

                            var landmarkId = ++newMarkerId
                            var tripLandmarkId = newTripId + '_' + landmarkId
                            $('.landmarks').append('<li> <button class="btn btn-success" id=' + tripLandmarkId + '>' + landmarkId + '</button></li>')
                            var landmarkBtnSelector = '#' + tripLandmarkId
                            $(landmarkBtnSelector).on('click', function (e) {
                                //mymap.panTo(coordinates)
                            })
                            clearInterval(intervalId)
                        }
                        else {
                            console.log('intervaling')
                        }
                    },1000)

                })
            }

        })
        $('.deleteTrip').unbind('click').on('click', function (e) {
            thisView.deleteTripFromLocalStorage(e.currentTarget.id)
            thisView.renderTripsFromLocalStorage()
        })

        $('.saveTrip').unbind('click').on('click', function (e) {

        })

    }

}