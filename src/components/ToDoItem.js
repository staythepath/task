import React, { useEffect, useRef, useState } from "react";
import { Draggable } from "react-beautiful-dnd";

const formatTime = (seconds) => {
  const safe = Math.max(0, seconds);
  const minutes = Math.floor(safe / 60)
    .toString()
    .padStart(2, "0");
  const secs = Math.floor(safe % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${secs}`;
};

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
}) => {
  const [primaryDuration, setPrimaryDuration] = useState(
    initialPrimaryDuration
  );
  const [secondaryDuration, setSecondaryDuration] = useState(
    initialSecondaryDuration
  );
  const [timeLeft, setTimeLeft] = useState(initialPrimaryDuration);
  const [isRunning, setIsRunning] = useState(false);
  const [isPrimary, setIsPrimary] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCycle, setCurrentCycle] = useState(0);
  const [numCycles, setNumCycles] = useState(initialNumCycles);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [taskLabel, setTaskLabel] = useState(task);
  const stepperTimeout = useRef(null);
  const timeLeftRef = useRef(timeLeft);
  const phaseStateRef = useRef({ isPrimary: true, currentCycle: 0 });
  const durationsRef = useRef({
    primaryDuration: initialPrimaryDuration,
    secondaryDuration: initialSecondaryDuration,
    numCycles: initialNumCycles,
  });
  const tilDoneTickRef = useRef(Date.now());
  const lastTickRef = useRef(Date.now());

  useEffect(() => {
    setTaskLabel(task);
  }, [task]);

  useEffect(() => {
    setNumCycles(initialNumCycles);
  }, [initialNumCycles]);

  useEffect(() => {
    setPrimaryDuration(initialPrimaryDuration);
    setSecondaryDuration(initialSecondaryDuration);
  }, [initialPrimaryDuration, initialSecondaryDuration]);

  useEffect(() => {
    durationsRef.current = {
      primaryDuration,
      secondaryDuration,
      numCycles,
    };
  }, [primaryDuration, secondaryDuration, numCycles]);

  useEffect(() => {
    setTimeLeft(isPrimary ? primaryDuration : secondaryDuration);
  }, [primaryDuration, secondaryDuration, isPrimary]);

  useEffect(() => {
    timeLeftRef.current = timeLeft;
  }, [timeLeft]);

  useEffect(() => {
    phaseStateRef.current = { isPrimary, currentCycle };
  }, [isPrimary, currentCycle]);

  useEffect(() => {
    if (index === runningTaskIndex && isTaskInTodos(id)) {
      setIsRunning(true);
    }
  }, [runningTaskIndex, index, isTaskInTodos, id]);

  useEffect(() => {
    if (!isRunning || !tilDone) return;

    tilDoneTickRef.current = Date.now();

    const tick = () => {
      const now = Date.now();
      const delta = Math.floor((now - tilDoneTickRef.current) / 1000);
      if (delta <= 0) return;
      tilDoneTickRef.current = now;
      setElapsedTime((prevElapsedTime) => prevElapsedTime + delta);
    };

    const interval = setInterval(tick, 1000);
    const onVisibility = () => tick();
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [isRunning, tilDone]);

  useEffect(() => {
    if (!isRunning || tilDone) return;

    lastTickRef.current = Date.now();

    const handleTaskCompletion = () => {
      setIsRunning(false);
      const { primaryDuration: focusSeconds, secondaryDuration: breakSeconds, numCycles: totalCycles } =
        durationsRef.current;
      const updatedTask = {
        id,
        index,
        task: taskLabel,
        primaryDuration: focusSeconds,
        secondaryDuration: breakSeconds,
        numCycles: totalCycles,
        tilDone,
        isRunning: false,
      };
      handleUpdate(updatedTask);
      onToggle(id, true);
    };

    const tick = () => {
      const now = Date.now();
      const delta = Math.floor((now - lastTickRef.current) / 1000);
      if (delta <= 0) return;
      lastTickRef.current = now;

      const { primaryDuration: focusSeconds, secondaryDuration: breakSeconds, numCycles: totalCycles } =
        durationsRef.current;
      let { isPrimary: localIsPrimary, currentCycle: localCycle } =
        phaseStateRef.current;
      let remaining = timeLeftRef.current - delta;

      while (remaining <= 0) {
        const bell = new Audio("/boxingbell.wav");
        bell.volume = volume / 100;
        bell.play();

        if (localIsPrimary) {
          const overshoot = -remaining;
          localIsPrimary = false;
          remaining = breakSeconds - overshoot;
          if (localCycle === totalCycles - 1) {
            const applause = new Audio("/applause.mp3");
            applause.volume = volume / 100;
            applause.play();
          }
        } else {
          if (localCycle >= totalCycles - 1) {
            timeLeftRef.current = 0;
            setTimeLeft(0);
            handleTaskCompletion();
            return;
          }
          const overshoot = -remaining;
          localCycle += 1;
          localIsPrimary = true;
          remaining = focusSeconds - overshoot;
        }
      }

      timeLeftRef.current = Math.max(0, remaining);
      setTimeLeft(timeLeftRef.current);

      if (localIsPrimary !== phaseStateRef.current.isPrimary) {
        setIsPrimary(localIsPrimary);
      }

      if (localCycle !== phaseStateRef.current.currentCycle) {
        setCurrentCycle(localCycle);
      }

      phaseStateRef.current = {
        isPrimary: localIsPrimary,
        currentCycle: localCycle,
      };
    };

    tick();
    const interval = setInterval(tick, 1000);
    const onVisibility = () => tick();
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [
    isRunning,
    tilDone,
    handleUpdate,
    id,
    index,
    onToggle,
    taskLabel,
    volume,
  ]);

  const toggleEdit = () => {
    setIsEditing((prev) => !prev);
  };

  const persistTask = (overrides = {}) => {
    handleUpdate({
      id,
      index,
      task: taskLabel,
      complete,
      primaryDuration,
      secondaryDuration,
      numCycles,
      tilDone,
      isRunning,
      order,
      ...overrides,
    });
  };

  const startStepper = (operation, setter) => {
    const run = () => {
      setter((prev) => operation(prev));
      stepperTimeout.current = window.setTimeout(run, 220);
    };
    run();
  };

  const stopStepper = () => {
    window.clearTimeout(stepperTimeout.current);
  };

  const handleToggleComplete = () => {
    const updatedTask = {
      id,
      index,
      task: taskLabel,
      complete: !complete,
      primaryDuration,
      secondaryDuration,
      numCycles,
      tilDone,
      isRunning: false,
    };
    handleUpdate(updatedTask);
    onToggle(id, !complete);
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

    if (isRunning) {
      setIsRunning(false);
      setRunningTaskIndex(-1);
    } else if (isTaskInTodos(id)) {
      playBell();
      setIsRunning(true);
      setRunningTaskIndex(index);
    }

    persistTask({ isRunning: !isRunning });
  };

  const resetTimer = () => {
    setIsRunning(false);
    setRunningTaskIndex(-1);
    setTimeLeft(primaryDuration);
    setIsPrimary(true);
    setElapsedTime(0);
    setCurrentCycle(0);
    persistTask({ isRunning: false });
  };

  const handleDeleteClick = () => {
    if (isRunning) {
      resetTimer();
    }
    onDelete();
  };

  const saveEdits = () => {
    setIsEditing(false);
    persistTask({
      primaryDuration,
      secondaryDuration,
      numCycles: tilDone ? 999 : numCycles,
      task: taskLabel,
    });
  };

  const formattedTime = tilDone ? formatTime(elapsedTime) : formatTime(timeLeft);
  const totalCycles = tilDone ? "∞" : `${currentCycle + 1}/${Math.max(1, numCycles)}`;

  return (
    <Draggable draggableId={draggableId} index={index}>
      {(provided) => (
        <li
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`task-card${isRunning ? " task-card--active" : ""}${
            isEditing ? " task-card--editing" : ""
          }`}
        >
          <div className="task-card__primary">
            <label className="checkbox-field">
              <input
                type="checkbox"
                checked={complete}
                onChange={handleToggleComplete}
              />
              <span></span>
            </label>
            <div className="stack stack--dense" style={{ minWidth: "0" }}>
              {isEditing ? (
                <input
                  type="text"
                  value={taskLabel}
                  onChange={(e) => setTaskLabel(e.target.value)}
                  disabled={complete}
                />
              ) : (
                <p
                  className={`task-card__title${
                    complete ? " task-card__title--complete" : ""
                  }`}
                >
                  {taskLabel}
                </p>
              )}
              <div className="task-card__meta">
                <span>Primary {Math.floor(primaryDuration / 60)}m</span>
                <span>Break {Math.floor(secondaryDuration / 60)}m</span>
                <span>Order {order ?? "—"}</span>
                <span>Cycles {tilDone ? "∞" : numCycles}</span>
              </div>
            </div>
          </div>

          <div className="task-card__timer">
            <div
              className={`timer-display${
                isRunning ? " timer-display--active" : ""
              }`}
            >
              {formattedTime}
            </div>
            <span className="pill">
              {tilDone ? "Til done" : `Cycle ${totalCycles}`}
            </span>
          </div>

          <div className="task-card__actions">
            {!complete && (
              <button type="button" className="btn" onClick={toggleTimer}>
                {isRunning ? "Pause" : "Start"}
              </button>
            )}
            <button
              type="button"
              className="btn btn--ghost"
              onClick={resetTimer}
            >
              Reset
            </button>
            <button
              type="button"
              className="btn btn--ghost"
              onClick={isEditing ? saveEdits : toggleEdit}
            >
              {isEditing ? "Done" : "Edit"}
            </button>
            <button
              type="button"
              className="btn btn--danger"
              onClick={handleDeleteClick}
            >
              Delete
            </button>
          </div>

          {isEditing && (
            <div className="task-card__editor" style={{ gridColumn: "1 / -1" }}>
              <div className="task-form__row">
                {!tilDone && (
                  <div className="task-form__field" style={{ maxWidth: "200px" }}>
                    <label>Cycles</label>
                    <div className="timer-stepper">
                      <button
                        type="button"
                        className="timer-stepper__button"
                        onMouseDown={() =>
                          startStepper(
                            (prev) => Math.max(1, prev - 1),
                            setNumCycles
                          )
                        }
                        onMouseUp={stopStepper}
                        onMouseLeave={stopStepper}
                        onTouchStart={() =>
                          startStepper(
                            (prev) => Math.max(1, prev - 1),
                            setNumCycles
                          )
                        }
                        onTouchEnd={stopStepper}
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
                      />
                      <button
                        type="button"
                        className="timer-stepper__button"
                        onMouseDown={() =>
                          startStepper((prev) => prev + 1, setNumCycles)
                        }
                        onMouseUp={stopStepper}
                        onMouseLeave={stopStepper}
                        onTouchStart={() =>
                          startStepper((prev) => prev + 1, setNumCycles)
                        }
                        onTouchEnd={stopStepper}
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}

                <div className="task-form__field" style={{ maxWidth: "220px" }}>
                    <label>Focus minutes</label>
                    <div className="timer-stepper">
                      <button
                        type="button"
                        className="timer-stepper__button"
                        onMouseDown={() =>
                          startStepper(
                            (value) => Math.max(value - 60, 0),
                            setPrimaryDuration
                          )
                      }
                      onMouseUp={stopStepper}
                      onMouseLeave={stopStepper}
                      onTouchStart={() =>
                        startStepper(
                          (value) => Math.max(value - 60, 0),
                          setPrimaryDuration
                        )
                      }
                      onTouchEnd={stopStepper}
                    >
                      −
                    </button>
                    <input
                      className="timer-stepper__input"
                      type="number"
                      min={0}
                      value={Math.floor(primaryDuration / 60)}
                      onChange={(e) => {
                        const value = e.target.value === "" ? 0 : parseInt(e.target.value, 10);
                        if (!Number.isNaN(value)) {
                          setPrimaryDuration(Math.min(Math.max(value, 0), 90) * 60);
                        }
                      }}
                      />
                      <button
                        type="button"
                        className="timer-stepper__button"
                        onMouseDown={() =>
                          startStepper(
                            (value) => Math.min(value + 60, 90 * 60),
                            setPrimaryDuration
                          )
                      }
                      onMouseUp={stopStepper}
                      onMouseLeave={stopStepper}
                      onTouchStart={() =>
                        startStepper(
                          (value) => Math.min(value + 60, 90 * 60),
                          setPrimaryDuration
                        )
                      }
                      onTouchEnd={stopStepper}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="task-form__field" style={{ maxWidth: "220px" }}>
                    <label>Break minutes</label>
                    <div className="timer-stepper">
                      <button
                        type="button"
                        className="timer-stepper__button"
                        onMouseDown={() =>
                          startStepper(
                            (value) => Math.max(value - 60, 0),
                            setSecondaryDuration
                          )
                      }
                      onMouseUp={stopStepper}
                      onMouseLeave={stopStepper}
                      onTouchStart={() =>
                        startStepper(
                          (value) => Math.max(value - 60, 0),
                          setSecondaryDuration
                        )
                      }
                      onTouchEnd={stopStepper}
                    >
                      −
                    </button>
                    <input
                      className="timer-stepper__input"
                      type="number"
                      min={0}
                      value={Math.floor(secondaryDuration / 60)}
                      onChange={(e) => {
                        const value = e.target.value === "" ? 0 : parseInt(e.target.value, 10);
                        if (!Number.isNaN(value)) {
                          setSecondaryDuration(
                            Math.min(Math.max(value, 0), 90) * 60
                          );
                        }
                      }}
                      />
                      <button
                        type="button"
                        className="timer-stepper__button"
                        onMouseDown={() =>
                          startStepper(
                            (value) => Math.min(value + 60, 90 * 60),
                            setSecondaryDuration
                          )
                      }
                      onMouseUp={stopStepper}
                      onMouseLeave={stopStepper}
                      onTouchStart={() =>
                        startStepper(
                          (value) => Math.min(value + 60, 90 * 60),
                          setSecondaryDuration
                        )
                      }
                      onTouchEnd={stopStepper}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </li>
      )}
    </Draggable>
  );
};

export default ToDoItem;
