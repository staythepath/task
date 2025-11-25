import React, { useCallback, useEffect, useState } from "react";
import { DragDropContext } from "react-beautiful-dnd";
import PriorityColumn from "../components/PriorityColumn";
import { useTasks } from "../context/TaskContext";

const COLUMN_TEMPLATE = {
  "column-1": {
    id: "column-1",
    title: "Tasks",
    sub: "If it takes less than 5 minutes leave it here",
  },
  "column-2": {
    id: "column-2",
    title: "Urgent and important",
  },
  "column-3": {
    id: "column-3",
    title: "Important",
  },
  "column-4": {
    id: "column-4",
    title: "Urgent",
  },
  "column-5": {
    id: "column-5",
    title: "Meh",
  },
};

const COLUMN_ORDER = [
  "column-1",
  "column-2",
  "column-3",
  "column-4",
  "column-5",
];

const buildBoardFromTodos = (todos) => {
  const tasks = {};
  const columns = COLUMN_ORDER.reduce((acc, columnId) => {
    acc[columnId] = { ...COLUMN_TEMPLATE[columnId], taskIds: [] };
    return acc;
  }, {});

  todos
    .filter((task) => !task.complete)
    .forEach((task) => {
      tasks[task.id] = task;
      const columnId = COLUMN_TEMPLATE[task.column]?.id || "column-1";
      columns[columnId].taskIds.push(task.id);
    });

  Object.values(columns).forEach((column) => {
    column.taskIds.sort((a, b) => {
      const taskA = tasks[a];
      const taskB = tasks[b];
      return (taskA?.order ?? 0) - (taskB?.order ?? 0);
    });
  });

  return {
    tasks,
    columns,
    columnOrder: COLUMN_ORDER,
  };
};

function Prio() {
  const { todos, updateTask, activeListId } = useTasks();
  const [board, setBoard] = useState(() => buildBoardFromTodos(todos));

  useEffect(() => {
    setBoard(buildBoardFromTodos(todos));
  }, [todos]);

  const persistBoard = useCallback(
    async (state) => {
      let order = 0;
      const updates = [];

      COLUMN_ORDER.forEach((columnId) => {
        const column = state.columns[columnId];
        column.taskIds.forEach((taskId) => {
          updates.push(
            updateTask(taskId, { order, column: columnId }, "todos")
          );
          order += 1;
        });
      });

      await Promise.all(updates);
    },
    [updateTask]
  );

  const onDragEnd = useCallback(
    async (result) => {
      const { destination, source, draggableId } = result;

      if (!destination) {
        return;
      }

      if (
        destination.droppableId === source.droppableId &&
        destination.index === source.index
      ) {
        return;
      }

      const start = board.columns[source.droppableId];
      const finish = board.columns[destination.droppableId];

      if (!start || !finish) {
        return;
      }

      const nextBoard = {
        ...board,
        columns: { ...board.columns },
      };

      if (start === finish) {
        const newTaskIds = Array.from(start.taskIds);
        newTaskIds.splice(source.index, 1);
        newTaskIds.splice(destination.index, 0, draggableId);

        nextBoard.columns[start.id] = {
          ...start,
          taskIds: newTaskIds,
        };

        setBoard(nextBoard);
        await persistBoard(nextBoard);
        return;
      }

      const startTaskIds = Array.from(start.taskIds);
      startTaskIds.splice(source.index, 1);
      const finishTaskIds = Array.from(finish.taskIds);
      finishTaskIds.splice(destination.index, 0, draggableId);

      nextBoard.columns[start.id] = {
        ...start,
        taskIds: startTaskIds,
      };
      nextBoard.columns[finish.id] = {
        ...finish,
        taskIds: finishTaskIds,
      };

      setBoard(nextBoard);

      await persistBoard(nextBoard);
    },
    [board, persistBoard]
  );

  const { tasks, columns, columnOrder } = board;

  const renderColumn = useCallback(
    (columnId) => {
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
          className = "";
      }

      return (
        <PriorityColumn
          key={columnId}
          className={className}
          column={column}
          tasks={tasksInColumn}
        />
      );
    },
    [columns, tasks]
  );

  return (
    <div className="app-layout">
      <header className="page-header">
        <div className="page-header__content">
          <h1>Priority matrix</h1>
          <p>
            Drag each task into the quadrant that matches its urgency and
            importance. Use this view to stage what deserves your focus first.
          </p>
        </div>
        <div className="page-header__aside">
          <span className="badge">{columnOrder.length} columns</span>
        </div>
      </header>

      {!activeListId ? (
        <section className="page-section page-section--subtle">
          <div className="empty-state">
            <strong>Select a list to prioritise</strong>
            Choose a list in the To Do view so we can pull in the tasks that
            still need attention.
          </div>
        </section>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <section className="page-section">
            <div className="page-section__headline">
              <h2>Quadrants</h2>
              <span className="pill">Drag to assign priority</span>
            </div>
            <div className="priority-columns-container">
              {columnOrder.map(renderColumn)}
            </div>
          </section>
        </DragDropContext>
      )}
    </div>
  );
}

export default Prio;
