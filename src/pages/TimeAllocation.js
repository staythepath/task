import React, { useState, useEffect, useCallback } from "react";
import { Slider } from "@mui/material";
import { getAuth } from "firebase/auth";
import { db } from "../config/firebase";
import { setDoc, doc, getDoc } from "firebase/firestore";

const TimeAllocation = () => {
  const auth = getAuth();
  const currentUser = auth.currentUser;

  const [timeAllocation, setTimeAllocation] = useState({
    monday: 0,
    tuesday: 0,
    wednesday: 0,
    thursday: 0,
    friday: 0,
    saturday: 0,
    sunday: 0,
  });

  const [nextWeekTimeAllocation, setNextWeekTimeAllocation] = useState({
    monday: 0,
    tuesday: 0,
    wednesday: 0,
    thursday: 0,
    friday: 0,
    saturday: 0,
    sunday: 0,
  });

  const fetchData = useCallback(async () => {
    try {
      const daysOrder = [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
      ];

      const lastVisitedDayRef = doc(
        db,
        `users/${currentUser.uid}/timeAllocation/lastVisitedDay`
      );
      const lastVisitedDaySnapshot = await getDoc(lastVisitedDayRef);
      let lastVisitedDay;
      if (lastVisitedDaySnapshot.exists()) {
        lastVisitedDay = lastVisitedDaySnapshot.data().day;
      }

      const currentWeekDocRef = doc(
        db,
        `users/${currentUser.uid}/timeAllocation/currentWeek`
      );
      const currentWeekDocSnapshot = await getDoc(currentWeekDocRef);
      if (currentWeekDocSnapshot.exists()) {
        const currentWeekData = currentWeekDocSnapshot.data();
        const orderedCurrentWeekData = {};
        daysOrder.forEach((day) => {
          orderedCurrentWeekData[day] = currentWeekData[day];
        });

        const nextWeekDocRef = doc(
          db,
          `users/${currentUser.uid}/timeAllocation/nextWeek`
        );
        const nextWeekDocSnapshot = await getDoc(nextWeekDocRef);
        if (nextWeekDocSnapshot.exists()) {
          const nextWeekData = nextWeekDocSnapshot.data();
          const orderedNextWeekData = {};
          daysOrder.forEach((day) => {
            orderedNextWeekData[day] = nextWeekData[day];
          });

          const currentDate = new Date();
          const currentDay = currentDate.getDay();

          if (
            currentDay === 1 &&
            (!lastVisitedDay || new Date(lastVisitedDay).getDay() < currentDay)
          ) {
            setTimeAllocation(orderedNextWeekData);
            setNextWeekTimeAllocation({
              monday: 0,
              tuesday: 0,
              wednesday: 0,
              thursday: 0,
              friday: 0,
              saturday: 0,
              sunday: 0,
            });
            // also update Firestore to reflect the week turnover
            await setDoc(currentWeekDocRef, orderedNextWeekData);
            await setDoc(nextWeekDocRef, {
              monday: 0,
              tuesday: 0,
              wednesday: 0,
              thursday: 0,
              friday: 0,
              saturday: 0,
              sunday: 0,
            });
          } else {
            setTimeAllocation(orderedCurrentWeekData);
            setNextWeekTimeAllocation(orderedNextWeekData);
          }

          // Update lastVisitedDay after the time allocations check
          await setDoc(lastVisitedDayRef, { day: currentDate });
        }
      }
    } catch (error) {
      console.log("Error fetching time allocation:", error);
    }
  }, [currentUser.uid]);

  useEffect(() => {
    fetchData();
    // removed setDoc for lastVisitedDay
  }, [fetchData, currentUser.uid]);

  const handleSliderChange = (week, e, newValue, day) => {
    if (week === "current") {
      setTimeAllocation({ ...timeAllocation, [day]: newValue });
    } else if (week === "next") {
      setNextWeekTimeAllocation({ ...nextWeekTimeAllocation, [day]: newValue });
    }
  };

  const handleSubmitCurrentWeek = async (e) => {
    e.preventDefault();
    const docRef = doc(
      db,
      `users/${currentUser.uid}/timeAllocation/currentWeek`
    );
    await setDoc(docRef, timeAllocation);

    console.log("Current week's time allocation has been saved.");
  };

  const handleSubmitNextWeek = async (e) => {
    e.preventDefault();
    const docRef = doc(db, `users/${currentUser.uid}/timeAllocation/nextWeek`);
    await setDoc(docRef, nextWeekTimeAllocation);

    console.log("Next week's time allocation has been saved.");
  };

  return (
    <>
      <h1 style={{ paddingTop: "80px" }}>Dedicate some time each day </h1>
      <h2 style={{ alignContent: "center" }}>This week</h2>
      <form
        onSubmit={handleSubmitCurrentWeek}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {Object.keys(timeAllocation).map((day) => (
          <div
            key={day}
            style={{
              width: "500px",
              display: "flex",
              alignItems: "center",
              margin: "10px 0",
            }}
          >
            <div style={{ width: "100px" }}>
              <h3 style={{ textAlign: "left" }}>
                {day.charAt(0).toUpperCase() + day.slice(1)}
              </h3>
            </div>
            <div style={{ width: "300px" }}>
              <Slider
                sx={{
                  "& .MuiSlider-thumb": {
                    background: "gray",
                  },
                  "& .MuiSlider-track": {
                    color: "gray",
                  },
                  "& .MuiSlider-rail": {
                    color: "gray",
                  },
                  "& .MuiSlider-active": {
                    color: "yellow",
                  },
                  "& .Mui-focusVisible": {
                    background: "gray",
                  },

                  "& .MuiSlider-mark": {
                    color: "gray",
                  },
                  "& .MuiSlider-thumbColorPrimary": {
                    color: "gray",
                  },
                }}
                aria-labelledby="discrete-slider"
                valueLabelDisplay="off"
                step={1}
                marks
                min={0}
                max={8}
                value={timeAllocation[day]}
                onChange={(e, newValue) =>
                  handleSliderChange("current", e, newValue, day)
                }
              />
            </div>
            <div style={{ width: "100px" }}>
              <h4 style={{ textAlign: "right" }}>{timeAllocation[day]} hrs</h4>
            </div>
          </div>
        ))}
        <button type="submit" style={{ marginTop: "20px" }}>
          Save
        </button>
      </form>
      <br />
      <h2 style={{ alignContent: "center" }}>Next week</h2>
      <form
        onSubmit={handleSubmitNextWeek}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {Object.keys(nextWeekTimeAllocation).map((day) => (
          <div
            key={day}
            style={{
              width: "500px",
              display: "flex",
              alignItems: "center",
              margin: "10px 0",
            }}
          >
            <div style={{ width: "100px" }}>
              <h3 variant="h6" style={{ textAlign: "left" }}>
                {day.charAt(0).toUpperCase() + day.slice(1)}
              </h3>
            </div>
            <div style={{ width: "300px" }}>
              <Slider
                sx={{
                  "& .MuiSlider-thumb": {
                    background: "gray",
                  },
                  "& .MuiSlider-track": {
                    color: "gray",
                  },
                  "& .MuiSlider-rail": {
                    color: "gray",
                  },
                  "& .MuiSlider-active": {
                    color: "yellow",
                  },
                  "& .Mui-focusVisible": {
                    background: "gray",
                  },
                  "& .MuiSlider-mark": {
                    color: "gray",
                  },
                }}
                aria-labelledby="discrete-slider"
                valueLabelDisplay="auto"
                step={1}
                marks
                min={0}
                max={8}
                value={nextWeekTimeAllocation[day]}
                onChange={
                  (e, newValue) => handleSliderChange("next", e, newValue, day) // "next" instead of "current"
                }
              />
            </div>
            <div style={{ width: "100px" }}>
              <h4 style={{ textAlign: "right" }}>
                {nextWeekTimeAllocation[day]} hrs
              </h4>
            </div>
          </div>
        ))}
        <button
          type="submit"
          style={{ marginTop: "20px", marginBottom: "20px" }}
        >
          Save
        </button>
      </form>
    </>
  );
};

export default TimeAllocation;
