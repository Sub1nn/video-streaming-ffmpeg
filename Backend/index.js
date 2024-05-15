import express from "express";
import multer from "multer";
import fs from "fs";
import cors from "cors";
import { exec } from "child_process";
import { v4 as uuidv4 } from "uuid";
import { log } from "console";
import path from "path";
import { stderr } from "process";

const app = express();

app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:5173"],
    credentials: true,
  })
);

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));

//multer middleware

const storage = multer.diskStorage({
  destination: function (res, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "-" + uuidv4() + path.extname(file.originalname));
  },
});

//multer configuration
const upload = multer({ storage: storage });

app.get("/", (req, res) => {
  res.json({ meessage: "Hii i am from app" });
});

app.post("/upload", upload.single("file"), function (req, res) {
  // convert video in HLS format
  const lessonId = uuidv4();
  const videoPath = req.file.path;
  const outputPath = `./uploads/bihe/${lessonId}`;
  const hlsPath = `${outputPath}/index.m3u8`;
  console.log("hlsPath", hlsPath);

  // if output directory doesn't exist, create it

  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
  }

  // ffmpeg
  // command to convert video to HLS format using ffmpeg
  const ffmpegCommand = `ffmpeg -i ${videoPath} -codec:v libx264 -codec:a aac -hls_time 10 -hls_playlist_type vod -hls_segment_filename "${outputPath}/segment%03d.ts" -start_number 0 ${hlsPath}`;

  // run the ffmpeg command; usually done in a separate process (queued), here no queue just for POC

  exec(ffmpegCommand, (error, stdout, stderr) => {
    if (error) {
      console.log(`exec error. ${error}`);
    }
    console.log(`stdout: ${stdout}`);
    console.log(`stderr: ${stderr}`);
    const videoUrl = `http://localhost.8000/uploads/bihe/${lessonId}/index.m3u8`;

    res.json({
      message: "Video converted to HLS format",
      videoUrl: videoUrl,
      lessonId: lessonId,
    });
  });
});

app.listen(8000, () => {
  console.log("app is listening at port 8000...");
});
