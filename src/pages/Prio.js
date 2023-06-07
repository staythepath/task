////////////This works but data.columns needs to be removed from that useEffect dependency array to prevent the loops

import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { DragDropContext } from "react-beautiful-dnd";
import PriorityColumn from "../components/PriorityColumn";
import "./Prio.css";
import { collection, updateDoc, doc, getDocs } from "firebase/firestore";
import { auth, db } from "../config/firebase";

function Prio({ todos, setTodos }) {
  const date = new Date();
  const todoListId = `${date.getFullYear()}-${
    date.getMonth() + 1
  }-${date.getDate()}`;

  const [updateFirestore, setUpdateFirestore] = useState(false);
  const [data, setData] = useState({
    tasks: {},
    columns: {
      "column-1": {
        id: "column-1",
        title: "Tasks",
        sub: "If it takes less than 5 minutes leave it here",
        taskIds: [],
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
  const columnsRef = useRef(data.columns);
  console.log(data);

  // Create a memoized todosRef
  const todosRef = useMemo(
    () =>
      collection(
        db,
        `users/${auth.currentUser.uid}/todoLists/${todoListId}/todos/`
      ),
    [todoListId]
  );

  const fetchTasks = useCallback(async () => {
    const tasksSnapshot = await getDocs(todosRef);
    const tasksData = tasksSnapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      .sort((a, b) => a.order - b.order); // sort tasks by order

    // Update todos
    setTodos(tasksData);
    console.log("Fetch Tasks Ran");
    console.log("Here is task data: ", tasksData);

    // Distribute tasks among columns based on their column value
    const tasks = {};
    tasksData.forEach((task) => {
      tasks[task.id] = task;
    });

    // Return the tasks
    return tasks;
  }, [todosRef, setTodos]); // remove data.columns from here

  useEffect(() => {
    fetchTasks().then((tasks) => {
      const newColumns = { ...columnsRef.current }; // Create a new copy of columns object

      // We want to place all tasks in column-1 so let's start by clearing it
      newColumns["column-1"].taskIds = [];

      Object.keys(tasks).forEach((taskId) => {
        const task = tasks[taskId];

        // Ignore the original column attribute of the task and always place it in column-1
        newColumns["column-1"].taskIds = [
          ...newColumns["column-1"].taskIds,
          task.id,
        ];
      });

      // Update data
      columnsRef.current = newColumns;
      setData((prevData) => ({
        ...prevData,
        tasks,
        columns: newColumns,
      }));
    });
  }, [fetchTasks]); // fetchTasks is a dependency here

  const updateOrder = (newState) => {
    let order = 0; // Initialize order counter
    let newTodos = []; // Initialize newTodos array

    // Iterate over all columns in their order
    newState.columnOrder.forEach((columnId) => {
      const column = newState.columns[columnId];

      // Iterate over all tasaks in the current column in their order
      column.taskIds.forEach((taskId) => {
        // Find the corresponding todo in the original todos array
        const todo = todos.find((todo) => todo.id === taskId);

        // Create a new todo with the updated order and column
        const newTodo = {
          ...todo,
          order, // Assign the current order to the task
          column: columnId, // Assign the current column to the task
        };

        // Push the new todo to the newTodos array
        newTodos.push(newTodo);

        order++; // Increment the order counter
      });
    });

    // Update todos in local state
    setTodos(newTodos);

    // Set updateFirestore flag to true
    setUpdateFirestore(true);
  };

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

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

      // Update the local state
      setData(newState);

      // Update order and todos in local state
      updateOrder(newState);

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

    // Update column attribute of the moved task in local state
    const newTask = { ...newState.tasks[draggableId], column: newFinish.id };
    newState.tasks[draggableId] = newTask;

    // Set data
    setData(newState);

    // Update order and todos in local state
    updateOrder(newState);
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
      <h2
        style={{
          paddingTop: "90px",
          paddingBottom: "30px",
          textAlign: "center",
        }}
      >
        Prioritize your tasks
      </h2>
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
