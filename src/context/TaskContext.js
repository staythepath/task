import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { onAuthStateChanged } from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { auth, db } from "../config/firebase";

const TaskContext = createContext(null);

const parseListId = (id) => {
  if (!id) return Number.MIN_SAFE_INTEGER;
  const parts = id.split("-").map((part) => Number(part));
  if (parts.length === 3 && parts.every((n) => !Number.isNaN(n))) {
    const [year, month, day] = parts;
    return new Date(year, month - 1, day).getTime();
  }

  return Number.MIN_SAFE_INTEGER;
};

const sortTasks = (tasks) =>
  [...tasks].sort((a, b) => {
    if (typeof a.order === "number" && typeof b.order === "number") {
      return a.order - b.order;
    }

    if (typeof a.order === "number") return -1;
    if (typeof b.order === "number") return 1;

    return (a.task || "").localeCompare(b.task || "");
  });

export const TaskProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [lists, setLists] = useState([]);
  const [activeListId, setActiveListId] = useState(null);
  const [todos, setTodos] = useState([]);
  const [completedTodos, setCompletedTodos] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);

      if (!firebaseUser) {
        setLists([]);
        setActiveListId(null);
        setTodos([]);
        setCompletedTodos([]);
      }
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!user) return undefined;

    const listsRef = collection(db, `users/${user.uid}/todoLists`);

    const unsubscribe = onSnapshot(listsRef, (snapshot) => {
      const listDocs = snapshot.docs
        .map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }))
        .sort((a, b) => parseListId(b.id) - parseListId(a.id));

      setLists(listDocs);

      if (!listDocs.length) {
        setActiveListId(null);
        return;
      }

      const hasActiveList =
        activeListId && listDocs.some((list) => list.id === activeListId);

      if (!hasActiveList) {
        setActiveListId(listDocs[0].id);
      }
    });

    return unsubscribe;
  }, [user, activeListId]);

  useEffect(() => {
    if (!user || !activeListId) {
      setTodos([]);
      setCompletedTodos([]);
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    const basePath = `users/${user.uid}/todoLists/${activeListId}`;
    const todosRef = collection(db, `${basePath}/todos`);
    const completedTodosRef = collection(db, `${basePath}/completedTodos`);

    const unsubscribeTodos = onSnapshot(todosRef, (snapshot) => {
      const nextTodos = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));

      setTodos(sortTasks(nextTodos));
      setLoading(false);
    });

    const unsubscribeCompleted = onSnapshot(completedTodosRef, (snapshot) => {
      const nextCompleted = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));

      setCompletedTodos(sortTasks(nextCompleted));
    });

    return () => {
      unsubscribeTodos();
      unsubscribeCompleted();
    };
  }, [user, activeListId]);

  const ensureUser = useCallback(() => {
    if (!user) {
      throw new Error("You need to be signed in to manage tasks.");
    }
  }, [user]);

  const ensureListReady = useCallback(() => {
    ensureUser();
    if (!activeListId) {
      throw new Error("Select or create a list before managing tasks.");
    }
  }, [activeListId, ensureUser]);

  const getCollectionRef = useCallback(
    (collectionName) => {
      ensureListReady();
      return collection(
        db,
        `users/${user.uid}/todoLists/${activeListId}/${collectionName}`
      );
    },
    [activeListId, ensureListReady, user]
  );

  const getDocRef = useCallback(
    (collectionName, id) =>
      doc(
        db,
        `users/${user?.uid}/todoLists/${activeListId}/${collectionName}/${id}`
      ),
    [activeListId, user?.uid]
  );

  const syncTodoOrder = useCallback(async (nextTodos) => {
    const batch = writeBatch(db);
    nextTodos.forEach((task, index) => {
      batch.update(getDocRef("todos", task.id), { order: index });
    });
    await batch.commit();
  }, [getDocRef]);

  const addTask = useCallback(
    async ({
      task,
      primaryDuration = 25 * 60,
      secondaryDuration = 5 * 60,
      numCycles = 1,
      tilDone = false,
      column = "column-1",
      isSpecial = false,
    }) => {
      ensureListReady();
      const payload = {
        task,
        primaryDuration,
        secondaryDuration,
        numCycles,
        tilDone,
        column,
        isSpecial,
        complete: false,
        completed: false,
        isRunning: false,
        userId: user.uid,
        order: todos.length,
        totalElapsedTime: 0,
      };

      const docRef = await addDoc(getCollectionRef("todos"), payload);
      return docRef.id;
    },
    [ensureListReady, getCollectionRef, todos.length, user?.uid]
  );

  const updateTask = useCallback(
    async (id, updates, collectionHint) => {
      ensureListReady();

      const isInTodos =
        collectionHint === "todos"
          ? true
          : collectionHint === "completedTodos"
          ? false
          : todos.some((todo) => todo.id === id);

      const collectionName = isInTodos ? "todos" : "completedTodos";
      await updateDoc(getDocRef(collectionName, id), updates);
    },
    [ensureListReady, getDocRef, todos]
  );

  const deleteTask = useCallback(
    async (id) => {
      ensureListReady();

      const remainingTodos = todos.filter((todo) => todo.id !== id);
      const isInTodos = remainingTodos.length !== todos.length;
      const collectionName = isInTodos ? "todos" : "completedTodos";

      await deleteDoc(getDocRef(collectionName, id));

      if (isInTodos) {
        await syncTodoOrder(remainingTodos);
      }
    },
    [ensureListReady, getDocRef, todos, syncTodoOrder]
  );

  const toggleTaskCompletion = useCallback(
    async (id, forceComplete) => {
      ensureListReady();

      const sourceTask =
        todos.find((todo) => todo.id === id) ||
        completedTodos.find((todo) => todo.id === id);

      if (!sourceTask) {
        throw new Error("Task not found");
      }

      const shouldComplete =
        typeof forceComplete === "boolean"
          ? forceComplete
          : !sourceTask.complete;

      const sourceCollection = sourceTask.complete
        ? "completedTodos"
        : "todos";
      const targetCollection = shouldComplete ? "completedTodos" : "todos";

      const batch = writeBatch(db);
      const targetTask = {
        ...sourceTask,
        complete: shouldComplete,
        completed: shouldComplete,
        isRunning: false,
        order: shouldComplete ? null : todos.length,
      };

      batch.delete(getDocRef(sourceCollection, id));
      batch.set(getDocRef(targetCollection, id), targetTask);

      if (sourceCollection === "todos") {
        const remaining = todos
          .filter((todo) => todo.id !== id)
          .map((todo, index) => ({
            id: todo.id,
            order: index,
          }));

        remaining.forEach(({ id: todoId, order }) => {
          batch.update(getDocRef("todos", todoId), { order });
        });
      }

      await batch.commit();
    },
    [ensureListReady, completedTodos, getDocRef, todos]
  );

  const reorderTodos = useCallback(
    async (nextTodos) => {
      ensureListReady();

      const reordered = nextTodos.map((todo, index) => ({
        ...todo,
        order: index,
      }));

      setTodos(reordered);
      await syncTodoOrder(reordered);
    },
    [ensureListReady, syncTodoOrder]
  );

  const createList = useCallback(
    async (listId) => {
      ensureUser();
      if (!listId) return;

      const trimmed = listId.trim();
      if (!trimmed.length) return;

      const docRef = doc(
        db,
        `users/${user.uid}/todoLists/${trimmed.replace(/\s+/g, "-")}`
      );
      await setDoc(docRef, { createdAt: Date.now() });
      setActiveListId(docRef.id);
    },
    [ensureUser, user?.uid]
  );

  const deleteList = useCallback(
    async (listId) => {
      ensureUser();
      if (!listId) return;

      const listRef = doc(db, `users/${user.uid}/todoLists/${listId}`);

      await deleteDoc(listRef);

      if (activeListId === listId) {
        setActiveListId(null);
      }
    },
    [activeListId, ensureUser, user?.uid]
  );

  const value = useMemo(
    () => ({
      user,
      lists,
      activeListId,
      setActiveListId,
      todos,
      completedTodos,
      loading,
      addTask,
      updateTask,
      toggleTaskCompletion,
      reorderTodos,
      deleteTask,
      createList,
      deleteList,
    }),
    [
      user,
      lists,
      activeListId,
      todos,
      completedTodos,
      loading,
      addTask,
      updateTask,
      toggleTaskCompletion,
      reorderTodos,
      deleteTask,
      createList,
      deleteList,
    ]
  );

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};

export const useTasks = () => {
  const context = useContext(TaskContext);

  if (!context) {
    throw new Error("useTasks must be used within a TaskProvider");
  }

  return context;
};
