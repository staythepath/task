import React, { useState, useEffect, useRef } from "react";
import { useDrag, useDrop } from "react-dnd";
import { ItemTypes } from "../ItemTypes";

const ToDoItem = ({
  id,
  index,
  moveItem,
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
    if (index === runningTaskIndex && !tilDone && isTaskInTodos(id)) {
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

  const countdownDisplayStyle = {
    width: "3rem",
    textAlign: "center",
    marginRight: "1rem",
  };
  const ref = useRef(null);
  const handleRef = useRef(null);
  const [, drag] = useDrag({
    type: ItemTypes.TODO_ITEM,
    item: { id, index, complete },
  });
  const [, drop] = useDrop({
    accept: ItemTypes.TODO_ITEM,
    hover(item, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;
      const isCompleted = item.complete;

      if (dragIndex === hoverIndex) {
        return;
      }

      moveItem(dragIndex, hoverIndex, isCompleted);
      item.index = hoverIndex;
    },
  });
  drag(handleRef);
  drop(ref);

  return (
    <li ref={ref} style={{ display: "flex", alignItems: "center" }}>
      <div
        ref={handleRef}
        className="handle"
        style={{
          cursor: "grab",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          marginRight: "10px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div
            style={{
              width: "4px",
              height: "4px",
              backgroundColor: "#999",
              borderRadius: "50%",
              marginRight: "4px",
            }}
          ></div>
          <div
            style={{
              width: "4px",
              height: "4px",
              backgroundColor: "#999",
              borderRadius: "50%",
            }}
          ></div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "5px",
            marginBottom: "5px",
          }}
        >
          <div
            style={{
              width: "4px",
              height: "4px",
              backgroundColor: "#999",
              borderRadius: "50%",
              marginRight: "4px",
            }}
          ></div>
          <div
            style={{
              width: "4px",
              height: "4px",
              backgroundColor: "#999",
              borderRadius: "50%",
            }}
          ></div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div
            style={{
              width: "4px",
              height: "4px",
              backgroundColor: "#999",
              borderRadius: "50%",
              marginRight: "4px",
            }}
          ></div>
          <div
            style={{
              width: "4px",
              height: "4px",
              backgroundColor: "#999",
              borderRadius: "50%",
            }}
          ></div>
        </div>
      </div>
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

      {isEditing ? (
        <input
          type="text"
          value={task}
          onChange={(e) => {
            handleUpdate({
              ...{
                id,
                index,
                moveItem,
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
          style={{ marginLeft: "1rem", marginRight: "1rem" }}
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
                className="timer-change-btn timer-change-btn-plus"
                disabled={tilDone}
                onMouseDown={() =>
                  handleMouseDown((prev) => prev + 1, numCycles, setNumCycles)
                }
                onMouseUp={handleMouseUp}
                onTouchStart={() =>
                  handleMouseDown((prev) => prev + 1, numCycles, setNumCycles)
                }
                onTouchEnd={handleMouseUp}
              >
                +
              </button>
              <button
                className="timer-change-btn timer-change-btn-minus"
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
                className="timer-input"
                style={{
                  borderColor: cyclesFocused ? "#666" : "transparent",
                  backgroundColor: cyclesFocused ? "#444" : "transparent",
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
                className="timer-change-btn timer-change-btn-plus"
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
                className="timer-change-btn timer-change-btn-minus"
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
                    e.target.value === "" ? 0 : parseInt(e.target.value, 10);
                  if (!isNaN(value)) {
                    setPrimaryDuration(value * 60);
                  }
                }}
                className="timer-input"
                style={{
                  borderColor: primaryDurationFocused ? "#666" : "transparent",
                  backgroundColor: primaryDurationFocused
                    ? "#444"
                    : "transparent",
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
                className="timer-change-btn timer-change-btn-plus"
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
                className="timer-change-btn timer-change-btn-minus"
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
                  isNaN(secondaryDuration / 60) || secondaryDuration === null
                    ? "00"
                    : Math.floor(secondaryDuration / 60)
                }
                onChange={(e) => {
                  const value =
                    e.target.value === "" ? 0 : parseInt(e.target.value, 10);
                  if (!isNaN(value)) {
                    setSecondaryDuration(value * 60);
                  }
                }}
                className="timer-input"
                style={{
                  borderColor: secondaryDurationFocused
                    ? "#666"
                    : "transparent",
                  backgroundColor: secondaryDurationFocused
                    ? "#444"
                    : "transparent",
                }}
                onFocus={() => setSecondaryDurationFocused(true)}
                onBlur={() => {
                  setSecondaryDurationFocused(false);
                  setSecondaryDuration(Math.min(secondaryDuration, 90 * 60));
                }}
                disabled={tilDone}
              />
            </div>
          </>
        )}

        <div style={countdownDisplayStyle}>
          <input
            type="text"
            value={`${Math.floor(timeLeft / 60)}:${String(
              timeLeft % 60
            ).padStart(2, "0")}`}
            readOnly
            style={{ width: "100%", textAlign: "center", marginLeft: ".5rem" }}
          />
        </div>
        {!isEditing && (
          <>
            <button
              onClick={toggleTimer}
              style={{ marginLeft: "1rem", minWidth: "72px", maxWidth: "72px" }}
            >
              {isRunning ? "Pause" : "Start"}
            </button>
            <button onClick={resetTimer} style={{ marginLeft: "1rem" }}>
              Reset
            </button>
            <button onClick={onDelete} style={{ marginLeft: "1rem" }}>
              Delete
            </button>
          </>
        )}
        <button
          onClick={isEditing ? updateTask : toggleEdit}
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
  );
};

export default ToDoItem;
