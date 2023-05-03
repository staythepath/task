import React, { useState, useEffect } from 'react';

const Timer = ({ initialDuration }) => {
  const [primaryDuration, setPrimaryDuration] = useState(initialDuration);
  const [secondaryDuration, setSecondaryDuration] = useState(initialDuration * 0.2);
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

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {!isRunning && timeLeft === primaryDuration && (
        <>
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
        </>
      )}
      <div style={countdownDisplayStyle}>
        {isRunning || timeLeft !== primaryDuration ? (
          <input
            type="text"
            value={`${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, '0')}`}
            readOnly
            style={{ width: '100%', textAlign: 'center' }}
          />
        ) : null}
      </div>
      <button onClick={toggleTimer} style={{ marginLeft: '1rem' }}>
        {isRunning ? 'Pause' : 'Start'}
      </button>
      <button onClick={resetTimer} style={{ marginLeft: '1rem' }}>
        Reset
      </button>
    </div>
  );
};

export default Timer;
