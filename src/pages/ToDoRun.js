import React, { useCallback, useEffect, useMemo, useState } from "react";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import { Slider } from "@mui/material";
import { styled } from "@mui/system";
import ToDoItemRun from "../components/ToDoItemRun";
import { BsPlayFill, BsPauseFill, BsVolumeUpFill } from "react-icons/bs";
import { IconContext } from "react-icons";
import { useTasks } from "../context/TaskContext";

const StyledSlider = styled(Slider)({
  width: "100%",
  color: "#8b5cf6",
  "& .MuiSlider-thumb": {
    height: 22,
    width: 22,
    backgroundColor: "#f8fafc",
    border: "3px solid rgba(99,102,241,0.45)",
  },
  "& .MuiSlider-track": {
    height: 8,
    borderRadius: 999,
  },
  "& .MuiSlider-rail": {
    height: 8,
    opacity: 0.3,
  },
});

const ToDoRun = () => {
  const {
    todos: remoteTodos,
    completedTodos: remoteCompletedTodos,
    reorderTodos,
    toggleTaskCompletion,
    updateTask,
    activeListId,
  } = useTasks();

  const [todos, setTodos] = useState(remoteTodos);
  const [completedTodos, setCompletedTodos] = useState(remoteCompletedTodos);
  const [runningTaskIndex, setRunningTaskIndex] = useState(-1);
  const [volume, setVolume] = useState(25);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    setTodos(remoteTodos);
    if (!remoteTodos.length) {
      setRunningTaskIndex(-1);
    }
  }, [remoteTodos]);

  useEffect(() => {
    setCompletedTodos(remoteCompletedTodos);
  }, [remoteCompletedTodos]);

  const playBell = useCallback(
    (times = 1) => {
      if (!times) return;
      const audio = new Audio("/boxingbell.wav");
      audio.volume = volume / 100;
      audio.play();
      setTimeout(() => playBell(times - 1), 1000);
    },
    [volume]
  );

  const handleToggle = useCallback(
    async (id, completed) => {
      await toggleTaskCompletion(id, completed);
      setRunningTaskIndex(-1);
    },
    [toggleTaskCompletion]
  );

  const handleUpdate = useCallback(
    async (updatedTask) => {
      if (!updatedTask?.id) return;
      const { id, ...updates } = updatedTask;
      await updateTask(id, updates);
    },
    [updateTask]
  );

  const startFirstTask = useCallback(() => {
    if (todos.length > 0 && runningTaskIndex === -1) {
      setShowModal(true);
    }
  }, [todos.length, runningTaskIndex]);

  const actuallyStartFirstTask = useCallback(async () => {
    playBell();
    if (todos.length > 0) {
      setRunningTaskIndex(0);
      const [firstTask, ...rest] = todos;
      setTodos([{ ...firstTask, isRunning: true }, ...rest]);
      await updateTask(firstTask.id, { isRunning: true });
    }
    setShowModal(false);
  }, [playBell, todos, updateTask]);

  const pauseOrResumeTask = useCallback(async () => {
    playBell();
    if (todos.length > 0 && runningTaskIndex !== -1) {
      const updated = [...todos];
      const task = updated[runningTaskIndex];
      updated[runningTaskIndex] = {
        ...task,
        isRunning: !task.isRunning,
      };
      setTodos(updated);
      await updateTask(task.id, { isRunning: !task.isRunning });
    }
  }, [playBell, runningTaskIndex, todos, updateTask]);

  const handleOnDragEnd = useCallback(
    async (result) => {
      if (!result.destination) return;

      const items = Array.from(todos);
      const [reorderedItem] = items.splice(result.source.index, 1);
      items.splice(result.destination.index, 0, reorderedItem);
      setTodos(items);
      await reorderTodos(items);

      if (runningTaskIndex === result.source.index) {
        setRunningTaskIndex(result.destination.index);
      } else if (
        result.destination.index <= runningTaskIndex &&
        result.source.index > runningTaskIndex
      ) {
        setRunningTaskIndex((prev) => prev + 1);
      } else if (
        result.destination.index >= runningTaskIndex &&
        result.source.index < runningTaskIndex
      ) {
        setRunningTaskIndex((prev) => prev - 1);
      }
    },
    [todos, reorderTodos, runningTaskIndex]
  );

  const handleVolumeChange = (_, newValue) => {
    setVolume(newValue);
  };

  const isTaskInTodos = useCallback(
    (taskId) => todos.some((todo) => todo.id === taskId),
    [todos]
  );

  const runDisabled = useMemo(
    () => !activeListId || !todos.length,
    [activeListId, todos.length]
  );

  return (
    <div className="app-layout">
      <header className="page-header">
        <div className="page-header__content">
          <h1>Run the bell</h1>
          <p>
            Lock in your queue and let the bell drive the pace. Adjust the
            volume, keep your focus, and move tasks to “Donzo” as they finish.
          </p>
        </div>
        <div className="page-header__aside">
          <span className="badge">{todos.length} queued</span>
          <span className="badge">{completedTodos.length} done</span>
        </div>
      </header>

      <section className="page-section">
        <div className="run-toolbar">
          <button
            onClick={runningTaskIndex !== -1 ? pauseOrResumeTask : startFirstTask}
            className="btn btn--primary"
            style={{ width: "200px" }}
            disabled={runDisabled}
          >
            {runningTaskIndex !== -1 ? (
              todos[runningTaskIndex]?.isRunning ? (
                <IconContext.Provider value={{ className: "react-icons" }}>
                  <BsPauseFill />
                </IconContext.Provider>
              ) : (
                <IconContext.Provider value={{ className: "react-icons" }}>
                  <BsPlayFill />
                </IconContext.Provider>
              )
            ) : (
              <IconContext.Provider value={{ className: "react-icons" }}>
                <BsPlayFill />
              </IconContext.Provider>
            )}
          </button>
        </div>

        <div className="volume-control" style={{ width: "min(260px, 40vw)", margin: "0 auto" }}>
          <button type="button" className="btn-icon btn--ghost">
            <BsVolumeUpFill size={22} />
          </button>
          <StyledSlider
            value={volume}
            onChange={handleVolumeChange}
            aria-labelledby="run-volume-slider"
          />
        </div>
      </section>

      <DragDropContext onDragEnd={handleOnDragEnd}>
        <section className="page-section">
          <div className="page-section__headline">
            <h2>Not yet done</h2>
            <span className="pill">Drag to reorder</span>
          </div>

          <Droppable droppableId="todos">
            {(provided) => (
              <div
                className="stack"
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {todos.map((todo, index) => (
                  <ToDoItemRun
                    key={todo.id}
                    handleUpdate={handleUpdate}
                    index={index}
                    id={todo.id}
                    task={todo.task}
                    complete={todo.complete}
                    primaryDuration={todo.primaryDuration}
                    secondaryDuration={todo.secondaryDuration}
                    numCycles={todo.numCycles}
                    onToggle={() => handleToggle(todo.id)}
                    tilDone={todo.tilDone}
                    runningTaskIndex={runningTaskIndex}
                    setRunningTaskIndex={setRunningTaskIndex}
                    isTaskInTodos={isTaskInTodos}
                    volume={volume}
                  />
                ))}
                {provided.placeholder}
                {!todos.length && (
                  <div className="empty-state">
                    <strong>No tasks are running</strong>
                    Queue something on the To Do page and jump back in.
                  </div>
                )}
              </div>
            )}
          </Droppable>
        </section>

        <section className="page-section page-section--subtle">
          <div className="page-section__headline">
            <h2>Donzo</h2>
            <span className="badge">{completedTodos.length} completed</span>
          </div>

          <Droppable droppableId="completedTodos">
            {(provided) => (
              <div
                className="stack"
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {completedTodos.map((todo, index) => (
                  <ToDoItemRun
                    key={todo.id}
                    handleUpdate={handleUpdate}
                    index={index}
                    id={todo.id}
                    task={todo.task}
                    complete={todo.complete}
                    primaryDuration={todo.primaryDuration}
                    secondaryDuration={todo.secondaryDuration}
                    numCycles={todo.numCycles}
                    onToggle={() => handleToggle(todo.id, false)}
                    tilDone={todo.tilDone}
                    runningTaskIndex={runningTaskIndex}
                    setRunningTaskIndex={setRunningTaskIndex}
                    isTaskInTodos={isTaskInTodos}
                    volume={volume}
                  />
                ))}
                {provided.placeholder}
                {!completedTodos.length && (
                  <div className="empty-state">
                    <strong>Nothing done yet</strong>
                    Finish a cycle and it will drop here automatically.
                  </div>
                )}
              </div>
            )}
          </Droppable>
        </section>
      </DragDropContext>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Ready to start?</h3>
            <p>
              Once the run begins, editing and reordering are locked. Double check
              your order, then let the bell lead the way.
            </p>
            <div className="modal-actions">
              <button className="btn btn--primary" onClick={actuallyStartFirstTask}>
                Yes, start
              </button>
              <button className="btn btn--ghost" onClick={() => setShowModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ToDoRun;
