import Pyro from './components/Pyro';
import React from 'react';
import ReactDOM from 'react-dom';
import {convertDate, convertTemps} from './components/util/DateUtils'

require('./scss/pyro.scss');

let url = 'https://zsz5ychlqi.execute-api.us-east-1.amazonaws.com/prod/sample-readings';
let request = new Request(url, {
  headers: new Headers({
    "X-Api-Key":"peoo6mHOGE8xrPtXl41wM3SWHmRZ4qcV8DrzlA4M"
  })
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
      <Pyro readings={readings} />,
      document.getElementById('contentPane')
    );
  });
