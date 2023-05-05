import React, { useState } from 'react';

const NewTaskForm = ({ onSubmit }) => {
  const [task, setTask] = useState('');
  const [primaryDuration, setPrimaryDuration] = useState(25 * 60);
  const [secondaryDuration, setSecondaryDuration] = useState(5 * 60);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (task.trim()) {
      console.log('New task:', task.trim(), primaryDuration * 60, secondaryDuration * 60);
      onSubmit(task.trim(), primaryDuration, secondaryDuration);
      setTask('');
      setPrimaryDuration(25 * 60);
      setSecondaryDuration(5 * 60);
    }
    
  };

  const [primaryDurationFocused, setPrimaryDurationFocused] = useState(false);
  const [secondaryDurationFocused, setSecondaryDurationFocused] = useState(false);
  
  const timerDisplayStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '1.2rem',
    margin: '0 0.5rem',
    marginRight: '0.03rem',
    marginLeft: '.4rem',
  };

  const colonDisplayStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '.01rem',
    margin: '0 0rem',
    lineHeight: '1',
    verticalAlign: 'middle',
    cursor: 'text',
  };
  
  
  return (
    <form onSubmit={handleSubmit}>
      <input
        id="new-task-form-hidden-input-primary"
        type="number"
        style={{ outline: '2px solid #000000' }}
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
        style={{ outline: '2px solid #000000' }}
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
      <button onClick={(e) => { e.preventDefault(); setPrimaryDuration(Math.max(0, primaryDuration - 60)) }}>-</button>
      <input
        type="text"
        pattern="\d*"
        value={isNaN(primaryDuration / 60) || primaryDuration === null
          ? "00"
          : Math.floor(primaryDuration / 60)}
        onChange={(e) => {
          const value = e.target.value === "" ? 0 : parseInt(e.target.value, 10);
          if (!isNaN(value)) {
            setPrimaryDuration(value * 60);
          }
        }}
        className="timer-input"
        style={{ borderColor: primaryDurationFocused ? '#666' : 'transparent', backgroundColor: primaryDurationFocused ? '#444' : 'transparent' }}
        onFocus={() => setPrimaryDurationFocused(true)}
        onBlur={() => setPrimaryDurationFocused(false)}
      />
<div style={{ ...colonDisplayStyle, cursor: 'default' }}>:</div>
<div
        style={timerDisplayStyle}
      >
  {isNaN(primaryDuration % 60) || primaryDuration === null
    ? "00"
    : String(primaryDuration % 60).padStart(2, "0")}
</div>


      <button onClick={(e) => { e.preventDefault(); setPrimaryDuration(primaryDuration + 60)}}>+</button>
      <button onClick={(e) => { e.preventDefault(); setSecondaryDuration(Math.max(0, secondaryDuration - 60)) }}>-</button>
      <input
        type="text"
        pattern="\d*"
        value={isNaN(secondaryDuration / 60) || secondaryDuration === null
          ? "00"
          : Math.floor(secondaryDuration / 60)}
        onChange={(e) => {
          const value = e.target.value === "" ? 0 : parseInt(e.target.value, 10);
          if (!isNaN(value)) {
            setSecondaryDuration(value * 60);
          }
        }}
        className="timer-input"
        style={{ borderColor: secondaryDurationFocused ? '#666' : 'transparent', backgroundColor: secondaryDurationFocused ? '#444' : 'transparent' }} // Updated here
        onFocus={() => setSecondaryDurationFocused(true)}
        onBlur={() => setSecondaryDurationFocused(false)}
      />
      <div style={{ ...colonDisplayStyle, cursor: 'default' }}>:</div>
      <div
        style={timerDisplayStyle}
      >
        {isNaN(secondaryDuration % 60) || secondaryDuration === null
          ? "00"
          : String(secondaryDuration % 60).padStart(2, "0")}
      </div>
      <button onClick={(e) => { e.preventDefault(); setSecondaryDuration(secondaryDuration + 60)}}>+</button>
      <button type="submit" style={{ marginLeft: '1rem' }}>
        Add
      </button>
    </form>
  );
};

export default NewTaskForm;
