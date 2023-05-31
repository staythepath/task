import React, { useEffect } from "react";
import { useState } from "react";
import { auth, googleProvider, db } from "../config/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
  getDocs,
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  where,
} from "firebase/firestore";

function Auth({ todos, setTodos }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [journals, setJournals] = useState([]);
  const [newEntry, setNewEntry] = useState("");
  const [newComplete, setNewComplete] = useState(false);
  const [updatedEntry, setUpdatedEntry] = useState("");

  const journalsRef = collection(db, "journals");

  if (auth.currentUser) {
    console.log("User is signed in" + auth.currentUser.u);
  } else {
    console.log("No user is signed in");
  }

  const register = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      getJournals();
    } catch (err) {
      console.error(err);
    }
  };

  const signIn = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      getJournals();
    } catch (err) {
      console.error(err);
    }
  };

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      getJournals();
    } catch (err) {
      console.error(err);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setJournals([]);
      setTodos([]);
    } catch (err) {
      console.error(err);
    }
  };

  const onSubmitEntry = async () => {
    try {
      await addDoc(journalsRef, {
        Complete: newComplete,
        currentTime: serverTimestamp(),
        Entry: newEntry,
        userId: auth?.currentUser?.uid,
      });
      getJournals();
      setNewEntry("");
      setNewComplete(false);
    } catch (err) {
      console.error(err);
    }
  };

  const getJournals = async () => {
    //READ DATA
    //SET ENTRY
    try {
      const q = query(journalsRef, where("userId", "==", auth.currentUser.uid));
      const data = await getDocs(q);
      const filteredData = data.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      console.log(filteredData);
      setJournals(filteredData);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, get the journals
        getJournals();
      } else {
        // No user is signed in, clear the journals state
        setJournals([]);
      }
    });

    // Cleanup function
    return () => {
      unsubscribe();
    };
    // eslint-disable-next-line
  }, []);

  const deleteEntry = async (id) => {
    const entryDoc = doc(db, "journals", id);
    await deleteDoc(entryDoc);
    getJournals();
  };

  const updateEntry = async (id) => {
    const entryDoc = doc(db, "journals", id);
    await updateDoc(entryDoc, { Entry: updatedEntry });
    getJournals();
  };

  return (
    <div className="ToDoList">
      <h1>Auth</h1>
      <div style={{ position: "relative", textAlign: "center" }}>
        <input
          style={{ margin: "10px" }}
          placeholder="Email..."
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          placeholder="Password..."
          type="password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <div style={{ padding: "10px" }}>
          <button onClick={register}>Register</button>
          <button onClick={signIn}>Sign In</button>
          <button onClick={signInWithGoogle}>Sign In With Google</button>
        </div>

        {auth.currentUser && (
          <>
            <div>
              <button onClick={logout}>Log Out</button>
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
                  <div></div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {journal.currentTime?.toDate().toLocaleString()}
                    <h3 style={{ marginLeft: "10px" }}>Complete?</h3>
                    <input
                      type="checkbox"
                      checked={journal.Complete}
                      disabled
                    />
                  </div>
                  <p style={{ margin: "1px" }}>{journal.Entry}</p>
                  <div>
                    <input
                      placeholder="Edit Entry..."
                      onChange={(e) => setUpdatedEntry(e.target.value)}
                    />
                    <button onClick={(e) => updateEntry(journal.id)}>
                      Submit
                    </button>
                  </div>
                  <button onClick={() => deleteEntry(journal.id)}>
                    Delete Entry
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
export default Auth;
