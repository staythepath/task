## Obey the Bell

A React + Firebase productivity suite that blends a Pomodoro-focused task queue, a run mode for hands-off execution, a priority board, and calendar tracking. The app now centralises all Firestore reads/writes through a shared task context, keeping the UI responsive while preserving your existing document layout.

### Firebase Structure

```
users/{uid}
  userInfo: { email, name, photoURL }
  todoLists/{listId}
    todos/{taskId}
    completedTodos/{taskId}
  goals/{...}
  journals/{...}
  timeAllocation/{...}
```

Each task document continues to use the fields you already store (`task`, `primaryDuration`, `secondaryDuration`, `numCycles`, `tilDone`, `column`, `order`, etc.). The refactor removes the hard-coded list ID and lets you pick or create lists directly in the UI, while all Firestore operations still target the same collections/subcollections.

### Environment Variables

Create a `.env.local` file in the project root and add the Firebase keys you already use in hosting:

```
REACT_APP_API_KEY=...
REACT_APP_AUTH_DOMAIN=...
REACT_APP_PROJECT_ID=...
REACT_APP_STORAGE_BUCKET=...
REACT_APP_MESSAGING_SENDER_ID=...
REACT_APP_APP_ID=...
REACT_APP_MEASUREMENT_ID=...
```

### Local Development

```bash
npm install
npm start
```

Sign in with any account that exists in your Firebase Auth project. Use the list picker on the To Do page to switch between existing day-based lists or to create a new one; all changes sync live across the timer, priority board, and run mode views.
