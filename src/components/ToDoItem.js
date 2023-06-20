import React, { useState, useEffect, useRef, useCallback } from "react";
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
  isSpecial,
  elapsedTime,
  setElapsedTime,
  totalElapsedTime,
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
  const [timer, setTimer] = useState(null);
  const timeoutId = useRef(null);
  const [elapsedShow, setElapsedShow] = useState(0);

  const userId = auth.currentUser ? auth.currentUser.uid : null;

  const worker = new Worker(`${process.env.PUBLIC_URL}/workerBootstrap.js`);

  const playBell = useCallback(
    (times = 1) => {
      if (times > 0) {
        const audio = new Audio("/boxingbell.wav");
        // Check if volume is finite, if not set a default value
        audio.volume = isFinite(volume) ? volume / 100 : 0.5;
        audio.play();
        setTimeout(() => playBell(times - 1), 1000);
      }
    },
    [volume]
  );

  const playApplause = useCallback(
    (times = 1) => {
      if (times > 0) {
        const audio = new Audio("/applause.mp3");
        // Check if volume is finite, if not set a default value
        audio.volume = isFinite(volume) ? volume / 100 : 0.5;
        audio.play();
        setTimeout(() => playApplause(times - 1), 1000);
      }
    },
    [volume]
  );

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

  const handleTaskCompletion = useCallback(() => {
    console.log("from handleTaskCompletion", elapsedTime);
    setIsRunning(false);

    console.log("elapsedTime: ", elapsedTime);
    const updatedTask = {
      id,
      index,
      task,
      primaryDuration,
      secondaryDuration,
      numCycles,
      tilDone,
      isRunning: false,
      totalElapsedTime: elapsedTime, // use the state value here
    };
    console.log("from handleTaskCompletion", updatedTask);
    handleUpdate(userId, updatedTask);
    onToggle(id, true);

    setElapsedTime(0);

    //
  }, [
    elapsedTime,
    setElapsedTime,
    id,
    index,
    task,
    primaryDuration,
    secondaryDuration,
    numCycles,
    tilDone,
    handleUpdate,
    userId,
    onToggle,
  ]);

  // Countdown useEffect
  useEffect(() => {
    if (isRunning && !timer) {
      worker.postMessage("start");
      worker.onmessage = (e) => {
        setTimeLeft((prevTimeLeft) => prevTimeLeft - 1);
        setElapsedTime((prevElapsedTime) => prevElapsedTime + 1);
        setElapsedShow((prevElapsedShow) => prevElapsedShow + 1);
      };
      setTimer(worker);
    } else if (!isRunning && timer) {
      timer.postMessage("stop");
      timer.terminate();
      setTimer(null);
    }

    return () => {
      if (timer) {
        timer.postMessage("stop");
        timer.terminate();
        setTimer(null);
      }
    };
  }, [isRunning, timer, setElapsedTime]);

  // Timer logic useEffect
  useEffect(() => {
    if (timeLeft === 0) {
      playBell();

      if (isRunning && timer) {
        timer.postMessage("stop");
        timer.terminate();
      }

      if (isPrimary) {
        setIsPrimary(false);
        setTimeLeft(secondaryDuration);

        if (currentCycle === numCycles - 1) {
          playApplause();
          let worker = new Worker("./timerWorker.js");
          worker.postMessage("start");
          worker.onmessage = (e) => {
            setTimeLeft((prevTimeLeft) => prevTimeLeft - 1);
          };
          setTimer(worker);
        } else {
          let worker = new Worker("./timerWorker.js");
          worker.postMessage("start");
          worker.onmessage = (e) => {
            setTimeLeft((prevTimeLeft) => prevTimeLeft - 1);
          };
          setTimer(worker);
        }
      } else {
        setCurrentCycle(currentCycle < numCycles - 1 ? currentCycle + 1 : 0);
        setIsPrimary(!isPrimary);
        setTimeLeft(isPrimary ? secondaryDuration : primaryDuration);

        // Check if it's the last secondary cycle
        if (currentCycle < numCycles - 1) {
          const interval = setInterval(() => {
            setTimeLeft((prevTimeLeft) => prevTimeLeft - 1);
          }, 1000);

          setTimer(interval);
        } else {
          // if it's the last secondary cycle
          // we allow the last secondary countdown to run before running handleTaskCompletion
          if (timeLeft === 0 && currentCycle === numCycles - 1 && !isPrimary) {
            handleTaskCompletion();
          }
        }
      }
    }
  }, [
    timeLeft,
    isRunning,
    currentCycle,
    numCycles,
    isPrimary,
    timer,
    handleTaskCompletion,
    secondaryDuration,
    primaryDuration,
    playBell,
    playApplause,
  ]);

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(primaryDuration);
    setIsPrimary(true);
    setElapsedTime(0);
    setElapsedShow(0);
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

  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  const updateTask = () => {
    setIsEditing(false);
    console.log("elapsedTime from updateTask", elapsedTime);
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
        totalElapsedTime: elapsedTime,
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
        totalElapsedTime: elapsedTime,
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
                    totalElapsedTime: elapsedTime,
                  };

                  handleUpdate(userId, updatedTask).then(() => {
                    onToggle(id, !complete);
                  });
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
                    <div>
                      <input
                        type="text"
                        value={formatTime(elapsedShow)}
                        readOnly
                        className={
                          isRunning ? "isRunningCountdown" : "countdown"
                        }
                        style={{
                          width: "100%",
                          textAlign: "center",
                          marginLeft: ".5rem",
                          marginRight: ".5rem",
                        }}
                      />
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={formatTime(timeLeft)}
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
                  value={formatTime(totalElapsedTime)}
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
