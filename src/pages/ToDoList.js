import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import { Slider } from "@mui/material";
import { styled } from "@mui/system";
import ToDoItem from "../components/ToDoItem";
import NewTaskForm from "../components/NewTaskForm";
import { BsVolumeUpFill } from "react-icons/bs";

const StyledSlider = styled(Slider)({
  width: 300,
  margin: "0 auto",

  color: "black",
  "& .MuiSlider-thumb": {
    height: 24,
    width: 24,
    backgroundColor: "#ccc",
  },
  "& .MuiSlider-track": {
    height: 8,
    backgroundColor: "gray",
  },
  "& .MuiSlider-rail": {
    height: 8,
    backgroundColor: "gray",
  },
});

const ToDoList = ({ todos, setTodos }) => {
  const [completedTodos, setCompletedTodos] = useState([]);
  const [runningTaskIndex, setRunningTaskIndex] = useState(-1);
  const [volume, setVolume] = useState(50);

  useEffect(() => {
    const storedTodos = JSON.parse(localStorage.getItem("todos")) || [];
    setTodos(storedTodos);
  }, [setTodos]);

  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    const storedCompletedTodos =
      JSON.parse(localStorage.getItem("completedTodos")) || [];
    setCompletedTodos(storedCompletedTodos);
  }, []);

  useEffect(() => {
    localStorage.setItem("completedTodos", JSON.stringify(completedTodos));
  }, [completedTodos]);

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
        isRunning: false,
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
    console.log(todos);
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
    if (!result.destination) return;
    const items = Array.from(todos);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setTodos(items);

    // If the running task is the one we moved, update the runningTaskIndex
    if (runningTaskIndex === result.source.index) {
      setRunningTaskIndex(result.destination.index);
    } else {
      // If the running task was not the one we moved but it was affected by the rearrangement, update its index accordingly
      if (
        result.destination.index <= runningTaskIndex &&
        result.source.index > runningTaskIndex
      ) {
        setRunningTaskIndex(runningTaskIndex + 1);
      } else if (
        result.destination.index >= runningTaskIndex &&
        result.source.index < runningTaskIndex
      ) {
        setRunningTaskIndex(runningTaskIndex - 1);
      }
    }
  };

  const handleVolumeChange = (event, newValue) => {
    setVolume(newValue);
  };

  return (
    <DragDropContext onDragEnd={handleOnDragEnd}>
      <div className="ToDoList">
        <NewTaskForm onSubmit={handleNewTask} />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h3>Not yet done</h3>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
            }}
          >
            <button
              style={{ backgroundColor: "transparent", marginRight: "0px" }}
            >
              <BsVolumeUpFill size={30} />
            </button>
            <div style={{ width: 325 }}>
              {" "}
              {/* Slider Container */}
              <StyledSlider
                value={volume}
                onChange={handleVolumeChange}
                aria-labelledby="continuous-slider"
              />
            </div>
          </div>
        </div>

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
                  volume={volume}
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
      </div>
    </DragDropContext>
  );
};

export default ToDoList;
