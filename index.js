const Queue = require("bull");
const express = require("express");

const app = express();

app.use(express.json());

// 1. Initiating the Queue
const pointlessQueue = new Queue("pointless", {
  redis: {
    host: "127.0.0.1",
    port: 6379,
  },
});

// Data for job
const data = {
  string: "mandatory data to be passed in job",
};

// Options for jobs
const options = {
  delay: 5000,
  attempts: 2,
};

// 2. Adding jobs to queue
for (let i = 0; i < 150; i++) {
  const newData = {
    string: `job with ${i}`,
  };
  pointlessQueue.add(newData, options);
}

// 3. Consumer
pointlessQueue.process(async (job) => {
  console.log("starting...");
  // Async logic here, this example waits for 2 seconds
  const res = await new Promise((r) => setTimeout(r, 2000));
  console.log("ended");
  return res;
});

app.use("/add-to-queue", (req, res) => {
  const { jobs } = req.body;

  if (!jobs || !(jobs instanceof Array)) {
    res.status(400).json({ error: "ise malakas" });
  } else {
    jobs.forEach((job) => {
      pointlessQueue.add(job);
    });

    res.json({ success: `Added ${jobs.length} jobs to queue` });
  }
});

app.listen(3000, () => console.log(`Listening on 3000`));
