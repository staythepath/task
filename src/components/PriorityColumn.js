import React from "react";
import { Droppable } from "react-beautiful-dnd";
import PriorityCard from "./PriorityCard";

const PriorityColumn = ({ column, tasks }) => {
  return (
    <Droppable droppableId={column.id}>
      {(provided) => (
        <div
          {...provided.droppableProps}
          ref={provided.innerRef}
          style={{
            minWidth: "200px",

            border: "1px solid black",
            borderRadius: "4px",
            padding: "10px",
            backgroundColor: "#4b4a4a",
          }}
        >
          <h3 style={{ textAlign: "center" }}>{column.title}</h3>
          <h4 style={{ textAlign: "center" }}>{column.sub}</h4>
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
