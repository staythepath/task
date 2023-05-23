import React, { useState } from "react";
import ToDoList from "./pages/ToDoList";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Prio from "./pages/Prio";
import ToDoRun from "./pages/ToDoRun";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import "./App.css";

function App() {
  const [todos, setTodos] = useState([]);
  return (
    <>
      <Router>
        <Navbar />
        <Routes>
          <Route
            path="/"
            element={<Home todos={todos} setTodos={setTodos} />}
          />
          <Route
            path="/ToDoList"
            element={<ToDoList todos={todos} setTodos={setTodos} />}
          />
          <Route
            path="/Prio"
            element={<Prio todos={todos} setTodos={setTodos} />}
          />
          <Route
            path="/ToDoRun"
            element={<ToDoRun todos={todos} setTodos={setTodos} />}
          />
        </Routes>
      </Router>
    </>
  );
}

export default App;
