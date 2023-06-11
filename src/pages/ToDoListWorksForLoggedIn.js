import React, { useState, useEffect, useCallback, useMemo } from "react";
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
  setDoc,
  getDocs,
} from "firebase/firestore";

const StyledSlider = styled(Slider)({
  width: 200,
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

const date = new Date();
const todoListId = `${date.getFullYear()}-${
  date.getMonth() + 1
}-${date.getDate()}`;

const ToDoList = ({
  todos,
  setTodos,
  completedTodos,
  setCompletedTodos,
  isRunning,
  setIsRunning,
}) => {
  const [runningTaskIndex, setRunningTaskIndex] = useState(-1);
  const [volume, setVolume] = useState(20);
  const [user, setUser] = useState({ role: "guest" }); // Default user state
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        // User is signed in.
        setCurrentUser(authUser);
        setUser(authUser);
      } else {
        // No user is signed in. Set user to guest.
        setCurrentUser(null);
        setUser({ role: "guest" });
      }
    });

    // Unsubscribe from the listener when the component is unmounted.
    return () => unsubscribe();
  }, []);

  // Create a memoized todosRef
  const todosRef = useMemo(
    () =>
      currentUser
        ? collection(
            db,
            `users/${currentUser.uid}/todoLists/${todoListId}/todos/`
          )
        : null, // You could provide a default value here if necessary
    [currentUser, todoListId]
  );

  // Separate useEffect for initial data fetching
  const fetchTasks = useCallback(async () => {
    const user = auth.currentUser;
    const todoListId = `${date.getFullYear()}-${
      date.getMonth() + 1
    }-${date.getDate()}`;

    if (user) {
      const todosRef = collection(
        db,
        `users/${user.uid}/todoLists/${todoListId}/todos/`
      );

      const tasksSnapshot = await getDocs(todosRef);
      const tasksData = tasksSnapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .sort((a, b) => a.order - b.order); // sort tasks by order

      // Update todos
      setTodos(tasksData);
      console.log("Fetch Tasks Ran");
      console.log("Here is task data: ", tasksData);

      // Distribute tasks among columns based on their column value
      const tasks = {};
      tasksData.forEach((task) => {
        tasks[task.id] = task;
      });

      // Return the tasks
      return tasks;
    } else {
      // If no user is logged in, load the data from local storage
      const localStorageTodos = localStorage.getItem("todos");
      const localStorageCompletedTodos = localStorage.getItem("completedTodos");

      if (localStorageTodos && localStorageCompletedTodos) {
        const tasksData = JSON.parse(localStorageTodos);
        setTodos(tasksData);

        const tasks = {};
        tasksData.forEach((task) => {
          tasks[task.id] = task;
        });

        return tasks;
      }
    }
  }, [setTodos]);

  useEffect(() => {
    // Fetch tasks from Firestore or local storage
    if (currentUser) {
      const todoListId = `${date.getFullYear()}-${
        date.getMonth() + 1
      }-${date.getDate()}`;

      const todosRef = collection(
        db,
        `users/${currentUser.uid}/todoLists/${todoListId}/todos`
      );

      const unsubscribeTodos = onSnapshot(todosRef, (snapshot) => {
        const userTodos = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTodos(userTodos);
        console.log("this is the userTodos from the useEffect hook", userTodos);
      });

      // Return cleanup function for Firestore listener
      return () => unsubscribeTodos();
    } else {
      fetchTasks();
    }
  }, [fetchTasks, currentUser]);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        const todoListId = `${date.getFullYear()}-${
          date.getMonth() + 1
        }-${date.getDate()}`;

        const todosRef = collection(
          db,
          `users/${user.uid}/todoLists/${todoListId}/todos`
        );
        const completedTodosRef = collection(
          db,
          `users/${user.uid}/todoLists/${todoListId}/completedTodos`
        );

        const todosQuery = query(todosRef, orderBy("order"));
        const completedTodosQuery = query(completedTodosRef, orderBy("order"));

        const unsubscribeTodos = onSnapshot(todosQuery, (snapshot) => {
          const userTodos = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setTodos(userTodos);
          console.log(
            "this is the userTodos from the useEffect hook",
            userTodos
          );
        });

        const unsubscribeCompletedTodos = onSnapshot(
          completedTodosQuery,
          (snapshot) => {
            const userCompletedTodos = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setCompletedTodos(userCompletedTodos);
            console.log("here is userCompletedTodos", userCompletedTodos);
          }
        );

        // Return cleanup function for Firestore listeners
        return () => {
          unsubscribeTodos();
          unsubscribeCompletedTodos();
        };
      } else {
        // If no user is logged in, then load the data from local storage
        const localStorageTodos = localStorage.getItem("todos");
        const localStorageCompletedTodos =
          localStorage.getItem("completedTodos");

        if (localStorageTodos && localStorageCompletedTodos) {
          setTodos(JSON.parse(localStorageTodos));
          setCompletedTodos(JSON.parse(localStorageCompletedTodos));
        }
      }
    });

    // Clean up the auth listener on unmount
    return () => unsubscribeAuth();
  }, [setTodos, setCompletedTodos]);

  // ...other code///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////
  //////////////////////
  //////

  const handleToggle = async (id, completed) => {
    const todoListId = `${date.getFullYear()}-${
      date.getMonth() + 1
    }-${date.getDate()}`;

    const taskIndex = todos.findIndex((task) => task.id === id);
    let movedTask;

    let newTodos = [...todos];
    newTodos.splice(taskIndex, 1);
    newTodos = newTodos.map((task, index) => ({ ...task, order: index })); // reset the order of remaining tasks

    if (user && user.role !== "guest") {
      if (taskIndex !== -1) {
        const updatedTask = {
          ...todos[taskIndex],
          complete:
            completed !== undefined ? completed : !todos[taskIndex].complete,
        };

        if (updatedTask.complete) {
          const completedTask = {
            ...updatedTask,
            isRunning: false,
            order: null,
          };
          setCompletedTodos([...completedTodos, completedTask]);
          setTodos(newTodos);

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
          updatedTask.order = newTodos.length;
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
          order: todos.length, // Here we set the order to the end of the list
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

      // Update Firestore for the remaining todos' orders
      for (let i = 0; i < newTodos.length; i++) {
        const updatedTodo = newTodos[i];
        await updateDoc(
          doc(
            db,
            `users/${user.uid}/todoLists/${todoListId}/todos/${updatedTodo.id}`
          ),
          { order: updatedTodo.order }
        );
      }
    } else {
      // Update data in local storage when no user is logged in
      if (taskIndex !== -1) {
        const updatedTask = {
          ...todos[taskIndex],
          complete:
            completed !== undefined ? completed : !todos[taskIndex].complete,
        };

        if (updatedTask.complete) {
          const completedTask = {
            ...updatedTask,
            isRunning: false,
            order: null,
          };
          const newCompletedTodos = [...completedTodos, completedTask];
          setCompletedTodos(newCompletedTodos);
          setTodos(newTodos);
          localStorage.setItem("todos", JSON.stringify(newTodos));
          localStorage.setItem(
            "completedTodos",
            JSON.stringify(newCompletedTodos)
          );
        } else {
          updatedTask.order = newTodos.length;
          const newTodosWithUpdated = [...newTodos, updatedTask];
          setTodos(newTodosWithUpdated);
          localStorage.setItem("todos", JSON.stringify(newTodosWithUpdated));
        }
      } else {
        const completedTaskIndex = completedTodos.findIndex(
          (task) => task.id === id
        );
        const updatedTask = {
          ...completedTodos[completedTaskIndex],
          complete: false,
          isRunning: false,
        };
        setRunningTaskIndex(-1);
        const newCompletedTodos = [...completedTodos];
        newCompletedTodos.splice(completedTaskIndex, 1);
        setCompletedTodos(newCompletedTodos);

        const incompleteTask = {
          ...updatedTask,
          primaryDuration: updatedTask.primaryDuration,
          secondaryDuration: updatedTask.secondaryDuration,
          numCycles: updatedTask.numCycles,
          tilDone: updatedTask.tilDone,
          isRunning: false,
          order: todos.length,
        };
        const newTodosWithIncomplete = [...todos, incompleteTask];
        setTodos(newTodosWithIncomplete);
        localStorage.setItem("todos", JSON.stringify(newTodosWithIncomplete));
        localStorage.setItem(
          "completedTodos",
          JSON.stringify(newCompletedTodos)
        );
      }
    }
  };

  const deleteTask = async (taskId) => {
    if (user.role !== "guest") {
      const taskRef = doc(
        db,
        `users/${user.uid}/todoLists/${todoListId}/todos/${taskId}`
      );
      try {
        await deleteDoc(taskRef);
        console.log(`Task with id ${taskId} deleted successfully.`);
      } catch (error) {
        console.error("Error deleting document: ", error);
      }
    } else {
      // If no user is authenticated, update the state and local storage directly
      const updatedTodos = todos.filter((todo) => todo.id !== taskId);
      setTodos(updatedTodos);
      localStorage.setItem("todos", JSON.stringify(updatedTodos));
    }
  };

  const handleDelete = (id) => {
    deleteTask(id)
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

  const handleUpdate = async (userId, updatedTask) => {
    const newTodos = todos.map((todo) =>
      todo.id === updatedTask.id ? updatedTask : todo
    );
    setTodos(newTodos);

    const newCompletedTodos = completedTodos.map((completedTodo) =>
      completedTodo.id === updatedTask.id ? updatedTask : completedTodo
    );
    setCompletedTodos(newCompletedTodos);

    const collectionPath = isTaskInTodos(updatedTask.id)
      ? "todos"
      : "completedTodos";

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
    const todoListId = `${date.getFullYear()}-${
      date.getMonth() + 1
    }-${date.getDate()}`;

    if (userId !== null) {
      // explicitly check if userId is not null
      const todosRef = collection(
        db,
        `users/${userId}/todoLists/${todoListId}/todos/`
      );

      try {
        const docRef = await addDoc(todosRef, task);
        console.log("Document written with ID: ", docRef.id);
        return docRef; // Return the docRef so it can be used in handleNewTask
      } catch (e) {
        console.error("Error adding document: ", e);
      }
    } else {
      // If no user is logged in, then store the data in local storage
      const newId = Date.now(); // Create a new ID based on the current timestamp
      const newTask = { ...task, id: newId }; // Create a new task with this ID
      const updatedTodos = [...todos, newTask]; // Add the new task to the current state

      setTodos(updatedTodos); // Update the state
      localStorage.setItem("todos", JSON.stringify(updatedTodos)); // Store the updated state in local storage

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
      order: todos.length,
      column: "column-1",
    };

    if (auth.currentUser) {
      newTodo.userId = auth.currentUser.uid;
    }

    // Adding the new task to Firestore or local storage
    addTask(auth.currentUser ? auth.currentUser.uid : null, newTodo)
      .then((docRef) => {
        // Update newTodo id with Firestore document id or local storage id
        newTodo.id = docRef.id;
        setTodos([...todos, newTodo]);
        console.log(
          "New task added to Firestore/local storage and to state: ",
          newTodo
        );
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

    const items = Array.from(todos);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update local state immediately
    setTodos(items);

    // Update Firestore in the background
    items.forEach((todo, index) => {
      const docRef = doc(
        db,
        `users/${auth.currentUser.uid}/todoLists/${todoListId}/todos/`,
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
    <>
      <NewTaskForm onSubmit={handleNewTask} />
      <DragDropContext onDragEnd={handleOnDragEnd}>
        <div className="ToDoList">
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
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <button style={{ backgroundColor: "transparent" }}>
                <BsVolumeUpFill size={30} />
              </button>
              <div style={{ width: "100%" }}>
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
                    setIsRunning={setIsRunning}
                    runningTaskIndex={runningTaskIndex}
                    setRunningTaskIndex={setRunningTaskIndex}
                    isTaskInTodos={isTaskInTodos}
                    draggableId={todo.id.toString()}
                    volume={volume}
                    order={todo.order}
                    todos={todos}
                    setTodos={setTodos}
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
                    setIsRunning={setIsRunning}
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
    </>
  );
};

export default ToDoList;

////////////////////////////////////////////////////////////////
