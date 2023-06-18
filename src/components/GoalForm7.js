import React from "react";
import TextField from "@mui/material/TextField";
import "../css/GoalGuide.css";

function GoalForm7({ formValues, handleInputChange1 }) {
  return (
    <form>
      <div style={{ width: "100%" }}>
        <TextField
          name="form7Field1"
          label="What horrible things will happen if you don't achieve your goals?"
          fullWidth
          margin="normal"
          style={{ display: "block" }}
          className="form-field"
          value={formValues.form7Field1}
          onChange={handleInputChange1}
        />
        <TextField
          name="form7Field2"
          label="Sometimes negative motivation is useful."
          fullWidth
          margin="normal"
          style={{ display: "block" }}
          className="form-field"
          value={formValues.form7Field2}
          onChange={handleInputChange1}
        />
        <TextField
          name="form7Field3"
          label="Picture your life when you fail."
          fullWidth
          margin="normal"
          style={{ display: "block" }}
          className="form-field"
          value={formValues.form7Field3}
          onChange={handleInputChange1}
        />
      </div>
    </form>
  );
}

export default GoalForm7;
