"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Play,
  Code,
  Users,
  Brain,
  Database,
  Cloud,
  Briefcase,
  FileText,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import ProtectedRoute from "@/components/ProtectedRoute";
import BottomNav from "@/components/BottomNav";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import {
  CreateInterviewPayload,
  InterviewLevel,
  InterviewCategory,
} from "@/types/interview-schema";
import { startInterview } from "@/utils/interview-api";
import { buildInterviewConfig } from "@/utils/api-helpers";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function InterviewSetupPage() {
  const router = useRouter();
  const { user, token } = useSelector((state: RootState) => state.auth);
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedPrimaryCategory, setSelectedPrimaryCategory] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [selectedDuration, setSelectedDuration] = useState("45");
  const [freeInterviewsUsed, setFreeInterviewsUsed] = useState(0);
  const [freeInterviewsLimit, setFreeInterviewsLimit] = useState(2);
  const [hasPaidPlan, setHasPaidPlan] = useState(false);
  const [interviewCredits, setInterviewCredits] = useState(0);
  const [loading, setLoading] = useState(false);

  // Check free trial usage on component mount
  useEffect(() => {
    const checkFreeTrialUsage = async () => {
      try {
        const response = await fetch(
          `${API_URL}/users/${user?._id}/interview-usage`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          console.warn("Failed to fetch trial usage, using default values");
          setFreeInterviewsUsed(0);
          setHasPaidPlan(false);
          return;
        }

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          console.warn("API returned non-JSON response, using default values");
          setFreeInterviewsUsed(0);
          setHasPaidPlan(false);
          return;
        }

        const data = await response.json();
        setFreeInterviewsUsed(data.freeInterviewsUsed || 0);
        setHasPaidPlan(data.hasPaidPlan || false);
        setFreeInterviewsLimit(data.freeInterviewsLimit ?? 2);
      } catch (error) {
        console.warn(
          "Error checking trial usage, using default values:",
          error instanceof Error ? error.message : String(error)
        );
        setFreeInterviewsUsed(0);
        setHasPaidPlan(false);
      }
    };

    const fetchPlan = async () => {
      try {
        const res = await fetch(`${API_URL}/payments/plan`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const plan = await res.json();
          setInterviewCredits(plan.interviewCredits || 0);
        }
      } catch {}
    };

    if (user?._id && token) {
      checkFreeTrialUsage();
      fetchPlan();
    }
  }, [user?._id, token]);

  const interviewLevels = [
    {
      id: InterviewLevel.BEGINNER,
      name: "Beginner Level",
      description: "For beginners and fresh graduates",
      icon: "🌱",
      difficulty: "Easy",
    },
    {
      id: InterviewLevel.INTERMEDIATE,
      name: "Intermediate Level",
      description: "2-5 years of experience",
      icon: "🚀",
      difficulty: "Medium",
    },
    {
      id: InterviewLevel.ADVANCED,
      name: "Advanced Level",
      description: "5+ years of experience",
      icon: "⭐",
      difficulty: "Hard",
    },
  ];

  const primaryCategories = [
    {
      id: "development",
      name: "Development",
      description: "Software development and programming roles",
      icon: Code,
      color: "text-blue-400",
    },
    {
      id: "marketing",
      name: "Marketing",
      description: "Digital marketing and growth roles",
      icon: Users,
      color: "text-green-400",
    },
    {
      id: "analyst",
      name: "Analyst",
      description: "Data analysis and business intelligence",
      icon: Brain,
      color: "text-purple-400",
    },
    {
      id: "hr",
      name: "HR",
      description: "Human resources and talent management",
      icon: Users,
      color: "text-orange-400",
    },
    {
      id: "content",
      name: "Content",
      description: "Content creation and management",
      icon: Briefcase,
      color: "text-pink-400",
    },
    {
      id: "design-cloud",
      name: "Design & Cloud",
      description: "UI/UX design and cloud infrastructure",
      icon: Cloud,
      color: "text-cyan-400",
    },
  ];

  const categoryMapping = {
    development: [
      {
        id: InterviewCategory.FRONTEND,
        name: "Frontend Developer",
        description: "React, JavaScript, CSS, UI/UX",
        icon: Code,
        color: "text-yellow-400",
        hasCodeEditor: true,
        languages: [
          {
            id: "javascript",
            name: "JavaScript",
            description: "Vanilla JavaScript fundamentals",
          },
          {
            id: "react",
            name: "React",
            description: "React framework and ecosystem",
          },
          { id: "vue", name: "Vue.js", description: "Vue.js framework" },
          { id: "angular", name: "Angular", description: "Angular framework" },
          {
            id: "typescript",
            name: "TypeScript",
            description: "TypeScript language",
          },
          { id: "html", name: "HTML", description: "HTML markup language" },
          { id: "css", name: "CSS", description: "CSS styling and layout" },
          { id: "sass", name: "Sass/SCSS", description: "CSS preprocessor" },
          {
            id: "nextjs",
            name: "Next.js",
            description: "React framework for production",
          },
        ],
      },
      {
        id: InterviewCategory.BACKEND,
        name: "Backend Developer",
        description: "Node.js, Python, APIs, Databases",
        icon: Database,
        color: "text-green-400",
        hasCodeEditor: true,
        languages: [
          {
            id: "javascript",
            name: "Node.js",
            description: "Server-side JavaScript",
          },
          { id: "python", name: "Python", description: "Python programming" },
          { id: "java", name: "Java", description: "Java programming" },
          { id: "csharp", name: "C#", description: "C# and .NET" },
          { id: "go", name: "Go", description: "Go programming language" },
          { id: "php", name: "PHP", description: "PHP server-side scripting" },
          {
            id: "ruby",
            name: "Ruby",
            description: "Ruby programming language",
          },
          {
            id: "rust",
            name: "Rust",
            description: "Systems programming language",
          },
          { id: "cpp", name: "C++", description: "C++ programming language" },
          { id: "c", name: "C", description: "C programming language" },
          {
            id: "scala",
            name: "Scala",
            description: "Scala programming language",
          },
          { id: "kotlin", name: "Kotlin", description: "Kotlin for backend" },
        ],
      },
      {
        id: InterviewCategory.FULLSTACK,
        name: "Full-Stack Developer",
        description: "Frontend + Backend development",
        icon: Code,
        color: "text-purple-400",
        hasCodeEditor: true,
        languages: [
          {
            id: "javascript",
            name: "JavaScript/Node.js",
            description: "Full-stack JavaScript",
          },
          {
            id: "python",
            name: "Python/Django",
            description: "Python full-stack",
          },
          { id: "java", name: "Java/Spring", description: "Java full-stack" },
          { id: "csharp", name: "C#/.NET", description: "Microsoft stack" },
          { id: "php", name: "PHP/Laravel", description: "PHP full-stack" },
          {
            id: "ruby",
            name: "Ruby/Rails",
            description: "Ruby on Rails stack",
          },
          {
            id: "go",
            name: "Go/Gin",
            description: "Go full-stack development",
          },
          {
            id: "typescript",
            name: "TypeScript/Node.js",
            description: "TypeScript full-stack",
          },
          {
            id: "rust",
            name: "Rust/Actix",
            description: "Rust full-stack development",
          },
        ],
      },
      {
        id: InterviewCategory.MOBILE,
        name: "Mobile Developer",
        description: "iOS, Android, React Native",
        icon: Code,
        color: "text-blue-400",
        hasCodeEditor: true,
        languages: [
          {
            id: "react-native",
            name: "React Native",
            description: "Cross-platform mobile development",
          },
          {
            id: "flutter",
            name: "Flutter",
            description: "Google's UI toolkit",
          },
          { id: "swift", name: "Swift", description: "iOS development" },
          { id: "kotlin", name: "Kotlin", description: "Android development" },
          { id: "java", name: "Java", description: "Android development" },
          {
            id: "dart",
            name: "Dart",
            description: "Dart language for Flutter",
          },
          {
            id: "objective-c",
            name: "Objective-C",
            description: "iOS development (legacy)",
          },
          {
            id: "xamarin",
            name: "Xamarin",
            description: "Microsoft mobile development",
          },
          {
            id: "ionic",
            name: "Ionic",
            description: "Hybrid mobile development",
          },
          {
            id: "cordova",
            name: "Apache Cordova",
            description: "PhoneGap mobile development",
          },
        ],
      },
      {
        id: InterviewCategory.SOCIAL_MEDIA_MARKETING,
        name: "Social Media Marketing",
        description:
          "Social media strategy, community management, influencer marketing",
        icon: Users,
        color: "text-blue-400",
        hasCodeEditor: false,
        languages: [
          {
            id: "facebook-marketing",
            name: "Facebook Marketing",
            description: "Facebook advertising and marketing",
          },
          {
            id: "instagram-marketing",
            name: "Instagram Marketing",
            description: "Instagram content and advertising",
          },
          {
            id: "linkedin-marketing",
            name: "LinkedIn Marketing",
            description: "LinkedIn B2B marketing",
          },
          {
            id: "twitter-marketing",
            name: "Twitter Marketing",
            description: "Twitter engagement and advertising",
          },
          {
            id: "tiktok-marketing",
            name: "TikTok Marketing",
            description: "TikTok content and advertising",
          },
        ],
      },
    ],
    marketing: [
      {
        id: InterviewCategory.DIGITAL_MARKETING,
        name: "Digital Marketing",
        description: "SEO, SEM, Social Media, Analytics",
        icon: Users,
        color: "text-green-400",
        hasCodeEditor: false,
        languages: [
          {
            id: "google-ads",
            name: "Google Ads",
            description: "Pay-per-click advertising",
          },
          {
            id: "facebook-ads",
            name: "Facebook Ads",
            description: "Social media advertising",
          },
          { id: "seo", name: "SEO", description: "Search engine optimization" },
          {
            id: "analytics",
            name: "Google Analytics",
            description: "Web analytics",
          },
          {
            id: "email-marketing",
            name: "Email Marketing",
            description: "Email campaign management",
          },
        ],
      },
      {
        id: InterviewCategory.CONTENT_MARKETING,
        name: "Content Marketing",
        description: "Content strategy, copywriting, blogging",
        icon: Briefcase,
        color: "text-pink-400",
        hasCodeEditor: false,
        languages: [
          {
            id: "copywriting",
            name: "Copywriting",
            description: "Persuasive writing techniques",
          },
          {
            id: "content-strategy",
            name: "Content Strategy",
            description: "Strategic content planning",
          },
          {
            id: "blogging",
            name: "Blogging",
            description: "Blog content creation",
          },
          {
            id: "social-media",
            name: "Social Media",
            description: "Social media content",
          },
          {
            id: "video-marketing",
            name: "Video Marketing",
            description: "Video content creation",
          },
        ],
      },
    ],
    analyst: [
      {
        id: InterviewCategory.DATA_ANALYST,
        name: "Data Analyst",
        description: "SQL, Python, Excel, Visualization",
        icon: Brain,
        color: "text-purple-400",
        hasCodeEditor: true,
        languages: [
          {
            id: "sql",
            name: "SQL",
            description: "Database querying and analysis",
          },
          {
            id: "python",
            name: "Python",
            description: "Data analysis with Python",
          },
          { id: "r", name: "R", description: "Statistical analysis with R" },
          {
            id: "excel",
            name: "Excel",
            description: "Advanced Excel techniques",
          },
          { id: "tableau", name: "Tableau", description: "Data visualization" },
        ],
      },
      {
        id: InterviewCategory.BUSINESS_ANALYST,
        name: "Business Analyst",
        description: "Requirements analysis, process improvement",
        icon: Briefcase,
        color: "text-blue-400",
        hasCodeEditor: false,
        languages: [
          {
            id: "requirements-analysis",
            name: "Requirements Analysis",
            description: "Gathering and documenting requirements",
          },
          {
            id: "process-mapping",
            name: "Process Mapping",
            description: "Business process analysis",
          },
          {
            id: "stakeholder-management",
            name: "Stakeholder Management",
            description: "Managing stakeholder relationships",
          },
          {
            id: "agile-methodologies",
            name: "Agile Methodologies",
            description: "Agile and Scrum practices",
          },
          {
            id: "data-analysis",
            name: "Data Analysis",
            description: "Business data interpretation",
          },
        ],
      },
      {
        id: InterviewCategory.FINANCIAL_ANALYST,
        name: "Financial Analyst",
        description: "Financial modeling, investment analysis, risk assessment",
        icon: Brain,
        color: "text-green-400",
        hasCodeEditor: false,
        languages: [
          {
            id: "financial-modeling",
            name: "Financial Modeling",
            description: "Building financial models and forecasts",
          },
          {
            id: "valuation",
            name: "Valuation",
            description: "Company and asset valuation techniques",
          },
          {
            id: "risk-analysis",
            name: "Risk Analysis",
            description: "Financial risk assessment and management",
          },
          {
            id: "investment-analysis",
            name: "Investment Analysis",
            description: "Investment research and analysis",
          },
          {
            id: "financial-reporting",
            name: "Financial Reporting",
            description: "Financial statements and reporting",
          },
        ],
      },
    ],
    hr: [
      {
        id: InterviewCategory.HR_GENERALIST,
        name: "HR Generalist",
        description: "Recruitment, employee relations, policies",
        icon: Users,
        color: "text-orange-400",
        hasCodeEditor: false,
        languages: [
          {
            id: "recruitment",
            name: "Recruitment",
            description: "Talent acquisition strategies",
          },
          {
            id: "employee-relations",
            name: "Employee Relations",
            description: "Managing workplace relationships",
          },
          {
            id: "performance-management",
            name: "Performance Management",
            description: "Employee performance systems",
          },
          {
            id: "hr-policies",
            name: "HR Policies",
            description: "Policy development and implementation",
          },
          {
            id: "compensation",
            name: "Compensation & Benefits",
            description: "Salary and benefits management",
          },
        ],
      },
      {
        id: InterviewCategory.HR_RECRUITER,
        name: "HR Recruiter",
        description: "Talent acquisition, sourcing, candidate screening",
        icon: Users,
        color: "text-purple-400",
        hasCodeEditor: false,
        languages: [
          {
            id: "talent-sourcing",
            name: "Talent Sourcing",
            description: "Finding and attracting candidates",
          },
          {
            id: "interviewing",
            name: "Interviewing",
            description: "Conducting effective interviews",
          },
          {
            id: "candidate-assessment",
            name: "Candidate Assessment",
            description: "Evaluating candidate fit and skills",
          },
          {
            id: "recruitment-strategy",
            name: "Recruitment Strategy",
            description: "Developing recruitment plans",
          },
        ],
      },
      {
        id: InterviewCategory.HR_BUSINESS_PARTNER,
        name: "HR Business Partner",
        description: "Strategic HR support, organizational development",
        icon: Users,
        color: "text-indigo-400",
        hasCodeEditor: false,
        languages: [
          {
            id: "strategic-hr",
            name: "Strategic HR",
            description: "Aligning HR with business strategy",
          },
          {
            id: "organizational-development",
            name: "Organizational Development",
            description: "Improving organizational effectiveness",
          },
          {
            id: "change-management",
            name: "Change Management",
            description: "Managing organizational change",
          },
          {
            id: "performance-management",
            name: "Performance Management",
            description: "Managing employee performance",
          },
        ],
      },
    ],
    content: [
      {
        id: InterviewCategory.CONTENT_WRITER,
        name: "Content Writer",
        description: "Writing, editing, content strategy",
        icon: Briefcase,
        color: "text-pink-400",
        hasCodeEditor: false,
        languages: [
          {
            id: "creative-writing",
            name: "Creative Writing",
            description: "Creative content creation",
          },
          {
            id: "technical-writing",
            name: "Technical Writing",
            description: "Technical documentation",
          },
          {
            id: "copywriting",
            name: "Copywriting",
            description: "Marketing copy creation",
          },
          {
            id: "editing",
            name: "Editing & Proofreading",
            description: "Content editing skills",
          },
          {
            id: "seo-writing",
            name: "SEO Writing",
            description: "Search-optimized content",
          },
        ],
      },
      {
        id: InterviewCategory.COPYWRITER,
        name: "Copywriter",
        description: "Marketing copy, advertising, persuasive writing",
        icon: FileText,
        color: "text-orange-400",
        hasCodeEditor: false,
        languages: [
          {
            id: "advertising-copy",
            name: "Advertising Copy",
            description: "Creating compelling ad copy",
          },
          {
            id: "email-marketing",
            name: "Email Marketing",
            description: "Email campaigns and newsletters",
          },
          {
            id: "web-copy",
            name: "Web Copy",
            description: "Website and landing page copy",
          },
          {
            id: "social-copy",
            name: "Social Media Copy",
            description: "Social media content and captions",
          },
        ],
      },
      {
        id: InterviewCategory.TECHNICAL_WRITER,
        name: "Technical Writer",
        description: "Documentation, API docs, user guides",
        icon: FileText,
        color: "text-gray-400",
        hasCodeEditor: false,
        languages: [
          {
            id: "api-documentation",
            name: "API Documentation",
            description: "Writing API documentation",
          },
          {
            id: "user-guides",
            name: "User Guides",
            description: "Creating user manuals and guides",
          },
          {
            id: "technical-specs",
            name: "Technical Specifications",
            description: "Writing technical specifications",
          },
          {
            id: "knowledge-base",
            name: "Knowledge Base",
            description: "Creating knowledge base articles",
          },
        ],
      },
    ],
    "design-cloud": [
      {
        id: InterviewCategory.UI_UX_DESIGNER,
        name: "UI/UX Designer",
        description: "User interface and experience design",
        icon: Briefcase,
        color: "text-cyan-400",
        hasCodeEditor: false,
        languages: [
          {
            id: "figma",
            name: "Figma",
            description: "Design and prototyping tool",
          },
          { id: "sketch", name: "Sketch", description: "UI design tool" },
          {
            id: "adobe-xd",
            name: "Adobe XD",
            description: "User experience design",
          },
          {
            id: "prototyping",
            name: "Prototyping",
            description: "Interactive prototypes",
          },
          {
            id: "user-research",
            name: "User Research",
            description: "User research and testing",
          },
        ],
      },
      {
        id: InterviewCategory.DEVOPS_ENGINEER,
        name: "Cloud Engineer",
        description: "Cloud infrastructure and DevOps",
        icon: Cloud,
        color: "text-blue-400",
        hasCodeEditor: true,
        languages: [
          { id: "aws", name: "AWS", description: "Amazon Web Services" },
          { id: "azure", name: "Azure", description: "Microsoft Azure" },
          {
            id: "gcp",
            name: "Google Cloud",
            description: "Google Cloud Platform",
          },
          {
            id: "docker",
            name: "Docker",
            description: "Containerization with Docker",
          },
          {
            id: "kubernetes",
            name: "Kubernetes",
            description: "Container orchestration",
          },
        ],
      },
      {
        id: InterviewCategory.CLOUD_ARCHITECT,
        name: "Cloud Architect",
        description: "Cloud architecture design, multi-cloud strategies",
        icon: Cloud,
        color: "text-sky-400",
        hasCodeEditor: true,
        languages: [
          {
            id: "aws-architecture",
            name: "AWS Architecture",
            description: "Amazon Web Services architecture",
          },
          {
            id: "azure-architecture",
            name: "Azure Architecture",
            description: "Microsoft Azure architecture",
          },
          {
            id: "gcp-architecture",
            name: "GCP Architecture",
            description: "Google Cloud Platform architecture",
          },
          {
            id: "multi-cloud",
            name: "Multi-Cloud",
            description: "Multi-cloud strategies and design",
          },
          {
            id: "serverless",
            name: "Serverless",
            description: "Serverless architecture patterns",
          },
        ],
      },
    ],
  };

  const handlePrimaryCategorySelect = (primaryCategoryId: string) => {
    setSelectedPrimaryCategory(primaryCategoryId);
    setSelectedCategory(""); // Reset category when primary category changes
    setSelectedLanguage(""); // Reset language when primary category changes
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSelectedLanguage(""); // Reset language when category changes

    // Auto-select the first available language for the category
    const availableCategories =
      categoryMapping[
        selectedPrimaryCategory as keyof typeof categoryMapping
      ] || [];
    const category = availableCategories.find((cat) => cat.id === categoryId);
    if (category && category.languages && category.languages.length > 0) {
      setSelectedLanguage(category.languages[0].id);
    }
  };

  const getAvailableCategories = () => {
    return (
      categoryMapping[
        selectedPrimaryCategory as keyof typeof categoryMapping
      ] || []
    );
  };

  const getAvailableLanguages = () => {
    const availableCategories = getAvailableCategories();
    const category = availableCategories.find(
      (cat) => cat.id === selectedCategory
    );
    return category?.languages || [];
  };

  const durations = [
    { value: "30", label: "30 minutes", description: "Quick assessment" },
    { value: "45", label: "45 minutes", description: "Standard interview" },
    {
      value: "60",
      label: "60 minutes",
      description: "Comprehensive interview",
    },
    {
      value: "90",
      label: "90 minutes",
      description: "In-depth technical interview",
    },
  ];

  const handleStartInterview = async () => {
    if (
      !selectedLevel ||
      !selectedPrimaryCategory ||
      !selectedCategory ||
      !selectedLanguage
    ) {
      alert(
        "Please select interview level, field, category, and language/tool"
      );
      return;
    }

    // Check if user has exceeded free interviews based on dynamic limit and credits
    if (!hasPaidPlan && interviewCredits <= 0 && freeInterviewsUsed >= freeInterviewsLimit) {
      router.push("/pricing");
      return;
    }

    if (!user?._id || !user?.name || !user?.email) {
      alert("User information is missing. Please log in again.");
      return;
    }

    setLoading(true);

    try {
      const availableCategories = getAvailableCategories();
      const selectedCategoryData = availableCategories.find(
        (cat) => cat.id === selectedCategory
      );

      // Get the proper language for the category
      const config = buildInterviewConfig(
        selectedLevel,
        selectedCategory,
        selectedDuration
      );

      // Map frontend field values to backend enum values
      const fieldMapping: { [key: string]: string } = {
        development: "DEVELOPMENT",
        marketing: "MARKETING",
        analyst: "ANALYST",
        hr: "HR",
        content: "CONTENT",
        "design-cloud": "DESIGN_CLOUD",
      };

      // Map frontend category values to backend enum values
      const categoryMapping: { [key: string]: string } = {
        frontend: "FRONTEND_DEVELOPER",
        backend: "BACKEND_DEVELOPER",
        fullstack: "FULL_STACK_DEVELOPER",
        mobile: "MOBILE_DEVELOPER",
        DIGITAL_MARKETING: "DIGITAL_MARKETING",
        CONTENT_MARKETING: "CONTENT_MARKETING",
        SOCIAL_MEDIA_MARKETING: "SOCIAL_MEDIA_MARKETING",
        DATA_ANALYST: "DATA_ANALYST",
        BUSINESS_ANALYST: "BUSINESS_ANALYST",
        FINANCIAL_ANALYST: "FINANCIAL_ANALYST",
        HR_GENERALIST: "HR_GENERALIST",
        HR_RECRUITER: "HR_RECRUITER",
        HR_BUSINESS_PARTNER: "HR_BUSINESS_PARTNER",
        CONTENT_WRITER: "CONTENT_WRITER",
        COPYWRITER: "COPYWRITER",
        TECHNICAL_WRITER: "TECHNICAL_WRITER",
        UI_UX_DESIGNER: "UI_UX_DESIGNER",
        CLOUD_ARCHITECT: "CLOUD_ARCHITECT",
        DEVOPS_ENGINEER: "DEVOPS_ENGINEER",
      };

      const backendField =
        fieldMapping[selectedPrimaryCategory] || "DEVELOPMENT";
      const backendCategory =
        categoryMapping[selectedCategory] || "FULL_STACK_DEVELOPER";

      // Navigate directly to the interview session page with all necessary parameters
      // The actual interview start will be triggered manually from the instructions popup
      const params = new URLSearchParams({
        level: selectedLevel,
        category: backendCategory,
        field: backendField,
        duration: selectedDuration,
        language: selectedLanguage, // Use the selected language instead of config.language
        hasCodeEditor: (
          selectedCategoryData?.hasCodeEditor || false
        ).toString(),
        userId: user._id,
        userName: user.name,
        userEmail: user.email,
        isFreeInterview: (
          !hasPaidPlan && interviewCredits <= 0 && freeInterviewsUsed < freeInterviewsLimit
        ).toString(),
      });

      router.push(`/learner/interview/voice-session?${params.toString()}`);
    } catch (error) {
      console.error("Error navigating to interview:", error);
      alert(
        `Failed to navigate to interview: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const canStartFreeInterview = hasPaidPlan || interviewCredits > 0 || freeInterviewsUsed < freeInterviewsLimit;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-black">
        <Navbar />
        <Sidebar userType="learner" />

      <div className="md:ml-64 ml-0 pt-16 md:pt-20 pb-24 md:pb-12">
        <div className="container-custom space-y-10">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Interview Setup Test </h1>
            <p className="text-gray-400 text-lg">
              Configure your AI-powered interview session
            </p>
          </div>

          {/* Free Trial Warning */}
              {!hasPaidPlan && (
                <div
                  className={`p-4 rounded-lg border ${
                    freeInterviewsUsed >= freeInterviewsLimit
                      ? "border-red-500 bg-red-500/10"
                      : "border-yellow-500 bg-yellow-500/10"
                  }`}
                >
                  <p className="text-sm">
                    {interviewCredits > 0
                      ? `✅ You have ${interviewCredits} interview credit(s).`
                      : freeInterviewsUsed >= freeInterviewsLimit
                        ? "🚫 You have used all your free interviews. Upgrade or ask admin for more."
                        : `⚡ Free Trial: ${freeInterviewsUsed}/${freeInterviewsLimit} interviews used.`}
                  </p>
                  {!hasPaidPlan && interviewCredits <= 0 && freeInterviewsUsed >= freeInterviewsLimit && (
                    <button
                      onClick={() => router.push("/pricing")}
                      className="mt-2 px-4 py-2 bg-[#00FFB2] text-black rounded-lg font-medium hover:bg-[#00FFB2]/80 transition-colors"
                    >
                      Upgrade Now
                    </button>
                  )}
                </div>
              )}

          {/* Interview Level Selection */}
          <div className="glass-card p-8">
            <h2 className="text-2xl font-semibold mb-6">
              Select Interview Level
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {interviewLevels.map((level) => (
                <button
                  key={level.id}
                  onClick={() => setSelectedLevel(level.id)}
                  disabled={!canStartFreeInterview}
                  className={`p-6 rounded-lg border-2 transition-all text-left ${
                    selectedLevel === level.id
                      ? "border-[#00FFB2] bg-[#00FFB2]/10"
                      : "border-[#333] hover:border-[#00FFB2]/50"
                  } ${
                    !canStartFreeInterview
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  <div className="text-3xl mb-3">{level.icon}</div>
                  <h3 className="font-semibold text-lg mb-2">{level.name}</h3>
                  <p className="text-sm text-gray-400 mb-3">
                    {level.description}
                  </p>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      level.difficulty === "Easy"
                        ? "bg-green-500/20 text-green-400"
                        : level.difficulty === "Medium"
                        ? "bg-yellow-500/20 text-yellow-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {level.difficulty}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Primary Category Selection */}
          <div className="glass-card p-8">
            <h2 className="text-2xl font-semibold mb-6">Select Field</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {primaryCategories.map((field) => {
                const IconComponent = field.icon;
                return (
                  <button
                    key={field.id}
                    onClick={() => handlePrimaryCategorySelect(field.id)}
                    disabled={!canStartFreeInterview}
                    className={`p-6 rounded-lg border-2 transition-all text-left ${
                      selectedPrimaryCategory === field.id
                        ? "border-[#00FFB2] bg-[#00FFB2]/10"
                        : "border-[#333] hover:border-[#00FFB2]/50"
                    } ${
                      !canStartFreeInterview
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    <div className="flex items-center mb-4">
                      <IconComponent className="h-8 w-8 text-[#00FFB2] mr-3" />
                      <h3 className="font-semibold text-lg">{field.name}</h3>
                    </div>
                    <p className="text-sm text-gray-400">{field.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interview Category Selection */}
          {selectedPrimaryCategory && (
            <div className="glass-card p-8">
              <h2 className="text-2xl font-semibold mb-6">Select Category</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {getAvailableCategories().map((category) => {
                  const IconComponent = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => handleCategorySelect(category.id)}
                      disabled={!canStartFreeInterview}
                      className={`p-6 rounded-lg border-2 transition-all text-left ${
                        selectedCategory === category.id
                          ? "border-[#00FFB2] bg-[#00FFB2]/10"
                          : "border-[#333] hover:border-[#00FFB2]/50"
                      } ${
                        !canStartFreeInterview
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <IconComponent className="h-6 w-6 text-[#00FFB2] mr-3" />
                          <h3 className="font-semibold">{category.name}</h3>
                        </div>
                        {category.hasCodeEditor && (
                          <span className="text-xs bg-[#00FFB2]/20 text-[#00FFB2] px-2 py-1 rounded-full">
                            Code Editor
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-400">
                        {category.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Language/Tool Selection */}
          {selectedCategory && (
            <div className="glass-card p-8">
              <h2 className="text-2xl font-semibold mb-6">
                Select{" "}
                {selectedPrimaryCategory === "development"
                  ? "Programming Language"
                  : "Tool/Technology"}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getAvailableLanguages().map((language) => (
                  <button
                    key={language.id}
                    onClick={() => setSelectedLanguage(language.id)}
                    disabled={!canStartFreeInterview}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      selectedLanguage === language.id
                        ? "border-[#00FFB2] bg-[#00FFB2]/10"
                        : "border-[#333] hover:border-[#00FFB2]/50"
                    } ${
                      !canStartFreeInterview
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    <h3 className="font-semibold mb-2">{language.name}</h3>
                    <p className="text-sm text-gray-400">
                      {language.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Duration Selection */}
          <div className="glass-card p-8">
            <h2 className="text-2xl font-semibold mb-6">Select Duration</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {durations.map((duration) => (
                <button
                  key={duration.value}
                  onClick={() => setSelectedDuration(duration.value)}
                  disabled={
                    !canStartFreeInterview ||
                    (!hasPaidPlan && duration.value !== "30")
                  }
                  className={`p-4 rounded-lg border-2 transition-all text-center ${
                    selectedDuration === duration.value
                      ? "border-[#00FFB2] bg-[#00FFB2]/10"
                      : "border-[#333] hover:border-[#00FFB2]/50"
                  } ${
                    !canStartFreeInterview ||
                    (!hasPaidPlan && duration.value !== "30")
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  <h3 className="font-semibold text-lg">{duration.label}</h3>
                  <p className="text-sm text-gray-400">
                    {duration.description}
                  </p>
                  {!hasPaidPlan && duration.value !== "30" && (
                    <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full mt-2 inline-block">
                      Pro Only
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Start Interview Button */}
          <div className="text-center">
            <button
              onClick={handleStartInterview}
              disabled={
                !selectedLevel ||
                !selectedPrimaryCategory ||
                !selectedCategory ||
                !selectedLanguage ||
                !canStartFreeInterview ||
                loading
              }
              className="btn-primary px-8 py-4 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mx-auto min-w-[200px]"
            >
              <Play className="mr-2 h-5 w-5" />
              {loading
                ? "Starting..."
                : !canStartFreeInterview
                ? "Upgrade Required"
                : "Start Interview"}
            </button>
            {(!selectedLevel ||
              !selectedPrimaryCategory ||
              !selectedCategory ||
              !selectedLanguage) &&
              canStartFreeInterview && (
                <p className="text-sm text-gray-400 mt-2">
                  Please select interview level, field, category, and{" "}
                  {selectedPrimaryCategory === "development"
                    ? "programming language"
                    : "tool/technology"}
                </p>
              )}
            {!canStartFreeInterview && (
              <p className="text-sm text-red-400 mt-2">
                You have reached the free interview limit. Please upgrade to
                continue.
              </p>
            )}
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
    </ProtectedRoute>
  );
}
