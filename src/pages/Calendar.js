import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import { collection, doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../config/firebase"; // import your Firebase config file
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
    // assuming events is an object with dates as keys
    const dateString = date.toISOString().split("T")[0];
    const event = events[dateString];

    if (event) {
      // Show event or navigate to event page
    } else {
      // Set an event for this date
      const updatedEvents = {
        ...events,
        [dateString]: {
          /* event details */
        },
      };
      setEvents(updatedEvents);

      const docRef = doc(db, "users", user.uid, "events");
      await setDoc(docRef, updatedEvents);
    }
  };

  return (
    <div className="calendar-container">
      <Calendar
        onChange={onChange}
        value={value}
        onClickDay={handleDayClick}
        className="react-calendar"
      />
    </div>
  );
};

export default CalendarPage;
