import React from "react";
import TextField from "@mui/material/TextField";
import "../css/GoalGuide.css";

function GoalForm2({ formValues, handleInputChange1 }) {
  return (
    <form>
      <div style={{ width: "100%" }}>
        <TextField
          name="form2Field1"
          label="Wha are your goals for the next year?"
          fullWidth
          margin="normal"
          style={{ display: "block" }}
          className="form-field"
          value={formValues.form2Field1}
          onChange={handleInputChange1}
        />
        <TextField
          name="form2Field2"
          label="Make sure it's doable in a year."
          fullWidth
          margin="normal"
          style={{ display: "block" }}
          className="form-field"
          value={formValues.form2Field2}
          onChange={handleInputChange1}
        />
        <TextField
          name="form2Field3"
          label="Don't make it too easy!"
          fullWidth
          margin="normal"
          style={{ display: "block" }}
          className="form-field"
          value={formValues.form2Field3}
          onChange={handleInputChange1}
        />
      </div>
    </form>
  );
}

export default GoalForm2;
