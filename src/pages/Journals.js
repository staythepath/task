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

function Journal({ todos, setTodos }) {
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

  const onSubmitEntry = async () => {
    const journalsRef = collection(db, "users", user.uid, "journals");
    const newDocId = generateDocId();
    const newDocRef = doc(journalsRef, newDocId);
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
    const endTaskRef = doc(
      db,
      `users/${user.uid}/todoLists/${todoListId}/todos/end`
    );
    await updateDoc(endTaskRef, { completed: true });
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

  const updateEntry = async (id) => {
    const entryDoc = doc(db, "users", user.uid, "journals", id);
    await updateDoc(entryDoc, { Entry: updatedEntry });
    setEditMode(false); // Add this line
    getJournals();
    const endTaskRef = doc(
      db,
      `users/${user.uid}/todoLists/${todoListId}/todos/end`
    );
    await updateDoc(endTaskRef, { completed: true, complete: true });
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
                  onClick={() => updateEntry(todaysEntry.id)}
                  disabled={updatedEntry.length < 150 || todos.length === 0} // Disable button if character count is less than 280 or there are no todos
                  style={{
                    margin: "10px",
                    backgroundColor:
                      updatedEntry.length >= 150 && todos.length > 0
                        ? "#131225"
                        : "#6666661e",
                  }}
                >
                  Mark Day Complete!
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
            onClick={onSubmitEntry}
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
