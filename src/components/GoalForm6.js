import React from "react";
import TextField from "@mui/material/TextField";
import "../css/GoalGuide.css";

function GoalForm6({ formValues, handleInputChange1 }) {
  return (
    <form>
      <div style={{ width: "100%" }}>
        <TextField
          name="form6Field1"
          label="Try to think ahead to what will stop you from achieving these goals?"
          fullWidth
          margin="normal"
          style={{ display: "block" }}
          className="form-field"
          value={formValues.form6Field1}
          onChange={handleInputChange1}
        />
        <TextField
          name="form6Field2"
          label="What obstacles will you face and how will you overcome them?"
          fullWidth
          margin="normal"
          style={{ display: "block" }}
          className="form-field"
          value={formValues.form6Field2}
          onChange={handleInputChange1}
        />
        <TextField
          name="form6Field3"
          label="Problems and challenges WILL come up!"
          fullWidth
          margin="normal"
          style={{ display: "block" }}
          className="form-field"
          value={formValues.form6Field3}
          onChange={handleInputChange1}
        />
      </div>
    </form>
  );
}

export default GoalForm6;
