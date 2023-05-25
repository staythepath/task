import React from "react";

function Home({ todos, setTodos }) {
  return (
    <div className="ToDoList">
      <h1>Home</h1>
      <div style={{ position: "relative", textAlign: "center" }}>
        <h4 style={{ textAlign: "center" }}>
          Here is the home page. And a bunch of text about something Idk what
          I'll put here. I just know that all of this is significant to me.
        </h4>
      </div>
    </div>
  );
}

export default Home;
