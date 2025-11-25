import React from "react";
import { Droppable } from "react-beautiful-dnd";
import PriorityCard from "./PriorityCard";

const PriorityColumn = ({ column, tasks, className }) => (
  <Droppable droppableId={column.id}>
    {(provided) => (
      <div
        className={`priority-column ${className ?? ""}`.trim()}
        {...provided.droppableProps}
        ref={provided.innerRef}
      >
        <div className="stack stack--dense" style={{ textAlign: "center" }}>
          <h3>{column.title}</h3>
          {column.sub && <p>{column.sub}</p>}
        </div>
        <div className="stack" style={{ marginTop: "12px" }}>
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
      </div>
    )}
  </Droppable>
);

export default PriorityColumn;
