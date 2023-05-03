import React, { useState, useEffect, useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { ItemTypes } from '../ItemTypes';

const ToDoItem = ({
  id,
  index,
  moveItem,
  task,
  complete,
  primaryDuration: initialPrimaryDuration,
  secondaryDuration: initialSecondaryDuration,
  onToggle,
  onDelete,
  handleUpdate,
}) => {
  const [primaryDuration, setPrimaryDuration] = useState(initialPrimaryDuration);
  const [secondaryDuration, setSecondaryDuration] = useState(initialSecondaryDuration);
  const [timeLeft, setTimeLeft] = useState(primaryDuration);
  const [isRunning, setIsRunning] = useState(false);
  const [isPrimary, setIsPrimary] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setPrimaryDuration(initialPrimaryDuration);
    setSecondaryDuration(initialSecondaryDuration);
  }, [initialPrimaryDuration, initialSecondaryDuration]);
  
  useEffect(() => {
    setTimeLeft(isPrimary ? primaryDuration : secondaryDuration);
  }, [primaryDuration, secondaryDuration, isPrimary]);

  useEffect(() => {
    let timer;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prevTimeLeft) => prevTimeLeft - 1);
      }, 1000);
    } else if (!isRunning) {
      clearInterval(timer);
    } else if (timeLeft === 0) {
      clearInterval(timer);
  
      const playSound = (times) => {
        if (times <= 0) return;
      
        const audio = new Audio('/beep.wav');
        audio.play();
      
        // Set the duration of the audio file in milliseconds.
        const audioDuration = 1500; // Adjust this value according to the length of your audio file.
      
        // Wait for the audio to finish playing before playing it again.
        setTimeout(() => playSound(times - 1), audioDuration);
      };
  
      playSound(8);
  
      setIsPrimary(!isPrimary);
      setTimeLeft(isPrimary ? secondaryDuration : primaryDuration);
      setIsRunning(true);
    }
  
    return () => clearInterval(timer);
  }, [isRunning, timeLeft, primaryDuration, secondaryDuration, isPrimary]);
  
  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };
  

  const adjustTime = (type, delta) => {
    if (type === 'primary') {
      setPrimaryDuration((prevDuration) => Math.max(0, prevDuration + delta * 60));
    } else if (type === 'secondary') {
      setSecondaryDuration((prevDuration) => Math.max(0, prevDuration + delta * 60));
    }
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(primaryDuration);
    setIsPrimary(true);
  };

  const focusHiddenInput = (type) => {
    if (isEditing && (type === "primary" || type === "secondary")) {
      document.querySelector(`#todo-${id}-hidden-input-${type}`).focus();
    }
  };
  

  const timerDisplayStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '2rem',
    margin: '0 0.5rem',
  };

  const countdownDisplayStyle = {
    width: '3rem',
    textAlign: 'center',
    marginRight: '1rem',
  };
  const ref = useRef(null);
  const handleRef = useRef(null);
  const [, drag] = useDrag({
    type: ItemTypes.TODO_ITEM,
    item: { id, index },
  });
  const [, drop] = useDrop({
    accept: ItemTypes.TODO_ITEM,
    hover(item, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      moveItem(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });
  drag(handleRef);
  drop(ref);

  return (
    <li ref={ref} style={{ display: 'flex', alignItems: 'center' }}>
      <div
        ref={handleRef}
        className="handle"
        style={{
          cursor: 'grab',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          marginRight: '10px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div
            style={{
              width: '4px',
              height: '4px',
              backgroundColor: '#999',
              borderRadius: '50%',
              marginRight: '4px',
            }}
          ></div>
          <div
            style={{
              width: '4px',
              height: '4px',
              backgroundColor: '#999',
              borderRadius: '50%',
            }}
          ></div>
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '5px',
            marginBottom: '5px',
          }}
        >
          <div
            style={{
              width: '4px',
              height: '4px',
              backgroundColor: '#999',
              borderRadius: '50%',
              marginRight: '4px',
            }}
          ></div>
          <div
            style={{
              width: '4px',
              height: '4px',
              backgroundColor: '#999',
              borderRadius: '50%',
            }}
          ></div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div
            style={{
              width: '4px',
              height: '4px',
              backgroundColor: '#999',
              borderRadius: '50%',
              marginRight: '4px',
            }}
          ></div>
          <div
            style={{
              width: '4px',
              height: '4px',
              backgroundColor: '#999',
              borderRadius: '50%',
            }}
          ></div>
        </div>
      </div>
      <input type="checkbox" checked={complete} onChange={onToggle} />
      {
      isEditing ? (
        <input
  type="text"
  value={task}
  onChange={(e) => {
    <input
  type="text"
  value={task}
  onChange={(e) => {
    const newTask = { ...{id, index, moveItem, task, complete, primaryDuration: initialPrimaryDuration, secondaryDuration: initialSecondaryDuration, onToggle, onDelete, handleUpdate}, task: e.target.value };
    handleUpdate(newTask);
  }}
  style={{ marginLeft: '1rem', marginRight: '1rem' }}
/>
  }}
  style={{ marginLeft: '1rem', marginRight: '1rem' }}
/>
      ) : (
        <span>{task}</span>
      )
    }
    
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
      {isEditing &&
        <>
          <input
          id={`todo-${id}-hidden-input-primary`}
          type="number"
          value={primaryDuration / 60}
          onChange={(e) =>
            setPrimaryDuration(Math.max(0, parseInt(e.target.value, 10) * 60))
          }
          className="hidden-timer-input"
          min="0"
        />
        <input
          id={`todo-${id}-hidden-input-secondary`}
          type="number"
          value={secondaryDuration / 60}
          onChange={(e) =>
            setSecondaryDuration(Math.max(0, parseInt(e.target.value, 10) * 60))
          }
          className="hidden-timer-input"
          min="0"
        />
          <button onClick={() => adjustTime('primary', -1)}>-</button>
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


          <button onClick={() => adjustTime('primary', 1)}>+</button>
          <button onClick={() => adjustTime('secondary', -1)}>-</button>
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


          <button onClick={() => adjustTime('secondary', 1)}>+</button>
        </>
      }
      
      <div style={countdownDisplayStyle}>
        <input
          type="text"
          value={`${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, '0')}`}
          readOnly
          style={{ width: '100%', textAlign: 'center', marginLeft: '.5rem' }}
        />
      </div>
      <button onClick={toggleTimer} style={{ marginLeft: '1rem', minWidth: '72px', maxWidth: '72px' }}>
        {isRunning ? 'Pause' : 'Start'}
      </button>
      <button onClick={resetTimer} style={{ marginLeft: '1rem' }}>
        Reset
      </button>
      <button onClick={onDelete} style={{ marginLeft: '1rem' }}>
        Delete
      </button>
      <button onClick={toggleEdit} style={{ marginLeft: '1rem' }}>
        {isEditing ? 'Done' : 'Edit'}
      </button>
    </div>
  </li>
);
};

export default ToDoItem;


