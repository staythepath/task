import React from "react";
import TextField from "@mui/material/TextField";
import "../css/GoalGuide.css";

function GoalForm3({ formValues, handleInputChange1 }) {
  return (
    <form>
      <div style={{ width: "100%" }}>
        <TextField
          name="form3Field1"
          label="Now what can you do in the next 3 months?"
          fullWidth
          margin="normal"
          style={{ display: "block" }}
          className="form-field"
          value={formValues.form3Field1}
          onChange={handleInputChange1}
        />
        <TextField
          name="form3Field2"
          label="This should lead to your over yearly goal."
          fullWidth
          margin="normal"
          style={{ display: "block" }}
          className="form-field"
          value={formValues.form3Field2}
          onChange={handleInputChange1}
        />
        <TextField
          name="form3Field3"
          label="Challenge yourself!"
          fullWidth
          margin="normal"
          style={{ display: "block" }}
          className="form-field"
          value={formValues.form3Field3}
          onChange={handleInputChange1}
        />
      </div>
    </form>
  );
}

export default GoalForm3;
