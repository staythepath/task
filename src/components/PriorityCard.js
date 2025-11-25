import React from "react";
import { Draggable } from "react-beautiful-dnd";

const PriorityCard = ({ task, index }) => (
  <Draggable draggableId={task.id} index={index}>
    {(provided, snapshot) => (
      <div
        {...provided.draggableProps}
        {...provided.dragHandleProps}
        ref={provided.innerRef}
        className={`priority-card${snapshot.isDragging ? " priority-card--dragging" : ""}`}
        style={provided.draggableProps.style}
      >
        {task.task}
      </div>
    )}
  </Draggable>
);

export default PriorityCard;
