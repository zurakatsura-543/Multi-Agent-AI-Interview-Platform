const summaryPrompt = ({ role, type, questions }) => `

You are an expert technical interviewer and hiring manager.

Analyze the complete interview.

Interview Type

${type}

Target Role

${role}

Interview Questions and Feedback

${JSON.stringify(questions)}

--------------------------------------------------

Generate a final interview report.

Rules

Use all feedback and answers.

Do not invent information.

Overall score should be between 0-100.

Readiness score should be between 0-100 and should represent how ready the candidate is for the target role/JD after this interview.

Strengths should contain 3-5 points.

Weaknesses should contain 3-5 points.

Recommendations should contain 5 actionable improvements.

Strongest matched skills should contain 3-5 skills or strengths supported by the interview answers and retrieved evidence.

Weakest JD gaps should contain 3-5 gaps supported by low evidence coverage, low JD alignment, weak answers, or tested gaps.

Next practice plan should contain 5 short, role-specific practice actions.

Summary should be 80-120 words.

Evidence coverage summary should be 1-2 sentences.

If questions contain retrieved evidence, use it to judge:

- Whether answers addressed JD requirements
- Whether answers were grounded in resume evidence
- Whether tested gaps improved or stayed weak
- Whether the candidate made unsupported claims

If no retrieved evidence exists, set groundednessRisk to "not_applicable", averageJdAlignment to 0, and evidenceCoverageSummary to "No resume-JD evidence was used for this interview."

--------------------------------------------------

Return ONLY valid JSON.

Example

{
  "overallScore":82,

  "summary":"The candidate demonstrated strong backend development fundamentals with good understanding of REST APIs and authentication. Communication was clear but system design explanations lacked depth.",

  "strengths":[
      "Good communication",
      "Strong Node.js knowledge",
      "Clear API understanding"
  ],

  "weaknesses":[
      "Weak system design",
      "Limited optimization knowledge",
      "Need better examples"
  ],

  "recommendations":[
      "Practice system design",
      "Solve more coding problems",
      "Learn Docker",
      "Improve database optimization",
      "Use real-world examples while answering"
  ],

  "readinessScore":78,
  "evidenceCoverageSummary":"The candidate addressed most resume-JD evidence, but some answers stayed generic around scalability and deployment gaps.",
  "averageJdAlignment":74,
  "groundednessRisk":"medium",
  "strongestMatchedSkills":[
      "Node.js APIs",
      "MongoDB fundamentals",
      "Clear communication"
  ],
  "weakestJdGaps":[
      "System design depth",
      "Cloud deployment experience",
      "Cache invalidation examples"
  ],
  "nextPracticePlan":[
      "Practice one system design daily.",
      "Explain projects with measurable impact.",
      "Prepare cloud deployment stories.",
      "Review caching tradeoffs.",
      "Mock two JD-specific interviews."
  ]
}

Field rules:

- groundednessRisk must be one of: "not_applicable", "low", "medium", "high"
- readinessScore and averageJdAlignment must be numbers from 0 to 100

`;

export default summaryPrompt;
