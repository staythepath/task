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

const Journals = () => {
  const [journals, setJournals] = useState([]);
  const [newEntry, setNewEntry] = useState("");
  const [newComplete, setNewComplete] = useState(false);
  const [activeEdit, setActiveEdit] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [user] = useAuthState(auth);

  const fetchJournals = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const journalsRef = collection(db, "users", user.uid, "journals");
    try {
      const data = await getDocs(journalsRef);
      const filteredData = data.docs
        .map((docSnap) => ({
          ...docSnap.data(),
          id: docSnap.id,
        }))
        .sort((a, b) => {
          const aDate = a.currentTime?.toDate?.() ?? new Date(0);
          const bDate = b.currentTime?.toDate?.() ?? new Date(0);
          return bDate - aDate;
        });
      setJournals(filteredData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchJournals();
    }
  }, [user, fetchJournals]);

  const onSubmitEntry = async () => {
    if (!user || !newEntry.trim()) return;
    const journalsRef = collection(db, "users", user.uid, "journals");
    try {
      await addDoc(journalsRef, {
        Complete: newComplete,
        currentTime: serverTimestamp(),
        Entry: newEntry.trim(),
      });
      setNewEntry("");
      setNewComplete(false);
      fetchJournals();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteEntry = async (id) => {
    if (!user) return;
    const entryDoc = doc(db, "users", user.uid, "journals", id);
    await deleteDoc(entryDoc);
    fetchJournals();
  };

  const startEditing = (journal) => {
    setActiveEdit(journal.id);
    setEditValue(journal.Entry || "");
  };

  const cancelEditing = () => {
    setActiveEdit(null);
    setEditValue("");
  };

  const saveEdit = async (id) => {
    if (!user) return;
    const entryDoc = doc(db, "users", user.uid, "journals", id);
    await updateDoc(entryDoc, { Entry: editValue });
    cancelEditing();
    fetchJournals();
  };

  return (
    <div className="app-layout">
      <header className="page-header">
        <div className="page-header__content">
          <h1>Daily journal</h1>
          <p>
            Capture reflections, wins, and lessons learned. Journals help you
            see progress beyond the checkboxes.
          </p>
        </div>
        <div className="page-header__aside">
          <span className="badge">{journals.length} entries</span>
        </div>
      </header>

      <div className="journal-wrapper">
        <aside className="journal-sidebar">
          <h2 style={{ marginTop: 0 }}>New entry</h2>
          <div className="journal-form">
            <textarea
              rows={6}
              placeholder="What happened today?"
              value={newEntry}
              onChange={(e) => setNewEntry(e.target.value)}
            />
            <label className="checkbox-field">
              <input
                type="checkbox"
                checked={newComplete}
                onChange={(e) => setNewComplete(e.target.checked)}
              />
              Mark as complete
            </label>
            <button
              type="button"
              className="btn btn--primary"
              onClick={onSubmitEntry}
              disabled={!newEntry.trim()}
            >
              Save entry
            </button>
          </div>
        </aside>

        <section className="page-section" style={{ minHeight: "420px" }}>
          <div className="page-section__headline">
            <h2>Journal archive</h2>
            <span className="pill">Most recent first</span>
          </div>

          {loading ? (
            <div className="empty-state">
              <strong>Loading entries…</strong>
            </div>
          ) : journals.length ? (
            <div className="journal-list">
              {journals.map((journal) => {
                const timestamp = journal.currentTime?.toDate?.();
                const formattedDate = timestamp
                  ? timestamp.toLocaleString()
                  : "Pending";

                const isEditing = activeEdit === journal.id;

                return (
                  <div key={journal.id} className="journal-card">
                    <div className="journal-card__top">
                      <div className="stack stack--dense" style={{ flex: 1 }}>
                        <span className="journal-card__time">
                          {formattedDate}
                        </span>
                        {isEditing ? (
                          <textarea
                            rows={4}
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                          />
                        ) : (
                          <div className="journal-card__body">{journal.Entry}</div>
                        )}
                      </div>
                      <span className="pill">
                        {journal.Complete ? "Complete" : "Draft"}
                      </span>
                    </div>

                    <div className="journal-card__actions">
                      {isEditing ? (
                        <>
                          <button
                            className="btn btn--primary"
                            onClick={() => saveEdit(journal.id)}
                          >
                            Save
                          </button>
                          <button
                            className="btn btn--ghost"
                            onClick={cancelEditing}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="btn btn--ghost"
                            onClick={() => startEditing(journal)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn--danger"
                            onClick={() => deleteEntry(journal.id)}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">
              <strong>No journal entries yet</strong>
              Capture a thought above and it will appear here.
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Journals;
