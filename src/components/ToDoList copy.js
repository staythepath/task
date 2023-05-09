import React, { useState, useCallback } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import ToDoItem from "./ToDoItem";
import NewTaskForm from "./NewTaskForm";

const ToDoList = () => {
  const [todos, setTodos] = useState([]);
  const [completedTodos, setCompletedTodos] = useState([]);
  const [nextTaskId, setNextTaskId] = useState(null);

  const handleToggle = useCallback((id) => {
    setTodos((prevTodos) => {
      const taskIndex = prevTodos.findIndex((task) => task.id === id);
      if (taskIndex === -1) return prevTodos;

      const updatedTask = {
        ...prevTodos[taskIndex],
        complete: !prevTodos[taskIndex].complete,
      };
      const newTodos = [...prevTodos];
      newTodos.splice(taskIndex, 1);

      if (updatedTask.complete) {
        setCompletedTodos((prevCompletedTodos) => [
          ...prevCompletedTodos,
          updatedTask,
        ]);
      } else {
        newTodos.push(updatedTask);
      }

      return newTodos;
    });

    setCompletedTodos((prevCompletedTodos) => {
      const taskIndex = prevCompletedTodos.findIndex((task) => task.id === id);
      if (taskIndex === -1) return prevCompletedTodos;

      const updatedTask = {
        ...prevCompletedTodos[taskIndex],
        complete: !prevCompletedTodos[taskIndex].complete,
      };
      const newCompletedTodos = [...prevCompletedTodos];
      newCompletedTodos.splice(taskIndex, 1);

      if (!updatedTask.complete) {
        setTodos((prevTodos) => [...prevTodos, updatedTask]);
      }

      return newCompletedTodos;
    });
  }, []);

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

  const handleNewTask = (
    task,
    primaryDuration,
    secondaryDuration,
    numCycles,
    tilDone
  ) => {
    console.log(
      "Task:",
      task,
      primaryDuration,
      secondaryDuration,
      numCycles,
      tilDone
    );
    const newTodo = {
      id: Date.now(),
      task: task,
      complete: false,
      primaryDuration: primaryDuration,
      secondaryDuration: secondaryDuration,
      numCycles: numCycles,
      tilDone: tilDone,
      isRunning: false,
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

  console.log("Todos:", todos);
  console.log("Completed Todos:", completedTodos);

  return (
    <DndProvider backend={HTML5Backend}>
      <NewTaskForm onSubmit={handleNewTask} />
      <h3>Incomplete Tasks</h3>
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
          tilDone={todo.tilDone}
          isRunning={todo.isRunning}
        />
      ))}
      <h3>Completed Tasks</h3>
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
          moveItem={moveItem}
          onToggle={() => handleToggle(todo.id)}
          onDelete={() => handleDelete(todo.id)}
          nextTaskId={nextTaskId}
          tilDone={todo.tilDone}
          isRunning={todo.isRunning}
        />
      ))}
    </DndProvider>
  );
};

export default ToDoList;
