import React from "react";
import { Droppable } from "react-beautiful-dnd";
import PriorityCard from "./PriorityCard";
import "../pages/Prio.css";

const PriorityColumn = ({ column, tasks, className }) => {
  return (
    <Droppable droppableId={column.id}>
      {(provided) => (
        <div
          className={className}
          {...provided.droppableProps}
          ref={provided.innerRef}
          style={{
            minWidth: "200px",

            borderRadius: "4px",
            padding: "10px",
            backgroundColor: "#4444441a",
            minHeight: "250px",
          }}
        >
          <h3 style={{ textAlign: "center" }}>{column.title}</h3>
          <p style={{ textAlign: "center" }}>{column.sub}</p>
          {tasks.map((task, index) => (
            <PriorityCard
              draggableId={task.id}
              key={task.id}
              task={task}
              index={index}
            />
          ))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
};

export default PriorityColumn;
