import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Prio from "./pages/Prio";
import ToDoList from "./pages/ToDoList";
import ToDoRun from "./pages/ToDoRun";
import Auth from "./components/Auth";
import Register from "./pages/Register";
import CalendarPage from "./pages/Calendar";
import Journals from "./pages/Journals";
import "./App.css";
import { useTasks } from "./context/TaskContext";

const PrivateRoute = ({ user, children }) =>
  user ? children : <Navigate to="/" replace />;

function App() {
  const { user } = useTasks();

  return (
    <Router>
      <Navbar />
      <div style={{ marginTop: "0px" }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/ToDoList"
            element={
              <PrivateRoute user={user}>
                <ToDoList />
              </PrivateRoute>
            }
          />
          <Route
            path="/Prio"
            element={
              <PrivateRoute user={user}>
                <Prio />
              </PrivateRoute>
            }
          />
          <Route
            path="/ToDoRun"
            element={
              <PrivateRoute user={user}>
                <ToDoRun />
              </PrivateRoute>
            }
          />
          <Route
            path="/Journals"
            element={
              <PrivateRoute user={user}>
                <Journals />
              </PrivateRoute>
            }
          />
          <Route
            path="/Calendar"
            element={
              <PrivateRoute user={user}>
                <CalendarPage user={user} />
              </PrivateRoute>
            }
          />
          <Route path="/Register" element={<Register />} />
          <Route path="/Auth" element={<Auth />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
