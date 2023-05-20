import React, { useState } from "react";

const NewTaskForm = ({ onSubmit }) => {
  const [task, setTask] = useState("");
  const [primaryDuration, setPrimaryDuration] = useState(25 * 60);
  const [secondaryDuration, setSecondaryDuration] = useState(5 * 60);
  const [numCycles, setNumCycles] = useState(1);
  const [tilDone, setTilDone] = useState(false);
  const timeoutId = React.useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (task.trim()) {
      onSubmit(
        task.trim(),
        primaryDuration,
        secondaryDuration,
        numCycles,
        tilDone
      );
      setTask("");
      setPrimaryDuration(25 * 60);
      setSecondaryDuration(5 * 60);
      setNumCycles(1);
      if (tilDone) {
        onSubmit(task.trim(), primaryDuration, secondaryDuration, 999, tilDone);
      } else {
        onSubmit(
          task.trim(),
          primaryDuration,
          secondaryDuration,
          numCycles,
          tilDone
        );
      }
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

  const [cyclesFocused, setCyclesFocused] = useState(false);
  const [primaryDurationFocused, setPrimaryDurationFocused] = useState(false);
  const [secondaryDurationFocused, setSecondaryDurationFocused] =
    useState(false);

  const countdownDisplayStyle = {
    width: "3rem",
    textAlign: "center",
    marginRight: "1rem",
  };

  return (
    <form onSubmit={handleSubmit} style={{ alignItems: "center" }}>
      <input
        type="text"
        value={task}
        onChange={(e) => setTask(e.target.value)}
        placeholder="Add new task"
      />

      <div style={{ display: "flex", minWidth: "81px" }}>
        <label htmlFor="til-done">
          <input
            height="50px"
            type="checkbox"
            id="til-done"
            checked={tilDone}
            onChange={() => setTilDone(!tilDone)}
            style={{ marginRight: "4px" }}
          />
          Til Done
        </label>
      </div>
      <div className="timer-btn-container">
        <button
          className="timer-change-btn timer-change-btn-plus"
          type="button"
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
          type="button"
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
        <div style={{ marginLeft: "3px", marginRight: "0px" }}>Cycles:</div>
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
        />
      </div>
      <div className="timer-btn-container">
        <button
          className="timer-change-btn timer-change-btn-plus"
          type="button"
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
          type="button"
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
        <div style={{ marginLeft: "3px", marginRight: "0px" }}>Minutes:</div>
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
            backgroundColor: primaryDurationFocused ? "#444" : "transparent",
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
          className="timer-change-btn timer-change-btn-plus"
          type="button"
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
          type="button"
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
        <div style={{ marginLeft: "1px", marginRight: "0px" }}>Minutes:</div>
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
            backgroundColor: secondaryDurationFocused ? "#444" : "transparent",
          }}
          onFocus={() => setSecondaryDurationFocused(true)}
          onBlur={() => {
            setSecondaryDurationFocused(false);
            setSecondaryDuration(Math.min(secondaryDuration, 90 * 60));
          }}
        />
        <div style={countdownDisplayStyle}>
          <input
            type="text"
            value={
              ((primaryDuration + secondaryDuration) * numCycles) / 60 + ":00"
            }
            readOnly
            style={{ width: "100%", textAlign: "center", marginLeft: ".5rem" }}
          />
        </div>
      </div>

      <button
        type="submit"
        style={{ marginLeft: "1rem", minWidth: "70px", maxWidth: "70px" }}
      >
        Add
      </button>
    </form>
  );
};

export default NewTaskForm;
