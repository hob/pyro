import React from 'react';
import FillGauge from './FillGauge';
import LineGraph from './LineGraph';
import AutoUpdate from './util/AutoUpdate';

class Pyro extends React.Component {
  constructor(props) {
    super(props);
    this.readings = props['readings'];
  }
  
  render() {
    this.fillGauge = <FillGauge readings={this.readings} />
    this.lineGraph = <LineGraph/>
    return <div id="contentPane">
      {this.fillGauge}
      {this.lineGraph}
    </div>;
  }

  componentDidMount() {
    this.autoUpdate = new AutoUpdate(this.fillGauge, this.lineGraph);
    this.autoUpdate.init();
  }
}

export default Pyro;
