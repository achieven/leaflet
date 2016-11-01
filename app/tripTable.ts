import {Component} from 'angular2/core';
import $ from '../node_modules/jquery/dist/jquery.min.js'
import L from '../node_modules/leaflet/dist/leaflet.js'
@Component({
    selector: 'my-app',
    templateUrl: 'app/app.html'
})
export class AppComponent {
    constructor() {

    }

    renderTripsFromLocalStorage(){
        var tripsAsArray = JSON.parse(window.localStorage.getItem('trips')) ||[]
        var tripsInTable = ''
        tripsAsArray.forEach(function (trip) {
            var tableRow = '<td>' + trip.date + '</td> <td>' + trip.name + '</td> <td>' + '<button class="btn btn-info editTrip" data-toggle="modal" data-target="#newTripModal" data-id=' + trip.id + '>Edit</button><button class="btn btn-info deleteTrip" id=' + trip.id +'>Delete</button>'
            tripsInTable += tableRow
        })
        $('.tripTable').html(tripsInTable)
    }

    deleteTripFromLocalStorage(id){
        var tripsAsArray = JSON.parse(window.localStorage.getItem('trips'))
        var tripToDelete = tripsAsArray.findIndex(function(trip){
            return trip.id == id
        })
        tripsAsArray.splice(tripToDelete, 1)
        window.localStorage.setItem('trips', JSON.stringify(tripsAsArray))
    }

    ngAfterContentInit() {
        this.renderTripsFromLocalStorage()
        var mymap = L.map('mapid').setView([51.505, -0.09], 13);
    }

    ngAfterContentChecked(){
        var thisView = this
        $('.editTrip').unbind('click').on('click', function(e){

        })
        $('.deleteTrip').unbind('click').on('click', function(e){
            thisView.deleteTripFromLocalStorage(e.currentTarget.id)
            thisView.renderTripsFromLocalStorage()
        })

        $('.saveTrip').unbind('click').on('click', function(e){
            
        })

    }

}