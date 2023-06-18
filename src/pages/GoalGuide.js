import React from "react";
import { useState } from "react";
import GoalForm1 from "../components/GoalForm1";
import GoalForm2 from "../components/GoalForm2";
import GoalForm3 from "../components/GoalForm3";
import GoalForm4 from "../components/GoalForm4";
import GoalForm5 from "../components/GoalForm5";
import GoalForm6 from "../components/GoalForm6";
import GoalForm7 from "../components/GoalForm7";
import GoalForm8 from "../components/GoalForm8";
import { db } from "../config/firebase";
import { getAuth } from "firebase/auth";
import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import StepContent from "@mui/material/StepContent";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { StyledEngineProvider } from "@mui/material/styles";
import "../css/GoalGuide.css";
import { setDoc, doc } from "firebase/firestore";

function GoalGuide({ todos, setTodos }) {
  const [activeStep, setActiveStep] = React.useState(0);
  const [formValues, setFormValues] = useState({
    form1Field1: "",
    form1Field2: "",
    form1Field3: "",
    form2Field1: "",
    form2Field2: "",
    form2Field3: "",
    form3Field1: "",
    form3Field2: "",
    form3Field3: "",
    form4Field1: "",
    form4Field2: "",
    form4Field3: "",
    form5Field1: "",
    form5Field2: "",
    form5Field3: "",
    form6Field1: "",
    form6Field2: "",
    form6Field3: "",
    form7Field1: "",
    form7Field2: "",
    form7Field3: "",
    form8Field1: "",
    form8Field2: "",
    form8Field3: "",
  });

  const auth = getAuth();
  const currentUser = auth.currentUser;

  const handleInputChange1 = (e) => {
    setFormValues({ ...formValues, [e.target.name]: e.target.value });
  };

  const steps = [
    {
      label: "Overarching life goals",
      description: `OK, we are going to start off with the big stuff, then we are going to break it down. So in broad terms, what are your life goals, or as I prefer to ask it, who do you want to be? Choose anything you want that a person can achieve. If a person can do it, you can probably do it too, so don’t limityourself and think about what you *really* want out of life. On your deathbed, what would you haveaccomplished that would make you feel happy with the life you lived? Those are the things that are important in life and what we need to focus on. You have a finite amount of time left and you don’teven know how large or small that amount is, so it’s best to start focusing on these things ASAP. \n
      Take as long as you need and feel free to include things you can start being right now. You can always change this letter… eventually. I recommend that you don’t show this to anyone so that you can really be honest. If you want to tell other people your goals that can be helpful, but I think it’s more important to be honest with yourself about what you want. Alright, it’s time. What do you want and who do you want to be?
      `,
      form: (
        <GoalForm1
          formValues={formValues}
          handleInputChange1={handleInputChange1}
        />
      ),
    },
    {
      label: "Yearly goals",
      description: `Those are some admirable ambitions! You can totally do that! I mean, probably, I don’t actually know you and I don’t actually know what that ambition is, but it felt right… either way you should totally go for it and focus your time on it if that is what you really want. What that means is we need to start breaking that down into smaller goals that we know we can achieve, that lead to accomplishing those goals. We aren’t going to map out every second of your life here, we are just breaking things down into more manageable pieces that we know we are able to accomplish. 
        We are going to start with some goals we want to accomplish over the next year that will lead us to achieving our life goals. From here we have to be less broad and start being very SMART(Specific, Achievable, Relevant, and Time-bound). Acronyms can be cheesy, but setting goals with this method works. So, over the next year what are some things you need to accomplish to be on your way to being who you want to be? They don’t have to take a year to do, but they can’t take more than a year. We are going to work towards our goals a year at a time, (also a quarter at a time, a month at a time, a week at a time, a day at a time and a task at a time)So what should you be doing over the next year in order to accomplish your goal? Remember, make them SMART.`,
      form: (
        <GoalForm2
          formValues={formValues}
          handleInputChange1={handleInputChange1}
        />
      ),
    },
    {
      label: "Quarterly goals",
      description: `Great! We are on our way! Now for each year goal we have, we are going to see if it can be done in a quarter of a year(3 months).  If it can be done in 3 months,  it is going to become a quarterly goal instead of a yearly goal. <br/> Now if it can’t be done in 3 months, we are going to see what thing or things we need to accomplish over the next 3 months to help us on our way to achieving that goal in a year. You can only have two quarterly goals per Yearly goal, or else we will end up with a bajillion tasks to do on day 1 and we don’t want that. Remember, you must be able to do this in 3 months. So take your yearly goals and, break them down and keep them SMART(Specific, Achievable, Relevant, and Time-bound).`,
      form: (
        <GoalForm3
          formValues={formValues}
          handleInputChange1={handleInputChange1}
        />
      ),
    },
    {
      label: "Monthly goals",
      description: `Perfect. Now we need to start being a bit careful here to keep things manageable. For each quarterly goal, we are going to come up with one goal to accomplish in the next month that will lead us to accomplishing that quarterly goal. If you HAVE TO do two goals you can, but it’s best to keep it to 1 for the month. Remember, you have 3 months to do this, so consider what needs to be done over all 3 months, and just put down the goal you need to accomplish in the first month. In an attempt to prevent any anxiety or stress over if you will meet your goal in time, always go heavier at the beginning instead of pushing everything to the last month. We are sort of locking in anti-procrastination by front loading our tasks instead of loading them at the end of the period. We don’t want to be racing to complete our goal at the end of the month or week or day or year or whatever. Also, I’m just gonna leave this here: Specific, Achievable, Relevant, and Time-bound`,
      form: (
        <GoalForm4
          formValues={formValues}
          handleInputChange1={handleInputChange1}
        />
      ),
    },
    {
      label: "Weekly goals",
      description: `OK, so it should be clear what we are doing here. We are going to do this down to the day where we will assign tasks that you will actually do and we are almost there! So you have some goals for the month, let’s break them down into what you can do in the next week in order to achieve the goal in a month. Remember, you don’t have to achieve your monthly goals in the next week, but we need to try to make progress towards each goal. Look at your monthly goals and figure out what steps you can take this upcoming week to help accomplish that goal.`,
      form: (
        <GoalForm5
          formValues={formValues}
          handleInputChange1={handleInputChange1}
        />
      ),
    },
    {
      label: "Challenges",
      description: `Now, yes we want to keep our spirits up so being positive is great and all, but I think it's equally important to be realistic. You are going to run into problems on your way to achieving success. It would be nice if you didn't, but we should probably just assume you will so that we can be prepared. 
      Think about the most likely issues you will run into on your way to your goals. Consider what you will do when you want to give up and figure out how to get around that. Make a plan to deal with yourself when you don't want to do what you need to do to succeed. If I knew what would help you through that bit, I'd tell you right now, but yoou certainly know yourself better than I know you, so I'm leaving it up to you.`,
      form: (
        <GoalForm6
          formValues={formValues}
          handleInputChange1={handleInputChange1}
        />
      ),
    },
    {
      label: "Negative motivation",
      description: `So this might be a different approach than what you are use to, but the fact is that a lot of times, negative motivation is more powerful than positive motivation. So we are going to use that to our advantage and ask where will you be if you don't achieve your goals? If the answer is "Right where I am now and that's not too bad," then you aren't playing the game right. This is meant to help you so it's beneficial to play along. Now, it's pointless to lie to yourself, but really try to think about the negative things that will happen or the negative feelings you will feel if you don't succeed or if you give up. 
      This seems like a strange approach, but the idea is that when people think positively about their goals, their body kind of relaxes and acts as if they have already achieved their goal. This is great for your mental health, but it doesn't always help you achieve your goals. When you think about the negative things that will happen if you don't achieve your goals, your body kind of tenses up and prepares for a fight. This is great for achieving your goals, but it's not great for your mental health. So we are going to use both. We will get to the positive stuff next.`,
      form: (
        <GoalForm7
          formValues={formValues}
          handleInputChange1={handleInputChange1}
        />
      ),
    },
    {
      label: "Positive motivation",
      description: `Time for the tried and true positivity approach. I don't really feel like I need to explain too much here, because this stuff is literally plastered all over the walls in a lot of places. Just write down the good stuff that will happen when you achieve your goals and how great you'll feel and how it will help you and everyone around you.`,
      form: (
        <GoalForm8
          formValues={formValues}
          handleInputChange1={handleInputChange1}
        />
      ),
    },
  ];

  const handleNext = async () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    // Define document names and the corresponding form fields
    const stepsData = {
      overarching: ["form1Field1", "form1Field2", "form1Field3"],
      yearly: ["form2Field1", "form2Field2", "form2Field3"],
      quarterly: ["form3Field1", "form3Field2", "form3Field3"],
      monthly: ["form4Field1", "form4Field2", "form4Field3"],
      weekly: ["form5Field1", "form5Field2", "form5Field3"],
      challenges: ["form6Field1", "form6Field2", "form6Field3"],
      negativeMo: ["form7Field1", "form7Field2", "form7Field3"],
      positiveMo: ["form8Field1", "form8Field2", "form8Field3"],
    };

    // Get the key of the current step (name of the document)
    const stepKey = Object.keys(stepsData)[activeStep];
    // Get the fields of the current step
    const fields = stepsData[stepKey];

    // Generate the document data
    let docData = {};
    fields.forEach((field) => {
      docData[field] = formValues[field];
    });

    // Create a reference to the Firestore document
    const docRef = doc(db, `users/${currentUser.uid}/goals/${stepKey}`);

    // Store the data in Firestore
    await setDoc(docRef, docData, { merge: true });

    // Increment the active step
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  return (
    <div className="ToDoList">
      <h1>Who do you want to be?</h1>
      <StyledEngineProvider injectFirst>
        <Box sx={{ maxWidth: 700 }}>
          <Stepper activeStep={activeStep} orientation="vertical">
            {steps.map((step, index) => (
              <Step key={step.label}>
                <StepLabel>{step.label}</StepLabel>{" "}
                <StepContent>
                  <Typography className="stepContent">
                    {step.description.split("\n").map((item, i) => (
                      <p key={i}>{item}</p>
                    ))}
                  </Typography>{" "}
                  {step.form}
                  <Box sx={{ mb: 2 }}>
                    <div>
                      <Button
                        variant="contained"
                        onClick={handleNext}
                        className="stepButton"
                      >
                        {index === steps.length - 1 ? "Finish" : "Continue"}
                      </Button>
                      <Button
                        disabled={index === 0}
                        onClick={handleBack}
                        className="backButton"
                      >
                        Back
                      </Button>
                    </div>
                  </Box>
                </StepContent>
              </Step>
            ))}
          </Stepper>
          {activeStep === steps.length && (
            <Paper square elevation={0} sx={{ p: 3 }}>
              <Typography>
                All steps completed - you&apos;re finished
              </Typography>
              <Button onClick={handleReset} className="resetButton">
                {" "}
                {/* Use the class */}
                Reset
              </Button>
            </Paper>
          )}
        </Box>
      </StyledEngineProvider>
    </div>
  );
}

export default GoalGuide;
