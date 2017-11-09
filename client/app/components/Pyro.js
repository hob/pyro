import React from 'react';
import FillGauge from './FillGauge';
import LineGraph from './LineGraph';

class Pyro extends React.Component {
  constructor(props) {
    super(props);
    this.readings = props['readings'];
  }
  render() {
    return <div id="contentPane">
      <FillGauge readings={this.readings} />
      <LineGraph/>
    </div>;
  }
}

export default Pyro;
