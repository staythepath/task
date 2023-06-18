import React from "react";
import TextField from "@mui/material/TextField";
import "../css/GoalGuide.css";

function GoalForm4({ formValues, handleInputChange1 }) {
  return (
    <form>
      <div style={{ width: "100%" }}>
        <TextField
          name="form4Field1"
          label="Alright what can you achieve this month?"
          fullWidth
          margin="normal"
          style={{ display: "block" }}
          className="form-field"
          value={formValues.form4Field1}
          onChange={handleInputChange1}
        />
        <TextField
          name="form4Field2"
          label="Don't make it impossible."
          fullWidth
          margin="normal"
          style={{ display: "block" }}
          className="form-field"
          value={formValues.form4Field2}
          onChange={handleInputChange1}
        />
        <TextField
          name="form4Field3"
          label="Be realistic."
          fullWidth
          margin="normal"
          style={{ display: "block" }}
          className="form-field"
          value={formValues.form4Field3}
          onChange={handleInputChange1}
        />
      </div>
    </form>
  );
}

export default GoalForm4;
