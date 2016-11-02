import {Component} from 'angular2/core';
@Component({
    selector: 'my-app',
    templateUrl: 'app/app.html'
})
export class AppComponent {
    mymap;
    constructor() {
        var allTrips = window.localStorage.getItem('trips')
        if(!allTrips || allTrips.length < 1) {
            window.localStorage.setItem('trips', JSON.stringify([]))
        }
    }

    renderTripsFromLocalStorage() {
        var tripsAsArray = JSON.parse(window.localStorage.getItem('trips'))
        var tripsInTable = ''
        tripsAsArray.forEach(function (trip) {
            var tableRow = '<tr><td>' + trip.date + '</td> <td>' + trip.name + '</td> <td>' + '<button class="btn btn-info editTrip" data-toggle="modal" data-target="#newTripModal" id=' + trip.id + '>Edit</button><button class="btn btn-info deleteTrip" id=' + trip.id + '>Delete</button></td></tr>'
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

    destroyMap() {
        this.mymap.remove()
        $('#mapid').empty()
        $('.landmarks').empty()
    }
    initializeEmptyMap() {
        var initialLatLng = [51.505, -0.09]
        this.mymap = L.map('mapid').setView([51.505, -0.09], 13);
        L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpandmbXliNDBjZWd2M2x6bDk3c2ZtOTkifQ._QA7i5Mpkd_m30IGElHziw', {
            maxZoom: 18,
            attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
            '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
            'Imagery © <a href="http://mapbox.com">Mapbox</a>',
            id: 'mapbox.streets'
        }).addTo(this.mymap);
        this.mymap.panTo(initialLatLng)
    }
    
    showTripProperties(thisTrip){
        var thisView = this
        var tripLandmarks = thisTrip.landmarks
        tripLandmarks.forEach(function(landmark){
            var tripLandmarkId = landmark.tripLandmarkId
            var landmarkId = tripLandmarkId.substr(tripLandmarkId.indexOf('_')+1)

            L.marker({lat: landmark.lat, lng: landmark.lng}).addTo(thisView.mymap);
            $('.landmarks').append('<li liId=' + tripLandmarkId + '> <button class="btn btn-success landmarkBtn" id=' + tripLandmarkId + ' lat=' + landmark.lat + ' lng=' + landmark.lng + '>' + landmarkId + '</button> <button class="glyphicon glyphicon-trash" id=' + tripLandmarkId  + ' lat=' + landmark.lat + ' lng=' + landmark.lng + '> </button></li>')
            $('.landmarkBtn').unbind('click').on('click', function (e) {
                thisView.mymap.panTo({lat: e.currentTarget.getAttribute('lat'), lng: e.currentTarget.getAttribute('lng')})
            })
            $('.glyphicon-trash').unbind('click').on('click', function (e) {
                var landmarkToRemoveIndex = tripLandmarks.findIndex(function(landmark){
                    return landmark.tripLandmarkId == e.currentTarget.id
                })
                tripLandmarks.splice(landmarkToRemoveIndex, 1)
                var liToRemoveSelector = '[liId=' + e.currentTarget.id + ']'
                $(liToRemoveSelector).remove()
                thisView.destroyMap()
                thisView.initializeEmptyMap()
                thisView.showTripProperties(thisTrip)

            })
        })
        setTimeout(function(){
            $('.createName').val(thisTrip.name)
            $('.createDate').val(thisTrip.date)
        },500)
        
    }
    
    editModal(allTrips,oldMarkers, lastMarkerId, tripId, tripIndex, newTripOrEdit){
        var thisView = this
        var newMarkers = []
        
        thisView.mymap.on('click', function (e) {
            var landmarkLatLng = e.latlng
            var newMarker = L.marker(landmarkLatLng).addTo(thisView.mymap);
            var landmarkId = ++lastMarkerId
            var tripLandmarkId = tripId + '_' + landmarkId
            newMarkers.push($.extend(landmarkLatLng, {tripLandmarkId: tripLandmarkId}))
            $('.landmarks').append('<li> <button class="btn btn-success landmarkBtn" id=' + tripLandmarkId + ' lat=' + landmarkLatLng.lat + ' lng=' + landmarkLatLng.lng + '>' + landmarkId + '</button> <button class="glyphicon glyphicon-trash"></button></li>')
            $('.landmarkBtn').unbind('click').on('click', function (e) {
                thisView.mymap.panTo({lat: e.currentTarget.getAttribute('lat'), lng: e.currentTarget.getAttribute('lng')})
            })
            $('.glyphicon-trash').unbind('click').on('click', function (e) {
                debugger
            })
        })
        $('.saveTrip').unbind('click').on('click', function (e) {
            e.preventDefault()
            var name = $('.createName').val()
            var date = $('.createDate').val()
            var id = tripId
            var newTripContents = {name: name, date: date, id: id, landmarks: oldMarkers.concat(newMarkers)}
            console.log(newTripOrEdit, newTripContents)
            if(newTripOrEdit === 'new'){
                allTrips.push(newTripContents)
            }
            else if(newTripOrEdit === 'edit') {
                allTrips[tripIndex] = newTripContents
            }
            
            window.localStorage.setItem('trips', JSON.stringify(allTrips))
            thisView.renderTripsFromLocalStorage();
            (<any>$('#newTripModal')).modal('hide')
        })
    }
    
    

    ngAfterContentChecked() {
        var thisView = this
        $('.editTrip').unbind('click').on('click', function (e) {
            var tripId = e.currentTarget.getAttribute('id')
            var allTrips = JSON.parse(window.localStorage.getItem('trips'))
            var tripIndex = allTrips.findIndex(function(trip){
                return tripId == trip.id
            })
            
            if (thisView.mymap) {
                thisView.destroyMap()
            }
            thisView.initializeEmptyMap()

            var allTrips = JSON.parse(window.localStorage.getItem('trips'))
            var thisTrip = allTrips[tripIndex]

            thisView.showTripProperties(thisTrip)
            var oldMarkers = thisTrip.landmarks
            var lastTripLandmarkId = oldMarkers[oldMarkers.length-1].tripLandmarkId
            var lastMarkerId = parseInt(lastTripLandmarkId.substr(lastTripLandmarkId.indexOf('_')+1))
            thisView.editModal(allTrips, oldMarkers, lastMarkerId, thisTrip.id, tripIndex, 'edit')
        })


        $('.newTripBtn').unbind('click').on('click', function (e) {

            if (thisView.mymap) {
                thisView.destroyMap()
            }
            thisView.initializeEmptyMap();
            
            var allTrips = JSON.parse(window.localStorage.getItem('trips'))
            var newTripId = allTrips.length > 0 ? allTrips[allTrips.length - 1].id+1 : 1
            
            var oldMarkers = []
            var lastMarkerId = 0
            $('.createName').val('')
            $('.createDate').val('')
            thisView.editModal(allTrips, oldMarkers, lastMarkerId, newTripId, undefined, 'new')
            
            
        })
        $('.deleteTrip').unbind('click').on('click', function (e) {
            thisView.deleteTripFromLocalStorage(e.currentTarget.id)
            thisView.renderTripsFromLocalStorage()
        })


    }

}