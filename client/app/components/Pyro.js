import React from 'react';
import FillGauge from './FillGauge';
import LineGraph from './LineGraph';
import AutoUpdate from './util/AutoUpdate';

class Pyro extends React.Component {
  constructor(props) {
    super(props);
    this.readings = props['readings'];
    this.latestReadingEndpoint = props['latestReadingEndpoint']
  }

  render() {
    return <div id="contentPane">
      <FillGauge readings={this.readings} currentReading={this.readings[this.readings.length - 1]} ref={(fillGauge) => {this.fillGauge = fillGauge; }} />
      <LineGraph readings={this.readings} ref={(lineGraph) => {this.lineGraph = lineGraph; }}/>
    </div>;
  }

  componentDidMount() {
    this.autoUpdate = new AutoUpdate(this.fillGauge, this.lineGraph, this.latestReadingEndpoint, this.readings);
    this.autoUpdate.init();
  }
}

export default Pyro;
