import React, { useState, useCallback } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import ToDoItem from "./ToDoItem";
import NewTaskForm from "./NewTaskForm";

const ToDoList = () => {
  const [todos, setTodos] = useState([]);
  const [completedTodos, setCompletedTodos] = useState([]);

  const handleToggle = (id, completed = false) => {
    const taskIndex = todos.findIndex((task) => task.id === id);
    if (taskIndex !== -1) {
      const updatedTask = {
        ...todos[taskIndex],
        complete: completed || !todos[taskIndex].complete,
      };
      const newTodos = [...todos];
      newTodos.splice(taskIndex, 1);
      setTodos(newTodos);
      if (updatedTask.complete) {
        // Update the completed task with the correct values
        const completedTask = {
          ...updatedTask,
        };
        console.log("Updated task:", completedTask);
        setCompletedTodos([...completedTodos, completedTask]);
      } else {
        setTodos([...newTodos, updatedTask]);
      }
    } else {
      const completedTaskIndex = completedTodos.findIndex(
        (task) => task.id === id
      );
      const updatedTask = {
        ...completedTodos[completedTaskIndex],
        complete: completed || !completedTodos[completedTaskIndex].complete,
      };
      const newCompletedTodos = [...completedTodos];
      newCompletedTodos.splice(completedTaskIndex, 1);
      setCompletedTodos(newCompletedTodos);
      // Update the incomplete task with the correct values
      const incompleteTask = {
        ...updatedTask,
        primaryDuration: updatedTask.primaryDuration,
        secondaryDuration: updatedTask.secondaryDuration,
        numCycles: updatedTask.numCycles,
        tilDone: updatedTask.tilDone,
      };
      setTodos([...todos, incompleteTask]);
    }
  };

  const handleDelete = (id) => {
    const newTodos = todos.filter((todo) => todo.id !== id);
    setTodos(newTodos);
  };

  const handleUpdate = (updatedTask) => {
    const newTodos = todos.map((todo) =>
      todo.id === updatedTask.id ? updatedTask : todo
    );
    const newCompletedTodos = completedTodos.map((todo) =>
      todo.id === updatedTask.id ? updatedTask : todo
    );
    setTodos(newTodos);
    setCompletedTodos(newCompletedTodos);
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
          onToggle={() => handleToggle(todo.id, index)}
          onDelete={() => handleDelete(todo.id)}
          tilDone={todo.tilDone}
          isRunning={todo.isRunning}
        />
      ))}
    </DndProvider>
  );
};

export default ToDoList;
