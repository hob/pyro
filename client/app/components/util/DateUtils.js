const fiveHours = 60 * 60 * 5;
function convertTemps(reading) {
    reading.t = reading.t * 9/5 + 32;
    reading.c = reading.c * 9/5 + 32;
}
function convertDate(reading) {
    reading.d = new Date((parseInt(reading.d) + fiveHours) * 1000);
}

export {convertTemps}
export {convertDate}
