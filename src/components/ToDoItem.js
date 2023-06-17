import React, { useState, useEffect, useRef, useCallback } from "react";
import { Draggable } from "react-beautiful-dnd";
import { auth } from "../config/firebase";
import { useTimer, useStopwatch } from "react-use-precision-timer";

const ToDoItem = ({
  id,
  index,
  task,
  complete,
  primaryDuration: initialPrimaryDuration,
  secondaryDuration: initialSecondaryDuration,
  numCycles: initialNumCycles,
  onToggle,
  onDelete,
  handleUpdate,
  tilDone,
  runningTaskIndex,
  setRunningTaskIndex,
  isTaskInTodos,
  draggableId,
  volume,
  order,
  todos,
  isSpecial,
  elapsedTime,
  setElapsedTime,
  totalElapsedTime,
  handleElapsedTimeUpdate,
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
  const [isEditing, setIsEditing] = useState(false);
  const [primaryDurationFocused, setPrimaryDurationFocused] = useState(false);
  const [secondaryDurationFocused, setSecondaryDurationFocused] =
    useState(false);
  const [cyclesFocused, setCyclesFocused] = useState(false);
  const [currentCycle, setCurrentCycle] = useState(0);
  const [numCycles, setNumCycles] = useState(initialNumCycles);
  const [hasStarted, setHasStarted] = useState(false);

  const timeoutId = useRef(null);

  const userId = auth.currentUser ? auth.currentUser.uid : null;
  const stopwatch = useStopwatch();

  const playBell = (times = 1) => {
    if (times > 0) {
      const audio = new Audio("/boxingbell.wav");
      audio.volume = volume / 100;
      audio.play();
      setTimeout(() => playBell(times - 1), 1000);
    }
  };

  useEffect(() => {
    setPrimaryDuration(initialPrimaryDuration);
    setSecondaryDuration(initialSecondaryDuration);
  }, [initialPrimaryDuration, initialSecondaryDuration]);

  useEffect(() => {
    if (index === runningTaskIndex && isTaskInTodos(id)) {
      timer.start();
      if (!hasStarted) {
        stopwatch.start();
        setHasStarted(true);
      }
      setIsRunning(true);
    } else {
      timer.stop();
    }
  }, [runningTaskIndex, index, tilDone, isTaskInTodos, id]);

  useEffect(() => {
    if (isPrimary) {
      setTimeLeft(primaryDuration);
    } else {
      setTimeLeft(secondaryDuration);
    }
  }, [primaryDuration, secondaryDuration, isPrimary]);

  const updateElapsedTime = useCallback(() => {
    const elapsed = stopwatch.getElapsedRunningTime();
    setElapsedTime(elapsed);
  }, [stopwatch, setElapsedTime]);

  const timerCallback = useCallback(
    (overdueCallCount) => {
      setTimeLeft((prevTimeLeft) => {
        let newTimeLeft = prevTimeLeft - 1;

        if (newTimeLeft === 0) {
          playBell();
          if (isPrimary) {
            setIsPrimary(false);
            newTimeLeft = secondaryDuration;
          } else {
            setCurrentCycle((currentCycle) => currentCycle + 1);
            if (currentCycle + 1 === numCycles) {
              // Update elapsed time before marking the task as complete
              updateElapsedTime();
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
                totalElapsedTime: elapsedTime, // now, elapsedTime should be up-to-date
              };

              handleUpdate(userId, updatedTask).then(() => {
                onToggle(id, !complete, elapsedTime);
              });
              resetTimer();
            } else {
              setIsPrimary(true);
              newTimeLeft = primaryDuration;
            }
          }
        }

        return newTimeLeft;
      });
    },
    // Add updateElapsedTime to the dependency array
    [
      secondaryDuration,
      primaryDuration,
      isPrimary,
      numCycles,
      currentCycle,
      stopwatch,
      updateElapsedTime,
    ]
  );

  const timer = useTimer({ delay: 1000 }, timerCallback);

  const toggleTimer = () => {
    if (timer.isRunning()) {
      timer.stop();
      stopwatch.pause();
      setIsRunning(false);
      playBell();
      // If it's running currently, we are about to pause it. So, set runningTaskIndex to -1
      setRunningTaskIndex(-1);
    } else if (isTaskInTodos(id)) {
      playBell();
      // If it's paused currently, we are about to start it. So, set runningTaskIndex to the current index
      setRunningTaskIndex(index);
      timer.start();
      if (hasStarted) {
        stopwatch.resume();
      } else {
        stopwatch.start();
        setHasStarted(true);
      }
      setIsRunning(true);
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(primaryDuration);
    setIsPrimary(true);
    setElapsedTime(0);
    stopwatch.stop();
    setHasStarted(false);
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  const handleTaskCompletion = useCallback(() => {
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
      totalElapsedTime,
    };

    handleUpdate(userId, updatedTask).then(() => {
      onToggle(id, !complete, elapsedTime); // Pass the elapsedTime value to the handleToggle function
    });
    resetTimer();
  }, [
    elapsedTime,
    updateElapsedTime,
    timer,
    stopwatch,
    handleUpdate,
    userId,
    onToggle,
    id,
    index,
    task,
    primaryDuration,
    secondaryDuration,
    numCycles,
    tilDone,
  ]);

  useEffect(() => {
    if (isRunning) {
      // Start the stopwatch
      stopwatch.resume();

      // Create an interval that updates every second
      const intervalId = setInterval(() => {
        setElapsedTime(stopwatch.getElapsedRunningTime());
      }, 1000);

      // Clean up function to clear the interval when the component unmounts or isRunning changes to false
      return () => {
        clearInterval(intervalId);
      };
    } else {
      // Stop the stopwatch and clear elapsed time when isRunning is false
      stopwatch.pause();
    }
  }, [isRunning, stopwatch, setElapsedTime]);

  const updateTask = () => {
    setIsEditing(false);
    const updatedTask = {
      id,
      index,
      task,
      complete,
      primaryDuration,
      secondaryDuration,
      numCycles: tilDone ? 999 : numCycles,
      tilDone,
      isRunning,
      order,
      totalElapsedTime: elapsedTime,
    };
    handleUpdate(userId, updatedTask);
  };

  const handleMouseDown = (operation, value, setValue) => {
    const changeValue = () => {
      setValue((prevValue) => operation(prevValue));
    };

    const accelerateChange = () => {
      changeValue();
      timeoutId.current = window.setTimeout(accelerateChange, 240);
    };

    accelerateChange();
  };

  const handleMouseUp = () => {
    window.clearTimeout(timeoutId.current);
  };

  const crossedOutStyle = {
    textDecoration: "line-through",
    opacity: 0.5,
  };

  return (
    <Draggable draggableId={draggableId} index={index}>
      {(provided) => (
        <li
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={
            isRunning
              ? isEditing
                ? "isRunning-isEditingTask"
                : "isRunning"
              : isEditing
              ? " task-isEditingTask"
              : "task"
          }
          //        className={ isRunning ? { isEditing ? 'isRunning-isEditingTask' : "isRunning-task"} : {isEditing ? "editing-task" : "task"}}
        >
          {!isSpecial && (
            <label
              className={
                isRunning
                  ? "isRunning-checkbox-container"
                  : "checkbox-container"
              }
            >
              <input
                type="checkbox"
                checked={complete}
                onChange={() => {
                  console.log("from the jsx", elapsedTime);
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
                    totalElapsedTime,
                  };

                  handleUpdate(userId, updatedTask).then(() => {
                    onToggle(id, !complete, elapsedTime); // Pass the elapsedTime value to the handleToggle function
                  });
                  resetTimer();
                }}
              />

              <span className="checkbox"></span>
            </label>
          )}
          {isEditing ? (
            <input
              type="text"
              value={task}
              onChange={(e) => {
                handleUpdate(userId, {
                  ...{
                    id,
                    index,
                    task,
                    complete,
                    primaryDuration,
                    secondaryDuration,
                    onToggle,
                    onDelete,
                    handleUpdate,
                  },
                  task: e.target.value,
                });
              }}
              style={{
                marginLeft: "20px",
                marginRight: "15px",

                minWidth: "2rem",
                backgroundColor: isRunning ? "#abf296" : "#66666667",
                color: isRunning ? "#227f08" : "",
              }}
            />
          ) : (
            <span style={complete ? crossedOutStyle : { marginRight: "1rem" }}>
              {task}
            </span>
          )}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-around",
              backgroundColor: "transparent",
              margin: "1px",
            }}
          >
            {isEditing && (
              <>
                <div className="timer-btn-container">
                  <button
                    className={
                      isRunning
                        ? "isRunning-timer-change-btn-plus"
                        : "timer-change-btn timer-change-btn-plus"
                    }
                    onMouseDown={() =>
                      handleMouseDown(
                        (prev) => prev + 1,
                        numCycles,
                        setNumCycles
                      )
                    }
                    onMouseUp={handleMouseUp}
                    onTouchStart={() =>
                      handleMouseDown(
                        (prev) => prev + 1,
                        numCycles,
                        setNumCycles
                      )
                    }
                    onTouchEnd={handleMouseUp}
                  >
                    +
                  </button>
                  <button
                    className={
                      isRunning
                        ? "isRunning-timer-change-btn isRunning-timer-change-btn-minus"
                        : "timer-change-btn timer-change-btn-minus"
                    }
                    onMouseDown={() =>
                      handleMouseDown(
                        (prev) => Math.max(1, prev - 1),
                        numCycles,
                        setNumCycles
                      )
                    }
                    onMouseUp={handleMouseUp}
                    onTouchStart={() =>
                      handleMouseDown(
                        (prev) => Math.max(1, prev - 1),
                        numCycles,
                        setNumCycles
                      )
                    }
                    onTouchEnd={handleMouseUp}
                  >
                    -
                  </button>
                </div>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <div style={{ marginLeft: "1px", marginRight: "3px" }}>
                    Cycles:
                  </div>
                  <input
                    type="text"
                    pattern="\d*"
                    value={numCycles}
                    onChange={(e) => setNumCycles(parseInt(e.target.value))}
                    className={
                      isRunning && primaryDurationFocused
                        ? "isRunning-timer-input"
                        : "number-input"
                    }
                    style={{
                      borderColor: cyclesFocused ? "#666" : "#666",
                      backgroundColor: cyclesFocused
                        ? isRunning
                          ? "#abf296"
                          : "#66666667"
                        : "#66666667",
                      color: isRunning ? "#227f08" : "",
                    }}
                    onFocus={() => setCyclesFocused(true)}
                    onBlur={() => {
                      setCyclesFocused(false);
                      if (!tilDone) setCyclesFocused(Math.min(setNumCycles, 1));
                      else return;
                    }}
                  />
                </div>
                <input
                  id={`todo-${id}-hidden-input-primary`}
                  type="number"
                  value={primaryDuration / 60}
                  onChange={(e) =>
                    setPrimaryDuration(
                      Math.max(0, parseInt(e.target.value, 10) * 60)
                    )
                  }
                  className="hidden-timer-input"
                  min="0"
                />
                <input
                  id={`todo-${id}-hidden-input-secondary`}
                  type="number"
                  value={secondaryDuration / 60}
                  onChange={(e) =>
                    setSecondaryDuration(
                      Math.max(0, parseInt(e.target.value, 10) * 60)
                    )
                  }
                  className="hidden-timer-input"
                  min="0"
                />

                <div className="timer-btn-container">
                  <button
                    className={
                      isRunning
                        ? "isRunning-timer-change-btn-plus"
                        : "timer-change-btn timer-change-btn-plus"
                    }
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleMouseDown(
                        (value) => Math.min(value + 60, 90 * 60),
                        primaryDuration,
                        setPrimaryDuration
                      );
                    }}
                    onMouseUp={handleMouseUp}
                  >
                    +
                  </button>
                  <button
                    className={
                      isRunning
                        ? "isRunning-timer-change-btn isRunning-timer-change-btn-minus"
                        : "timer-change-btn timer-change-btn-minus"
                    }
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleMouseDown(
                        (value) => Math.max(value - 60, 0),
                        primaryDuration,
                        setPrimaryDuration
                      );
                    }}
                    onMouseUp={handleMouseUp}
                  >
                    -
                  </button>
                </div>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <div style={{ marginLeft: "1px" }}>Minutes:</div>
                  <input
                    type="text"
                    pattern="\d*"
                    value={
                      isNaN(primaryDuration / 60) || primaryDuration === null
                        ? "00"
                        : Math.floor(primaryDuration / 60)
                    }
                    onChange={(e) => {
                      const value =
                        e.target.value === ""
                          ? 0
                          : parseInt(e.target.value, 10);
                      if (!isNaN(value)) {
                        setPrimaryDuration(value * 60);
                      }
                    }}
                    className="timer-input"
                    style={{
                      borderColor: primaryDurationFocused ? "#666" : "#666",
                      backgroundColor: primaryDurationFocused
                        ? !isRunning
                          ? "#66666667"
                          : "#abf296"
                        : "#66666667",
                      color: isRunning ? "#227f08" : "",
                    }}
                    onFocus={() => setPrimaryDurationFocused(true)}
                    onBlur={() => {
                      setPrimaryDurationFocused(false);
                      setPrimaryDuration(Math.min(primaryDuration, 90 * 60));
                    }}
                  />
                </div>
                <div className="timer-btn-container">
                  <button
                    className={
                      isRunning
                        ? "isRunning-timer-change-btn-plus"
                        : "timer-change-btn timer-change-btn-plus"
                    }
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleMouseDown(
                        (value) => Math.min(value + 60, 90 * 60),
                        secondaryDuration,
                        setSecondaryDuration
                      );
                    }}
                    onMouseUp={handleMouseUp}
                  >
                    +
                  </button>

                  <button
                    className={
                      isRunning
                        ? "isRunning-timer-change-btn isRunning-timer-change-btn-minus"
                        : "timer-change-btn timer-change-btn-minus"
                    }
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleMouseDown(
                        (value) => Math.max(value - 60, 0),
                        secondaryDuration,
                        setSecondaryDuration
                      );
                    }}
                    onMouseUp={handleMouseUp}
                  >
                    -
                  </button>
                </div>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <div style={{ marginLeft: "1px", marginRight: "0px" }}>
                    Minutes:
                  </div>
                  <input
                    type="text"
                    pattern="\d*"
                    value={
                      isNaN(secondaryDuration / 60) ||
                      secondaryDuration === null
                        ? "00"
                        : Math.floor(secondaryDuration / 60)
                    }
                    onChange={(e) => {
                      const value =
                        e.target.value === ""
                          ? 0
                          : parseInt(e.target.value, 10);
                      if (!isNaN(value)) {
                        setSecondaryDuration(value * 60);
                      }
                    }}
                    className="timer-input"
                    style={{
                      borderColor: secondaryDurationFocused ? "#666" : "#666",
                      backgroundColor: secondaryDurationFocused
                        ? !isRunning
                          ? "#66666667"
                          : "#abf296"
                        : "#66666667",
                      color: isRunning ? "#227f08" : "",
                    }}
                    onFocus={() => setSecondaryDurationFocused(true)}
                    onBlur={() => {
                      setSecondaryDurationFocused(false);
                      setSecondaryDuration(
                        Math.min(secondaryDuration, 90 * 60)
                      );
                    }}
                  />
                </div>
              </>
            )}

            <div className="countdown">
              {!complete ? (
                <>
                  {tilDone ? (
                    <input
                      type="text"
                      value={`${
                        Math.floor(elapsedTime / 3600)
                          ? Math.floor(elapsedTime / 3600) + ":"
                          : ""
                      }${String(Math.floor(elapsedTime / 60) % 60).padStart(
                        2,
                        "0"
                      )}:${String(elapsedTime % 60).padStart(2, "0")}`}
                      readOnly
                      className={isRunning ? "isRunningCountdown" : "countdown"}
                      style={{
                        width: "100%",
                        textAlign: "center",
                        marginLeft: ".5rem",
                        marginRight: ".5rem",
                      }}
                    />
                  ) : (
                    <input
                      type="text"
                      value={`${
                        Math.floor(timeLeft / 3600)
                          ? Math.floor(timeLeft / 3600) + ":"
                          : ""
                      }${String(Math.floor(timeLeft / 60) % 60).padStart(
                        2,
                        "0"
                      )}:${String(timeLeft % 60).padStart(2, "0")}`}
                      readOnly
                      className={isRunning ? "isRunningCountdown" : "countdown"}
                      style={{
                        width: "100%",
                        textAlign: "center",
                        marginLeft: ".5rem",
                      }}
                    />
                  )}
                </>
              ) : (
                <input
                  type="text"
                  value={`${
                    Math.floor(totalElapsedTime / (1000 * 60 * 60)) > 0
                      ? String(
                          Math.floor(totalElapsedTime / (1000 * 60 * 60))
                        ).padStart(2, "0") + ":"
                      : ""
                  }${String(
                    Math.floor(totalElapsedTime / (1000 * 60)) % 60
                  ).padStart(2, "0")}:${String(
                    Math.floor(totalElapsedTime / 1000) % 60
                  ).padStart(2, "0")}`}
                  readOnly
                  className={isRunning ? "isRunningCountdown" : "countdown"}
                  style={{
                    width: "100%",
                    textAlign: "center",
                    marginLeft: ".5rem",
                  }}
                />
              )}
            </div>

            {!complete && (
              <>
                {!isEditing && (
                  <>
                    {!complete && (
                      <button
                        onClick={toggleTimer}
                        className={
                          isRunning ? "isRunning-button" : "notRunning-button"
                        }
                      >
                        {isRunning ? "Pause" : "Start"}
                      </button>
                    )}

                    <button
                      onClick={resetTimer}
                      style={{ marginLeft: "1rem" }}
                      className={
                        isRunning ? "isRunning-button" : "notRunning-button"
                      }
                    >
                      Reset
                    </button>

                    {!isSpecial && (
                      <button
                        onClick={onDelete}
                        style={{ marginLeft: "1rem" }}
                        className={
                          isRunning ? "isRunning-button" : "notRunning-button"
                        }
                      >
                        Delete
                      </button>
                    )}
                  </>
                )}

                {!isSpecial && (
                  <button
                    onClick={isEditing ? updateTask : toggleEdit}
                    className={
                      isRunning ? "isRunning-button" : "notRunning-button"
                    }
                    style={{ marginLeft: "1rem", textAlign: "center" }}
                  >
                    {isEditing ? "Done" : "Edit"}
                  </button>
                )}
              </>
            )}
          </div>
        </li>
      )}
    </Draggable>
  );
};

export default ToDoItem;
