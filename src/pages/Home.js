import React from "react";

function Home({ todos, setTodos }) {
  return (
    <div className="ToDoList">
      <h1>Home</h1>
      <div style={{ position: "relative", textAlign: "center" }}>
        <h4 style={{ textAlign: "center" }}>
          I'll put something better here later, but right now I'm just letting
          you know, you have to log in to use any of this.
        </h4>
      </div>
    </div>
  );
}

export default Home;
