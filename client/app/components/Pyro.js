import React from 'react';
import FillGauge from './FillGauge';

class Pyro extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return <div id="contentPane"><FillGauge/></div>;
  }
}

export default Pyro;
