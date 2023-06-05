import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import { Slider } from "@mui/material";
import { styled } from "@mui/system";
import ToDoItemRun from "../components/ToDoItemRun";
import { BsPlayFill, BsPauseFill, BsArrowRepeat } from "react-icons/bs";
import { BsVolumeUpFill } from "react-icons/bs";

import { auth, db } from "../config/firebase";
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  deleteDoc,
} from "firebase/firestore";

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

const ToDoRun = ({ todos, setTodos, completedTodos, setCompletedTodos }) => {
  const [runningTaskIndex, setRunningTaskIndex] = useState(-1);
  const [volume, setVolume] = useState(25);
  const [showModal, setShowModal] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  let userId = auth.currentUser.uid;

  const todoListId = "your-todo-list-id";

  useEffect(() => {
    const fetchTodos = async () => {
      const todosQuery = query(
        collection(db, `users/${userId}/todoLists/${todoListId}/todos`)
      );
      const todosSnapshot = await getDocs(todosQuery);
      let todosData = todosSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Sort todos by order
      todosData.sort((a, b) => a.order - b.order);

      setTodos(todosData);
    };

    fetchTodos();
  }, []);

  useEffect(() => {
    const fetchCompletedTodos = async () => {
      const completedTodosQuery = query(
        collection(db, `users/${userId}/todoLists/${todoListId}/completedTodos`)
      );
      const completedTodosSnapshot = await getDocs(completedTodosQuery);
      const completedTodosData = completedTodosSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCompletedTodos(completedTodosData);
    };

    fetchCompletedTodos();
  }, []);

  useEffect(() => {
    console.log("we are about to update firestore with", todos);
  }, [todos]);

  const handleToggle = async (id, completed) => {
    const todoListId = "your-todo-list-id"; // replace with your actual todoList ID
    const taskIndex = todos.findIndex((task) => task.id === id);

    let movedTask;

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
          order: null,
        };
        setCompletedTodos([...completedTodos, completedTask]);

        // Update Firestore
        movedTask = completedTask;
        await deleteDoc(
          doc(
            db,
            `users/${auth.currentUser.uid}/todoLists/${todoListId}/todos/${id}`
          )
        );
        await setDoc(
          doc(
            db,
            `users/${auth.currentUser.uid}/todoLists/${todoListId}/completedTodos/${id}`
          ),
          movedTask
        );
      } else {
        setTodos([...newTodos, updatedTask]);

        // Update Firestore
        movedTask = updatedTask;
        await deleteDoc(
          doc(
            db,
            `users/${auth.currentUser.uid}/todoLists/${todoListId}/completedTodos/${id}`
          )
        );
        await setDoc(
          doc(
            db,
            `users/${auth.currentUser.uid}/todoLists/${todoListId}/todos/${id}`
          ),
          movedTask
        );
      }
    } else {
      const completedTaskIndex = completedTodos.findIndex(
        (task) => task.id === id
      );
      const updatedTask = {
        ...completedTodos[completedTaskIndex],
        complete: false,
        isRunning: false, // Here we set the complete property to false, indicating the task is now incomplete
      };
      setRunningTaskIndex(-1);
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
        order: null,
      };
      setTodos([...todos, incompleteTask]);

      // Update Firestore
      movedTask = incompleteTask;
      await deleteDoc(
        doc(
          db,
          `users/${auth.currentUser.uid}/todoLists/${todoListId}/completedTodos/${id}`
        )
      );
      await setDoc(
        doc(
          db,
          `users/${auth.currentUser.uid}/todoLists/${todoListId}/todos/${id}`
        ),
        movedTask
      );
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

  const startFirstTask = () => {
    if (todos.length > 0 && runningTaskIndex === -1) {
      setShowModal(true);
    }
  };

  const actuallyStartFirstTask = () => {
    if (todos.length > 0) {
      setRunningTaskIndex(0);
      let updatedTodos = [...todos];
      updatedTodos[0] = { ...updatedTodos[0], isRunning: true };
      setTodos(updatedTodos);
    }
    setShowModal(false);
  };

  const pauseOrResumeTask = () => {
    console.log("pause or resume task");
    if (todos.length > 0 && runningTaskIndex !== -1) {
      let updatedTodos = [...todos];
      let isRunning = updatedTodos[runningTaskIndex].isRunning;
      updatedTodos[runningTaskIndex] = {
        ...updatedTodos[runningTaskIndex],
        isRunning: !isRunning,
      };
      setTodos(updatedTodos);
    }
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
        <div
          style={{
            display: "flex",
            justifyContent: "center",
          }}
        >
          <button
            onClick={
              runningTaskIndex !== -1 ? pauseOrResumeTask : startFirstTask
            }
            style={{
              width: "10%",
              height: "25%",
            }}
          >
            {runningTaskIndex !== -1
              ? todos[runningTaskIndex].isRunning
                ? "Pause"
                : "Resume"
              : "Start"}
          </button>
        </div>
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
                  onDelete={() => handleDelete(todo.id)}
                  tilDone={todo.tilDone}
                  isRunning={todo.isRunning}
                  setIsRunning={setIsRunning}
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
      {showModal && (
        <>
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              zIndex: 999,
            }}
          />
          <div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              backgroundColor: "#4b4a4a",
              padding: "20px",
              zIndex: 1000,
              borderRadius: "10px",
              textAlign: "center",
              boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.1)",
            }}
          >
            <p>
              Are you sure you want to start? Once you start this running, you
              can't edit or rearrange your tasks. I recommend you double check
              you have everything set and ordered properly first.{" "}
            </p>
            <button onClick={actuallyStartFirstTask}>Yes, start</button>
            <button onClick={() => setShowModal(false)}>No, cancel</button>
          </div>
        </>
      )}
    </DragDropContext>
  );
};

export default ToDoRun;
