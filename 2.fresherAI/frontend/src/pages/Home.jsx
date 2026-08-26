import React, { useState } from "react";
import { motion } from "motion/react";
import {
  FiArrowRight,
  FiBarChart2,
  FiBriefcase,
  FiCheck,
  FiClipboard,
  FiFileText,
  FiInstagram,
  FiLinkedin,
  FiMessageCircle,
  FiPlay,
  FiShield,
  FiTarget,
  FiZap,
} from "react-icons/fi";
import LoginModel from "../components/LoginModel";
import BrandMark from "../components/BrandMark";

const navItems = ["Features", "How It Works", "Use Cases", "Pricing", "About"];

const featureStrip = [
  ["AI-Powered Interviews", "Realistic, role-specific interviews powered by advanced AI.", FiZap],
  ["Smart Feedback", "Instant, actionable feedback to help you improve.", FiMessageCircle],
  ["Performance Insights", "Track your progress with detailed analytics and reports.", FiBarChart2],
  ["Get Hired Faster", "Build confidence, sharpen skills, and land your dream job.", FiBriefcase],
];

const featureCards = [
  ["Resume-Aware Questions", "Generate technical and HR questions from the candidate's real resume, projects, and skill gaps.", FiFileText],
  ["JD-Based Resume Scoring", "Compare resumes with job descriptions, required experience, keywords, and role expectations.", FiTarget],
  ["Live Interview Practice", "Practice with spoken questions, fast transcript capture, code editor support, and answer feedback.", FiMessageCircle],
  ["Learning Roadmaps", "Turn weak areas into weekly learning plans with curated resources and progress tracking.", FiClipboard],
  ["Performance Reports", "Review interview score, strengths, weaknesses, recommendations, and progress analytics.", FiBarChart2],
  ["Secure Coin Workflow", "Use coins for AI actions with payment verification and controlled feature usage.", FiShield],
];

const workflow = [
  ["Upload or build resume", "Start with an ATS-ready resume or analyze an existing PDF."],
  ["Pick role and context", "Choose target role, experience level, interview type, or paste a job description."],
  ["Practice with AI agents", "Resume, scorer, roadmap, and interview agents generate personalized outputs."],
  ["Improve with evidence", "Use feedback, reports, and gap-based roadmaps to prepare for real interviews."],
];

const useCases = [
  "Freshers preparing for first technical interviews",
  "Students targeting internships and campus placements",
  "Career switchers mapping resume gaps to learning plans",
  "Developers practicing role-specific technical and HR rounds",
];

const pricing = [
  {
    title: "Launch",
    badge: "Starter",
    price: "₹99",
    coins: "200 Interview Coins",
    desc: "A compact credit pack for one focused prep cycle.",
    features: ["4 AI interviews", "20 resume scans", "10 roadmap generations", "Instant coin credit"],
  },
  {
    title: "Growth",
    badge: "Popular",
    price: "₹199",
    coins: "500 Interview Coins",
    desc: "A higher-velocity pack for active role targeting.",
    features: ["10 AI interviews", "50 resume scans", "25 roadmap generations", "Best value for students"],
    highlight: true,
  },
  {
    title: "Pro",
    badge: "Serious Prep",
    price: "₹349",
    coins: "1000 Interview Coins",
    desc: "For multiple roles, resume iterations, and practice rounds.",
    features: ["20 AI interviews", "100 resume scans", "50 roadmap generations", "Role-specific preparation"],
  },
  {
    title: "Scale",
    badge: "Max Value",
    price: "₹599",
    coins: "2000 Interview Coins",
    desc: "Large credit reserve for heavy testing, demos, and portfolio usage.",
    features: ["40 AI interviews", "200 resume scans", "100 roadmap generations", "Great for product demos"],
  },
];

function HeroPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.65, delay: 0.18 }}
      className="hg-preview-shell"
    >
      <div className="hg-dot-grid" />
      <div className="hg-hero-image-card">
        <img src="/hero.png" alt="HireGen-AI dashboard preview" />
      </div>
    </motion.div>
  );
}

function Home({ setUser }) {
  const [showLogin, setShowLogin] = useState(false);

  return (
    <div className="hg-landing">
      <motion.header
        initial={{ opacity: 0, y: -18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="hg-nav"
      >
        <BrandMark />
        <nav>
          {navItems.map((item) => (
            <a key={item} href={`#${item.toLowerCase().replaceAll(" ", "-")}`}>
              {item}
            </a>
          ))}
        </nav>
        <div className="hg-nav-actions">
          <button className="hg-login-btn" onClick={() => setShowLogin(true)}>Log in</button>
          <button className="hg-primary-btn small" onClick={() => setShowLogin(true)}>
            Get Started Free <FiArrowRight />
          </button>
        </div>
      </motion.header>

      <main>
        <section className="hg-hero">
          <div className="hg-hero-copy">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="hg-pill"
            >
              <FiZap /> AI-Powered Interview Platform
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.06 }}
            >
              Ace all of your Interviews.
              <br />
              Land Your
              <br />
              <span>Dream Job.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.12 }}
            >
              HireGen-AI is your AI co-pilot for interview success. Practice, improve, and get hired faster with real-time feedback and smart insights.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.18 }}
              className="hg-hero-actions"
            >
              <button className="hg-primary-btn" onClick={() => setShowLogin(true)}>
                Start Practicing Free <FiArrowRight />
              </button>
              <a className="hg-secondary-btn" href="#features">
                Explore Features <FiPlay />
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.24 }}
              className="hg-trust-row"
            >
              <FiZap />
              <p>Built for resume-aware interview practice and role-specific preparation</p>
            </motion.div>
          </div>

          <HeroPreview />
        </section>

        <section className="hg-feature-strip" id="features">
          {featureStrip.map(([title, desc, Icon]) => (
            <article key={title}>
              <div>
                <Icon />
              </div>
              <h2>{title}</h2>
              <p>{desc}</p>
            </article>
          ))}
        </section>

        <section className="hg-section">
          <div className="hg-section-heading">
            <span>Features</span>
            <h2>Everything needed for focused interview preparation.</h2>
            <p>HireGen-AI combines resume intelligence, role targeting, interview simulation, scoring, and roadmaps in one workflow.</p>
          </div>
          <div className="hg-card-grid">
            {featureCards.map(([title, desc, Icon]) => (
              <article className="hg-info-card" key={title}>
                <div><Icon /></div>
                <h3>{title}</h3>
                <p>{desc}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="hg-section hg-muted-section" id="how-it-works">
          <div className="hg-section-heading">
            <span>How It Works</span>
            <h2>From resume to interview readiness in four steps.</h2>
          </div>
          <div className="hg-steps">
            {workflow.map(([title, desc], index) => (
              <article key={title}>
                <strong>{String(index + 1).padStart(2, "0")}</strong>
                <h3>{title}</h3>
                <p>{desc}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="hg-section" id="use-cases">
          <div className="hg-section-heading">
            <span>Use Cases</span>
            <h2>Built for realistic job-prep scenarios.</h2>
          </div>
          <div className="hg-usecase-grid">
            {useCases.map((item) => (
              <div key={item}>
                <FiCheck />
                <p>{item}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="hg-section hg-muted-section" id="pricing">
          <div className="hg-section-heading">
            <span>Pricing</span>
            <h2>Coin packs for AI workflows.</h2>
            <p>Resume builder and scorer use 10 coins, roadmap generation uses 20 coins, and AI interviews use 50 coins.</p>
          </div>
          <div className="hg-pricing-grid">
            {pricing.map((plan) => (
              <article className={plan.highlight ? "highlight" : ""} key={plan.title}>
                <div className="hg-plan-top">
                  <h3>{plan.title}</h3>
                  <span>{plan.badge}</span>
                </div>
                <p>{plan.desc}</p>
                <strong>{plan.price}<small> INR</small></strong>
                <div className="hg-coin-pill">🪙 {plan.coins}</div>
                <ul>
                  {plan.features.map((feature) => (
                    <li key={feature}><FiCheck /> {feature}</li>
                  ))}
                </ul>
                <button onClick={() => setShowLogin(true)}>Buy {plan.coins.split(" ")[0]} Coins</button>
              </article>
            ))}
          </div>
        </section>

        <footer className="hg-footer" id="about">
          <div className="hg-footer-brand">
            <BrandMark />
            <p>
              Multi-agent AI career preparation for resumes, job-specific scoring, roadmaps, and resume-aware mock interviews.
            </p>
            <div className="hg-social-links">
              <a href="https://www.linkedin.com/in/sahil-salve-225003230" target="_blank" rel="noopener noreferrer" aria-label="Sahil Salve on LinkedIn">
                <FiLinkedin />
              </a>
              <a href="https://www.instagram.com/sahil_s2415/" target="_blank" rel="noopener noreferrer" aria-label="Sahil Salve on Instagram">
                <FiInstagram />
              </a>
            </div>
          </div>

          <div className="hg-footer-col">
            <h3>Product</h3>
            <a href="#features">Features</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#pricing">Pricing</a>
          </div>

          <div className="hg-footer-col">
            <h3>Use Cases</h3>
            <a href="#use-cases">Freshers</a>
            <a href="#use-cases">Internships</a>
            <a href="#use-cases">Career Switchers</a>
          </div>

          <div className="hg-footer-bottom">
            <span>© {new Date().getFullYear()} HireGen-AI</span>
            <span>Built with React, Node.js, MongoDB, Redis, Firebase, and AI agents.</span>
          </div>
        </footer>
      </main>

      {showLogin && <LoginModel onClose={() => setShowLogin(false)} setUser={setUser} />}
    </div>
  );
}

export default Home;
