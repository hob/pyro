import Pyro from './components/Pyro';
import React from 'react';
import ReactDOM from 'react-dom';

require('./scss/pyro.scss');

ReactDOM.render(
  <Pyro />,
  document.getElementById('app')
);
