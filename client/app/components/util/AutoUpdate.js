import {convertDate, convertTemps} from './DateUtils'

class AutoUpdate {
  constructor(fillGauge, historyGraph) {
    this.fillGauge = fillGauge;
    this.historyGraph = historyGraph;
  }
  init() {
    window.setInterval(this.fetchLatestReading, 30000);
    window.addEventListener("resize", this.resizeThrottler, false);
    this.resizeTimeout = null;
  }

  fetchLatestReading() {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', latestReadingEndpoint);
      xhr.responseType = 'json';
      xhr.onload = function() {
          var reading = xhr.response
          if(reading != null) {
              readings.push(reading)
              convertDate(reading);
              convertTemps(reading);
              this.fillGauge.displayReading(reading);
              this.historyGraph.readingAdded();
          }
      }
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
