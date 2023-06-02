import React, { useEffect, useState } from "react";
import ToDoList from "./pages/ToDoList";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Prio from "./pages/Prio";
import ToDoRun from "./pages/ToDoRun";
import Auth from "./components/Auth";
import Journals from "./pages/Journals";
import Register from "./pages/Register";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, onSnapshot } from "firebase/firestore";
import { auth, db } from "./config/firebase"; // import your Firebase config file

import "./App.css";

function App() {
  const [todos, setTodos] = useState([]);
  const [isAuth, setIsAuth] = useState(false);

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
                isAuth ? (
                  <ToDoList todos={todos} setTodos={setTodos} />
                ) : (
                  <Home />
                )
              }
            />
            <Route
              path="/Prio"
              element={
                isAuth ? <Prio todos={todos} setTodos={setTodos} /> : <Home />
              }
            />
            <Route
              path="/ToDoRun"
              element={
                isAuth ? (
                  <ToDoRun todos={todos} setTodos={setTodos} />
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
            <Route path="/Register" element={<Register />} />
            <Route path="/Auth" element={<Auth />} />
          </Routes>
        </div>
      </Router>
      <div />
    </>
  );
}

export default App;
