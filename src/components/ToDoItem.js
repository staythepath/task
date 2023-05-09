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
  const [currentCycle, setCurrentCycle] = useState(0);
  const [numCycles, setNumCycles] = useState(initialNumCycles);

  useEffect(() => {
    setPrimaryDuration(initialPrimaryDuration);
    setSecondaryDuration(initialSecondaryDuration);
  }, [initialPrimaryDuration, initialSecondaryDuration]);

  useEffect(() => {
    setTimeLeft(isPrimary ? primaryDuration : secondaryDuration);
  }, [primaryDuration, secondaryDuration, isPrimary]);

  useEffect(() => {
    let timer;

    const playSound = () => {
      const audio = new Audio("/beep.wav");
      audio.play();
    };

    const runTimer = () => {
      timer = setInterval(() => {
        setTimeLeft((prevTimeLeft) => prevTimeLeft - 1);
      }, 1000);
    };

    const handleTaskCompletion = (onToggle) => {
      setIsRunning(false);
      onToggle(id, true);
      handleUpdate({
        id,
        index,
        task,
        primaryDuration,
        secondaryDuration,
        numCycles,
        tilDone,
        isRunning: false,
      });
      setTimeout(() => {
        onToggle(id, true);
      }, 1);
    };

    if (isRunning && timeLeft > 0 && !tilDone) {
      runTimer();
    } else if (!isRunning) {
      clearInterval(timer);
      handleUpdate({
        id,
        index,
        task,
        primaryDuration,
        secondaryDuration,
        numCycles,
        tilDone,
        isRunning: false,
      });
    } else if (!tilDone && timeLeft === 0) {
      clearInterval(timer);
      playSound();

      if (isPrimary) {
        setIsPrimary(false);
        setTimeLeft(secondaryDuration);
        runTimer();
      } else {
        if (currentCycle < numCycles - 1) {
          setCurrentCycle(currentCycle + 1);
          setIsPrimary(true);
          setTimeLeft(primaryDuration);
          runTimer();
        } else {
          handleTaskCompletion(onToggle);
        }
      }
    } else if (tilDone) {
      timer = setInterval(() => {
        setTimeLeft((prevTimeLeft) => prevTimeLeft + 1);
      }, 1000);
    }

    return () => {
      clearInterval(timer);
    };
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
  ]);

  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  const colonDisplayStyle = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: ".01rem",
    margin: "0 0rem",
    lineHeight: "1",
    verticalAlign: "middle",
    cursor: "text",
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

  const timerDisplayStyle = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "1.2rem",
    margin: "0 0.5rem",
    marginRight: "0.03rem",
    marginLeft: ".4rem",
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
    item: { id, index },
  });
  const [, drop] = useDrop({
    accept: ItemTypes.TODO_ITEM,
    hover(item, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      moveItem(dragIndex, hoverIndex);
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
          onToggle();
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
            <div className="cycle-input">
              <input
                type="number"
                min="1"
                className="cycle-input-field"
                value={numCycles}
                onChange={(e) => setNumCycles(parseInt(e.target.value))}
              />
              <div className="cycle-btn-container">
                <button
                  className="cycle-change-btn cycle-change-btn-plus"
                  onClick={() => setNumCycles(numCycles + 1)}
                >
                  +
                </button>
                <button
                  className="cycle-change-btn cycle-change-btn-minus"
                  onClick={() => setNumCycles(Math.max(1, numCycles - 1))}
                >
                  -
                </button>
              </div>
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
            <div style={{ ...colonDisplayStyle, cursor: "default" }}>:</div>
            <div style={timerDisplayStyle}>
              {isNaN(primaryDuration % 60) || primaryDuration === null
                ? "00"
                : String(primaryDuration % 60).padStart(2, "0")}
            </div>
            <div className="timer-btn-container">
              <button
                className="timer-change-btn timer-change-btn-plus"
                onClick={(e) => {
                  e.preventDefault();
                  if (primaryDuration < 90 * 60)
                    setPrimaryDuration(primaryDuration + 60);
                }}
              >
                +
              </button>
              <button
                className="timer-change-btn timer-change-btn-minus"
                onClick={(e) => {
                  e.preventDefault();
                  setPrimaryDuration(Math.max(0, primaryDuration - 60));
                }}
              >
                -
              </button>
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
                borderColor: secondaryDurationFocused ? "#666" : "transparent",
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
            <div style={{ ...colonDisplayStyle, cursor: "default" }}>:</div>
            <div style={timerDisplayStyle}>
              {isNaN(secondaryDuration % 60) || secondaryDuration === null
                ? "00"
                : String(secondaryDuration % 60).padStart(2, "0")}
            </div>
            <div className="timer-btn-container">
              <button
                className="timer-change-btn timer-change-btn-plus"
                onClick={(e) => {
                  e.preventDefault();
                  if (secondaryDuration < 90 * 60)
                    setSecondaryDuration(secondaryDuration + 60);
                }}
              >
                +
              </button>
              <button
                className="timer-change-btn timer-change-btn-minus"
                onClick={(e) => {
                  e.preventDefault();
                  setSecondaryDuration(Math.max(0, secondaryDuration - 60));
                }}
              >
                -
              </button>
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
          onClick={toggleEdit}
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
