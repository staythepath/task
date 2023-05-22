import React from "react";

function Home({ todos, setTodos }) {
  return (
    <div className="ToDoList">
      <h1>Home</h1>
      <div style={{ display: "flex", position: "relative" }}>
        <p style={{ position: "center" }}>
          Here is the home page. And a bunch of text about something Idk what
          I'll put here
        </p>
      </div>
    </div>
  );
}

export default Home;
