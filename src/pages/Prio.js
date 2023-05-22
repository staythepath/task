import React, { useState } from "react";
import { DragDropContext } from "react-beautiful-dnd";
import PriorityColumn from "../components/PriorityColumn";
import "./Prio.css";

function Prio({ todos, setTodos }) {
  const [data, setData] = useState({
    tasks: todos.reduce(
      (acc, todo) => ({
        ...acc,
        [todo.id]: { id: `${todo.id}`, content: `${todo.task}` },
      }),
      {}
    ),
    columns: {
      "column-1": {
        id: "column-1",
        title: "If it takes less than 5 minutes leave it here",
        taskIds: todos.map((todo, index) => todo.id),
      },
      "column-2": {
        id: "column-2",
        title: "Urgent and important",
        taskIds: [],
      },
      "column-3": {
        id: "column-3",
        title: "Important",
        taskIds: [],
      },
      "column-4": {
        id: "column-4",
        title: "Urgent",
        taskIds: [],
      },
      "column-5": {
        id: "column-5",
        title: "Other",
        taskIds: [],
      },
    },
    columnOrder: ["column-1", "column-2", "column-3", "column-4", "column-5"],
  });

  console.log(data);
  console.log(todos);

  const onDragEnd = (result) => {
    const { destination, source } = result;

    // dropped outside the list
    if (!destination) {
      return;
    }

    const start = data.columns[source.droppableId];
    const finish = data.columns[destination.droppableId];

    // Moving in the same list
    if (start === finish) {
      const newTaskIds = Array.from(start.taskIds);
      const [removed] = newTaskIds.splice(source.index, 1);
      newTaskIds.splice(destination.index, 0, removed);

      const newColumn = {
        ...start,
        taskIds: newTaskIds,
      };

      const newState = {
        ...data,
        columns: {
          ...data.columns,
          [newColumn.id]: newColumn,
        },
      };

      setData(newState);
      return;
    }

    // Moving from one list to another
    const startTaskIds = Array.from(start.taskIds);
    const [removed] = startTaskIds.splice(source.index, 1);
    const newStart = {
      ...start,
      taskIds: startTaskIds,
    };

    const finishTaskIds = Array.from(finish.taskIds);
    finishTaskIds.splice(destination.index, 0, removed);
    const newFinish = {
      ...finish,
      taskIds: finishTaskIds,
    };

    const newState = {
      ...data,
      columns: {
        ...data.columns,
        [newStart.id]: newStart,
        [newFinish.id]: newFinish,
      },
    };

    setData(newState);

    const newTodos = newState.columnOrder
      .flatMap((columnId) =>
        newState.columns[columnId].taskIds.map((taskId) => data.tasks[taskId])
      )
      .map((task) => {
        // Find the complete todo object in the original todos array using the task id
        const originalTodo = todos.find(
          (todo) => todo.id.toString() === task.id
        );
        return originalTodo;
      });

    setTodos(newTodos);
    console.log("Here are the todos:" + todos);
    localStorage.setItem("todos", JSON.stringify(newTodos));
  };

  const { tasks, columns, columnOrder } = data; // extract tasks and columns from data state

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <h2 style={{ textAlign: "center" }}>Prioritize your tasks</h2>
      <div className="priority-columns-container">
        {columnOrder.map((columnId) => {
          const column = columns[columnId];
          const tasksInColumn = column.taskIds.map((taskId) => tasks[taskId]);
          return (
            <PriorityColumn
              key={columnId}
              column={column}
              tasks={tasksInColumn}
              todos={todos}
              setTodos={setTodos}
            />
          );
        })}
      </div>
    </DragDropContext>
  );
}

export default Prio;
