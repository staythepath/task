import React, { useState, useEffect, useMemo } from "react";
import { DragDropContext, Droppable } from "react-beautiful-dnd";

import TodoItemTom from "./TodoItemTom";
import NewTaskFormNoPad from "./NewTaskFormNoPad";
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

const tomorrow = (() => {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date;
})();

const todoTListId = `${tomorrow.getFullYear()}-${
  tomorrow.getMonth() + 1
}-${tomorrow.getDate()}`;

const ToDoList = ({ isRunning, setIsRunning, todosT, setTodosT }) => {
  const [runningTaskIndex, setRunningTaskIndex] = useState(-1);

  const [user, setUser] = useState({ role: "guest" }); // Default user state

  const [completedTodosT, setCompletedTodosT] = useState([]);
  const tomorrow = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return date;
  }, []);

  useEffect(() => {
    // This observer returns the current user if there's one logged in.
    // Otherwise, it returns null.
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        // User is signed in.
        setUser(authUser);
      } else {
        // No user is signed in. Set user to guest.
        setUser({ role: "guest" });
      }
    });

    // Unsubscribe from the listener when the component is unmounted.
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        const todoListId = `${tomorrow.getFullYear()}-${
          tomorrow.getMonth() + 1
        }-${tomorrow.getDate()}`;

        const todosTRef = collection(
          db,
          `users/${user.uid}/todoLists/${todoListId}/todos`
        );

        const todosTQuery = query(todosTRef, orderBy("order"));

        const unsubscribeTodosT = onSnapshot(todosTQuery, (snapshot) => {
          const userTodosT = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setTodosT(userTodosT);
        });

        // Return cleanup function for Firestore listeners
        return () => {
          unsubscribeTodosT();
        };
      } else {
        // If no user is logged in, then load the data from local storage
        const localStorageTodos = localStorage.getItem("todos");
        const localStorageCompletedTodos =
          localStorage.getItem("completedTodos");

        if (localStorageTodos && localStorageCompletedTodos) {
          setTodosT(JSON.parse(localStorageTodos));
          setCompletedTodosT(JSON.parse(localStorageCompletedTodos));
        }
      }
    });

    // Clean up the auth listener on unmount
    return () => unsubscribeAuth();
  }, [setTodosT, setCompletedTodosT, tomorrow]);

  // ...other code

  const deleteTask = async (userId, taskId, id) => {
    const todoListId = `${tomorrow.getFullYear()}-${
      tomorrow.getMonth() + 1
    }-${tomorrow.getDate()}`;
    const taskRef = doc(
      db,
      `users/${auth.currentUser.uid}/todoLists/${todoListId}/todos/${taskId}`
    );
    setRunningTaskIndex(-1);
    try {
      await deleteDoc(taskRef);
      console.log(`Task with id ${taskId} deleted successfully.`);
    } catch (error) {
      console.error("Error deleting document: ", error);
    }
  };

  const handleDelete = (id) => {
    if (user.uid) {
      // Deleting the task from Firestore
      deleteTask(user.uid, id)
        .then(() => {
          const newTodosT = todosT.filter((todoT) => todoT.id !== id);
          setTodosT(newTodosT);
          console.log("Task deleted from Firestore and from state: ", id);
        })
        .catch((error) => {
          console.error("Error deleting task: ", error);
        });
    }
  };

  const isTaskInTodosT = (taskId) => {
    return todosT.some((todoT) => todoT.id === taskId);
  };

  const handleUpdate = async (userId, updatedTask) => {
    const newTodosT = todosT.map((todo) =>
      todo.id === updatedTask.id ? updatedTask : todo
    );
    setTodosT(newTodosT);

    const newCompletedTodosT = completedTodosT.map((completedTodo) =>
      completedTodo.id === updatedTask.id ? updatedTask : completedTodo
    );
    setCompletedTodosT(newCompletedTodosT);

    const collectionPath = isTaskInTodosT(updatedTask.id)
      ? "todos"
      : "completedTodos";

    const todoListId = `${tomorrow.getFullYear()}-${
      tomorrow.getMonth() + 1
    }-${tomorrow.getDate()}`;
    const taskRef = doc(
      db,
      `users/${userId}/todoLists/${todoListId}/${collectionPath}/${updatedTask.id}`
    );

    // Create an object of fields to update, excluding any that are undefined
    const fieldsToUpdate = [
      "task",
      "complete",
      "primaryDuration",
      "secondaryDuration",
      "numCycles",
      "tilDone",
      "isRunning",
      "order",
    ].reduce((acc, curr) => {
      if (updatedTask[curr] !== undefined) {
        acc[curr] = updatedTask[curr];
      }
      return acc;
    }, {});

    try {
      await updateDoc(taskRef, fieldsToUpdate);
      console.log("Document updated successfully in Firestore");
    } catch (e) {
      console.error("Error updating document in Firestore: ", e);
    }
  };

  const addTask = async (userId, task) => {
    const todoListId = `${tomorrow.getFullYear()}-${
      tomorrow.getMonth() + 1
    }-${tomorrow.getDate()}`;

    if (userId) {
      const todosTRef = collection(
        db,
        `users/${userId}/todoLists/${todoListId}/todos/`
      );

      try {
        const docRef = await addDoc(todosTRef, task);
        console.log("Document written with ID: ", docRef.id);
        return docRef; // Return the docRef so it can be used in handleNewTask
      } catch (e) {
        console.error("Error adding document: ", e);
      }
    } else {
      // If no user is logged in, then store the data in local storage
      const newId = Date.now(); // Create a new ID based on the current timestamp
      const newTask = { ...task, id: newId }; // Create a new task with this ID
      const updatedTodosT = [...todosT, newTask]; // Add the new task to the current state

      setTodosT(updatedTodosT); // Update the state
      localStorage.setItem("todos", JSON.parse(updatedTodosT)); // Store the updated state in local storage

      return Promise.resolve({ id: newId }); // Return a resolved promise with the new ID
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
      order: todosT.length,
      column: "column-1",
    };

    // Adding the new task to Firestore
    addTask(auth.currentUser ? auth.currentUser.uid : null, newTodo)
      .then((docRef) => {
        // Update newTodo id with Firestore document id
        newTodo.id = docRef.id;
        setTodosT([...todosT, newTodo]);
        console.log("New task added to Firestore and to state: ", newTodo);
      })
      .catch((error) => {
        console.error("Error adding task: ", error);
      });
  };

  const handleOnDragEnd = (result) => {
    if (!result.destination) return;

    const sourceId = result.source.droppableId;
    const destinationId = result.destination.droppableId;

    // Do not allow moving tasks from completedTodos to todos, and vice versa.
    if (sourceId !== destinationId) {
      return;
    }

    if (sourceId === "completedTodos") {
      // Don't allow rearranging tasks within completedTodos.
      return;
    }

    const items = Array.from(todosT);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update local state immediately
    setTodosT(items);

    // Update Firestore in the background
    items.forEach((todoT, index) => {
      const docRef = doc(
        db,
        `users/${auth.currentUser.uid}/todoLists/${todoTListId}/todos/`,
        todoT.id
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

  return (
    <>
      <NewTaskFormNoPad
        onSubmit={handleNewTask}
        style={{ paddingBottom: "0px" }}
      />
      <DragDropContext onDragEnd={handleOnDragEnd}>
        <div className="ToDoList">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              paddingBottom: "0px",
              paddingTop: "0px",
            }}
          >
            <h3>Tasks for tomorrow</h3>
          </div>

          <Droppable droppableId="todos">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {todosT.map((todoT, index) => (
                  <TodoItemTom
                    key={todoT.id}
                    handleUpdate={handleUpdate}
                    index={index}
                    id={todoT.id}
                    task={todoT.task}
                    complete={todoT.complete}
                    primaryDuration={todoT.primaryDuration}
                    secondaryDuration={todoT.secondaryDuration}
                    numCycles={todoT.numCycles}
                    onDelete={() => handleDelete(todoT.id)}
                    tilDone={todoT.tilDone}
                    isRunning={todoT.isRunning}
                    setIsRunning={setIsRunning}
                    runningTaskIndex={runningTaskIndex}
                    setRunningTaskIndex={setRunningTaskIndex}
                    isTaskInTodos={isTaskInTodosT}
                    draggableId={todoT.id.toString()}
                    order={todoT.order}
                    todos={todosT}
                    setTodos={setTodosT}
                  />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>
      </DragDropContext>
    </>
  );
};

export default ToDoList;

////////////////////////////////////////////////////////////////
