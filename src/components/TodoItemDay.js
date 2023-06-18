import React, { useState, useEffect } from "react";

const ToDoItemRun = ({
  id,
  index,
  task,
  complete,
  primaryDuration: initialPrimaryDuration,
  secondaryDuration: initialSecondaryDuration,
  numCycles: initialNumCycles,
  onToggle,
  handleUpdate,
  tilDone,
  runningTaskIndex,
  setRunningTaskIndex,
  isTaskInTodos,
  volume,
  isRunning,
  setIsRunning,
  totalElapsedTime,
}) => {
  const [primaryDuration, setPrimaryDuration] = useState(
    initialPrimaryDuration
  );
  const [secondaryDuration, setSecondaryDuration] = useState(
    initialSecondaryDuration
  );
  const [timeLeft, setTimeLeft] = useState(primaryDuration);

  const [isPrimary, setIsPrimary] = useState(true);

  const [currentCycle, setCurrentCycle] = useState(0);
  const numCycles = initialNumCycles;

  useEffect(() => {
    setPrimaryDuration(initialPrimaryDuration);
    setSecondaryDuration(initialSecondaryDuration);
  }, [initialPrimaryDuration, initialSecondaryDuration]);

  useEffect(() => {
    if (!tilDone || tilDone) {
      setTimeLeft(isPrimary ? primaryDuration : secondaryDuration);
    } else {
      setTimeLeft(0);
    }
  }, [primaryDuration, secondaryDuration, isPrimary, tilDone]);

  useEffect(() => {
    if (index === runningTaskIndex && isTaskInTodos) {
      setIsRunning(true);
    }
  }, [runningTaskIndex, index, tilDone, isTaskInTodos, id, setIsRunning]);

  useEffect(() => {
    let timer;

    const handleTaskCompletion = () => {
      console.log(tilDone);
      setIsRunning(false);

      const updatedTask = {
        id,
        index,
        task,
        primaryDuration,
        secondaryDuration,
        numCycles,
        tilDone,
        isRunning: false,
      };
      handleUpdate(updatedTask);
      onToggle(id, true);
      if (isTaskInTodos(id)) {
        setRunningTaskIndex(index);
      }
    };

    const playApplause = (times = 1) => {
      if (times > 0) {
        const audio = new Audio("/applause.mp3");
        audio.volume = volume / 100;
        audio.play();
        setTimeout(() => playApplause(times - 1), 1000);
      }
    };

    if (isRunning) {
      console.log(timeLeft);
      timer = setInterval(
        () => setTimeLeft((prevTimeLeft) => prevTimeLeft - 1),
        1000
      );

      if (
        timeLeft === 1 ||
        (isPrimary ? primaryDuration : secondaryDuration) === 0
      ) {
        clearInterval(timer);
        if (isPrimary) {
          setIsPrimary(false);
          setTimeLeft(secondaryDuration);
          // Check if we're about to start the last cycle with a secondary timer
          if (currentCycle === numCycles - 1) {
            playApplause();
          }
          timer = setInterval(
            () => setTimeLeft((prevTimeLeft) => prevTimeLeft - 1),
            1000
          );
        } else {
          setCurrentCycle(currentCycle < numCycles - 1 ? currentCycle + 1 : 0);
          setIsPrimary(!isPrimary);
          setTimeLeft(isPrimary ? secondaryDuration : primaryDuration);
          if (currentCycle < numCycles - 1) {
            timer = setInterval(
              () => setTimeLeft((prevTimeLeft) => prevTimeLeft - 1),
              1000
            );
          } else if (!tilDone) {
            handleTaskCompletion();
          }
        }
      }
    }

    return () => clearInterval(timer);
  }, [
    isRunning,
    primaryDuration,
    secondaryDuration,
    isPrimary,
    currentCycle,
    numCycles,
    timeLeft,
    tilDone,
    handleUpdate,
    id,
    index,
    onToggle,
    task,
    setRunningTaskIndex,
    isTaskInTodos,
    volume,
    setIsRunning,
  ]);

  const crossedOutStyle = {
    textDecoration: "line-through",
    opacity: 0.5,
  };

  const formatTime = (time) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor(time / 60) % 60;
    const seconds = time % 60;

    return `${hours ? hours + ":" : ""}${String(minutes).padStart(
      2,
      "0"
    )}:${String(seconds).padStart(2, "0")}`;
  };

  return (
    <div className="task-container-">
      <li className={"task"}>
        <span style={complete ? crossedOutStyle : { marginRight: "1rem" }}>
          {task}
        </span>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-around",
          }}
        >
          <div className="countdown">
            {!tilDone && (
              <input
                type="text"
                value={numCycles - currentCycle}
                readOnly
                className={isRunning ? "isRunningCountdown" : ""}
                style={{
                  width: "100%",
                  textAlign: "center",
                  marginRight: "rem",
                }}
              />
            )}
          </div>
          <div className="countdown">
            {tilDone ? (
              <input
                type="text"
                value={formatTime(totalElapsedTime)}
                readOnly
                className={isRunning ? "isRunningCountdown" : "countdown"}
                style={{
                  width: "100%",
                  textAlign: "center",
                  marginLeft: ".5rem",
                }}
              />
            ) : (
              <div className="countdown">
                <input
                  type="text"
                  value={formatTime(totalElapsedTime)}
                  readOnly
                  className={isRunning ? "isRunningCountdown" : "countdown"}
                  style={{
                    width: "100%",
                    textAlign: "center",
                    marginLeft: ".5rem",
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </li>
    </div>
  );
};

export default ToDoItemRun;
