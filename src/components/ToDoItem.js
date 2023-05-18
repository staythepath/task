import React, { useState, useEffect, useRef } from "react";
import { Draggable } from "react-beautiful-dnd";

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

  useEffect(() => {
    setPrimaryDuration(initialPrimaryDuration);
    setSecondaryDuration(initialSecondaryDuration);
  }, [initialPrimaryDuration, initialSecondaryDuration]);

  useEffect(() => {
    setTimeLeft(isPrimary ? primaryDuration : secondaryDuration);
  }, [primaryDuration, secondaryDuration, isPrimary]);

  useEffect(() => {
    if (index === runningTaskIndex && isTaskInTodos(id)) {
      setIsRunning(true);
    }
  }, [runningTaskIndex, index, tilDone, isTaskInTodos, id]);

  useEffect(() => {
    let timer;

    const playSound = (times = 3) => {
      if (times > 0) {
        const audio = new Audio("/beep.wav");
        audio.play();
        setTimeout(() => playSound(times - 1), 1000);
      }
    };

    const handleTaskCompletion = () => {
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

    if (isRunning && timeLeft > 0 && !tilDone) {
      timer = setInterval(
        () => setTimeLeft((prevTimeLeft) => prevTimeLeft - 1),
        1000
      );
    } else if (!tilDone && timeLeft === 0) {
      clearInterval(timer);
      playSound();
      if (isPrimary) {
        setIsPrimary(false);
        setTimeLeft(secondaryDuration);
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
        } else {
          handleTaskCompletion();
        }
      }
    } else if (tilDone && isRunning) {
      timer = setInterval(
        () => setTimeLeft((prevTimeLeft) => prevTimeLeft + 1),
        1000
      );
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
  ]);

  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  const updateTask = () => {
    handleUpdate({
      id,
      index,
      task,
      complete,
      primaryDuration,
      secondaryDuration,
      numCycles,
    });
    setIsEditing(false);
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
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(tilDone ? 0 : primaryDuration);
    setIsPrimary(true);
  };


  return (
    <Draggable draggableId={draggableId} index={index}>
      {(provided) => (
        <li
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={ isRunning ? 'isRunning' : 'getItemStyle'}

        >
          <label className={ isRunning ? "isRunning-checkbox-container" : "checkbox-container"}>
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
            <span className="checkbox"></span>
          </label>

          {isEditing ? (
            <input
              type="text"
              value={task}
              onChange={(e) => {
                handleUpdate({
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
              style={{ marginLeft: "1rem", marginRight: "1rem",
              backgroundColor: isRunning ? "#abf296" : "transparent",
              color: isRunning ? "#227f08" : ""  }}  
              
            />
          ) : (
            <span style={complete ? crossedOutStyle : {}}>{task}</span>
          )}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-around",
            }}
          >
            {isEditing && (
              <>
                <div className="timer-btn-container">
                  <button
                    className={isRunning ? "isRunning-timer-change-btn-plus" : "timer-change-btn timer-change-btn-plus"}
                    disabled={tilDone}
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
                    className={isRunning ? "isRunning-timer-change-btn isRunning-timer-change-btn-minus" : "timer-change-btn timer-change-btn-minus"}
                    disabled={tilDone}
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
                    className={isRunning && primaryDurationFocused ? "isRunning-timer-input" : "number-input"}
                    style={{
                      borderColor: cyclesFocused ? "#666" : "transparent",
                      backgroundColor: cyclesFocused ? (isRunning ? "#abf296" : "#444") : "transparent",
                      color: isRunning ? "#227f08" : "",
                    }}
                    onFocus={() => setCyclesFocused(true)}
                    onBlur={() => {
                      setCyclesFocused(false);
                      setCyclesFocused(Math.min(setNumCycles, 1));
                    }}
                    disabled={tilDone}
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
                    className={isRunning ? "isRunning-timer-change-btn-plus" : "timer-change-btn timer-change-btn-plus"}
                    disabled={tilDone}
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
                    className={isRunning ? "isRunning-timer-change-btn isRunning-timer-change-btn-minus" : "timer-change-btn timer-change-btn-minus"}
                    disabled={tilDone}
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
                      borderColor: primaryDurationFocused ? "#666" : "transparent",
                      backgroundColor: primaryDurationFocused ? (!isRunning ? "#444" : "#abf296" ) : "transparent",
                      color: isRunning? "#227f08" : "",


                    }}
                    onFocus={() => setPrimaryDurationFocused(true)}
                    onBlur={() => {
                      setPrimaryDurationFocused(false);
                      setPrimaryDuration(Math.min(primaryDuration, 90 * 60));
                    }}
                    disabled={tilDone}
                  />
                </div>
                <div className="timer-btn-container">
                  <button
                    className={isRunning ? "isRunning-timer-change-btn-plus" : "timer-change-btn timer-change-btn-plus"}
                    disabled={tilDone}
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
                    className={isRunning ? "isRunning-timer-change-btn isRunning-timer-change-btn-minus" : "timer-change-btn timer-change-btn-minus"}
                    disabled={tilDone}
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
                      borderColor: secondaryDurationFocused ? "#666" : "transparent",
                      backgroundColor: secondaryDurationFocused ? (!isRunning ? "#444" : "#abf296") : "transparent",
                      color: isRunning? "#227f08" : "",


                    }}
                    onFocus={() => setSecondaryDurationFocused(true)}
                    onBlur={() => {
                      setSecondaryDurationFocused(false);
                      setSecondaryDuration(
                        Math.min(secondaryDuration, 90 * 60)
                      );
                    }}
                    disabled={tilDone}
                  />
                </div>
              </>
            )}

            <div className="countdown" >
              <input
                type="text"
                value={`${Math.floor(timeLeft / 60)}:${String(
                  timeLeft % 60
                ).padStart(2, "0")}`}
                readOnly
                className= {isRunning ? "isRunningCountdown" : "" }
                style={{
                  width: "100%",
                  textAlign: "center",
                  marginLeft: ".5rem",
                  
                }}
              />
            </div>
            {!isEditing && (
              <>
                <button
                  onClick={toggleTimer}
                  className= {isRunning ? "isRunning-button" : "notRunning-button" }
      
                >
                  {isRunning ? "Pause" : "Start"}
                </button>
                <button onClick={resetTimer} style={{ marginLeft: "1rem" }} className= {isRunning ? "isRunning-button" : "notRunning-button" }>
                  Reset
                </button>
                <button onClick={onDelete} style={{ marginLeft: "1rem" }} className= {isRunning ? "isRunning-button" : "notRunning-button" }>
                  Delete
                </button>
              </>
            )}
            <button
              onClick={isEditing ? updateTask : toggleEdit}
              className= {isRunning ? "isRunning-button" : "notRunning-button" }
              style={{
                marginLeft: "1rem",
                minWidth: "70px",
                maxWidth: "70px",
                textAlign: "center",
              }}
            >
              {isEditing ? "Done" : "Edit"}
            </button>
          </div>
        </li>
      )}
    </Draggable>
  );
};

export default ToDoItem;
