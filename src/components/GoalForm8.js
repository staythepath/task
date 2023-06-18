import React from "react";
import TextField from "@mui/material/TextField";
import "../css/GoalGuide.css";

function GoalForm8({ formValues, handleInputChange1 }) {
  return (
    <form>
      <div style={{ width: "100%" }}>
        <TextField
          name="form8Field1"
          label="On a positive note, what good things would success bring?"
          fullWidth
          margin="normal"
          style={{ display: "block" }}
          className="form-field"
          value={formValues.form8Field1}
          onChange={handleInputChange1}
        />
        <TextField
          name="form8Field2"
          label="If succeeding at this won't make you happier, change the goal."
          fullWidth
          margin="normal"
          style={{ display: "block" }}
          className="form-field"
          value={formValues.form8Field2}
          onChange={handleInputChange1}
        />
        <TextField
          name="form8Field3"
          label="If it won't make you happier, you won't do it anyway."
          fullWidth
          margin="normal"
          style={{ display: "block" }}
          className="form-field"
          value={formValues.form8Field3}
          onChange={handleInputChange1}
        />
      </div>
    </form>
  );
}

export default GoalForm8;
