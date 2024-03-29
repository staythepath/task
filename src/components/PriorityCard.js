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
            padding: "13px",

            margin: "10px",
            borderRadius: "4px",
            backdropFilter: "blur(10px)",
            backgroundColor: snapshot.isDragging ? "#17135f48" : "#22222252", // this is how you use isDragging
            ...provided.draggableProps.style, // this should come last to allow the movement of the element
          }}
        >
          {task.task}
        </div>
      )}
    </Draggable>
  );
};

export default PriorityCard;
