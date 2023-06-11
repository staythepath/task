import React, { useState, useEffect, useRef } from "react";
import { Draggable } from "react-beautiful-dnd";
import { auth } from "../config/firebase";

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
  const timeoutId = useRef(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const userId = auth.currentUser ? auth.currentUser.uid : null;

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
      handleUpdate(userId, updatedTask);
      onToggle(id, true);
      //
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
    userId,
  ]);

  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  const updateTask = () => {
    setIsEditing(false);
    if (!tilDone) {
      console.log({
        id,
        index,
        task,
        complete,
        primaryDuration,
        secondaryDuration,
        numCycles,
        tilDone,
        isRunning,
        order,
      });
      handleUpdate(userId, {
        id,
        index,
        task,
        complete,
        primaryDuration,
        secondaryDuration,
        numCycles,
        tilDone,
        isRunning,
        order,
      });
    } else {
      console.log({
        id,
        index,
        task,
        complete,
        primaryDuration,
        secondaryDuration,
        numCycles: 999,
        tilDone,
        order,
        isRunning,
      });
      handleUpdate(userId, {
        id,
        index,
        task,
        complete,
        primaryDuration,
        secondaryDuration,
        numCycles: 999,
        tilDone,
        isRunning,
        order,
      });
    }
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

  const toggleTimer = () => {
    const playBell = (times = 1) => {
      if (times > 0) {
        const audio = new Audio("/boxingbell.wav");
        audio.volume = volume / 100;
        audio.play();
        setTimeout(() => playBell(times - 1), 1000);
      }
    };
    setIsRunning(!isRunning);

    if (isRunning) {
      // If it's running currently, we are about to pause it. So, set runningTaskIndex to -1
      setRunningTaskIndex(-1);
    } else if (isTaskInTodos(id)) {
      playBell();
      // If it's paused currently, we are about to start it. So, set runningTaskIndex to the current index
      setRunningTaskIndex(index);
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(primaryDuration);
    setIsPrimary(true);
    setElapsedTime(0);
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
          <label
            className={
              isRunning ? "isRunning-checkbox-container" : "checkbox-container"
            }
          >
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
                handleUpdate(userId, updatedTask);
                onToggle(id, !complete);
              }}
            />
            <span className="checkbox"></span>
          </label>

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
              {tilDone ? (
                <input
                  type="text"
                  value={`${Math.floor(elapsedTime / 60)}:${String(
                    elapsedTime % 60
                  ).padStart(2, "0")}`}
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
                  value={`${Math.floor(timeLeft / 60)}:${String(
                    timeLeft % 60
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
                <button
                  onClick={onDelete}
                  style={{ marginLeft: "1rem" }}
                  className={
                    isRunning ? "isRunning-button" : "notRunning-button"
                  }
                >
                  Delete
                </button>
              </>
            )}

            {isRunning ? (
              <button
                className={
                  "notRunning-button" /*"button-84" Use this for the other button*/
                }
                style={{
                  marginLeft: "1rem",

                  textAlign: "center",
                }}
              >
                Edit
              </button>
            ) : (
              <button
                onClick={isEditing ? updateTask : toggleEdit}
                className={
                  isRunning
                    ? "isRunning-button"
                    : "notRunning-button" /*"button-84" Use this for the other button*/
                }
                style={{
                  marginLeft: "1rem",

                  textAlign: "center",
                }}
              >
                {isEditing ? "Done" : "Edit"}
              </button>
            )}
          </div>
        </li>
      )}
    </Draggable>
  );
};

export default ToDoItem;
