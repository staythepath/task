import React from "react";
import { Draggable } from "react-beautiful-dnd";

const PriorityCard = ({ task, index }) => {
  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
          style={{
            padding: "10px",
            border: "1px solid black",
            margin: "10px",
            borderRadius: "4px",
            backgroundColor: snapshot.isDragging ? "#555" : "#222", // this is how you use isDragging
            ...provided.draggableProps.style, // this should come last to allow the movement of the element
          }}
        >
          {task.content}
        </div>
      )}
    </Draggable>
  );
};

export default PriorityCard;
