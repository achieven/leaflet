import {Component} from 'angular2/core';
@Component({
    selector: 'my-app',
    templateUrl: 'app/app.html'
})
export class AppComponent {
    mymap;

    constructor() {
        var allTrips = window.localStorage.getItem('trips')
        if (!allTrips || allTrips.length < 1) {
            window.localStorage.setItem('trips', JSON.stringify([]))
        }
    }

    renderTripsFromLocalStorage() {
        var tripsAsArray = JSON.parse(window.localStorage.getItem('trips'))
        var tripsInTable = ''
        tripsAsArray.forEach(function (trip) {
            var dateTd = '<td>' + trip.date + '</td>'
            var nameTd = '<td>' + trip.name + '</td>'
            var editCopyDeleteTd = '<td class="editAndDeleteTrip">' + '<button class="btn btn-info editTrip" data-toggle="modal" data-target="#newTripModal" id=' + trip.id + '>Edit</button> <button class="btn btn-success copyTrip" id=' + JSON.stringify(trip) + '> Copy</button><button class="btn btn-warning deleteTrip" id=' + trip.id + '>Delete</button></td>'
            var deleteWarningText = '<td class="deleteTripWarning hide" deleteId=' + trip.id + '><div class="alert alert-warning text-center" id="deleteWarningText">Are you sure you want to delete this trip? This is an irreversible step! </div></td>'
            var deleteWarningButtons = '<td class="deleteTripWarningButtons hide" deleteId=' + trip.id +'> <button class="btn btn-danger yesDeleteTrip yesButton" id=' + trip.id +' type="button">Yes </button> <button class="btn btn-info noDontDeleteTrip noButton" id=' + trip.id +' type="button">No </button></td>'
            var tableRow = '<tr>' +dateTd + nameTd + editCopyDeleteTd + deleteWarningText + deleteWarningButtons +'</tr>'
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
        this.mymap && this.mymap.remove()
        $('#mapid').empty()
        $('.landmarks').empty()
    }

    initializeEmptyMap() {
        this.mymap = L.map('mapid').setView([51.505, -0.09], 13);
        L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpandmbXliNDBjZWd2M2x6bDk3c2ZtOTkifQ._QA7i5Mpkd_m30IGElHziw', {
            maxZoom: 18,
            attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
            '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
            'Imagery © <a href="http://mapbox.com">Mapbox</a>',
            id: 'mapbox.streets'
        }).addTo(this.mymap);
    }

    showTripProperties(thisTrip, newTripOrEdit) {
        var thisView = this
        var tripLandmarks = thisTrip.landmarks
        tripLandmarks.forEach(function (landmark) {
            var fullLandmarkId = landmark.fullLandmarkId
            var tripsLandmarkId = fullLandmarkId.substr(fullLandmarkId.indexOf('_') + 1)

            L.marker({lat: landmark.lat, lng: landmark.lng}).addTo(thisView.mymap);
            $('.landmarks').append('<li liId=' + fullLandmarkId + '> <button class="btn btn-success landmarkBtn"' + ' lat=' + landmark.lat + ' lng=' + landmark.lng + '>' + tripsLandmarkId + '</button> <button class="glyphicon glyphicon-trash" id=' + fullLandmarkId + ' lat=' + landmark.lat + ' lng=' + landmark.lng + '> </button></li>')
            $('.landmarkBtn').unbind('click').on('click', function (e) {
                thisView.mymap.panTo({
                    lat: e.currentTarget.getAttribute('lat'),
                    lng: e.currentTarget.getAttribute('lng')
                })
            })
        })
        $('.glyphicon-trash').unbind('click').on('click', function (e) {
            var landmarkToRemoveIndex = tripLandmarks.findIndex(function (landmark) {
                return landmark.fullLandmarkId == e.currentTarget.id
            })
            tripLandmarks.splice(landmarkToRemoveIndex, 1)
            var liToRemoveSelector = '[liId=' + e.currentTarget.id + ']'
            $(liToRemoveSelector).remove()
            thisView.destroyMap()
            thisView.initializeEmptyMap()
            thisView.editModal(thisTrip, newTripOrEdit)
        })
        setTimeout(function () {

            $('.createName').val(thisTrip.name)
            $('.createDate').val(thisTrip.date.split('/').reverse().join('-'))
        }, 500)
    }


    editModal(thisTrip, newTripOrEdit) {
        var thisView = this
        thisView.destroyMap()
        thisView.initializeEmptyMap()
        thisView.showTripProperties(thisTrip, newTripOrEdit)


        var newMarkers = []

        thisView.mymap.on('click', function (e) {
            var tripsLastLandmarkId
            if (thisTrip.landmarks.length === 0) {
                tripsLastLandmarkId = 0
            }
            else {
                var lastLandmark = thisTrip.landmarks[thisTrip.landmarks.length - 1]
                tripsLastLandmarkId = parseInt(lastLandmark.fullLandmarkId.substr(lastLandmark.fullLandmarkId.indexOf('_') + 1))
            }
            var landmark = e.latlng
            var newLandmark = L.marker(landmark)
            var currentTripsLandmarkId = ++tripsLastLandmarkId
            var fullLandmarkId = thisTrip.id + '_' + currentTripsLandmarkId
            thisTrip.landmarks.push($.extend(landmark, {fullLandmarkId: fullLandmarkId}))
            thisView.destroyMap()
            thisView.initializeEmptyMap()
            thisView.editModal(thisTrip, newTripOrEdit)
        })
        $('.saveTrip').unbind('click').on('click', function (e) {
            e.preventDefault()
            var name = $('.createName').val()
            var dateToReverse = $('.createDate').val()
            var date = dateToReverse.split('-').reverse().join('/')
            
            if(thisView.validateTripProperties(name, date)){
                var id = thisTrip.id
                var newTripContents = {name: name, date: date, id: id, landmarks: thisTrip.landmarks}
                var allTrips = JSON.parse(window.localStorage.getItem('trips'))
                if (newTripOrEdit === 'new') {
                    allTrips.push(newTripContents)
                }
                else if (newTripOrEdit === 'edit') {
                    var tripIndex = allTrips.findIndex(function (_trip) {
                        return _trip.id === thisTrip.id
                    })
                    allTrips[tripIndex] = newTripContents
                }
                $('.error-create-trip').addClass('hide')
                window.localStorage.setItem('trips', JSON.stringify(allTrips))
                thisView.renderTripsFromLocalStorage();
                (<any>$('#newTripModal')).modal('hide')
            }
        })
    }


    ngAfterContentChecked() {
        var thisView = this
        $('.editTrip').unbind('click').on('click', function (e) {
            var tripId = e.currentTarget.getAttribute('id')
            var allTrips = JSON.parse(window.localStorage.getItem('trips'))
            var tripIndex = allTrips.findIndex(function (trip) {
                return tripId == trip.id
            })

            var allTrips = JSON.parse(window.localStorage.getItem('trips'))
            var thisTrip = allTrips[tripIndex]
            thisView.editModal(thisTrip, 'edit')
        })


        $('#newTripBtn').unbind('click').on('click', function (e) {

            var allTrips = JSON.parse(window.localStorage.getItem('trips'))
            var newTripId = allTrips.length > 0 ? allTrips[allTrips.length - 1].id + 1 : 1

            var oldMarkers = []
            var lastMarkerId = 0
            var thisTrip = {
                name: '',
                date: '',
                id: newTripId,
                landmarks: []
            }
            thisView.editModal(thisTrip, 'new')


        })
        $('.copyTrip').unbind('click').on('click', function (e) {
            var allTrips = JSON.parse(window.localStorage.getItem('trips'))
            var copiedTrip = JSON.parse(e.currentTarget.id)
            var indexOfCurrentTrip = allTrips.indexOf(function(_trip){
                return copiedTrip.id == _trip.id
            })
            var lastTripId = allTrips[allTrips.length-1].id
            copiedTrip.id = lastTripId+1
            allTrips.splice(indexOfCurrentTrip, 0, copiedTrip)
            window.localStorage.setItem('trips', JSON.stringify(allTrips))
            thisView.renderTripsFromLocalStorage()
        })
        $('.deleteTrip').unbind('click').on('click', function (e) {
            var deleteWarningSelector = '[deleteId=' + JSON.stringify(e.currentTarget.id) + ']'
            $(deleteWarningSelector).removeClass('hide')
        })
        $('.yesDeleteTrip').unbind('click').on('click', function (e) {
            thisView.deleteTripFromLocalStorage(e.currentTarget.id)
            thisView.renderTripsFromLocalStorage()
            var deleteWarningSelector = '[deleteId=' + JSON.stringify(e.currentTarget.id) + ']'
            $('.deleteWarningSelector').addClass('hide')
        })
        $('.noDontDeleteTrip').unbind('click').on('click', function (e) {
            var deleteWarningSelector = '[deleteId=' + JSON.stringify(e.currentTarget.id) + ']'
            $(deleteWarningSelector).addClass('hide')
        })
    }

    validateTripProperties(name, date){
        var dateRegex = /^(((0[1-9]|[12]\d|3[01])\/(0[13578]|1[02])\/((19|[2-9]\d)\d{2}))|((0[1-9]|[12]\d|30)\/(0[13456789]|1[012])\/((19|[2-9]\d)\d{2}))|((0[1-9]|1\d|2[0-8])\/02\/((19|[2-9]\d)\d{2}))|(29\/02\/((1[6-9]|[2-9]\d)(0[48]|[2468][048]|[13579][26])|((16|[2468][048]|[3579][26])00))))$/g;
        var dateValid = dateRegex.test(date)

        if(!dateValid){
            $('.error-create-trip').removeClass('hide')
            $('.error-create-trip').text('date is not valid!')
        }
        else if(!name){
            $('.error-create-trip').removeClass('hide')
            $('.error-create-trip').text('must fill name!')
        }
        else {
            return true
        }
        return false
    }

}