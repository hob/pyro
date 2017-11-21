import {convertDate, convertTemps} from './DateUtils'

class AutoUpdate {
  constructor(fillGauge, historyGraph, latestReadingEndpoint, readings) {
    this.fillGauge = fillGauge;
    this.historyGraph = historyGraph;
    this.latestReadingEndpoint = latestReadingEndpoint;
    this.resizeThrottler = this.resizeThrottler.bind(this);
    this.resizeHandler = this.resizeHandler.bind(this);
    this.readings = readings;
  }
  init() {
    window.setInterval(this.fetchLatestReading.bind(this), 30000);
    window.addEventListener("resize", this.resizeThrottler, false);
    this.resizeTimeout = null;
  }

  fetchLatestReading() {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', this.latestReadingEndpoint);
      xhr.responseType = 'json';
      xhr.onload = function() {
          var reading = xhr.response
          if(reading != null) {
              this.readings.push(reading)
              convertDate(reading);
              convertTemps(reading);
              this.fillGauge.setState({readings: this.readings, currentReading: reading});
              this.historyGraph.readingAdded();
          }
      }.bind(this);
      xhr.onerror = function(e) {
          console.error(e);
      }
      xhr.send();
  }

  resizeThrottler() {
      // ignore resize events as long as an resizeHandler execution is in the queue
      if ( !this.resizeTimeout ) {
          this.resizeTimeout = setTimeout(function() {
              this.resizeTimeout = null;
              this.resizeHandler();
          }, 66); // The resizeHandler will execute at a rate of 15fps
      }
  }

  resizeHandler() {
      d3.select("#fillgauge > *").remove()
      this.fillGuage.displayReading(currentReading);
  }
}

export default AutoUpdate;
