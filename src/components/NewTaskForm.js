import React, { useState } from "react";

const NewTaskForm = ({ onSubmit }) => {
  const [task, setTask] = useState("");
  const [primaryDuration, setPrimaryDuration] = useState(25 * 60);
  const [secondaryDuration, setSecondaryDuration] = useState(5 * 60);
  const [numCycles, setNumCycles] = useState(1);
  const [tilDone, setTilDone] = useState(false);

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

  const [primaryDurationFocused, setPrimaryDurationFocused] = useState(false);
  const [secondaryDurationFocused, setSecondaryDurationFocused] =
    useState(false);

  const timerDisplayStyle = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "1.2rem",
    margin: "0 0.5rem",
    marginRight: "0.03rem",
    marginLeft: ".4rem",
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

      <div className="cycle-input">
        <input
          type="number"
          min="1"
          className="cycle-input-field"
          value={numCycles}
          onChange={(e) => setNumCycles(parseInt(e.target.value))}
          disabled={tilDone}
        />
        <div className="cycle-btn-container">
          <button
            type="button"
            className="cycle-change-btn cycle-change-btn-plus"
            onClick={() => setNumCycles(numCycles + 1)}
            disabled={tilDone}
          >
            +
          </button>
          <button
            type="button"
            className="cycle-change-btn cycle-change-btn-minus"
            onClick={() => setNumCycles(Math.max(1, numCycles - 1))}
            disabled={tilDone}
          >
            -
          </button>
        </div>
      </div>

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
          disabled={tilDone}
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
          disabled={tilDone}
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
          backgroundColor: secondaryDurationFocused ? "#444" : "transparent",
        }} // Updated here
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
          disabled={tilDone}
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
          disabled={tilDone}
          onClick={(e) => {
            e.preventDefault();
            setSecondaryDuration(Math.max(0, secondaryDuration - 60));
          }}
        >
          -
        </button>
      </div>

      <div style={countdownDisplayStyle}>
        <input
          type="text"
          value={primaryDuration / 60 + ":00"}
          readOnly
          style={{ width: "100%", textAlign: "center", marginLeft: ".5rem" }}
        />
      </div>

      <button type="submit" style={{ marginLeft: "1rem" }}>
        Add
      </button>
    </form>
  );
};

export default NewTaskForm;
