import Pyro from './components/Pyro';
import React from 'react';
import ReactDOM from 'react-dom';
import {convertDate, convertTemps} from './components/util/DateUtils'

require('./scss/pyro.scss');

readings.forEach(function(reading){
    convertDate(reading);
    convertTemps(reading);
});
ReactDOM.render(
  <Pyro readings={readings} latestReadingEndpoint={latestReadingEndpoint}/>,
  document.getElementById('contentPane')
);
