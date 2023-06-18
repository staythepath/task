import React from "react";
import TextField from "@mui/material/TextField";
import "../css/GoalGuide.css";

function GoalForm1({ formValues, handleInputChange1 }) {
  return (
    <form>
      <div style={{ width: "100%" }}>
        <TextField
          name="form1Field1"
          label="What's your first life goal?"
          fullWidth
          margin="normal"
          style={{ display: "block" }}
          className="form-field"
          value={formValues.form1Field1}
          onChange={handleInputChange1}
        />
        <TextField
          name="form1Field2"
          label="And your second life goal?"
          fullWidth
          margin="normal"
          style={{ display: "block" }}
          className="form-field"
          value={formValues.form1Field2}
          onChange={handleInputChange1}
        />
        <TextField
          name="form1Field3"
          label="Why not three?"
          fullWidth
          margin="normal"
          style={{ display: "block" }}
          className="form-field"
          value={formValues.form1Field3}
          onChange={handleInputChange1}
        />
      </div>
    </form>
  );
}

export default GoalForm1;
