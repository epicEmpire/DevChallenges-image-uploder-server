import { config } from "dotenv";
import express, { Application, NextFunction, Request, Response } from "express";
import fileUpload from "express-fileupload";
import path from "path";
import morgan from "morgan";
import fs from "fs";

import rimraf from "rimraf";

config();


const app: Application = express();

app.get("/", (req: Request, res: Response, next: NextFunction) => {
  res.send("Dev Challenges Image Uploader");
});

app.use(morgan("dev"));
app.use(fileUpload());

// app.use("/tmp", express.static(path.join(__dirname, "../tmp")));

// check if the file exists in the uploads directory
app.get("/tmp/:filename", (req: Request, res: Response, next: NextFunction) => {
  const filename = req.params.filename;
  const filepath = path.join(__dirname, "../tmp", filename);

  console.log(filename);
  console.log(filepath);

  // check if file exists
  if (!fs.existsSync(filepath)) {
    return res.status(404).json({ msg: "File not found" });
  }

  // return express.static(path.join(__dirname, "../tmp"));

  // display file

  res.sendFile(filepath);
});

// delete files after 1 hour
const uploadsDir = path.join(__dirname, "../tmp");

setInterval(() => {
  fs.readdir(uploadsDir, function (err, files) {
    console.log(files);
    if (files !== undefined) {
      files.forEach(function (file, index) {
        fs.stat(path.join(uploadsDir, file), function (err, stat) {
          let endTime, now;
          if (err) {
            return console.error(err);
          }
          now = new Date().getTime();
          // 15 minutes
          endTime = new Date(stat.ctime).getTime() + 15 * 60 * 1000;
          if (now > endTime) {
            return rimraf(path.join(uploadsDir, file)).then(() => {
              console.log("Successfully deleted");
            });
          }
        });
      });
    }
  });
}, 60000);

app.post("/api/upload", (req: Request, res: Response, next: NextFunction) => {
  if (!req.files) {
    return res.status(400).json({ msg: "No file uploaded" });
  }

  // check wether the directory exists or not
  if (!fs.existsSync(path.join(__dirname, "../tmp"))) {
    fs.mkdirSync(path.join(__dirname, "../tmp"));
  }

  try {
    const file: any = req.files.file;

    console.log(file);

    // random file name
    const fileName = Math.random().toString(36).substring(7);

    // file extension
    const fileExtension = file.name.split(".").pop();

    // file first name
    const fileFirstName = file.name.split(".").shift();

    // file final name
    const fileFinalName = `${fileFirstName}-${fileName}.${fileExtension}`;

    const filepath = path.join(__dirname, "../tmp", fileFinalName);

    file.mv(filepath, (err: any) => {
      if (err) {
        console.error(err);
        return res.status(500).send(err);
      }

      // current domain name
      const domainName = req.protocol + "://" + req.get("host");
      console.log(domainName);

      res.json({
        url: `${domainName}/tmp/${fileFinalName}`,
      });
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ msg: "Server Error" });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
