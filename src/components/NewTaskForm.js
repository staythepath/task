import React, { useState } from 'react';

const NewTaskForm = ({ onSubmit }) => {
  const [task, setTask] = useState('');
  const [primaryDuration, setPrimaryDuration] = useState(25);
  const [secondaryDuration, setSecondaryDuration] = useState(5);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (task.trim()) {
      console.log('New task:', task.trim(), primaryDuration * 60, secondaryDuration * 60);
      onSubmit(task.trim(), primaryDuration * 60, secondaryDuration * 60);
      setTask('');
      setPrimaryDuration(25);
      setSecondaryDuration(5);
    }
    
  };

  const focusHiddenInput = (type) => {
    if (type === "primary" || type === "secondary") {
      document.querySelector(`#new-task-form-hidden-input-${type}`).focus();
    }
  };
  

  const timerDisplayStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '2rem',
    margin: '0 0.5rem',
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input
        id="new-task-form-hidden-input-primary"
        type="number"
        value={primaryDuration / 60}
        onChange={(e) =>
          setPrimaryDuration(Math.max(0, parseInt(e.target.value, 10) * 60))
        }
        className="hidden-timer-input"
        min="0"
      />
      <input
        id="new-task-form-hidden-input-secondary"
        type="number"
        value={secondaryDuration / 60}
        onChange={(e) =>
          setSecondaryDuration(Math.max(0, parseInt(e.target.value, 10) * 60))
        }
        className="hidden-timer-input"
        min="0"
      />

      <input
        type="text"
        value={task}
        onChange={(e) => setTask(e.target.value)}
        placeholder="Add new task"
      />
      <button onClick={(e) => { e.preventDefault(); setPrimaryDuration(primaryDuration - 1)}}>-</button>
      <div
        style={timerDisplayStyle}
        onClick={() => focusHiddenInput("primary")}
      >
        {isNaN(primaryDuration / 60) || primaryDuration === null
          ? "00"
          : Math.floor(primaryDuration / 60)}
        :
        {isNaN(primaryDuration % 60) || primaryDuration === null
          ? "00"
          : String(primaryDuration % 60).padStart(2, "0")}
      </div>

      <button onClick={(e) => { e.preventDefault(); setPrimaryDuration(primaryDuration + 1)}}>+</button>
      <button onClick={(e) => { e.preventDefault(); setSecondaryDuration(secondaryDuration - 1)}}>-</button>
      <div
        style={timerDisplayStyle}
        onClick={() => focusHiddenInput("secondary")}
      >
        {isNaN(secondaryDuration / 60) || secondaryDuration === null
          ? "00"
          : Math.floor(secondaryDuration / 60)}
        :
        {isNaN(secondaryDuration % 60) || secondaryDuration === null
          ? "00"
          : String(secondaryDuration % 60).padStart(2, "0")}
      </div>


      <button onClick={(e) => { e.preventDefault(); setSecondaryDuration(secondaryDuration + 1)}}>+</button>
      <button type="submit" style={{ marginLeft: '1rem' }}>
        Add
      </button>
    </form>
  );
};

export default NewTaskForm;
