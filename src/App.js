import React, { useEffect, useState } from "react";
import ToDoList from "./pages/ToDoList";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Prio from "./pages/Prio";
import ToDoRun from "./pages/ToDoRun";
import Auth from "./components/Auth";
import Day from "./pages/Day";
import Journals from "./pages/Journals";
import Register from "./pages/Register";
import CalendarPage from "./pages/Calendar";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, onSnapshot } from "firebase/firestore";
import { auth, db } from "./config/firebase"; // import your Firebase config file
import { DateContext } from "./DateContex";

import "./App.css";

function App() {
  const [todos, setTodos] = useState([]);
  const [completedTodos, setCompletedTodos] = useState([]);
  const [isAuth, setIsAuth] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    let unsubscribeAuth = null;
    let unsubscribeTodos = null;

    unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuth(true);
        unsubscribeTodos = getTodos(user.uid);
      } else {
        setIsAuth(false);
        setTodos([]);
        if (unsubscribeTodos) unsubscribeTodos();
      }
    });

    return () => {
      if (unsubscribeAuth) unsubscribeAuth();
      if (unsubscribeTodos) unsubscribeTodos();
    };
  }, []);

  const getTodos = (userId) => {
    const todosRef = collection(db, `users/${userId}/todoLists`);
    const q = query(todosRef);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const todosData = snapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      setTodos(todosData);
    });

    return unsubscribe;
  };

  return (
    <DateContext.Provider value={{ selectedDate, setSelectedDate }}>
      <>
        <Router>
          <Navbar />
          <div style={{ marginTop: "0px" }}>
            <Routes>
              <Route
                path="/"
                element={<Home todos={todos} setTodos={setTodos} />}
              />
              <Route
                path="/ToDoList"
                element={
                  <ToDoList
                    todos={todos}
                    setTodos={setTodos}
                    completedTodos={completedTodos}
                    setCompletedTodos={setCompletedTodos}
                    isRunning={isRunning}
                    setIsRunning={setIsRunning.bind(this)}
                  />
                }
              />
              <Route
                path="/Prio"
                element={
                  isAuth ? (
                    <Prio
                      todos={todos}
                      setTodos={setTodos}
                      completedTodos={completedTodos}
                      setCompletedTodos={setCompletedTodos}
                    />
                  ) : (
                    <Home />
                  )
                }
              />
              <Route
                path="/ToDoRun"
                element={
                  isAuth ? (
                    <ToDoRun
                      todos={todos}
                      setTodos={setTodos}
                      completedTodos={completedTodos}
                      setCompletedTodos={setCompletedTodos}
                      isRunning={isRunning}
                      setIsRunning={setIsRunning}
                    />
                  ) : (
                    <Home />
                  )
                }
              />
              <Route
                path="/Journals"
                element={
                  isAuth ? (
                    <Journals todos={todos} setTodos={setTodos} />
                  ) : (
                    <Home />
                  )
                }
              />

              <Route
                path="/Calendar"
                element={
                  isAuth ? <CalendarPage user={auth.currentUser} /> : <Home />
                }
              />
              <Route
                path="/day/:date"
                element={
                  isAuth ? <Day selectedDate={selectedDate} /> : <Home />
                }
              />

              <Route path="/Register" element={<Register />} />
              <Route path="/Auth" element={<Auth />} />
            </Routes>
          </div>
        </Router>

        <div />
      </>
    </DateContext.Provider>
  );
}

export default App;
