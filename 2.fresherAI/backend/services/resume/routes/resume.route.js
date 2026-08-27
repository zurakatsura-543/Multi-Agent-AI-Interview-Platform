import express from "express"

import { getAllResumeEvaluations, getResume, uploadResume } from "../controllers/resume.controller.js"
import { upload } from "../middleware/multer.js"

const resumeRouter = express.Router()


resumeRouter.post("/upload",upload.single("resume"),uploadResume)

resumeRouter.get("/get-resume",getResume)

resumeRouter.get("/all",getAllResumeEvaluations)

export default resumeRouter;
