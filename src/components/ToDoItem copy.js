import React, { useState, useEffect, useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { ItemTypes } from '../ItemTypes';

const ToDoItem = ({ id, index, moveItem, task, complete, onToggle, onDelete }) => {
  const [primaryDuration, setPrimaryDuration] = useState(25 * 60);
  const [secondaryDuration, setSecondaryDuration] = useState(5 * 60);
  const [timeLeft, setTimeLeft] = useState(primaryDuration);
  const [isRunning, setIsRunning] = useState(false);
  const [isPrimary, setIsPrimary] = useState(true);

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
  drag(drop(ref));

  return (
    <li ref={ref} style={{ display: 'flex', alignItems: 'center' }}>
    <div
      className="handle"
      style={{
        cursor: 'grab',
        marginRight: '15px',
        borderRadius: '10px',
        backgroundColor: '#ccc',
        height: '20px',
        width: '20px',
      }}
    ></div>
      <input type="checkbox" checked={complete} onChange={onToggle} />
      <span>{task}</span>
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
        <button onClick={() => adjustTime('primary', -1)}>-</button>
        <div style={timerDisplayStyle}>
          {Math.floor(primaryDuration / 60)}:{String(primaryDuration % 60).padStart(2, '0')}
        </div>
        <button onClick={() => adjustTime('primary', 1)}>+</button>
        <button onClick={() => adjustTime('secondary', -1)}>-</button>
        <div style={timerDisplayStyle}>
          {Math.floor(secondaryDuration / 60)}:{String(secondaryDuration % 60).padStart(2, '0')}
        </div>
        <button onClick={() => adjustTime('secondary', 1)}>+</button>
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
      </div>
    </li>
  );
};

export default ToDoItem;


