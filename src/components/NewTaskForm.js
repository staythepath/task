import React, { useState, useRef } from "react";

const formatMinutes = (seconds) => Math.max(0, Math.floor(seconds / 60));

const NewTaskForm = ({ onSubmit, disabled = false }) => {
  const [task, setTask] = useState("");
  const [primaryDuration, setPrimaryDuration] = useState(25 * 60);
  const [secondaryDuration, setSecondaryDuration] = useState(5 * 60);
  const [numCycles, setNumCycles] = useState(1);
  const [tilDone, setTilDone] = useState(false);
  const timeoutId = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (disabled) return;
    if (task.trim()) {
      if (tilDone) {
        onSubmit(task.trim(), primaryDuration, secondaryDuration, 999, tilDone);
      } else {
        onSubmit(
          task.trim(),
          primaryDuration,
          secondaryDuration,
          Math.max(1, numCycles),
          tilDone
        );
      }
      setTask("");
      setPrimaryDuration(25 * 60);
      setSecondaryDuration(5 * 60);
      setNumCycles(1);
    }
  };

  const handleMouseDown = (operation, setValue) => {
    if (disabled) return;
    const changeValue = () => {
      setValue((prevValue) => operation(prevValue));
    };

    const accelerateChange = () => {
      changeValue();
      timeoutId.current = window.setTimeout(accelerateChange, 220);
    };

    accelerateChange();
  };

  const handleMouseUp = () => {
    window.clearTimeout(timeoutId.current);
  };

  const totalMinutes = tilDone
    ? "Til done"
    : `${((primaryDuration + secondaryDuration) * numCycles) / 60}:00`;

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <div className="task-form__row">
        <div className="task-form__field" style={{ flex: "1 1 320px" }}>
          <label htmlFor="task-input">Task</label>
          <input
            id="task-input"
            type="text"
            value={task}
            onChange={(e) => setTask(e.target.value)}
            placeholder="What are we focusing on?"
            disabled={disabled}
            required
          />
        </div>
        <label className="checkbox-field">
          <input
            type="checkbox"
            checked={tilDone}
            onChange={() => setTilDone(!tilDone)}
            disabled={disabled}
          />
          Til done
        </label>
      </div>

      <div className="task-form__row">
        <div className="task-form__field" style={{ maxWidth: "200px" }}>
          <label>Cycles</label>
          <div className="timer-stepper">
            <button
              type="button"
              className="timer-stepper__button"
              onMouseDown={() =>
                handleMouseDown(
                  (prev) => Math.max(1, prev - 1),
                  setNumCycles
                )
              }
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={() =>
                handleMouseDown(
                  (prev) => Math.max(1, prev - 1),
                  setNumCycles
                )
              }
              onTouchEnd={handleMouseUp}
              disabled={disabled}
            >
              −
            </button>
            <input
              className="timer-stepper__input"
              type="number"
              min={1}
              value={numCycles}
              onChange={(e) =>
                setNumCycles(Math.max(1, parseInt(e.target.value || "1", 10)))
              }
              disabled={disabled || tilDone}
            />
            <button
              type="button"
              className="timer-stepper__button"
              onMouseDown={() =>
                handleMouseDown((prev) => prev + 1, setNumCycles)
              }
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={() =>
                handleMouseDown((prev) => prev + 1, setNumCycles)
              }
              onTouchEnd={handleMouseUp}
              disabled={disabled || tilDone}
            >
              +
            </button>
          </div>
        </div>

        <div className="task-form__field" style={{ maxWidth: "200px" }}>
          <label>Focus minutes</label>
          <div className="timer-stepper">
            <button
              type="button"
              className="timer-stepper__button"
              onMouseDown={(e) => {
                e.preventDefault();
                handleMouseDown(
                  (value) => Math.max(value - 60, 0),
                  setPrimaryDuration
                );
              }}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={(e) => {
                e.preventDefault();
                handleMouseDown(
                  (value) => Math.max(value - 60, 0),
                  setPrimaryDuration
                );
              }}
              onTouchEnd={handleMouseUp}
              disabled={disabled}
            >
              −
            </button>
            <input
              className="timer-stepper__input"
              type="number"
              min={0}
              value={formatMinutes(primaryDuration)}
              onChange={(e) => {
                const value = e.target.value === "" ? 0 : parseInt(e.target.value, 10);
                if (!Number.isNaN(value)) {
                  setPrimaryDuration(Math.min(Math.max(value, 0), 90) * 60);
                }
              }}
              disabled={disabled}
            />
            <button
              type="button"
              className="timer-stepper__button"
              onMouseDown={(e) => {
                e.preventDefault();
                handleMouseDown(
                  (value) => Math.min(value + 60, 90 * 60),
                  setPrimaryDuration
                );
              }}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={(e) => {
                e.preventDefault();
                handleMouseDown(
                  (value) => Math.min(value + 60, 90 * 60),
                  setPrimaryDuration
                );
              }}
              onTouchEnd={handleMouseUp}
              disabled={disabled}
            >
              +
            </button>
          </div>
        </div>

        <div className="task-form__field" style={{ maxWidth: "200px" }}>
          <label>Break minutes</label>
          <div className="timer-stepper">
            <button
              type="button"
              className="timer-stepper__button"
              onMouseDown={(e) => {
                e.preventDefault();
                handleMouseDown(
                  (value) => Math.max(value - 60, 0),
                  setSecondaryDuration
                );
              }}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={(e) => {
                e.preventDefault();
                handleMouseDown(
                  (value) => Math.max(value - 60, 0),
                  setSecondaryDuration
                );
              }}
              onTouchEnd={handleMouseUp}
              disabled={disabled}
            >
              −
            </button>
            <input
              className="timer-stepper__input"
              type="number"
              min={0}
              value={formatMinutes(secondaryDuration)}
              onChange={(e) => {
                const value = e.target.value === "" ? 0 : parseInt(e.target.value, 10);
                if (!Number.isNaN(value)) {
                  setSecondaryDuration(Math.min(Math.max(value, 0), 90) * 60);
                }
              }}
              disabled={disabled}
            />
            <button
              type="button"
              className="timer-stepper__button"
              onMouseDown={(e) => {
                e.preventDefault();
                handleMouseDown(
                  (value) => Math.min(value + 60, 90 * 60),
                  setSecondaryDuration
                );
              }}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={(e) => {
                e.preventDefault();
                handleMouseDown(
                  (value) => Math.min(value + 60, 90 * 60),
                  setSecondaryDuration
                );
              }}
              onTouchEnd={handleMouseUp}
              disabled={disabled}
            >
              +
            </button>
          </div>
        </div>

        <div className="task-form__field" style={{ maxWidth: "160px" }}>
          <label>Total time</label>
          <input
            type="text"
            value={totalMinutes}
            readOnly
            disabled
          />
        </div>
      </div>

      <div className="task-form__row" style={{ justifyContent: "flex-end" }}>
        <button
          type="submit"
          className="btn btn--primary"
          disabled={disabled || !task.trim()}
        >
          Add task
        </button>
      </div>
    </form>
  );
};

export default NewTaskForm;
