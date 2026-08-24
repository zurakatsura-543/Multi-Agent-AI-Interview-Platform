import mongoose from "mongoose";


const resumeSchema = new mongoose.Schema({
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      unique: true,
      index: true,
    },

    extractedText: {
      type: String,
      required: true,
    },

    score: {
      type: Number,
      default: 0,
    },

    matchScore: {
      type: Number,
      default: 0,
    },

    jobTitle: {
      type: String,
      default: "",
    },

    jobDescription: {
      type: String,
      default: "",
    },

    requiredExperience: {
      type: String,
      default: "",
    },

    summary: {
      type: String,
      default: "",
    },

    name: {
      type: String,
      default: "",
    },

    email: {
      type: String,
      default: "",
    },

    phone: {
      type: String,
      default: "",
    },

    education: {
      type: [String],
      default: [],
    },

    skills: {
      type: [String],
      default: [],
    },

    projects: {
      type: [String],
      default: [],
    },

    experience: {
      type: [String],
      default: [],
    },

    strengths: {
      type: [String],
      default: [],
    },

    weaknesses: {
      type: [String],
      default: [],
    },

    missingSkills: {
      type: [String],
      default: [],
    },

    suggestedRole: {
      type: String,
      default: "",
    },

    targetRole: {
      type: String,
      default: "",
    },

    roleFitSummary: {
      type: String,
      default: "",
    },

    candidateExperience: {
      type: String,
      default: "",
    },

    experienceFitSummary: {
      type: String,
      default: "",
    },

    keywordMatches: {
      type: [String],
      default: [],
    },

    keywordGaps: {
      type: [String],
      default: [],
    },

    recommendations: {
      type: [String],
      default: [],
    },
},{timestamps:true})


const Resume = mongoose.model("Resume" , resumeSchema)

export default Resume
