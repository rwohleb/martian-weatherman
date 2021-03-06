/**
 * Copyright 2013 Robert Wohleb
 *
 * This file is part of Martian Weatherman.
 *
 * Martian Weatherman is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Martian Weatherman is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Martian Weatherman.  If not, see <http://www.gnu.org/licenses/>.
 */
var app = {
    data: [],

    // Application Constructor
    initialize: function() {
        console.log('initialize');

        this.bindEvents();
    },

    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        console.log('bindEvents');

        document.addEventListener('deviceready', this.onDeviceReady, false);
    },

    loadData: function() {
        console.log('loadData');

        $('#offline').slideUp();
        $('#data').slideUp();
        $('#loading').slideDown();

        var yql = 'select * from xml where url="http://data.marsweather.com/rems_climate.xml" and itemPath="climate_report.record" | sort(field="record.sol") | reverse()';
        var yql_uri = 'http://query.yahooapis.com/v1/public/yql?q=' + encodeURIComponent(yql) + '&format=json&callback=?';

        $.ajax({
            dataType: "json",
            url: yql_uri,
            timeout: 2000,
            success: app.onAjaxData,
            error: app.onAjaxError
        });
    },

    renderData: function() {
        console.log('renderData');

        $('#loading').slideUp();
        $('#offline').slideUp();
        $('#data').slideDown();

        console.log(app.data.length);
        // We are just going to get the last 5
        for (var i=0; i<5; i++) {
            console.log(app.data[i]);

            var terrestrial_date = app.data[i].terrestrial_date || '--';
            var sol = app.data[i].sol || '--';
            var ls = app.data[i].magnitudes.ls || '--';

            var temp_scale = window.localStorage.getItem("settings_temp_scale") || 'C';

            var min_temp = app.data[i].magnitudes.min_temp || '--';
            var max_temp = app.data[i].magnitudes.max_temp || '--';
            if (temp_scale == 'F') {
                if (min_temp != '--') {
                    min_temp = ((parseFloat(min_temp) * 1.8) + 32).toFixed(2);
                }
                if (max_temp != '--') {
                    max_temp = ((parseFloat(max_temp) * 1.8) + 32).toFixed(2);
                }
            }
            else {
                if (min_temp != '--') {
                    min_temp = parseFloat(min_temp).toFixed(2);
                }
                if (max_temp != '--') {
                    max_temp = parseFloat(max_temp).toFixed(2);
                }
            }

            var pressure_value  = app.data[i].magnitudes.pressure || '--';
            var pressure_string  = app.data[i].magnitudes.pressure_string || '--';

            var abs_humidity  = app.data[i].magnitudes.abs_humidity || '--';

            var wind_speed  = app.data[i].magnitudes.wind_speed || '--';
            var wind_direction  = app.data[i].magnitudes.wind_direction || '--';

            var season  = app.data[i].magnitudes.season || '--';

            var sunrise  = app.data[i].magnitudes.sunrise || '--';
            var sunset  = app.data[i].magnitudes.sunset || '--';

            var atmo_opacity  = app.data[i].magnitudes.atmo_opacity || '--';
            var atmo_opacity_img = 'img/atmo_null.png';

            if (atmo_opacity == 'Sunny') {
                atmo_opacity_img = 'img/atmo_sunny.png';
            }
            if (atmo_opacity == 'Cloudy') {
                atmo_opacity_img = 'img/atmo_cloudy.png';
            }

            //
            // Now we need to format the date/time values to match the local phone settings.
            //
            if (terrestrial_date != '--') {
                var terrestrial_date_obj = new Date(terrestrial_date);

                // The date object got a date like 2013-04-03, but then assumes it's local tz.
                // Now we need to create a new date object adjusted to GMT.
                //var diff = terrestrial_date_obj.getTimezoneOffset();
                //var terrestrial_date_obj_adj = new Date(terrestrial_date_obj.getTime() + diff*60000);

                navigator.globalization.dateToString(terrestrial_date_obj, function(date) {
                    var which = i;
                    $('#sol-record-' + which + ' .terrestrial-date').text(date.value);
                }, function() {}, {formatLength:'short', selector:'date'});
            }
            /*
            if (sunrise != '--') {
                var sunrise_obj = new Date(sunrise);
                navigator.globalization.dateToString(sunrise_obj, function(date) {
                    var which = i;
                    $('#sol-record-' + which + ' .sunrise').text(date.value);
                }, function() {}, {formatLength:'full', selector:'date and time'});
            }
            if (sunset != '--') {
                var sunset_obj = new Date(sunset);
                navigator.globalization.dateToString(sunset_obj, function(date) {
                    var which = i;
                    $('#sol-record-' + which + ' .sunset').text(date.value);
                }, function() {}, {formatLength:'full', selector:'date and time'});
            }
            */

            $('#sol-record-' + i + ' .terrestrial-date').text(terrestrial_date);
            $('#sol-record-' + i + ' .sol').text(sol);
            $('#sol-record-' + i + ' .ls').text(ls);
            $('#sol-record-' + i + ' .temp-scale').text(temp_scale);
            $('#sol-record-' + i + ' .min-temp').text(min_temp);
            $('#sol-record-' + i + ' .max-temp').text(max_temp);
            $('#sol-record-' + i + ' .pressure-value').text(pressure_value);
            $('#sol-record-' + i + ' .pressure-string').text(pressure_string);
            $('#sol-record-' + i + ' .abs_humidity').text(abs_humidity);
            $('#sol-record-' + i + ' .wind-speed').text(wind_speed);
            $('#sol-record-' + i + ' .wind-direction').text(wind_direction);
            $('#sol-record-' + i + ' .season').text(season);
            $('#sol-record-' + i + ' .atmo-opacity-image img').attr('src', atmo_opacity_img);
            $('#sol-record-' + i + ' .atmo-opacity-string').text(atmo_opacity);
            $('#sol-record-' + i + ' .sunrise').text(sunrise);
            $('#sol-record-' + i + ' .sunset').text(sunset);
        }
    },

    // ----- Event Handlers -----

    // deviceready Event Handler
    onDeviceReady: function() {
        console.log('onDeviceReady');

        app.loadData();
        //window.setTimeout(app.loadData, 5000);

        // Bind additional events
        $('#refresh').bind('click', app.onRefreshClick);
        $('#panel-settings').on('panelbeforeopen', app.onSettingsOpen);
        $('#panel-settings').on('panelbeforeclose', app.onSettingsClose);
    },

    onRefreshClick: function() {
        console.log('onRefreshClick');

        app.loadData();
    },

    onSettingsOpen: function(evt, ui) {
        var temp_scale = window.localStorage.getItem("settings_temp_scale") || 'C';
        console.log(temp_scale);
        $('#settings-temp-scale').val(temp_scale).slider('refresh');
    },

    onSettingsClose: function(evt, ui) {
        var temp_scale = $('#settings-temp-scale').val();
        window.localStorage.setItem('settings_temp_scale', temp_scale);

        app.renderData();
    },

    onAjaxData: function(data, status, xhr) {
        console.log('onAjaxData');
        console.log(data);

        app.data = data.query.results.record;
        console.log(app.data);

        app.renderData();

        // Refresh the data no faster than every 10 minutes
        window.setTimeout(app.loadData, 1000 * 60 * 10);
    },

    onAjaxError: function(xhr, status, err) {
        console.log('onAjaxError');

        $('#loading').slideUp();
        $('#data').slideUp();
        $('#offline').slideDown();

        // Try again in a few seconds
        window.setTimeout(app.loadData, 5000);
    }
};
