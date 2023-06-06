import React, { useEffect, useState, useCallback } from "react";
import {
  getDocs,
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db, auth } from "../config/firebase";
import { useAuthState } from "react-firebase-hooks/auth";

function Journal() {
  const [journals, setJournals] = useState([]);
  const [newEntry, setNewEntry] = useState("");
  const [newComplete, setNewComplete] = useState(false);
  const [updatedEntry, setUpdatedEntry] = useState("");
  const [user] = useAuthState(auth);

  const onSubmitEntry = async () => {
    const journalsRef = collection(db, "users", user.uid, "journals");
    try {
      await addDoc(journalsRef, {
        Complete: newComplete,
        currentTime: serverTimestamp(),
        Entry: newEntry,
      });
      setNewEntry("");
      setNewComplete(false);
      getJournals();
    } catch (err) {
      console.error(err);
    }
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
    getJournals();
  };

  return (
    <div className="Journal">
      <div className="ToDoList-header" style={{ paddingTop: "80px" }}>
        <h1></h1>
        <br />
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "10px",
        }}
      >
        <input
          placeholder="Entry..."
          value={newEntry}
          onChange={(e) => setNewEntry(e.target.value)}
        />
        <input
          type="checkbox"
          checked={newComplete}
          onChange={(e) => setNewComplete(e.target.checked)}
        />
        <label>Complete?</label>
        <button onClick={onSubmitEntry}>Submit</button>
      </div>
      <div>
        {journals.map((journal) => (
          <div style={{ textAlign: "center", padding: "10px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {journal.currentTime?.toDate().toLocaleString()}
              <h3 style={{ marginLeft: "10px" }}>Complete?</h3>
              <input type="checkbox" checked={journal.Complete} disabled />
            </div>
            <p style={{ margin: "1px" }}>{journal.Entry}</p>
            <div>
              <input
                placeholder="Edit Entry..."
                onChange={(e) => setUpdatedEntry(e.target.value)}
              />
              <button onClick={(e) => updateEntry(journal.id)}>Submit</button>
            </div>
            <button
              style={{ margin: "10px" }}
              onClick={() => deleteEntry(journal.id)}
            >
              Delete Entry
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Journal;
