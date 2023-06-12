import React, { useEffect, useState, useCallback } from "react";
import {
  getDocs,
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db, auth } from "../config/firebase";

import { useAuthState } from "react-firebase-hooks/auth";
import TomTodoList from "../components/TomTodoList";

function Journal({
  todos,
  setTodos,
  completedTodos,
  setCompletedTodos,
  setRunningTaskIndex,
  runningTaskIndex,
}) {
  const [journals, setJournals] = useState([]);
  const [newEntry, setNewEntry] = useState("");
  const [newComplete, setNewComplete] = useState(false);
  const [updatedEntry, setUpdatedEntry] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [user] = useAuthState(auth);

  const date = new Date();
  const todoListId = `${date.getFullYear()}-${
    date.getMonth() + 1
  }-${date.getDate()}`;

  const today = `${date.getFullYear()}-${
    date.getMonth() + 1
  }-${date.getDate()}`;

  const todaysEntry = journals.find((journal) => journal.date === today);

  const generateDocId = () => {
    const formattedDate = `${date.getFullYear()}-${
      date.getMonth() + 1
    }-${date.getDate()}`;
    const formattedTime = `${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}`;
    return `${formattedDate}_${formattedTime}`;
  };

  const handleToggle = async (id, completed) => {
    console.log("running handleToggle");
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

        if (updatedTask.completed) {
          // Task is being moved from todos to completedTodos
          const completedTask = {
            ...updatedTask,
            isRunning: false,
            order: null,
          };

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
          order: updatedTask.id === "start" ? -1 : todos.length,
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

  const onSubmitEntryAndUpdateEndTask = async () => {
    console.log("here are the todos", todos);
    // only pass in id if todaysEntry is not undefined
    await onSubmitEntry(todaysEntry ? todaysEntry.id : undefined);
    handleToggle("end", true);
  };

  const updateEntryAndUpdateEndTask = async () => {
    console.log("here are the todos", todos);
    await updateEntry(todaysEntry.id);
    handleToggle("end");
  };

  const onSubmitEntry = async () => {
    const journalsRef = collection(db, "users", user.uid, "journals");
    const newDocId = generateDocId();
    const newDocRef = doc(journalsRef, newDocId);

    // Move endTaskRef definition here
    const endTaskRef = doc(
      db,
      `users/${user.uid}/todoLists/${todoListId}/todos/end`
    );

    try {
      await setDoc(newDocRef, {
        Complete: newComplete,
        currentTime: serverTimestamp(),
        Entry: newEntry,
        date: `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`,
      });
      setNewEntry("");
      setNewComplete(false);
      getJournals();
      setEditMode(false);
    } catch (err) {
      console.error(err);
    }

    await updateDoc(endTaskRef, { completed: true, complete: true });
  };

  const updateEntry = async (id) => {
    console.log("here is the todos array", todos);
    const entryDoc = doc(db, "users", user.uid, "journals", id);

    // Move endTaskRef definition here
    const endTaskRef = doc(
      db,
      `users/${user.uid}/todoLists/${todoListId}/todos/end`
    );

    await updateDoc(entryDoc, { Entry: updatedEntry });
    setEditMode(false); // Add this line
    getJournals();
    await updateDoc(endTaskRef, { completed: true, complete: true });
  };

  const getJournals = useCallback(async () => {
    const journalsRef = collection(db, "users", user.uid, "journals");
    try {
      const data = await getDocs(journalsRef);
      const filteredData = data.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      console.log(filteredData);
      setJournals(filteredData);
    } catch (err) {
      console.error(err);
    }
  }, [user.uid]);

  useEffect(() => {
    getJournals();
  }, [getJournals]);

  const deleteEntry = async (id) => {
    const entryDoc = doc(db, "users", user.uid, "journals", id);
    await deleteDoc(entryDoc);
    getJournals();
  };

  return (
    <div className="ToDoList">
      <div className="ToDoList-header" style={{ paddingTop: "80px" }}>
        <h1> Write a bit about today and set tasks for tomorrow! </h1>
        <br />
      </div>

      <TomTodoList todos={todos} setTodos={setTodos} />

      {todaysEntry ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "10px",
            width: "100%",
          }}
        >
          {!editMode ? (
            <>
              <pre
                style={{
                  margin: "1px",
                  fontSize: "16px",
                  textAlign: "left",
                  whiteSpace: "pre-wrap",
                  wordWrap: "break-word",

                  width: "70%", // Adjust to your desired width
                }}
              >
                {todaysEntry.Entry}
              </pre>
              <button
                onClick={() => {
                  setEditMode(true);
                  setUpdatedEntry(todaysEntry.Entry);
                }}
                style={{ margin: "10px" }}
              >
                Edit Entry
              </button>
            </>
          ) : (
            <>
              <textarea
                rows="5"
                placeholder="You need to add at least one task and write 150 characters to be able to mark the day as complete. You can cheat if you want, but you're just cheating yourself. This text you are reading is over 200 characters. I think you can squeeze out 150."
                className="textera-box"
                value={updatedEntry} // The value is the state that changes when we set the updated entry
                onChange={(e) => setUpdatedEntry(e.target.value)}
                style={{ width: "70%", fontSize: "16px", borderRadios: "10px" }} // Adjust to your desired width
              />
              <div>
                <button
                  onClick={() => updateEntryAndUpdateEndTask()}
                  disabled={updatedEntry.length < 150 || todos.length === 0} // Disable button if character count is less than 280 or there are no todos
                  style={{
                    margin: "10px",
                    backgroundColor:
                      updatedEntry.length >= 150 && todos.length > 0
                        ? "#131225"
                        : "#6666661e",
                  }}
                >
                  Update Entry
                </button>
                <button
                  style={{
                    margin: "10px",
                  }}
                  onClick={() => deleteEntry(todaysEntry.id)}
                >
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            margin: "10px",

            width: "100%",
          }}
        >
          <textarea
            rows="5"
            placeholder="You need to add at least one task and write 150 characters to be able to mark the day as complete. You can cheat if you want, but you're just cheating yourself. This text you are reading is over 200 characters. I think you can squeeze out 150."
            className="textera-box"
            value={newEntry}
            onChange={(e) => setNewEntry(e.target.value)}
            style={{ width: "70%", fontSize: "16px", borderRadios: "10px" }} // Adjust to your desired width
          />
          <button
            onClick={() => onSubmitEntryAndUpdateEndTask()}
            disabled={newEntry.length < 150 || todos.length === 0} // Disable button if character count is less than 280 or there are no todos
            style={{
              margin: "10px",
              backgroundColor:
                newEntry.length >= 150 && todos.length > 0
                  ? "#131225"
                  : "#6666661e",
            }}
          >
            Mark Day Complete!
          </button>
        </div>
      )}
    </div>
  );
}

export default Journal;
