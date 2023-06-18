import React from "react";
import TextField from "@mui/material/TextField";
import "../css/GoalGuide.css";

function GoalForm5({ formValues, handleInputChange1 }) {
  return (
    <form>
      <div style={{ width: "100%" }}>
        <TextField
          name="form5Field1"
          label="What can you do this next week to meet your monthly goal?"
          fullWidth
          margin="normal"
          style={{ display: "block" }}
          className="form-field"
          value={formValues.form5Field1}
          onChange={handleInputChange1}
        />
        <TextField
          name="form5Field2"
          label="What can you do in 7 days? (a lot)"
          fullWidth
          margin="normal"
          style={{ display: "block" }}
          className="form-field"
          value={formValues.form5Field2}
          onChange={handleInputChange1}
        />
        <TextField
          name="form5Field3"
          label="Challenge yourself!"
          fullWidth
          margin="normal"
          style={{ display: "block" }}
          className="form-field"
          value={formValues.form5Field3}
          onChange={handleInputChange1}
        />
      </div>
    </form>
  );
}

export default GoalForm5;
