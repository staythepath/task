import React, { useEffect, useState, useContext } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../config/firebase";
import ToDoItemDay from "../components/TodoItemDay";
import { DateContext } from "../DateContex";
import { auth } from "../config/firebase";
import "./Day.css";

const Day = () => {
  const [tasks, setTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]); // New state for completed tasks
  const [journals, setJournals] = useState([]); // Change this line
  const { selectedDate } = useContext(DateContext);

  let user = auth.currentUser;

  // Format selectedDate
  const formattedSelectedDate = `${selectedDate.getFullYear()}-${
    selectedDate.getMonth() + 1
  }-${selectedDate.getDate()}`;

  useEffect(() => {
    if (user) {
      // assuming tasks are stored in users/{uid}/todoLists/{todoListId}/todos
      const tasksRef = collection(
        db,
        "users",
        user.uid,
        "todoLists",
        formattedSelectedDate,
        "todos"
      );
      const unsubscribeTasks = onSnapshot(tasksRef, (snapshot) => {
        const tasksData = snapshot.docs.map((doc) => doc.data());
        setTasks(tasksData);
      });

      // assuming journal is stored in users/{uid}/journal/{dateString} doc
      const journalsRef = collection(db, "users", user.uid, "journals");
      const q = query(journalsRef, where("date", "==", formattedSelectedDate));
      const unsubscribeJournals = onSnapshot(q, (snapshot) => {
        // Change this line
        const journalsData = snapshot.docs.map((doc) => ({
          // Change this line
          ...doc.data(),
          id: doc.id,
        }));
        setJournals(journalsData); // Change this line
      });

      return () => {
        unsubscribeTasks();
        unsubscribeJournals(); // Change this line
      };
    }
  }, [user, formattedSelectedDate]);

  // New useEffect for completed todos
  useEffect(() => {
    if (user) {
      const completedTasksRef = collection(
        db,
        "users",
        user.uid,
        "todoLists",
        formattedSelectedDate,
        "completedTodos"
      );
      const unsubscribe = onSnapshot(completedTasksRef, (snapshot) => {
        const tasksData = snapshot.docs.map((doc) => doc.data());
        setCompletedTasks(tasksData);
      });

      return () => unsubscribe();
    }
  }, [user, formattedSelectedDate]);

  return (
    <div
      className="outer-div"
      style={{ display: "flex", justifyContent: "center" }}
    >
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <h2>{selectedDate.toDateString()}</h2>
          <h2>{journals.length ? "Day Complete!" : "Day Incomplete"}</h2>
        </div>
        <h3>Incomplete Tasks</h3>
        {tasks.map((task, index) => (
          <ToDoItemDay
            key={index}
            {...task}
            // Provide other required props for ToDoItemRun
          />
        ))}
        <h3>Completed Tasks</h3> {/* New heading for completed tasks */}
        {completedTasks.map((task, index) => (
          <ToDoItemDay
            key={index}
            {...task}
            // Provide other required props for ToDoItemRun
            // Maybe include a prop to change styling for completed tasks
          />
        ))}
        <h3>Journal</h3>
        {journals.map((journal, index) => (
          <pre
            key={index}
            style={{
              margin: "1px",
              marginLeft: "15%",
              fontSize: "16px",
              whiteSpace: "pre-wrap",
              wordWrap: "break-word",
              paddingBottom: "40px",
              width: "70%",
            }}
          >
            {journal.Entry}
          </pre>
        ))}
      </div>
    </div>
  );
};

export default Day;
