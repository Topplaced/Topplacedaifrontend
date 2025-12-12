"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import Sidebar from "@/components/Sidebar";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import Image from "next/image";
import {
  Pencil,
  Mail,
  Phone,
  Briefcase,
  Upload,
  FileText,
  ExternalLink,
  Linkedin,
  Target,
  GraduationCap,
  Settings,
  Download,
  Trash2,
  MapPin,
  Award,
  Plus,
  X,
  Loader2,
  Check,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { updateUserName } from "@/store/slices/authSlice";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface ExtractedData {
  name?: string;
  email?: string;
  phone?: string;
  skills?: string[];
  experience?: Array<{
    title: string;
    company: string;
    duration: string;
    description: string;
  }>;
  education?: Array<{
    degree: string;
    institution: string;
    year: string;
  }>;
}

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedinProfile: string;
  goals: string;
  skills: string[];
  experience: Array<{
    title: string;
    company: string;
    duration: string;
    description: string;
  }>;
  education: Array<{
    degree: string;
    institution: string;
    year: string;
  }>;
}

export default function LearnerProfilePage() {
  const [isVisible, setIsVisible] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [showExtractedData, setShowExtractedData] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  // per-section editing
  const [editHeader, setEditHeader] = useState(false);
  const [editSkills, setEditSkills] = useState(false);
  const [editingExperienceIndex, setEditingExperienceIndex] = useState<number | null>(null);
  const [editingEducationIndex, setEditingEducationIndex] = useState<number | null>(null);
  const [editGoals, setEditGoals] = useState(false);

  const { user, token } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  const [profileData, setProfileData] = useState<ProfileData>({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    location: "",
    linkedinProfile: user?.linkedin_profile || "",
    goals: user?.goals || "",
    skills: [],
    experience: [],
    education: [],
  });

  const [uploadedResume, setUploadedResume] = useState<{
    filename: string;
    url: string;
    uploadDate: string;
  } | null>(
    user?.resume_url
      ? {
          filename: "Resume.pdf",
          url: user.resume_url,
          uploadDate: new Date().toLocaleDateString(),
        }
      : null
  );

  // ---------- API & Data ----------

  const fetchProfileData = async () => {
    if (!user?._id || !token) return;

    setIsLoadingProfile(true);
    try {
      const response = await fetch(`${API_URL}/users/${user._id}/profile`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const backendData = await response.json();

        setProfileData({
          name: backendData.name || user.name || "",
          email: backendData.email || user.email || "",
          phone: backendData.phone || user.phone || "",
          location: backendData.location || "",
          linkedinProfile:
            backendData.linkedin_url || user.linkedin_profile || "",
          goals: backendData.career_goals || user.goals || "",
          skills:
            backendData.skills ||
            (user.tech_stack ? user.tech_stack.split(",") : []),
          experience:
            backendData.experience ||
            (user.experience
              ? typeof user.experience === "string"
                ? JSON.parse(user.experience)
                : user.experience
              : []),
          education:
            backendData.education ||
            (user.education
              ? typeof user.education === "string"
                ? JSON.parse(user.education)
                : user.education
            : []),
        });
      } else if (response.status === 404) {
        // No profile yet – hydrate from user
        setProfileData({
          name: user?.name || "",
          email: user?.email || "",
          phone: user?.phone || "",
          location: "",
          linkedinProfile: user?.linkedin_profile || "",
          goals: user?.goals || "",
          skills: user?.tech_stack ? user.tech_stack.split(",") : [],
          experience: user?.experience
            ? typeof user.experience === "string"
              ? JSON.parse(user.experience)
              : user.experience
            : [],
          education: user?.education
            ? typeof user.education === "string"
              ? JSON.parse(user.education)
              : user.education
            : [],
        });
      } else {
        throw new Error("Failed to fetch profile data");
      }
    } catch (error) {
      console.error("Error fetching profile data:", error);
      toast.error("Failed to load profile data");
      // Fallback
      setProfileData({
        name: user?.name || "",
        email: user?.email || "",
        phone: user?.phone || "",
        location: "",
        linkedinProfile: user?.linkedin_profile || "",
        goals: user?.goals || "",
        skills: user?.tech_stack ? user.tech_stack.split(",") : [],
        experience: user?.experience
          ? typeof user.experience === "string"
            ? JSON.parse(user.experience)
            : user.experience
          : [],
        education: user?.education
          ? typeof user.education === "string"
            ? JSON.parse(user.education)
            : user.education
          : [],
      });
    } finally {
      setIsLoadingProfile(false);
    }
  };

  useEffect(() => {
    setIsVisible(true);
    if (user && token) {
      fetchProfileData();
    }
  }, [user, token]);

  // ---------- Local handlers ----------

  const handleInputChange = (field: keyof ProfileData, value: any) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  const handleSkillAdd = (skill: string) => {
    if (skill.trim() && !profileData.skills.includes(skill.trim())) {
      setProfileData((prev) => ({
        ...prev,
        skills: [...prev.skills, skill.trim()],
      }));
      setHasUnsavedChanges(true);
    }
  };

  const handleSkillRemove = (skillToRemove: string) => {
    setProfileData((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }));
    setHasUnsavedChanges(true);
  };

  const handleExperienceAdd = () => {
    setProfileData((prev) => ({
      ...prev,
      experience: [
        ...prev.experience,
        { title: "", company: "", duration: "", description: "" },
      ],
    }));
    setEditingExperienceIndex(prev => prev ?? profileData.experience.length);
    setHasUnsavedChanges(true);
  };

  const handleExperienceUpdate = (
    index: number,
    field: string,
    value: string
  ) => {
    setProfileData((prev) => ({
      ...prev,
      experience: prev.experience.map((exp, i) =>
        i === index ? { ...exp, [field]: value } : exp
      ),
    }));
    setHasUnsavedChanges(true);
  };

  const handleExperienceRemove = (index: number) => {
    setProfileData((prev) => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index),
    }));
    setEditingExperienceIndex(null);
    setHasUnsavedChanges(true);
  };

  const handleEducationAdd = () => {
    setProfileData((prev) => ({
      ...prev,
      education: [
        ...prev.education,
        { degree: "", institution: "", year: "" },
      ],
    }));
    setEditingEducationIndex(prev => prev ?? profileData.education.length);
    setHasUnsavedChanges(true);
  };

  const handleEducationUpdate = (
    index: number,
    field: string,
    value: string
  ) => {
    setProfileData((prev) => ({
      ...prev,
      education: prev.education.map((edu, i) =>
        i === index ? { ...edu, [field]: value } : edu
      ),
    }));
    setHasUnsavedChanges(true);
  };

  const handleEducationRemove = (index: number) => {
    setProfileData((prev) => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }));
    setEditingEducationIndex(null);
    setHasUnsavedChanges(true);
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file only");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch(`${API_URL}/users/${user?._id}/resume`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setUploadedResume({
          filename: data.resume.filename,
          url: data.resume.url,
          uploadDate: new Date().toLocaleDateString(),
        });

        if (data.resume.extracted_data) {
          setExtractedData(data.resume.extracted_data);
          setShowExtractedData(true);
          toast.success("Resume uploaded and data extracted successfully!");
        } else {
          toast.success("Resume uploaded successfully!");
        }
      } else {
        toast.error(data.message || "Failed to upload resume");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload resume");
    } finally {
      setIsUploading(false);
    }
  };

  const handleApplyExtractedData = () => {
    if (!extractedData) return;
    setProfileData((prev) => ({
      ...prev,
      name: extractedData.name || prev.name,
      email: extractedData.email || prev.email,
      phone: extractedData.phone || prev.phone,
      skills: extractedData.skills || prev.skills,
      experience: extractedData.experience || prev.experience,
      education: extractedData.education || prev.education,
    }));
    setShowExtractedData(false);
    setEditHeader(true);
    setEditSkills(true);
    setEditGoals(true);
    setHasUnsavedChanges(true);
    toast.success("Extracted data applied to profile!");
  };

  const saveProfileData = async () => {
    if (!user?._id || !token) return;

    try {
      // Update base user
      const response = await fetch(`${API_URL}/users/${user._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: profileData.name,
          phone: profileData.phone
            ? profileData.phone.replace(/\s+/g, "")
            : "",
          goals: profileData.goals,
          tech_stack: profileData.skills.join(","),
          experience:
            profileData.experience.length > 0
              ? JSON.stringify(profileData.experience)
              : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update user data");
      }

      // Update / create profile
      let profileResponse = await fetch(
        `${API_URL}/users/${user._id}/profile`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: profileData.name,
            email: profileData.email,
            phone: profileData.phone
              ? profileData.phone.replace(/\s+/g, "")
              : "",
            location: profileData.location,
            linkedin_url: profileData.linkedinProfile,
            skills: profileData.skills,
            experience: profileData.experience,
            education: profileData.education,
            career_goals: profileData.goals,
          }),
        }
      );

      if (profileResponse.status === 404) {
        profileResponse = await fetch(
          `${API_URL}/users/${user._id}/profile`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              user_id: user._id,
              name: profileData.name,
              email: profileData.email,
              phone: profileData.phone
                ? profileData.phone.replace(/\s+/g, "")
                : "",
              location: profileData.location,
              linkedin_url: profileData.linkedinProfile,
              skills: profileData.skills,
              experience: profileData.experience,
              education: profileData.education,
              career_goals: profileData.goals,
            }),
          }
        );
      }

      if (!profileResponse.ok) {
        throw new Error("Failed to update profile");
      }

      toast.success("Profile updated successfully!");
      setHasUnsavedChanges(false);
      dispatch(updateUserName(profileData.name));
      await fetchProfileData();
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to update profile");
      throw error;
    }
  };

  const handleSave = async () => {
    try {
      await saveProfileData();
    } catch {
      // toast already handled in saveProfileData
    }
  };

  const handleResumeRemove = () => {
    setUploadedResume(null);
    toast.success("Resume removed");
  };

  // ---------- UI ----------

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-black">
        <Navbar />
        <div className="flex">
          <Sidebar userType="learner" />
          <main className="flex-1 md:ml-64 ml-0 p-6 md:p-8 pt-16 md:pt-20 pb-24 md:pb-12">
            {isLoadingProfile ? (
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex items-center space-x-2 text-gray-200">
                  <Loader2 className="h-6 w-6 animate-spin text-[#00FFB2]" />
                  <span>Loading profile data...</span>
                </div>
              </div>
            ) : (
              <div className="container-custom">
                {/* Page header */}
                <div
                  className={`mb-8 mt-6 md:mt-10 transition-all duration-700 flex justify-between items-center ${
                    isVisible
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-10"
                  }`}
                >
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-[#00FFB2]/60 mb-1">
                      Profile
                    </p>
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">
                      Your{" "}
                      <span className="gradient-text">
                        Professional Profile
                      </span>
                    </h1>
                    <p className="text-gray-400 text-sm md:text-base">
                      Build your professional presence and showcase your
                      expertise for interviews and career opportunities.
                    </p>
                  </div>

                  <div className="flex gap-2">
                    {!editHeader ? (
                      <button
                        onClick={() => setEditHeader(true)}
                        className="h-10 w-10 flex items-center justify-center rounded-full border border-[#00FFB2]/50 bg-[#00FFB2]/10 hover:bg-[#00FFB2]/20 transition-colors"
                        aria-label="Edit profile header"
                      >
                        <Pencil size={18} />
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={async () => {
                            await handleSave();
                            setEditHeader(false);
                          }}
                          className="h-10 w-10 flex items-center justify-center rounded-full bg-[#00FFB2] hover:bg-[#00CC8E] text-black transition-colors"
                          aria-label="Save profile header"
                        >
                          <Check size={18} />
                        </button>
                        <button
                          onClick={() => setEditHeader(false)}
                          className="h-10 w-10 flex items-center justify-center rounded-full border border-gray-600 bg-black/40 hover:bg-black/70 transition-colors"
                          aria-label="Cancel editing header"
                        >
                          <X size={18} />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Extracted Resume Modal */}
                {showExtractedData && extractedData && (
                  <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="glass-card p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-semibold">
                          Extracted Resume Data
                        </h3>
                        <button
                          onClick={() => setShowExtractedData(false)}
                          className="text-gray-400 hover:text-white"
                        >
                          <X size={24} />
                        </button>
                      </div>

                      <div className="space-y-4 mb-6 text-sm">
                        {extractedData.name && (
                          <div>
                            <label className="text-xs uppercase tracking-wide text-gray-400">
                              Name
                            </label>
                            <p className="text-white text-base">
                              {extractedData.name}
                            </p>
                          </div>
                        )}
                        {extractedData.email && (
                          <div>
                            <label className="text-xs uppercase tracking-wide text-gray-400">
                              Email
                            </label>
                            <p className="text-white text-base">
                              {extractedData.email}
                            </p>
                          </div>
                        )}
                        {extractedData.phone && (
                          <div>
                            <label className="text-xs uppercase tracking-wide text-gray-400">
                              Phone
                            </label>
                            <p className="text-white text-base">
                              {extractedData.phone}
                            </p>
                          </div>
                        )}

                        {extractedData.skills &&
                          extractedData.skills.length > 0 && (
                            <div>
                              <label className="text-xs uppercase tracking-wide text-gray-400">
                                Skills
                              </label>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {extractedData.skills.map((skill, index) => (
                                  <span
                                    key={index}
                                    className="px-3 py-1 bg-[#00FFB2]/20 text-[#00FFB2] rounded-full text-xs"
                                  >
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={handleApplyExtractedData}
                          className="btn-primary flex-1 flex items-center justify-center gap-2"
                        >
                          <Check size={16} />
                          Apply to Profile
                        </button>
                        <button
                          onClick={() => setShowExtractedData(false)}
                          className="btn-outline flex-1"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-8">
                  {/* Profile Header Card */}
                  <div className="glass-card p-8 neon-glow">
                    <div className="h-1 w-full bg-gradient-to-r from-[#00FFB2]/40 via-[#00FFB2] to-[#00FFB2]/40 rounded-full mb-6" />

                    <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
                      {/* Profile Image */}
                      <div className="relative">
                        <div className="rounded-full p-[3px] bg-gradient-to-tr from-[#00FFB2] via-[#00FFB2]/30 to-transparent">
                          <Image
                            src={
                              user?.profile_image ||
                              "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop"
                            }
                            alt="Profile"
                            width={120}
                            height={120}
                            className="rounded-full border-4 border-black object-cover"
                          />
                        </div>
                        {editHeader && (
                          <label className="absolute bottom-1 right-1 w-9 h-9 bg-[#00FFB2] rounded-full flex items-center justify-center cursor-pointer hover:bg-[#00CC8E] transition-colors shadow-lg shadow-[#00FFB2]/50">
                            <Upload size={16} className="text-black" />
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>

                      {/* Profile Info */}
                      <div className="flex-1 space-y-4">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                          <div>
                            <h2 className="text-2xl md:text-3xl font-semibold">
                              {(editHeader ? profileData.name : user?.name) || "Your Name"}
                            </h2>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center text-gray-300 gap-2">
                            <Mail size={18} className="text-[#00FFB2]" />
                            <span className="truncate">
                              {profileData.email || "email@example.com"}
                            </span>
                          </div>

                          <div className="flex items-center text-gray-300 gap-2">
                            <Phone size={18} className="text-[#00FFB2]" />
                            <span>
                              {profileData.phone || "Phone not set"}
                            </span>
                          </div>

                          <div className="flex items-center text-gray-300 gap-2">
                            <MapPin size={18} className="text-[#00FFB2]" />
                            <span>
                              {profileData.location || "Location not set"}
                            </span>
                          </div>
                        </div>

                        {profileData.linkedinProfile && (
                          <div className="flex items-center text-gray-300 gap-2 text-sm">
                            <Linkedin size={18} className="text-[#00FFB2]" />
                            <a
                              href={profileData.linkedinProfile}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#00FFB2] hover:underline flex items-center gap-1"
                            >
                              LinkedIn Profile <ExternalLink size={14} />
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Header edit form */}
                    {editHeader && (
                      <div className="mt-8 pt-6 border-t border-gray-700/70">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                              Full Name
                            </label>
                            <Input
                              value={profileData.name}
                              onChange={(e) =>
                                handleInputChange("name", e.target.value)
                              }
                              placeholder="full name..."
                              className="w-full bg-[#050505] border border-gray-700 rounded-lg py-3 px-4 text-white"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                              Phone Number
                            </label>
                            <Input
                              value={profileData.phone}
                              onChange={(e) =>
                                handleInputChange("phone", e.target.value)
                              }
                              placeholder="phone number..."
                              className="w-full bg-[#050505] border border-gray-700 rounded-lg py-3 px-4 text-white"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                              Location
                            </label>
                            <Input
                              value={profileData.location}
                              onChange={(e) =>
                                handleInputChange("location", e.target.value)
                              }
                              placeholder="location..."
                              className="w-full bg-[#050505] border border-gray-700 rounded-lg py-3 px-4 text-white"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                              LinkedIn Profile
                            </label>
                            <Input
                              value={profileData.linkedinProfile}
                              onChange={(e) =>
                                handleInputChange(
                                  "linkedinProfile",
                                  e.target.value
                                )
                              }
                              placeholder="url..."
                              className="w-full bg-[#050505] border border-gray-700 rounded-lg py-3 px-4 text-white"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Resume Upload Section */}
                  <div className="glass-card p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-[#00FFB2]/15 flex items-center justify-center">
                          <FileText size={22} className="text-[#00FFB2]" />
                        </div>
                        <div>
                          <h3 className="text-lg md:text-xl font-semibold">
                            Resume &amp; AI Extraction
                          </h3>
                          <p className="text-gray-400 text-xs md:text-sm">
                            Upload once. We’ll auto-extract your skills and
                            experience into your profile.
                          </p>
                        </div>
                      </div>
                    </div>

                    {uploadedResume && (
                      <div className="bg-[#050505] rounded-lg p-4 border border-gray-700 mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-red-500/15 rounded-lg flex items-center justify-center">
                            <FileText size={24} className="text-red-400" />
                          </div>
                          <div>
                            <div className="font-medium text-white text-sm md:text-base">
                              {uploadedResume.filename}
                            </div>
                            <div className="text-xs text-gray-400">
                              Uploaded on {uploadedResume.uploadDate}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <a
                            href={`${API_URL}${uploadedResume.url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-outline py-1 px-3 text-xs md:text-sm flex items-center gap-1"
                          >
                            <Download size={14} />
                            Download
                          </a>
                          <button
                            onClick={handleResumeRemove}
                            className="text-red-400 hover:text-red-300 p-1"
                            aria-label="Remove resume"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center bg-black/40">
                      <FileText
                        size={40}
                        className="text-gray-500 mx-auto mb-4"
                      />
                      <h4 className="text-lg font-semibold mb-1">
                        Upload Your Resume
                      </h4>
                      <p className="text-gray-400 text-sm mb-4 max-w-lg mx-auto">
                        Upload a PDF resume and let AI pre-fill your profile
                        with skills, experience, and education.
                      </p>
                      <label className="btn-primary cursor-pointer inline-flex items-center gap-2">
                        {isUploading ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Upload size={16} />
                            Upload Resume (PDF)
                          </>
                        )}
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={handleResumeUpload}
                          className="hidden"
                          disabled={isUploading}
                        />
                      </label>
                      <p className="text-xs text-gray-500 mt-2">
                        PDF format only, max size 5MB
                      </p>
                    </div>
                  </div>

                  {/* Skills Section */}
                  <div className="glass-card p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-[#00FFB2]/15 flex items-center justify-center">
                          <Settings size={20} className="text-[#00FFB2]" />
                        </div>
                        <div>
                          <h3 className="text-lg md:text-xl font-semibold">
                            Skills
                          </h3>
                          <p className="text-gray-400 text-xs md:text-sm">
                            Highlight tools, languages, and frameworks you’re
                            confident with.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {editSkills && (
                          <button
                            onClick={() => {
                              const skill = prompt("Enter a skill:");
                              if (skill) handleSkillAdd(skill);
                            }}
                            className="btn-outline py-1 px-3 text-xs md:text-sm flex items-center gap-1"
                          >
                            <Plus size={14} />
                            Add Skill
                          </button>
                        )}
                        {!editSkills ? (
                          <button
                            onClick={() => setEditSkills(true)}
                            className="btn-outline py-1 px-3 text-xs md:text-sm flex items-center gap-1"
                          >
                            <Pencil size={14} />
                            Edit
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={async () => {
                                await handleSave();
                                setEditSkills(false);
                              }}
                              className="btn-primary py-1 px-3 text-xs md:text-sm flex items-center gap-1"
                            >
                              <Check size={14} />
                              Save
                            </button>
                            <button
                              onClick={() => setEditSkills(false)}
                              className="btn-outline py-1 px-3 text-xs md:text-sm flex items-center gap-1"
                            >
                              <X size={14} />
                              Cancel
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {profileData.skills.length > 0 ? (
                        profileData.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-[#00FFB2]/20 text-[#00FFB2] rounded-full text-xs md:text-sm flex items-center gap-2"
                          >
                            {skill}
                            {editSkills && (
                              <button
                                onClick={() => handleSkillRemove(skill)}
                                className="text-red-400 hover:text-red-300"
                                aria-label="Remove skill"
                              >
                                <X size={12} />
                              </button>
                            )}
                          </span>
                        ))
                      ) : (
                        <div className="text-center py-8 w-full">
                          <Settings
                            size={40}
                            className="text-gray-500 mx-auto mb-3"
                          />
                          <p className="text-gray-400 mb-2 text-sm">
                            No skills added yet.
                          </p>
                          {editSkills && (
                            <button
                              onClick={() => {
                                const skill = prompt("Enter a skill:");
                                if (skill) handleSkillAdd(skill);
                              }}
                              className="btn-outline text-xs md:text-sm"
                            >
                              Add Your First Skill
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Experience Section */}
                  <div className="glass-card p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-[#00FFB2]/15 flex items-center justify-center">
                          <Briefcase size={20} className="text-[#00FFB2]" />
                        </div>
                        <div>
                          <h3 className="text-lg md:text-xl font-semibold">
                            Experience
                          </h3>
                          <p className="text-gray-400 text-xs md:text-sm">
                            Share the roles where you applied your skills in
                            real projects.
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={handleExperienceAdd}
                        className="btn-outline py-1 px-3 text-xs md:text-sm flex items-center gap-1"
                      >
                        <Plus size={14} />
                        Add Experience
                      </button>
                    </div>

                    <div className="space-y-6">
                      {profileData.experience.length > 0 ? (
                        profileData.experience.map((exp, index) => (
                          <div
                            key={index}
                            className="bg-[#050505] rounded-xl p-4 border border-gray-700 relative overflow-hidden"
                          >
                            <div className="absolute left-0 top-0 h-full w-[3px] bg-gradient-to-b from-[#00FFB2] via-[#00FFB2]/40 to-transparent" />

                            <div className="pl-4">
                              {editingExperienceIndex === index ? (
                                <div className="space-y-4">
                                  <div className="flex items-center justify-between">
                                    <h4 className="font-semibold text-sm">
                                      Experience {index + 1}
                                    </h4>
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() =>
                                          handleExperienceRemove(index)
                                        }
                                        className="text-red-400 hover:text-red-300"
                                        aria-label="Delete experience"
                                      >
                                        <Trash2 size={16} />
                                      </button>
                                      <button
                                        onClick={async () => {
                                          await handleSave();
                                          setEditingExperienceIndex(null);
                                        }}
                                        className="btn-primary py-1 px-3 text-xs flex items-center gap-1"
                                      >
                                        <Check size={14} />
                                        Save
                                      </button>
                                      <button
                                        onClick={() =>
                                          setEditingExperienceIndex(null)
                                        }
                                        className="btn-outline py-1 px-3 text-xs flex items-center gap-1"
                                      >
                                        <X size={14} />
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input
                                      value={exp.title}
                                      onChange={(e) =>
                                        handleExperienceUpdate(
                                          index,
                                          "title",
                                          e.target.value
                                        )
                                      }
                                      placeholder="Job Title"
                                      className="bg-[#020202] border border-gray-700"
                                    />
                                    <Input
                                      value={exp.company}
                                      onChange={(e) =>
                                        handleExperienceUpdate(
                                          index,
                                          "company",
                                          e.target.value
                                        )
                                      }
                                      placeholder="Company Name"
                                      className="bg-[#020202] border border-gray-700"
                                    />
                                    <Input
                                      value={exp.duration}
                                      onChange={(e) =>
                                        handleExperienceUpdate(
                                          index,
                                          "duration",
                                          e.target.value
                                        )
                                      }
                                      placeholder="Duration (e.g., Jan 2020 - Present)"
                                      className="bg-[#020202] border border-gray-700"
                                    />
                                  </div>
                                  <textarea
                                    value={exp.description}
                                    onChange={(e) =>
                                      handleExperienceUpdate(
                                        index,
                                        "description",
                                        e.target.value
                                      )
                                    }
                                    placeholder="Job description and achievements..."
                                    rows={3}
                                    className="w-full bg-[#020202] border border-gray-700 rounded-lg py-3 px-4 text-white placeholder-gray-400 resize-none text-sm"
                                  />
                                </div>
                              ) : (
                                <div>
                                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-1 mb-1">
                                    <h4 className="font-semibold text-base">
                                      {exp.title || "Job Title"}
                                    </h4>
                                    <span className="text-xs text-gray-400">
                                      {exp.duration || "Duration not set"}
                                    </span>
                                  </div>
                                  <p className="text-[#00FFB2] text-sm mb-2">
                                    {exp.company || "Company"}
                                  </p>
                                  <p className="text-gray-300 text-sm leading-relaxed">
                                    {exp.description ||
                                      "Add a short description about what you worked on and your impact."}
                                  </p>
                                  <div className="mt-3">
                                    <button
                                      onClick={() =>
                                        setEditingExperienceIndex(index)
                                      }
                                      className="btn-outline py-1 px-3 text-xs flex items-center gap-1"
                                    >
                                      <Pencil size={14} />
                                      Edit
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <Briefcase
                            size={40}
                            className="text-gray-500 mx-auto mb-3"
                          />
                          <p className="text-gray-400 mb-3 text-sm">
                            No experience added yet.
                          </p>
                          <button
                            onClick={handleExperienceAdd}
                            className="btn-outline text-xs md:text-sm"
                          >
                            Add Your First Experience
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Education Section */}
                  <div className="glass-card p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-[#00FFB2]/15 flex items-center justify-center">
                          <GraduationCap
                            size={20}
                            className="text-[#00FFB2]"
                          />
                        </div>
                        <div>
                          <h3 className="text-lg md:text-xl font-semibold">
                            Education
                          </h3>
                          <p className="text-gray-400 text-xs md:text-sm">
                            Show where you studied and what you completed.
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={handleEducationAdd}
                        className="btn-outline py-1 px-3 text-xs md:text-sm flex items-center gap-1"
                      >
                        <Plus size={14} />
                        Add Education
                      </button>
                    </div>

                    <div className="space-y-6">
                      {profileData.education.length > 0 ? (
                        profileData.education.map((edu, index) => (
                          <div
                            key={index}
                            className="bg-[#050505] rounded-xl p-4 border border-gray-700 relative overflow-hidden"
                          >
                            <div className="absolute left-0 top-0 h-full w-[3px] bg-gradient-to-b from-[#00FFB2] via-[#00FFB2]/40 to-transparent" />
                            <div className="pl-4">
                              {editingEducationIndex === index ? (
                                <div className="space-y-4">
                                  <div className="flex items-center justify-between">
                                    <h4 className="font-semibold text-sm">
                                      Education {index + 1}
                                    </h4>
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() =>
                                          handleEducationRemove(index)
                                        }
                                        className="text-red-400 hover:text-red-300"
                                        aria-label="Delete education"
                                      >
                                        <Trash2 size={16} />
                                      </button>
                                      <button
                                        onClick={async () => {
                                          await handleSave();
                                          setEditingEducationIndex(null);
                                        }}
                                        className="btn-primary py-1 px-3 text-xs flex items-center gap-1"
                                      >
                                        <Check size={14} />
                                        Save
                                      </button>
                                      <button
                                        onClick={() =>
                                          setEditingEducationIndex(null)
                                        }
                                        className="btn-outline py-1 px-3 text-xs flex items-center gap-1"
                                      >
                                        <X size={14} />
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input
                                      value={edu.degree}
                                      onChange={(e) =>
                                        handleEducationUpdate(
                                          index,
                                          "degree",
                                          e.target.value
                                        )
                                      }
                                      placeholder="Degree (e.g., BSc Computer Science)"
                                      className="bg-[#020202] border border-gray-700"
                                    />
                                    <Input
                                      value={edu.institution}
                                      onChange={(e) =>
                                        handleEducationUpdate(
                                          index,
                                          "institution",
                                          e.target.value
                                        )
                                      }
                                      placeholder="Institution Name"
                                      className="bg-[#020202] border border-gray-700"
                                    />
                                    <Input
                                      value={edu.year}
                                      onChange={(e) =>
                                        handleEducationUpdate(
                                          index,
                                          "year",
                                          e.target.value
                                        )
                                      }
                                      placeholder="Year (e.g., 2020-2024)"
                                      className="bg-[#020202] border border-gray-700"
                                    />
                                  </div>
                                </div>
                              ) : (
                                <div>
                                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-1 mb-1">
                                    <h4 className="font-semibold text-base">
                                      {edu.degree || "Degree"}
                                    </h4>
                                    <span className="text-xs text-gray-400">
                                      {edu.year || "Year not set"}
                                    </span>
                                  </div>
                                  <p className="text-[#00FFB2] text-sm">
                                    {edu.institution || "Institution"}
                                  </p>
                                  <div className="mt-3">
                                    <button
                                      onClick={() =>
                                        setEditingEducationIndex(index)
                                      }
                                      className="btn-outline py-1 px-3 text-xs flex items-center gap-1"
                                    >
                                      <Pencil size={14} />
                                      Edit
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <GraduationCap
                            size={40}
                            className="text-gray-500 mx-auto mb-3"
                          />
                          <p className="text-gray-400 mb-3 text-sm">
                            No education added yet.
                          </p>
                          <button
                            onClick={handleEducationAdd}
                            className="btn-outline text-xs md:text-sm"
                          >
                            Add Your Education
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Career Goals Section */}
                  <div className="glass-card p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-[#00FFB2]/15 flex items-center justify-center">
                          <Target size={20} className="text-[#00FFB2]" />
                        </div>
                        <div>
                          <h3 className="text-lg md:text-xl font-semibold">
                            Career Goals
                          </h3>
                          <p className="text-gray-400 text-xs md:text-sm">
                            Tell us where you want to go so we can match the
                            right opportunities.
                          </p>
                        </div>
                      </div>
                      {!editGoals ? (
                        <button
                          onClick={() => setEditGoals(true)}
                          className="btn-outline py-1 px-3 text-xs md:text-sm flex items-center gap-1"
                        >
                          <Pencil size={14} />
                          Edit
                        </button>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={async () => {
                              await handleSave();
                              setEditGoals(false);
                            }}
                            className="btn-primary py-1 px-3 text-xs md:text-sm flex items-center gap-1"
                          >
                            <Check size={14} />
                            Save
                          </button>
                          <button
                            onClick={() => setEditGoals(false)}
                            className="btn-outline py-1 px-3 text-xs md:text-sm flex items-center gap-1"
                          >
                            <X size={14} />
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>

                    {editGoals ? (
                      <div className="space-y-4">
                        <textarea
                          value={profileData.goals}
                          onChange={(e) =>
                            handleInputChange("goals", e.target.value)
                          }
                          placeholder="Describe your career aspirations, target roles, and what you want to learn next..."
                          rows={4}
                          className="w-full bg-[#050505] border border-gray-700 rounded-lg py-3 px-4 text-white placeholder-gray-400 resize-none text-sm"
                        />
                      </div>
                    ) : profileData.goals ? (
                      <div className="bg-[#050505] rounded-lg p-4 border border-gray-700">
                        <p className="text-gray-300 leading-relaxed text-sm md:text-base">
                          {profileData.goals}
                        </p>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Target
                          size={40}
                          className="text-gray-500 mx-auto mb-3"
                        />
                        <p className="text-gray-400 mb-2 text-sm">
                          No career goals set yet.
                        </p>
                        <p className="text-gray-500 text-xs">
                          Click the edit button above to describe your goals and
                          preferred roles.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Profile Stats */}
                  <div className="glass-card p-6">
                    <h3 className="text-lg md:text-xl font-semibold mb-4 flex items-center gap-2">
                      <Award size={22} className="text-[#00FFB2]" />
                      Profile Statistics
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-[#050505] p-4 rounded-lg text-center border border-gray-700">
                        <div className="text-[#00FFB2] text-2xl font-bold mb-1">
                          {(() => {
                            const fields = [
                              profileData.name,
                              profileData.email,
                              profileData.phone,
                              profileData.location,
                              profileData.linkedinProfile,
                              profileData.goals,
                              profileData.skills.length > 0,
                              profileData.experience.length > 0,
                              profileData.education.length > 0,
                              uploadedResume,
                            ];
                            const completedFields = fields.filter((field) =>
                              field
                                ? typeof field === "boolean"
                                  ? field
                                  : field.toString().trim() !== ""
                                : false
                            ).length;
                            return Math.round(
                              (completedFields / fields.length) * 100
                            );
                          })()}
                          %
                        </div>
                        <div className="text-xs text-gray-400">
                          Profile Completion
                        </div>
                      </div>
                      <div className="bg-[#050505] p-4 rounded-lg text-center border border-gray-700">
                        <div className="text-[#00FFB2] text-2xl font-bold mb-1">
                          {profileData.skills.length}
                        </div>
                        <div className="text-xs text-gray-400">Skills</div>
                      </div>
                      <div className="bg-[#050505] p-4 rounded-lg text-center border border-gray-700">
                        <div className="text-[#00FFB2] text-2xl font-bold mb-1">
                          {profileData.experience.length}
                        </div>
                        <div className="text-xs text-gray-400">Experience</div>
                      </div>
                      <div className="bg-[#050505] p-4 rounded-lg text-center border border-gray-700">
                        <div className="text-[#00FFB2] text-2xl font-bold mb-1">
                          {profileData.education.length}
                        </div>
                        <div className="text-xs text-gray-400">Education</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
        <BottomNav />
      </div>
    </ProtectedRoute>
  );
}
