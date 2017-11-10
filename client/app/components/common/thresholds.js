const colorThresholds = new Map();
colorThresholds.set(500, "#800026");
colorThresholds.set(450, "#bd0026");
colorThresholds.set(400, "#e31a1c");
colorThresholds.set(350, "#fc4e2a");
colorThresholds.set(300, "#fd8d3c");
colorThresholds.set(250, "#feb24c");
colorThresholds.set(200, "#fed976");
colorThresholds.set(150, "#ffeda0");
colorThresholds.set(100, "#ffffcc");
colorThresholds.set(50, "#9ecae1");
colorThresholds.set(0, "#4292c6");

function getColorByTemp(temp) {
    for(var [threshold, color] of colorThresholds) {
        if(temp > threshold) {
            return color;
        }
    }
    return "#FFFFFF";
}

function getColorThresholds() {
  return colorThresholds;
}

export {getColorByTemp};
export {getColorThresholds};
