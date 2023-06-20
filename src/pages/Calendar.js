import React, { useState, useEffect, useContext } from "react";
import Calendar from "react-calendar";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db, auth } from "../config/firebase"; // import your Firebase config file
import "./Calendar.css";
import { DateContext } from "../DateContex";
import { useNavigate } from "react-router-dom"; // import useNavigate

const CalendarPage = ({ closeSidebar }) => {
  const [value, onChange] = useState(new Date());
  const [events, setEvents] = useState({});
  const { setSelectedDate } = useContext(DateContext);
  const navigate = useNavigate(); // initialize useNavigate
  let user = auth.currentUser;

  const getUserEvents = async (uid) => {
    const docRef = doc(db, "users", uid, "events", "eventsData");
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
    closeSidebar();
    if (!user) {
      console.log("User is not defined");
      return;
    }
    // assuming events is an object with dates as keys
    const dateString = date.toISOString().split("T")[0];
    const event = events[dateString];

    // Update the selectedDate in your context
    setSelectedDate(date);

    // Navigate to the Day page with the selected date
    navigate(`/day/${dateString}`);

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

      // Now you are writing to `users/{userId}/todoLists/{todoListId}/`
      const docRef = doc(
        db,
        "users",
        user.uid,
        "todoLists",
        dateString,
        "todos"
      );
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
