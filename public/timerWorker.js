// timerWorker.js
/* global self */

self.onmessage = function (event) {
  let count = 0;
  if (event.data.cmd === "start") {
    setInterval(() => {
      self.postMessage({ timer: count });
      count++;
    }, 1000);
  } else if (event.data.cmd === "stop") {
    clearInterval();
    count = 0;
  }
};
