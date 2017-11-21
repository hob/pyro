import React from 'react'
import {liquidFillGaugeDefaultSettings} from "./util/liquid_fill_gauge.js";
import {loadLiquidFillGauge} from "./util/liquid_fill_gauge.js";
import {getColorByTemp} from './common/thresholds.js';

class FillGauge extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      readings: props['readings'],
      currentReading: props['currentReading']
    }
    this.gauge = null;
  }

  render() {
    if(this.state.readings.length > 0) {
      return <div id="fillgaugeContainer">
               <svg id="fillGauge"></svg>
             </div>
    }else{
      return <div id='noReadings'>No Readings Yet</div>
    }
  }

  componentDidMount() {
    this.displayCurrentReading();
  }

  displayCurrentReading() {
      var thermostatTemp = this.state.currentReading.t;
      if(this.gauge == null) {
          var config = liquidFillGaugeDefaultSettings();
          config.circleColorFunction = function() {
              return getColorByTemp(thermostatTemp);
          }
          config.textColorFunction = function() {
              return "#DDD";
          }
          config.waveTextColorFunction = function() {
              return "#333";
          }
          config.waveColorFunction = function() {
              return getColorByTemp(thermostatTemp);
          }
          config.timeStampColorFunction = function() {
              return "#444";
          }
          config.timeStampWaveTextColorFunction = function() {
              return "#444";
          }
          config.circleThickness = 0.2;
          config.textVertPosition = 0.5;
          config.waveAnimateTime = 10000;
          config.displayPercent = false;
          config.maxValue = 700;
          config.timeStampFunction = () => {
              return this.state.currentReading.d.toLocaleTimeString();
          };
          config.dateStampFunction = () => {
              return this.state.currentReading.d.toLocaleDateString();
          };

          this.gauge = loadLiquidFillGauge("fillGauge", thermostatTemp, config);
      }else{
          this.gauge.update(thermostatTemp);
      }
  }
}

export default FillGauge;
