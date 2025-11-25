import React, { useCallback, useMemo, useState } from "react";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import { Slider } from "@mui/material";
import { styled } from "@mui/system";
import { BsVolumeUpFill } from "react-icons/bs";
import ToDoItem from "../components/ToDoItem";
import NewTaskForm from "../components/NewTaskForm";
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

const ToDoList = () => {
  const {
    todos,
    completedTodos,
    addTask,
    updateTask,
    toggleTaskCompletion,
    reorderTodos,
    deleteTask,
    lists,
    activeListId,
    setActiveListId,
    createList,
    loading,
  } = useTasks();

  const [runningTaskIndex, setRunningTaskIndex] = useState(-1);
  const [volume, setVolume] = useState(24);
  const [newListName, setNewListName] = useState("");

  const handleVolumeChange = (_, newValue) => {
    setVolume(newValue);
  };

  const isTaskInTodos = useCallback(
    (taskId) => todos.some((todo) => todo.id === taskId),
    [todos]
  );

  const handleNewTask = useCallback(
    async (task, primaryDuration, secondaryDuration, numCycles, tilDone) => {
      await addTask({
        task,
        primaryDuration,
        secondaryDuration,
        numCycles,
        tilDone,
      });
    },
    [addTask]
  );

  const handleUpdate = useCallback(
    async (updatedTask) => {
      const { id, ...updates } = updatedTask;
      if (!id) return;
      await updateTask(id, updates);
    },
    [updateTask]
  );

  const handleToggle = useCallback(
    async (id, completed) => {
      await toggleTaskCompletion(id, completed);
      setRunningTaskIndex(-1);
    },
    [toggleTaskCompletion]
  );

  const handleDelete = useCallback(
    async (id) => {
      await deleteTask(id);
      setRunningTaskIndex(-1);
    },
    [deleteTask]
  );

  const handleOnDragEnd = useCallback(
    async (result) => {
      if (!result.destination) return;

      const { source, destination } = result;
      if (source.droppableId !== destination.droppableId) {
        return;
      }

      if (source.droppableId === "completedTodos") {
        return;
      }

      const items = Array.from(todos);
      const [reorderedItem] = items.splice(source.index, 1);
      items.splice(destination.index, 0, reorderedItem);

      await reorderTodos(items);

      if (runningTaskIndex === source.index) {
        setRunningTaskIndex(destination.index);
      } else if (
        destination.index <= runningTaskIndex &&
        source.index > runningTaskIndex
      ) {
        setRunningTaskIndex((prev) => prev + 1);
      } else if (
        destination.index >= runningTaskIndex &&
        source.index < runningTaskIndex
      ) {
        setRunningTaskIndex((prev) => prev - 1);
      }
    },
    [todos, reorderTodos, runningTaskIndex]
  );

  const handleCreateList = useCallback(
    async (event) => {
      event.preventDefault();
      if (!newListName.trim()) return;
      await createList(newListName.trim());
      setNewListName("");
    },
    [createList, newListName]
  );

  const hasLists = useMemo(() => lists && lists.length > 0, [lists]);

  return (
    <div className="app-layout">
      <header className="page-header">
        <div className="page-header__content">
          <h1>Task Planner</h1>
          <p>
            Capture everything you need to tackle today. Create focused Pomodoro
            sessions, drag to prioritise, and let the bell keep you honest.
          </p>
        </div>
        <div className="page-header__aside">
          <span className="badge">{todos.length} active</span>
          <span className="badge">{completedTodos.length} completed</span>
        </div>
      </header>

      <section className="page-section">
        <div className="page-section__headline">
          <h2>Lists</h2>
        </div>
        <form className="task-form" onSubmit={handleCreateList}>
          <div className="task-form__row">
            <div className="task-form__field" style={{ flex: "0 0 220px" }}>
              <label htmlFor="list-selector">Active list</label>
              <select
                id="list-selector"
                value={activeListId || ""}
                onChange={(event) => setActiveListId(event.target.value)}
                disabled={!hasLists}
              >
                {!hasLists && <option value="">No lists yet</option>}
                {lists.map((list) => (
                  <option key={list.id} value={list.id}>
                    {list.id}
                  </option>
                ))}
              </select>
            </div>
            <div className="task-form__field" style={{ flex: "1 1 240px" }}>
              <label htmlFor="new-list">Create a new list</label>
              <input
                id="new-list"
                type="text"
                placeholder="i.e. 2025-03-28 or Weekend Plan"
                value={newListName}
                onChange={(event) => setNewListName(event.target.value)}
              />
            </div>
            <button
              type="submit"
              className="btn btn--primary"
              style={{ alignSelf: "flex-end" }}
            >
              Create & switch
            </button>
          </div>
        </form>
        {!activeListId && (
          <div className="empty-state" style={{ marginTop: "18px" }}>
            <strong>No list selected</strong>
            Create or choose a list to start planning your sessions.
          </div>
        )}
      </section>

      <section className="page-section">
        <div className="page-section__headline">
          <h2>New task</h2>
          <span className="pill">Pomodoro ready</span>
        </div>
        <NewTaskForm onSubmit={handleNewTask} disabled={!activeListId} />
      </section>

      <DragDropContext onDragEnd={handleOnDragEnd}>
        <section className="page-section">
          <div className="page-section__headline">
            <h2>{loading ? "Loading tasks…" : "Not yet done"}</h2>
            <div className="volume-control" style={{ width: "min(240px, 36vw)" }}>
              <button type="button" className="btn-icon btn--ghost">
                <BsVolumeUpFill size={22} />
              </button>
              <StyledSlider
                value={volume}
                onChange={handleVolumeChange}
                aria-labelledby="volume-slider"
              />
            </div>
          </div>

          <Droppable droppableId="todos">
            {(provided) => (
              <ul
                className="task-list"
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {todos.map((todo, index) => (
                  <ToDoItem
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
                    onDelete={() => handleDelete(todo.id)}
                    tilDone={todo.tilDone}
                    runningTaskIndex={runningTaskIndex}
                    setRunningTaskIndex={setRunningTaskIndex}
                    isTaskInTodos={isTaskInTodos}
                    draggableId={todo.id.toString()}
                    volume={volume}
                    order={todo.order}
                  />
                ))}
                {provided.placeholder}
                {!todos.length && (
                  <li className="empty-state">
                    <strong>No tasks queued</strong>
                    Use the form above or move items out of “Donzo” to build
                    your run sheet.
                  </li>
                )}
              </ul>
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
              <ul
                className="task-list"
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {completedTodos.map((todo, index) => (
                  <ToDoItem
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
                    onDelete={() => handleDelete(todo.id)}
                    tilDone={todo.tilDone}
                    runningTaskIndex={runningTaskIndex}
                    setRunningTaskIndex={setRunningTaskIndex}
                    isTaskInTodos={isTaskInTodos}
                    draggableId={todo.id.toString()}
                    volume={volume}
                  />
                ))}
                {provided.placeholder}
                {!completedTodos.length && (
                  <li className="empty-state">
                    <strong>No completed tasks yet</strong>
                    When you mark an item done it will land here for
                    safekeeping.
                  </li>
                )}
              </ul>
            )}
          </Droppable>
        </section>
      </DragDropContext>
    </div>
  );
};

export default ToDoList;
