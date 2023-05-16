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
      console.log(
        "New task:",
        task.trim(),
        primaryDuration * 60,
        secondaryDuration * 60,
        numCycles,
        tilDone
      );
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
      setTilDone(false);
      if (tilDone) {
        onSubmit(task.trim(), 0, 0, numCycles, tilDone);
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

  const [primaryDurationFocused, setPrimaryDurationFocused] = useState(false);
  const [secondaryDurationFocused, setSecondaryDurationFocused] =
    useState(false);

  const countdownDisplayStyle = {
    width: "3rem",
    textAlign: "center",
    marginRight: "1rem",
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={task}
        onChange={(e) => setTask(e.target.value)}
        placeholder="Add new task"
      />

      <label htmlFor="til-done">
        <input
          type="checkbox"
          id="til-done"
          checked={tilDone}
          onChange={() => setTilDone(!tilDone)}
        />
        Til Done
      </label>
      <div className="cycle-btn-container">
        <button
          type="button"
          className="cycle-change-btn cycle-change-btn-plus"
          onMouseDown={() =>
            handleMouseDown((prev) => prev + 1, numCycles, setNumCycles)
          }
          onMouseUp={handleMouseUp}
          onTouchStart={() =>
            handleMouseDown((prev) => prev + 1, numCycles, setNumCycles)
          }
          onTouchEnd={handleMouseUp}
          disabled={tilDone}
        >
          +
        </button>
        <button
          type="button"
          className="cycle-change-btn cycle-change-btn-minus"
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
          disabled={tilDone}
        >
          -
        </button>
      </div>
      <div className="cycle-input">
        <input
          type="number"
          min="1"
          className="cycle-input-field"
          value={numCycles}
          onChange={(e) => setNumCycles(parseInt(e.target.value))}
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
          onBlur={() => {
            setPrimaryDurationFocused(false);
            setPrimaryDuration(Math.min(primaryDuration, 90 * 60));
          }}
          disabled={tilDone}
        />
        <div style={{ marginLeft: "1px" }}>Minutes</div>
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
          disabled={tilDone}
        />
        <div style={{ marginLeft: "1px" }}>Minutes</div>
      </div>

      <div style={countdownDisplayStyle}>
        <input
          type="text"
          value={primaryDuration / 60 + ":00"}
          readOnly
          style={{ width: "100%", textAlign: "center", marginLeft: ".5rem" }}
        />
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