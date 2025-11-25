import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import "./Calendar.css";

const CalendarPage = ({ user }) => {
  const [value, onChange] = useState(new Date());
  const [events, setEvents] = useState({});

  const getUserEvents = async (uid) => {
    const docRef = doc(db, "users", uid, "events");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      setEvents(docSnap.data());
    }
  };

  useEffect(() => {
    if (user) {
      getUserEvents(user.uid);
    }
  }, [user]);

  const handleDayClick = async (date) => {
    const dateString = date.toISOString().split("T")[0];
    const event = events[dateString];

    if (!event && user) {
      const updatedEvents = {
        ...events,
        [dateString]: {
          note: "",
        },
      };
      setEvents(updatedEvents);

      const docRef = doc(db, "users", user.uid, "events");
      await setDoc(docRef, updatedEvents);
    }
  };

  return (
    <div className="app-layout">
      <header className="page-header">
        <div className="page-header__content">
          <h1>Calendar</h1>
          <p>
            Spot commitments at a glance and carve out focused time around what
            matters most.
          </p>
        </div>
      </header>

      <section className="page-section calendar-card">
        <div className="page-section__headline" style={{ marginBottom: "18px" }}>
          <h2>Schedule</h2>
          <span className="pill">Tap a day to add notes</span>
        </div>
        <div className="calendar-container">
          <Calendar
            onChange={onChange}
            value={value}
            onClickDay={handleDayClick}
            className="react-calendar"
          />
        </div>
      </section>
    </div>
  );
};

export default CalendarPage;
