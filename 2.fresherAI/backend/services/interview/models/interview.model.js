import mongoose from "mongoose";


const feedbackSchema = new mongoose.Schema(
    {
        score: {
            type: Number,
            default: 0,
        },

        correctness: {
            type: Number,
            default: 0,
        },

        clarity: {
            type: Number,
            default: 0,
        },

        relevance: {
            type: Number,
            default: 0,
        },

        detail: {
            type: Number,
            default: 0,
        },

        efficiency: {
            type: Number,
            default: 0,
        },

        communication: {
            type: Number,
            default: 0,
        },

        problemSolving: {
            type: Number,
            default: 0,
        },

        creativity: {
            type: Number,
            default: 0,
        },

        feedback: {
            type: String,
            default: "",
        },

        improvements: {
            type: [String],
            default: [],
        },

        evidenceCoverage: {
            type: String,
            enum: ["not_applicable", "weak", "partial", "strong"],
            default: "not_applicable",
        },

        jdAlignment: {
            type: Number,
            default: 0,
        },

        groundednessRisk: {
            type: String,
            enum: ["not_applicable", "low", "medium", "high"],
            default: "not_applicable",
        },
    },
    { _id: false }
);

const questionEvidenceSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            default: "",
        },
        title: {
            type: String,
            default: "",
        },
        jdRequirement: {
            type: String,
            default: "",
        },
        resumeEvidence: {
            type: String,
            default: "",
        },
        testedGap: {
            type: String,
            default: "",
        },
        retrievalMethod: {
            type: String,
            default: "",
        },
        signals: {
            type: [String],
            default: [],
        },
    },
    { _id: false }
);

const questionSchema = new mongoose.Schema(
    {
        question: {
            type: String,
            required: true,
        },
        userAnswer: {
            type: String,
            default: "",
        },

        difficulty: {
            type: String,
            enum: ["easy", "medium", "hard"],
            default: "easy",
        },

        timer: {
            type: Number,
            default: 60,
        },

        source: {
            type: String,
            enum: ["resume", "general", "coding", "scenario", "behavioral"],
            default: "general",
        },

        focus: {
            type: String,
            default: "",
        },

        evidence: {
            type: questionEvidenceSchema,
            default: () => ({}),
        },

        feedback: {
            type: feedbackSchema,
            default: () => ({}),
        },
    },
    { _id: false }
);

const interviewSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            index: true,
        },

        type: {
            type: String,
            enum: ["hr", "technical"],
            required: true,
        },

        role: {
            type: String,
            required: true,
        },
        useResume: {
            type: Boolean,
            default: false,
        },

        currentQuestion: {
            type: Number,
            default: 0,
        },

        questions: {
            type: [questionSchema],
            default: [],
        },

        overallScore: {
            type: Number,
            default: 0,
        },

        strengths: {
            type: [String],
            default: [],
        },

        weaknesses: {
            type: [String],
            default: [],
        },

        recommendations: {
            type: [String],
            default: [],
        },

        summary: {
            type: String,
            default: "",
        },

        readinessScore: {
            type: Number,
            default: 0,
        },

        evidenceCoverageSummary: {
            type: String,
            default: "",
        },

        averageJdAlignment: {
            type: Number,
            default: 0,
        },

        groundednessRisk: {
            type: String,
            enum: ["not_applicable", "low", "medium", "high"],
            default: "not_applicable",
        },

        strongestMatchedSkills: {
            type: [String],
            default: [],
        },

        weakestJdGaps: {
            type: [String],
            default: [],
        },

        nextPracticePlan: {
            type: [String],
            default: [],
        },

        status: {
            type: String,
            enum: ["in-progress", "completed"],
            default: "in-progress",
        },
    },
    {
        timestamps: true,
    }
);

const Interview = mongoose.model("Interview" , interviewSchema)

export default Interview
