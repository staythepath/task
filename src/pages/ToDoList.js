import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import { Slider } from "@mui/material";
import { styled } from "@mui/system";
import ToDoItem from "../components/ToDoItem";
import NewTaskForm from "../components/NewTaskForm";
import { BsVolumeUpFill } from "react-icons/bs";
import { auth, db } from "../config/firebase";
import {
  addDoc,
  collection,
  doc,
  deleteDoc,
  query,
  orderBy,
  updateDoc,
  onSnapshot,
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

const ToDoList = ({ todos, setTodos }) => {
  const [completedTodos, setCompletedTodos] = useState([]);
  const [runningTaskIndex, setRunningTaskIndex] = useState(-1);
  const [volume, setVolume] = useState(50);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        // User is logged in
        console.log("onAuthStateChanged thinks user is logged in");

        const todosRef = collection(db, `users/${user.uid}/todoLists`);

        // Adding orderBy() to order the todos by 'order' field
        const todosQuery = query(todosRef, orderBy("order"));

        const unsubscribeFirestore = onSnapshot(todosQuery, (snapshot) => {
          const userTodos = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setTodos(userTodos);
        });

        // return cleanup function for Firestore listener
        return unsubscribeFirestore;
      } else {
        // User is logged out
        console.log("onAuthStateChanged thinks user is logged out!");
        // No Firestore cleanup needed as no listener set up
      }
    });

    // Clean up the auth listener on unmount
    return () => unsubscribeAuth();
  }, [setTodos]); // Empty array means this effect runs once on mount and cleanup on unmount

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
        setRunningTaskIndex(-1);
      } else {
        setTodos([...newTodos, updatedTask]);
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

  const deleteTask = async (userId, taskId) => {
    const taskRef = doc(db, `users/${userId}/todoLists/${taskId}`);
    setRunningTaskIndex(-1);
    try {
      await deleteDoc(taskRef);
      console.log(`Task with id ${taskId} deleted successfully.`);
    } catch (error) {
      console.error("Error deleting document: ", error);
    }
  };

  const handleDelete = (id) => {
    // Deleting the task from Firestore
    deleteTask(auth.currentUser.uid, id)
      .then(() => {
        const newTodos = todos.filter((todo) => todo.id !== id);
        setTodos(newTodos);
        console.log("Task deleted from Firestore and from state: ", id);
      })
      .catch((error) => {
        console.error("Error deleting task: ", error);
      });
  };

  const isTaskInTodos = (taskId) => {
    return todos.some((todo) => todo.id === taskId);
  };

  const handleUpdate = (updatedTask) => {
    const newTodos = todos.map((todo) =>
      todo.id === updatedTask.id ? updatedTask : todo
    );
    setTodos(newTodos);

    const newCompletedTodos = completedTodos.map((completedTodo) =>
      completedTodo.id === updatedTask.id ? updatedTask : completedTodo
    );
    setCompletedTodos(newCompletedTodos);
  };

  const addTask = async (userId, task) => {
    const todosRef = collection(db, `users/${userId}/todoLists`);
    try {
      const docRef = await addDoc(todosRef, task);
      console.log("Document written with ID: ", docRef.id);
      return docRef; // Return the docRef so it can be used in handleNewTask
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  const handleNewTask = (
    task,
    primaryDuration,
    secondaryDuration,
    numCycles,
    tilDone
  ) => {
    const newTodo = {
      task: task,
      complete: false,
      primaryDuration: primaryDuration,
      secondaryDuration: secondaryDuration,
      numCycles: numCycles,
      tilDone: tilDone,
      isRunning: false,
      userId: auth.currentUser.uid,
      order: todos.length,
    };

    // Adding the new task to Firestore
    addTask(auth.currentUser.uid, newTodo)
      .then((docRef) => {
        // Update newTodo id with Firestore document id
        newTodo.id = docRef.id;
        setTodos([...todos, newTodo]);
        console.log("New task added to Firestore and to state: ", newTodo);
      })
      .catch((error) => {
        console.error("Error adding task: ", error);
      });
  };

  const handleOnDragEnd = (result) => {
    if (!result.destination) return;
    if (
      result.source.droppableId === "completedTodos" &&
      result.destination.droppableId === "todos"
    ) {
      return;
    }

    const items = Array.from(todos);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update local state immediately
    setTodos(items);

    // Update Firestore in the background
    items.forEach((todo, index) => {
      const docRef = doc(
        db,
        `users/${auth.currentUser.uid}/todoLists`,
        todo.id
      );
      updateDoc(docRef, { order: index });
    });

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
