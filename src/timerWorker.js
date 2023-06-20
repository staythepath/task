let count = 0;
onmessage = function (event) {
  if (event.data.cmd === "start") {
    setInterval(() => {
      postMessage({ timer: count });
      count++;
    }, 1000);
  } else if (event.data.cmd === "stop") {
    clearInterval();
    count = 0;
  }
};
