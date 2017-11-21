import Pyro from './components/Pyro';
import React from 'react';
import ReactDOM from 'react-dom';
import {convertDate, convertTemps} from './components/util/DateUtils'

require('./scss/pyro.scss');

let request = new Request(readingsUrl, {
  headers: new Headers({})
});
fetch(request)
  .then(function(response) {
    return response.json();
  }).then(function(readings){
    readings.forEach(function(reading){
        convertDate(reading);
        convertTemps(reading);
    });
    ReactDOM.render(
      <Pyro readings={readings} latestReadingEndpoint={latestReadingEndpoint}/>,
      document.getElementById('contentPane')
    );
  });
