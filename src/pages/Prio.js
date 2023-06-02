import React, { useState, useEffect } from "react";
import { DragDropContext } from "react-beautiful-dnd";
import PriorityColumn from "../components/PriorityColumn";
import "./Prio.css";
import { collection, updateDoc, doc } from "firebase/firestore";
import { auth, db } from "../config/firebase";

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
        title: "Tasks",
        sub: "If it takes less than 5 minutes leave it here",
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
        title: "Meh",
        taskIds: [],
      },
    },
    columnOrder: ["column-1", "column-2", "column-3", "column-4", "column-5"],
  });

  console.log(data);

  let userId = auth.currentUser.uid;

  const todosRef = collection(db, `users/${userId}/todoLists`);

  const [updateFirestore, setUpdateFirestore] = useState(false);

  const updateOrder = (newState) => {
    let order = 0; // Initialize order counter
    let newTodos = []; // Initialize newTodos array

    // Iterate over all columns in their order
    newState.columnOrder.forEach((columnId) => {
      const column = newState.columns[columnId];

      // Iterate over all tasks in the current column in their order
      column.taskIds.forEach((taskId) => {
        // Find the corresponding todo in the original todos array
        const todo = todos.find((todo) => todo.id === taskId);

        // Create a new todo with the updated order
        const newTodo = {
          ...todo,
          order, // Assign the current order to the task
        };

        // Push the new todo to the newTodos array
        newTodos.push(newTodo);

        order++; // Increment the order counter
      });
    });

    // Update todos in local state
    setTodos(newTodos);
  };

  const onDragEnd = async (result) => {
    const { destination, source } = result;
    setUpdateFirestore(true);

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

      updateOrder(newState); // Update order
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

    updateOrder(newState);

    // Update todos in local state
  };

  useEffect(() => {
    if (updateFirestore) {
      // Here you'd update Firestore with the current state of todos
      todos.forEach(async (todo) => {
        const taskRef = doc(todosRef, todo.id);
        await updateDoc(taskRef, todo);
      });

      // Reset the updateFirestore flag
      setUpdateFirestore(false);
    }
  }, [todos, todosRef, updateFirestore]);

  console.log(todos);

  const { tasks, columns, columnOrder } = data; // extract tasks and columns from data state

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <h2 style={{ textAlign: "center" }}>Prioritize your tasks</h2>
      <div className="priority-columns-container">
        {columnOrder.map((columnId) => {
          const column = columns[columnId];
          const tasksInColumn = column.taskIds.map((taskId) => tasks[taskId]);

          let className;
          switch (columnId) {
            case "column-1":
              className = "column1";
              break;
            case "column-2":
              className = "column2";
              break;
            case "column-3":
              className = "column3";
              break;
            case "column-4":
              className = "column4";
              break;
            case "column-5":
              className = "column5";
              break;
            default:
              break;
          }

          return (
            <PriorityColumn
              key={columnId}
              className={className}
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
