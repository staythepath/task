import React, { useState, useCallback } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import ToDoItem from "./ToDoItem";
import NewTaskForm from "./NewTaskForm";

const ToDoList = () => {
  const [todos, setTodos] = useState([]);
  const [nextTaskId, setNextTaskId] = useState(null);

  const handleToggle = (id) => {
    const newTodos = todos.map((todo) =>
      todo.id === id ? { ...todo, complete: !todo.complete } : todo
    );
    setTodos(newTodos);
  };

  const handleDelete = (id) => {
    const newTodos = todos.filter((todo) => todo.id !== id);
    setTodos(newTodos);
  };

  const handleUpdate = (updatedTask) => {
    const newTodos = todos.map((todo) =>
      todo.id === updatedTask.id ? updatedTask : todo
    );
    setTodos(newTodos);
  };

  const handleCyclesCompleted = (completedTaskId) => {
    const taskIndex = todos.findIndex((task) => task.id === completedTaskId);
    if (taskIndex < todos.length - 1) {
      setNextTaskId(todos[taskIndex + 1].id);
    } else {
      setNextTaskId(null);
    }
  };

  const handleNewTask = (
    task,
    primaryDuration,
    secondaryDuration,
    numCycles
  ) => {
    console.log("Task:", task, primaryDuration, secondaryDuration, numCycles);
    const newTodo = {
      id: Date.now(),
      task: task,
      complete: false,
      primaryDuration: primaryDuration,
      secondaryDuration: secondaryDuration,
      numCycles: numCycles,
    };
    setTodos([...todos, newTodo]);
  };

  const moveItem = useCallback(
    (dragIndex, hoverIndex) => {
      const draggedItem = todos[dragIndex];
      const newTodos = [...todos];
      newTodos.splice(dragIndex, 1);
      newTodos.splice(hoverIndex, 0, draggedItem);
      setTodos(newTodos);
    },
    [todos]
  );

  return (
    <DndProvider backend={HTML5Backend}>
      <NewTaskForm onSubmit={handleNewTask} />
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
          moveItem={moveItem}
          onToggle={() => handleToggle(todo.id)}
          onDelete={() => handleDelete(todo.id)}
          nextTaskId={nextTaskId}
          onCyclesCompleted={() => handleCyclesCompleted(todo.id)}
        />
      ))}
    </DndProvider>
  );
};

export default ToDoList;
