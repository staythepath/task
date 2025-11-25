import React, { useEffect, useRef, useState } from "react";

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

const ToDoItemRun = ({
  id,
  index,
  task,
  complete,
  primaryDuration: initialPrimaryDuration,
  secondaryDuration: initialSecondaryDuration,
  numCycles: initialNumCycles,
  onToggle,
  handleUpdate,
  tilDone,
  runningTaskIndex,
  setRunningTaskIndex,
  isTaskInTodos,
  volume,
}) => {
  const [primaryDuration, setPrimaryDuration] = useState(
    initialPrimaryDuration
  );
  const [secondaryDuration, setSecondaryDuration] = useState(
    initialSecondaryDuration
  );
  const [timeLeft, setTimeLeft] = useState(initialPrimaryDuration);
  const [isPrimary, setIsPrimary] = useState(true);
  const [currentCycle, setCurrentCycle] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [taskLabel, setTaskLabel] = useState(task);
  const timeLeftRef = useRef(initialPrimaryDuration);
  const phaseStateRef = useRef({ isPrimary: true, currentCycle: 0 });
  const durationsRef = useRef({
    primaryDuration: initialPrimaryDuration,
    secondaryDuration: initialSecondaryDuration,
    numCycles: initialNumCycles,
  });
  const tilDoneTickRef = useRef(Date.now());
  const lastTickRef = useRef(Date.now());

  useEffect(() => {
    setPrimaryDuration(initialPrimaryDuration);
    setSecondaryDuration(initialSecondaryDuration);
    setTaskLabel(task);
  }, [initialPrimaryDuration, initialSecondaryDuration, task]);

  useEffect(() => {
    durationsRef.current = {
      primaryDuration,
      secondaryDuration,
      numCycles: initialNumCycles,
    };
  }, [primaryDuration, secondaryDuration, initialNumCycles]);

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
    } else if (runningTaskIndex !== index) {
      setIsRunning(false);
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
      const { primaryDuration: focusSeconds, secondaryDuration: breakSeconds, numCycles } =
        durationsRef.current;
      const updatedTask = {
        id,
        index,
        task: taskLabel,
        primaryDuration: focusSeconds,
        secondaryDuration: breakSeconds,
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

    const tick = () => {
      const now = Date.now();
      const delta = Math.floor((now - lastTickRef.current) / 1000);
      if (delta <= 0) return;
      lastTickRef.current = now;

      const { primaryDuration: focusSeconds, secondaryDuration: breakSeconds, numCycles } =
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
          if (localCycle === numCycles - 1) {
            const applause = new Audio("/applause.mp3");
            applause.volume = volume / 100;
            applause.play();
          }
        } else {
          if (localCycle >= numCycles - 1) {
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
    isTaskInTodos,
    setRunningTaskIndex,
  ]);

  const formattedTime = tilDone ? formatTime(elapsedTime) : formatTime(timeLeft);
  const remainingCycles = tilDone
    ? "∞"
    : `${Math.max(initialNumCycles - currentCycle, 1)}`;

  return (
    <div className={`task-card${isRunning ? " task-card--active" : ""}`}>
      <div className="task-card__primary">
        <label className="checkbox-field">
          <input
            type="checkbox"
            checked={complete}
            onChange={() => onToggle(id, !complete)}
          />
          <span></span>
        </label>
        <div className="stack stack--dense">
          <p
            className={`task-card__title${
              complete ? " task-card__title--complete" : ""
            }`}
          >
            {taskLabel}
          </p>
          <div className="task-card__meta">
            <span>Primary {Math.floor(primaryDuration / 60)}m</span>
            <span>Break {Math.floor(secondaryDuration / 60)}m</span>
            <span>Cycles left {remainingCycles}</span>
          </div>
        </div>
      </div>
      <div className="task-card__timer">
        <div
          className={`timer-display${isRunning ? " timer-display--active" : ""}`}
        >
          {formattedTime}
        </div>
        <span className="pill">{tilDone ? "Til done" : `Cycle ${currentCycle + 1}`}</span>
      </div>
    </div>
  );
};

export default ToDoItemRun;
