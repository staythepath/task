import React, { useState, useEffect, useCallback } from "react";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import { Slider } from "@mui/material";
import { styled } from "@mui/system";
import ToDoItem from "../components/ToDoItem";
import NewTaskForm from "../components/NewTaskForm";
import { BsVolumeUpFill, BsVolumeMuteFill } from "react-icons/bs";
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
  where,
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
  runningTaskIndex,
  setRunningTaskIndex,
}) => {
  const [volume, setVolume] = useState(20);
  const [user, setUser] = useState({ role: "guest" }); // Default user state
  const [currentUser, setCurrentUser] = useState(null);

  const [muted, setMuted] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(20);
  const [elapsedTime, setElapsedTime] = useState(0);

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

  useEffect(() => {
    console.log("Here are the todos after they've been updated", todos);
  }, [todos]);

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
      setTimeout(async () => {
        // If no user is logged in, load the data from local storage
        const localStorageTodos = localStorage.getItem("todos");
        const localStorageCompletedTodos =
          localStorage.getItem("completedTodos");

        if (localStorageTodos) {
          const tasksData = JSON.parse(localStorageTodos);

          const tasks = {};
          tasksData.forEach((task) => {
            tasks[task.id] = task;
          });

          console.log("Here is tasksData before the setTodos", tasksData);

          await setTodos(tasksData);

          console.log("Here is tasksData after the setTodos", tasksData);
          console.log("Fetch Tasks Else If Ran");

          if (localStorageCompletedTodos) {
            const completedTasksData = JSON.parse(localStorageCompletedTodos);
            await setCompletedTodos(completedTasksData);
          }

          return tasks;
        }
      }, 1); // 1000ms delay = 1 second
    }
  }, [setCompletedTodos, setTodos]);

  useEffect(() => {
    if (currentUser) {
      const todoListId = `${date.getFullYear()}-${
        date.getMonth() + 1
      }-${date.getDate()}`;

      const todosRef = collection(
        db,
        `users/${currentUser.uid}/todoLists/${todoListId}/todos`
      );

      const unsubscribeTodos = onSnapshot(todosRef, (snapshot) => {
        const userTodos = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .sort((a, b) => a.order - b.order);
        setTodos(userTodos);
        console.log("this is the userTodos from the useEffect hook", userTodos);
      });

      // Return cleanup function for Firestore listener
      return () => unsubscribeTodos();
    } else {
      fetchTasks();
    }
  }, [fetchTasks, currentUser, setTodos]);

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
        fetchTasks();
      }
    });

    // Clean up the auth listener on unmount
    return () => unsubscribeAuth();
  }, [fetchTasks, setCompletedTodos, setTodos]);

  useEffect(() => {
    if (currentUser) {
      const startTaskId = "start";

      const todoListRef = collection(
        db,
        `users/${currentUser.uid}/todoLists/${todoListId}/todos`
      );

      const completedTodoListRef = collection(
        db,
        `users/${currentUser.uid}/todoLists/${todoListId}/completedTodos`
      );

      const specialOrder = -1;

      const startTask = {
        id: startTaskId,
        task: "Visualize yourself doing all the steps of each task.",
        completed: false,
        complete: false,
        place: "start",
        column: "column-2",
        isRunning: false,
        isSpecial: true,
        numCycles: 1,
        order: specialOrder,
        primaryDuration: 60,
        secondaryDuration: 0,
        tilDone: false,
        user: currentUser.uid,
      };

      const checkStartTaskExists = async () => {
        const todoSnapshot = await getDocs(
          query(todoListRef, where("id", "==", startTaskId))
        );
        const completedTodoSnapshot = await getDocs(
          query(completedTodoListRef, where("id", "==", startTaskId))
        );
        return !todoSnapshot.empty || !completedTodoSnapshot.empty;
      };

      const addSpecialTaskToFirebase = async () => {
        const startTaskRef = doc(
          db,
          `users/${currentUser.uid}/todoLists/${todoListId}/todos/${startTaskId}`
        );
        await setDoc(startTaskRef, startTask);
      };

      checkStartTaskExists().then((exists) => {
        if (!exists) {
          setTodos((prevTodos) => [startTask, ...prevTodos]);
          addSpecialTaskToFirebase();
        }
      });
    }
  }, [currentUser, setTodos]);

  useEffect(() => {
    if (currentUser) {
      const endTaskId = "end";

      const todoListRef = collection(
        db,
        `users/${currentUser.uid}/todoLists/${todoListId}/todos`
      );

      const completedTodoListRef = collection(
        db,
        `users/${currentUser.uid}/todoLists/${todoListId}/completedTodos`
      );

      const specialOrder = 999;

      const endTask = {
        id: endTaskId,
        task: "Go to journals page, make some task for tomorrow, write a quick journal entry, and complete the day.",
        completed: false,
        complete: false,
        place: "end",
        column: "column-2",
        isRunning: false,
        isSpecial: true,
        numCycles: 1,
        order: specialOrder,
        primaryDuration: 86400,
        secondaryDuration: 0,
        tilDone: false,
        user: currentUser.uid,
      };

      const checkEndTaskExists = async () => {
        const todoSnapshot = await getDocs(
          query(todoListRef, where("id", "==", endTaskId))
        );
        const completedTodoSnapshot = await getDocs(
          query(completedTodoListRef, where("id", "==", endTaskId))
        );
        return !todoSnapshot.empty || !completedTodoSnapshot.empty;
      };

      const addSpecialTaskToFirebase = async () => {
        const endTaskRef = doc(
          db,
          `users/${currentUser.uid}/todoLists/${todoListId}/todos/${endTaskId}`
        );
        await setDoc(endTaskRef, endTask);
      };

      checkEndTaskExists().then((exists) => {
        if (!exists) {
          setTodos((prevTodos) => [endTask, ...prevTodos]);
          addSpecialTaskToFirebase();
        }
      });
    }
  }, [currentUser, setTodos]);

  const playApplause = (times = 1) => {
    if (times > 0) {
      const audio = new Audio("/applause.mp3");
      audio.volume = volume / 100;
      audio.play();
      setTimeout(() => playApplause(times - 1), 1000);
    }
  };

  const handleToggle = async (id, completed) => {
    const todoListId = `${date.getFullYear()}-${
      date.getMonth() + 1
    }-${date.getDate()}`;

    const taskIndex = todos.findIndex((task) => task.id === id);
    let movedTask;

    // Filter out the task that is being moved and update the orders of remaining tasks
    let newTodos = todos.filter((task, index) => index !== taskIndex);
    newTodos = newTodos.map((task, index) =>
      task.isSpecial ? task : { ...task, order: index }
    );

    if (user && user.role !== "guest") {
      if (taskIndex !== -1) {
        const updatedTask = {
          ...todos[taskIndex],
          completed:
            completed !== undefined ? completed : !todos[taskIndex].completed,
          complete:
            completed !== undefined ? completed : !todos[taskIndex].completed, // Updating the 'complete' attribute
        };
        playApplause(1);
        if (updatedTask.completed) {
          // Task is being moved from todos to completedTodos
          console.log("checking updatedTask from handleToggle", updatedTask);

          const completedTask = {
            ...updatedTask,
            isRunning: false,
            order: null,
            totalElapsedTime: elapsedTime,
          };
          setElapsedTime(0);
          // Check if the task already exists in completedTodos before adding
          if (!completedTodos.find((task) => task.id === completedTask.id)) {
            setCompletedTodos([...completedTodos, completedTask]);
          }

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
          // Task is being moved within todos
          updatedTask.order = newTodos.length;

          // Check if the task already exists in todos before adding
          if (!todos.find((task) => task.id === updatedTask.id)) {
            setTodos([...newTodos, updatedTask]);
          }

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
        // Task is being moved from completedTodos to todos
        const completedTaskIndex = completedTodos.findIndex(
          (task) => task.id === id
        );
        const updatedTask = {
          ...completedTodos[completedTaskIndex],
          completed: false,
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
          order:
            updatedTask.id === "start"
              ? -1
              : updatedTask.id === "end"
              ? 999
              : todos.length,
        };

        // Check if the task already exists in todos before adding
        if (!todos.find((task) => task.id === incompleteTask.id)) {
          setTodos([...todos, incompleteTask]);
        }

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
          completed:
            completed !== undefined ? completed : !todos[taskIndex].completed,
          complete:
            completed !== undefined ? completed : !todos[taskIndex].completed, // Updating the 'complete' attribute
        };

        if (updatedTask.completed) {
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
          completed: false,
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
          order: updatedTask.id === "start" ? -1 : todos.length,
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
    console.log("Updated task from handleUpdate: ", updatedTask);
    if (user && user.role !== "guest") {
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
        "totalElapsedTime",
      ].reduce((acc, curr) => {
        if (updatedTask[curr] !== undefined) {
          acc[curr] = updatedTask[curr];
        }
        return acc;
      }, {});

      try {
        await updateDoc(taskRef, fieldsToUpdate);
        console.log("Document updated successfully in Firestore");

        // Update state
        setTodos((prevTodos) =>
          prevTodos.map((todo) =>
            todo.id === updatedTask.id ? updatedTask : todo
          )
        );
        setCompletedTodos((prevCompletedTodos) =>
          prevCompletedTodos.map((completedTodo) =>
            completedTodo.id === updatedTask.id ? updatedTask : completedTodo
          )
        );
      } catch (e) {
        console.error("Error updating document in Firestore: ", e);
      }
    } else {
      // If no user is authenticated, update the state and local storage directly
      setTodos((prevTodos) =>
        prevTodos.map((todo) =>
          todo.id === updatedTask.id ? updatedTask : todo
        )
      );
      setCompletedTodos((prevCompletedTodos) =>
        prevCompletedTodos.map((completedTodo) =>
          completedTodo.id === updatedTask.id ? updatedTask : completedTodo
        )
      );
      localStorage.setItem("todos", JSON.stringify(todos));
      localStorage.setItem("completedTodos", JSON.stringify(completedTodos));
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
      console.log("These are the todos added to local storage ", todos);
      console.log("here is local storage", localStorage);

      return Promise.resolve({ id: newId }); // Return a resolved promise with the new ID
    }
    fetchTasks();
  };

  const handleNewTask = (
    task,
    primaryDuration,
    secondaryDuration,
    numCycles,
    tilDone
  ) => {
    // First, we ensure that the order of all regular tasks (not special) are incremented by 1
    const updatedTodos = todos.map((todo) =>
      !todo.isSpecial ? { ...todo, order: todo.order + 1 } : todo
    );

    // Find the index of the endTask
    const endTaskIndex = updatedTodos.findIndex(
      (todo) => todo.isSpecial && todo.place === "end"
    );

    // Then we add the new task with order: todos.length - 1 to insert it second from the very bottom
    const newTodo = {
      task: task,
      completed: false,
      complete: false,
      primaryDuration: primaryDuration,
      secondaryDuration: secondaryDuration,
      numCycles: numCycles,
      tilDone: tilDone,
      isRunning: false,
      order: todos.length - 1, // Insert the new task second from the very bottom
      column: "column-1",
      isSpecial: false, // new tasks added by users are not special
      totalElapsedTime: 1138,
    };

    if (auth.currentUser) {
      newTodo.userId = auth.currentUser.uid;
    }

    // Adding the new task to Firestore or local storage
    addTask(auth.currentUser ? auth.currentUser.uid : null, newTodo)
      .then((docRef) => {
        // Update newTodo id with Firestore document id or local storage id
        newTodo.id = docRef.id;
        // Add the newTodo to the updated list of todos and update the state
        updatedTodos.splice(endTaskIndex, 0, newTodo); // Insert the new task at the appropriate position
        setTodos(updatedTodos);
        console.log(
          "New task added to Firestore/local storage and to state: ",
          newTodo
        );
      })
      .catch((error) => {
        console.error("Error adding task: ", error);
      });
  };

  const handleOnDragEnd = async (result) => {
    if (!result.destination) return;

    // The following is the id of your start task
    const startTaskId = "start";
    const endTaskId = "end";

    // Cancel the operation if the user tries to move the start task
    if (result.draggableId === startTaskId) {
      console.log("Sorry, you can't move the start task!");
      return;
    }

    if (result.draggableId === endTaskId) {
      console.log("Sorry, you can't move the end task!");
      return;
    }

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

    // Update local storage
    localStorage.setItem("todos", JSON.stringify(items));

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

    // Update Firestore in the background if a user is logged in
    if (user && user.role !== "guest") {
      items.forEach(async (todo, index) => {
        const order = todo.isSpecial ? todo.order : index;
        const docRef = doc(
          db,
          `users/${user.uid}/todoLists/${todoListId}/todos/`,
          todo.id
        );
        await updateDoc(docRef, { order });
      });
    }
  };

  const handleVolumeChange = (event, newValue) => {
    if (newValue === 0) {
      setMuted(true);
    } else {
      if (muted) {
        setMuted(false);
      }
      setPreviousVolume(newValue);
    }
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
                justifyContent: "flex-end",
                alignItems: "center",
              }}
            >
              <button
                style={{ backgroundColor: "transparent" }}
                onClick={() => {
                  if (!muted) {
                    setVolume(0);
                  } else {
                    setVolume(previousVolume);
                  }
                  setMuted(!muted);
                }}
              >
                {muted ? (
                  <BsVolumeMuteFill size={30} />
                ) : (
                  <BsVolumeUpFill size={30} />
                )}
              </button>
              <div style={{ width: 225 }}>
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
                    isSpecial={todo.isSpecial}
                    elapsedTime={todo.elapsedTime}
                    setElapsedTime={setElapsedTime}
                    totalElapsedTime={todo.totalElapsedTime}
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
                    elapsedTime={elapsedTime}
                    setElapsedTime={setElapsedTime}
                    totalElapsedTime={todo.totalElapsedTime}
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
