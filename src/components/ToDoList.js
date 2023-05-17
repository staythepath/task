import React, { useState } from "react";
import { DragDropContext, Droppable } from "react-beautiful-dnd";

import ToDoItem from "./ToDoItem";
import NewTaskForm from "./NewTaskForm";

const ToDoList = () => {
  const [todos, setTodos] = useState([]);
  const [completedTodos, setCompletedTodos] = useState([]);
  const [runningTaskIndex, setRunningTaskIndex] = useState(-1);

  const handleToggle = (id, completed) => {
    const taskIndex = todos.findIndex((task) => task.id === id);
    if (taskIndex !== -1) {
      const updatedTask = {
        ...todos[taskIndex],
        complete:
          completed !== undefined ? completed : !todos[taskIndex].complete,
      };
      const newTodos = [...todos];
      newTodos.splice(taskIndex, 1);
      setTodos(newTodos);
      if (updatedTask.complete) {
        const completedTask = {
          ...updatedTask,
          isRunning: false,
        };
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
        complete: false, // Here we set the complete property to false, indicating the task is now incomplete
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

  const isTaskInTodos = (taskId) => {
    return todos.some((todo) => todo.id === taskId);
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

  const handleOnDragEnd = (result) => {
    console.log(result);
    const draggableId = parseInt(result.draggableId, 10); // This parses the ID back into an integer
    console.log(draggableId);
    if (!result.destination) return;
    const items = Array.from(todos);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setTodos(items);
  };

  return (
    <DragDropContext onDragEnd={handleOnDragEnd}>
      <NewTaskForm onSubmit={handleNewTask} />
      <h3>Not yet done</h3>
      <Droppable droppableId="todos">
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef}>
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
                isRunning={todo.isRunning}
                runningTaskIndex={runningTaskIndex}
                setRunningTaskIndex={setRunningTaskIndex}
                isTaskInTodos={isTaskInTodos}
                draggableId={todo.id.toString()}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
      <h3>Donzo</h3>
      <Droppable droppableId="completedTodos">
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef}>
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
                onToggle={() => handleToggle(todo.id, index)}
                onDelete={() => handleDelete(todo.id)}
                tilDone={todo.tilDone}
                isRunning={false}
                runningTaskIndex={runningTaskIndex}
                setRunningTaskIndex={setRunningTaskIndex}
                isTaskInTodos={isTaskInTodos}
                draggableId={todo.id.toString()}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default ToDoList;
