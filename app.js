const express = require("express");
const cors = require("cors");
const app = express();
const connectDB = require("./config/database");
require("dotenv").config();
const usersRouter = require("./routes/usersRoute");
const examsRouter = require("./routes/examsRoute");
const reportsRouter = require("./routes/reportsRoute");
const PORT = process.env.PORT || 3000;

app.use(express.json());

const allowedOrigins = [
  "http://localhost:5173",
  "https://quizappjoseph.netlify.app/",
];

app.use(
  cors({
    // origin: "http://localhost:5173",
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use("/api/users", usersRouter);
app.use("/api/exams", examsRouter);
app.use("/api/reports", reportsRouter);
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}).catch((err) => {
  console.log(err);
});

