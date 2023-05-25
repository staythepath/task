import React, { useState, useEffect } from "react";

import { BsPlayFill, BsPauseFill } from "react-icons/bs";

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
}) => {
  const [primaryDuration, setPrimaryDuration] = useState(
    initialPrimaryDuration
  );
  const [secondaryDuration, setSecondaryDuration] = useState(
    initialSecondaryDuration
  );
  const [timeLeft, setTimeLeft] = useState(primaryDuration);
  const [isRunning, setIsRunning] = useState(false);
  const [isPrimary, setIsPrimary] = useState(true);

  const [currentCycle, setCurrentCycle] = useState(0);
  const numCycles = initialNumCycles;

  const [elapsedTime, setElapsedTime] = useState(0);

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
    if (index === runningTaskIndex && isTaskInTodos(id)) {
      setIsRunning(true);
    }
  }, [runningTaskIndex, index, tilDone, isTaskInTodos, id]);

  useEffect(() => {
    let timer;

    if (isRunning && tilDone) {
      timer = setInterval(
        () => setElapsedTime((prevElapsedTime) => prevElapsedTime + 1),
        1000
      );
    }

    return () => clearInterval(timer);
  }, [isRunning, tilDone]);

  useEffect(() => {
    let timer;

    const playBell = (times = 1) => {
      if (times > 0) {
        const audio = new Audio("/boxingbell.wav");
        audio.volume = volume / 100;
        audio.play();
        setTimeout(() => playBell(times - 1), 1000);
      }
    };

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
        playBell();
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
  ]);

  const crossedOutStyle = {
    textDecoration: "line-through",
    opacity: 0.5,
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);

    if (isRunning) {
    }
  };

  return (
    <div className="task-container-">
      <li className={isRunning ? "isRunning" : "task"}>
        <label
          className={
            isRunning ? "isRunning-checkbox-container" : "checkbox-container"
          }
        >
          {isRunning ? (
            <input
              type="checkbox"
              checked={complete}
              onChange={() => {
                const updatedTask = {
                  id,
                  index,
                  task,
                  complete: !complete,
                  primaryDuration,
                  secondaryDuration,
                  numCycles,
                  tilDone,
                  isRunning: false,
                };
                handleUpdate(updatedTask);
                onToggle(id, !complete);
              }}
            />
          ) : (
            <input type="checkbox" checked={complete} />
          )}
          <span className="checkbox"></span>
        </label>

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
          {runningTaskIndex === index && !complete ? (
            isRunning ? (
              <button
                onClick={toggleTimer}
                style={{
                  backgroundColor: "transparent",
                  marginRight: "1px",
                  maxHeight: "1px",
                  marginBottom: "25px",
                }}
              >
                <BsPauseFill size={25} color={"#227f08"} />{" "}
                {/* This could be your pause icon */}
              </button>
            ) : (
              <button
                onClick={toggleTimer}
                style={{
                  backgroundColor: "transparent",
                  marginRight: "1px",
                  maxHeight: "1px",
                  marginBottom: "25px",
                }}
              >
                <BsPlayFill size={25} /> {/* This could be your play icon */}
              </button>
            )
          ) : (
            <button
              style={{
                backgroundColor: "transparent",
                color: "transparent",
                marginRight: "4px",
                maxHeight: "35px",
              }}
            >
              <BsPlayFill size={20} /> {/* This could be your pause icon */}
            </button>
          )}
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
          <div className="countdownRun">
            {tilDone ? (
              <input
                type="text"
                value={`${Math.floor(elapsedTime / 60)}:${String(
                  elapsedTime % 60
                ).padStart(2, "0")}`}
                readOnly
                className={isRunning ? "isRunningCountdown" : ""}
                style={{
                  width: "100%",
                  textAlign: "center",
                  marginLeft: ".5rem",
                  marginRight: "1rem",
                }}
              />
            ) : (
              <input
                type="text"
                value={`${Math.floor(timeLeft / 60)}:${String(
                  timeLeft % 60
                ).padStart(2, "0")}`}
                readOnly
                className={isRunning ? "isRunningCountdown" : ""}
                style={{
                  width: "100%",
                  textAlign: "center",
                  marginLeft: ".5rem",
                  marginRight: "1rem",
                }}
              />
            )}
          </div>
        </div>
      </li>
    </div>
  );
};

export default ToDoItemRun;
