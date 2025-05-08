import React, { useState, useRef, useEffect } from "react";
import { useFireproof } from "use-fireproof";
import { callAI } from "call-ai";

const JobPosterApp = () => {
  const { database, useLiveQuery, useDocument } = useFireproof("local-gig-connect-v2");
  const fileInputRef = useRef(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("post");
  const [showJobDetails, setShowJobDetails] = useState(null);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [showOutreachTips, setShowOutreachTips] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Job form document
  const { doc: jobForm, merge: mergeJobForm, submit: submitJob, reset: resetForm } = useDocument({
    title: "",
    category: "",
    description: "",
    location: "",
    budget: "",
    budgetType: "fixed",
    date: "",
    time: "",
    contactName: "",
    contactPhone: "",
    contactEmail: "",
    _files: {},
    status: "Open",
    createdAt: Date.now()
  });

  // Get all jobs, sorted by creation date (newest first)
  const { docs: allJobs } = useLiveQuery("createdAt", { descending: true });
  
  // Apply filters to jobs
  const jobs = allJobs.filter(job => {
    const matchesSearch = searchTerm === "" || 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || job.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const categories = [
    "Plumbing", 
    "Tutoring", 
    "Repairs", 
    "Cleaning", 
    "Moving", 
    "Gardening",
    "Electrical",
    "Painting",
    "Carpentry",
    "Other"
  ];

  const statusOptions = [
    { value: "all", label: "All Statuses" },
    { value: "Open", label: "Open" },
    { value: "In Progress", label: "In Progress" },
    { value: "Completed", label: "Completed" },
    { value: "Cancelled", label: "Cancelled" }
  ];

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      mergeJobForm({ _files: { jobImage: e.target.files[0] } });
    }
  };

  const handleJobSubmit = (e) => {
    e.preventDefault();
    if (!jobForm.title || !jobForm.category || !jobForm.description || 
        !jobForm.location || !jobForm.contactName || !jobForm.contactPhone) {
      alert("Please fill all required fields");
      return;
    }
    
    submitJob();
    setActiveTab("dashboard");
  };

  const generateJobDescription = async () => {
    if (!jobForm.title || !jobForm.category) {
      alert("Please enter a job title and category first");
      return;
    }

    setIsGeneratingDescription(true);
    
    try {
      const prompt = `Create a detailed job description for a ${jobForm.category} job titled "${jobForm.title}". 
      Include typical requirements, scope of work, and appropriate details a client might want to specify.
      Keep it under 200 words and make it professional but approachable.`;

      const response = await callAI(prompt);
      mergeJobForm({ description: response });
    } catch (error) {
      console.error("Error generating description:", error);
      alert("Failed to generate job description. Please try again or write your own.");
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  const generateDemoData = async () => {
    setIsLoading(true);
    
    try {
      const prompt = `Generate 5 local job listings in JSON format. Each job should have:
      - title: creative but realistic local job title
      - category: one of these categories [${categories.join(', ')}]
      - description: detailed 2-3 sentence job description
      - location: a realistic city and neighborhood
      - budget: a reasonable dollar amount as a number
      - budgetType: either "fixed" or "hourly"
      - date: a future date in YYYY-MM-DD format
      - time: a time range like "2:00 PM - 5:00 PM"
      - status: "Open"
      - contactName: a realistic full name
      - contactPhone: a realistic phone number
      - contactEmail: a realistic email address`;

      const demoData = await callAI(prompt, {
        schema: {
          properties: {
            jobs: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  category: { type: "string" },
                  description: { type: "string" },
                  location: { type: "string" },
                  budget: { type: "string" },
                  budgetType: { type: "string" },
                  date: { type: "string" },
                  time: { type: "string" },
                  status: { type: "string" },
                  contactName: { type: "string" },
                  contactPhone: { type: "string" },
                  contactEmail: { type: "string" }
                }
              }
            }
          }
        }
      });

      const parsedData = JSON.parse(demoData);
      
      for (const job of parsedData.jobs) {
        await database.put({
          ...job,
          createdAt: Date.now() - Math.floor(Math.random() * 86400000) // Random time within last 24h
        });
      }
      
      setActiveTab("dashboard");
    } catch (error) {
      console.error("Error generating demo data:", error);
      alert("Failed to generate demo data");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteJob = async (jobId) => {
    if (confirm("Are you sure you want to delete this job?")) {
      await database.del(jobId);
    }
  };

  const updateJobStatus = async (job, newStatus) => {
    await database.put({
      ...job,
      status: newStatus
    });
  };

  // Background pattern style for Memphis style design
  const backgroundPattern = {
    backgroundImage: `radial-gradient(#ff9770 2px, transparent 2px), radial-gradient(#70d6ff 2px, transparent 2px)`,
    backgroundSize: `30px 30px`,
    backgroundPosition: `0 0, 15px 15px`,
    backgroundColor: '#ffffff'
  };

  return (
    <div className="min-h-screen" style={backgroundPattern}>
      <div className="max-w-4xl mx-auto pt-8 px-4 pb-16">
        <header className="mb-6">
          <h1 className="text-4xl font-bold text-center mb-2" style={{color: "#242424"}}>
            Local Gig Connect
          </h1>
          <p className="text-xl text-center italic mb-6" style={{color: "#242424"}}>
            *Connect with local talent for your quick jobs and projects. Post a job, find the right person, and get things done!*
          </p>
          
          {/* Navigation tabs */}
          <div className="flex justify-center mb-6">
            <div className="flex space-x-4 border-4 border-[#ff70a6] rounded-full p-1 bg-white">
              <button 
                onClick={() => setActiveTab("post")} 
                className={`px-5 py-2 rounded-full font-bold transition-all ${activeTab === "post" ? "bg-[#70d6ff] text-white" : "text-[#242424]"}`}
              >
                Post a Job
              </button>
              <button 
                onClick={() => setActiveTab("dashboard")} 
                className={`px-5 py-2 rounded-full font-bold transition-all ${activeTab === "dashboard" ? "bg-[#70d6ff] text-white" : "text-[#242424]"}`}
              >
                Dashboard
              </button>
              <button 
                onClick={() => {
                  setActiveTab("outreach");
                  setShowOutreachTips(true);
                }} 
                className={`px-5 py-2 rounded-full font-bold transition-all ${activeTab === "outreach" ? "bg-[#70d6ff] text-white" : "text-[#242424]"}`}
              >
                Find Clients
              </button>
            </div>
          </div>
        </header>

        {activeTab === "post" && (
          <div className="bg-white p-6 rounded-lg shadow-lg border-4 border-[#ff9770]">
            <h2 className="text-2xl font-bold mb-4" style={{color: "#242424"}}>Post a New Job</h2>
            
            <form onSubmit={handleJobSubmit}>
              <div className="mb-4">
                <label className="block font-bold mb-2" style={{color: "#242424"}}>Job Title*</label>
                <input
                  type="text"
                  value={jobForm.title}
                  onChange={(e) => mergeJobForm({ title: e.target.value })}
                  className="w-full p-2 border-4 border-[#ffd670] rounded-lg focus:outline-none focus:border-[#ff70a6]"
                  placeholder="e.g., Fix Leaking Kitchen Sink"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block font-bold mb-2" style={{color: "#242424"}}>Category*</label>
                <select
                  value={jobForm.category}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    mergeJobForm({ category: e.target.value });
                  }}
                  className="w-full p-2 border-4 border-[#ffd670] rounded-lg focus:outline-none focus:border-[#ff70a6]"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              
              <div className="mb-4 relative">
                <div className="flex justify-between items-center mb-2">
                  <label className="block font-bold" style={{color: "#242424"}}>Job Description*</label>
                  <button 
                    type="button" 
                    onClick={generateJobDescription}
                    disabled={isGeneratingDescription}
                    className="text-sm px-3 py-1.5 bg-[#70d6ff] text-white font-medium rounded hover:bg-[#ff70a6] transition-colors"
                  >
                    {isGeneratingDescription ? "Generating..." : "Generate Description"}
                  </button>
                </div>
                <textarea
                  value={jobForm.description}
                  onChange={(e) => mergeJobForm({ description: e.target.value })}
                  className="w-full p-2 border-4 border-[#ffd670] rounded-lg min-h-[120px] focus:outline-none focus:border-[#ff70a6]"
                  placeholder="Describe the job in detail..."
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="mb-4">
                  <label className="block font-bold mb-2" style={{color: "#242424"}}>Location*</label>
                  <input
                    type="text"
                    value={jobForm.location}
                    onChange={(e) => mergeJobForm({ location: e.target.value })}
                    className="w-full p-2 border-4 border-[#ffd670] rounded-lg focus:outline-none focus:border-[#ff70a6]"
                    placeholder="e.g., Downtown, Seattle"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block font-bold mb-2" style={{color: "#242424"}}>Budget</label>
                  <div className="flex">
                    <input
                      type="text"
                      value={jobForm.budget}
                      onChange={(e) => mergeJobForm({ budget: e.target.value })}
                      className="w-3/5 p-2 border-4 border-r-0 border-[#ffd670] rounded-l-lg focus:outline-none focus:border-[#ff70a6]"
                      placeholder="e.g., 50"
                    />
                    <select
                      value={jobForm.budgetType}
                      onChange={(e) => mergeJobForm({ budgetType: e.target.value })}
                      className="w-2/5 p-2 border-4 border-l-0 border-[#ffd670] rounded-r-lg focus:outline-none focus:border-[#ff70a6]"
                    >
                      <option value="fixed">Fixed</option>
                      <option value="hourly">Hourly</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="mb-4">
                  <label className="block font-bold mb-2" style={{color: "#242424"}}>Preferred Date</label>
                  <input
                    type="date"
                    value={jobForm.date}
                    onChange={(e) => mergeJobForm({ date: e.target.value })}
                    className="w-full p-2 border-4 border-[#ffd670] rounded-lg focus:outline-none focus:border-[#ff70a6]"
                  />
                </div>

                <div className="mb-4">
                  <label className="block font-bold mb-2" style={{color: "#242424"}}>Preferred Time</label>
                  <input
                    type="text"
                    value={jobForm.time}
                    onChange={(e) => mergeJobForm({ time: e.target.value })}
                    className="w-full p-2 border-4 border-[#ffd670] rounded-lg focus:outline-none focus:border-[#ff70a6]"
                    placeholder="e.g., 2:00 PM - 5:00 PM"
                  />
                </div>
              </div>

              {/* Contact Information Section */}
              <div className="mt-6 mb-6 p-4 bg-[#e9ff70] border-2 border-[#ffd670] rounded-lg">
                <h3 className="text-lg font-bold mb-3" style={{color: "#242424"}}>Contact Information</h3>
                <p className="text-sm text-gray-700 mb-4 italic">Your contact info will only be shared with hired freelancers.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="mb-4">
                    <label className="block font-bold mb-2" style={{color: "#242424"}}>Contact Name*</label>
                    <input
                      type="text"
                      value={jobForm.contactName}
                      onChange={(e) => mergeJobForm({ contactName: e.target.value })}
                      className="w-full p-2 border-4 border-[#ffd670] rounded-lg focus:outline-none focus:border-[#ff70a6]"
                      placeholder="Your full name"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block font-bold mb-2" style={{color: "#242424"}}>Phone Number*</label>
                    <input
                      type="tel"
                      value={jobForm.contactPhone}
                      onChange={(e) => mergeJobForm({ contactPhone: e.target.value })}
                      className="w-full p-2 border-4 border-[#ffd670] rounded-lg focus:outline-none focus:border-[#ff70a6]"
                      placeholder="Your phone number"
                      required
                    />
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block font-bold mb-2" style={{color: "#242424"}}>Email (Optional)</label>
                  <input
                    type="email"
                    value={jobForm.contactEmail}
                    onChange={(e) => mergeJobForm({ contactEmail: e.target.value })}
                    className="w-full p-2 border-4 border-[#ffd670] rounded-lg focus:outline-none focus:border-[#ff70a6]"
                    placeholder="Your email address"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block font-bold mb-2" style={{color: "#242424"}}>Upload Image (Optional)</label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  className="w-full p-3 border-2 border-dashed border-[#70d6ff] rounded-lg text-center hover:bg-[#e9ff70] transition-colors"
                >
                  {jobForm._files.jobImage ? "Image Selected" : "Click to Upload"}
                </button>
                {jobForm._files.jobImage && (
                  <p className="mt-2 text-sm text-gray-600">{jobForm._files.jobImage.name}</p>
                )}
              </div>

              <div className="flex justify-between items-center">
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#ff70a6] text-white font-bold rounded-lg hover:bg-[#ff9770] transition-colors"
                >
                  Post Job
                </button>
                <button
                  type="button"
                  onClick={generateDemoData}
                  disabled={isLoading}
                  className="px-4 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
                >
                  {isLoading ? "Generating..." : "Demo Data"}
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === "dashboard" && (
          <div className="bg-white p-6 rounded-lg shadow-lg border-4 border-[#ffd670]">
            <h2 className="text-2xl font-bold mb-4" style={{color: "#242424"}}>Your Jobs</h2>
            
            {showJobDetails ? (
              <div className="mb-6">
                <button 
                  onClick={() => setShowJobDetails(null)}
                  className="mb-4 flex items-center text-[#ff70a6] font-medium"
                >
                  <span>← Back to all jobs</span>
                </button>
                
                <div className="border-4 border-[#70d6ff] rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold" style={{color: "#242424"}}>{showJobDetails.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-white text-sm font-bold ${
                      showJobDetails.status === "Open" ? "bg-green-500" :
                      showJobDetails.status === "In Progress" ? "bg-blue-500" :
                      showJobDetails.status === "Completed" ? "bg-purple-500" : 
                      "bg-gray-500"
                    }`}>{showJobDetails.status}</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-gray-700 mb-2"><span className="font-bold">Category:</span> {showJobDetails.category}</p>
                      <p className="text-gray-700 mb-2"><span className="font-bold">Location:</span> {showJobDetails.location}</p>
                      <p className="text-gray-700 mb-2">
                        <span className="font-bold">Budget:</span> ${showJobDetails.budget} ({showJobDetails.budgetType})
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-700 mb-2"><span className="font-bold">Date:</span> {showJobDetails.date || "Flexible"}</p>
                      <p className="text-gray-700 mb-2"><span className="font-bold">Time:</span> {showJobDetails.time || "Flexible"}</p>
                      <p className="text-gray-700 mb-2">
                        <span className="font-bold">Posted:</span> {new Date(showJobDetails.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  {/* Contact Information */}
                  <div className="mb-4 p-3 bg-[#e9ff70] rounded-lg">
                    <h4 className="font-bold mb-2" style={{color: "#242424"}}>Contact Information</h4>
                    <p className="text-gray-700 mb-1"><span className="font-medium">Name:</span> {showJobDetails.contactName}</p>
                    <p className="text-gray-700 mb-1"><span className="font-medium">Phone:</span> {showJobDetails.contactPhone}</p>
                    {showJobDetails.contactEmail && (
                      <p className="text-gray-700"><span className="font-medium">Email:</span> {showJobDetails.contactEmail}</p>
                    )}
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="font-bold mb-2" style={{color: "#242424"}}>Description</h4>
                    <p className="text-gray-700 whitespace-pre-wrap">{showJobDetails.description}</p>
                  </div>
                  
                  {showJobDetails._files?.jobImage && (
                    <div className="mb-6">
                      <h4 className="font-bold mb-2" style={{color: "#242424"}}>Attached Image</h4>
                      <div className="border-2 border-[#ffd670] rounded-lg overflow-hidden">
                        <img 
                          src={URL.createObjectURL(showJobDetails._files.jobImage)} 
                          alt="Job image" 
                          className="w-full max-h-80 object-contain" 
                        />
                      </div>
                    </div>
                  )}

                  <div className="mt-6">
                    <h4 className="font-bold mb-2" style={{color: "#242424"}}>Update Status</h4>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => updateJobStatus(showJobDetails, "Open")}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${showJobDetails.status === "Open" ? 'bg-green-100 text-green-700 border-2 border-green-500' : 'bg-gray-100 hover:bg-green-100'}`}
                      >
                        Open
                      </button>
                      <button
                        onClick={() => updateJobStatus(showJobDetails, "In Progress")}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${showJobDetails.status === "In Progress" ? 'bg-blue-100 text-blue-700 border-2 border-blue-500' : 'bg-gray-100 hover:bg-blue-100'}`}
                      >
                        In Progress
                      </button>
                      <button
                        onClick={() => updateJobStatus(showJobDetails, "Completed")}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${showJobDetails.status === "Completed" ? 'bg-purple-100 text-purple-700 border-2 border-purple-500' : 'bg-gray-100 hover:bg-purple-100'}`}
                      >
                        Completed
                      </button>
                      <button
                        onClick={() => updateJobStatus(showJobDetails, "Cancelled")}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${showJobDetails.status === "Cancelled" ? 'bg-red-100 text-red-700 border-2 border-red-500' : 'bg-gray-100 hover:bg-red-100'}`}
                      >
                        Cancelled
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Search and filter controls */}
                <div className="flex flex-col md:flex-row gap-4 mb-5">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search jobs..."
                      className="w-full p-2.5 border-4 border-[#ffd670] rounded-lg focus:outline-none focus:border-[#ff70a6]"
                    />
                  </div>
                  <div>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="w-full p-2.5 border-4 border-[#ffd670] rounded-lg focus:outline-none focus:border-[#ff70a6]"
                    >
                      {statusOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {jobs.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">
                      {allJobs.length > 0 ? "No jobs match your search" : "No jobs posted yet"}
                    </p>
                    <button
                      onClick={() => {
                        setSearchTerm("");
                        setFilterStatus("all");
                        if (allJobs.length === 0) setActiveTab("post");
                      }}
                      className="px-6 py-2 bg-[#ff70a6] text-white font-bold rounded-lg hover:bg-[#ff9770] transition-colors"
                    >
                      {allJobs.length > 0 ? "Clear Filters" : "Post Your First Job"}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {jobs.map((job) => (
                      <div 
                        key={job._id} 
                        className="border-4 border-[#70d6ff] rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between">
                          <div className="flex-1">
                            <h3 className="font-bold text-lg" style={{color: "#242424"}}>{job.title}</h3>
                            <p className="text-gray-700 line-clamp-2">{job.description}</p>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                              <p className="text-sm text-gray-600"><span className="font-medium">Category:</span> {job.category}</p>
                              <p className="text-sm text-gray-600"><span className="font-medium">Location:</span> {job.location}</p>
                              {job.budget && (
                                <p className="text-sm text-gray-600">
                                  <span className="font-medium">Budget:</span> ${job.budget} ({job.budgetType})
                                </p>
                              )}
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Contact:</span> {job.contactName}
                              </p>
                            </div>
                          </div>
                          
                          <div className="ml-4 flex flex-col items-end">
                            <span className={`px-3 py-1 rounded-full text-white text-sm mb-2 ${
                              job.status === "Open" ? "bg-green-500" :
                              job.status === "In Progress" ? "bg-blue-500" :
                              job.status === "Completed" ? "bg-purple-500" : 
                              "bg-gray-500"
                            }`}>{job.status}</span>
                            <div className="flex gap-2">
                              <button
                                onClick={() => setShowJobDetails(job)}
                                className="text-sm px-3 py-1 bg-[#70d6ff] text-white rounded hover:bg-[#ff70a6] transition-colors"
                              >
                                View
                              </button>
                              <button
                                onClick={() => deleteJob(job._id)}
                                className="text-sm px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === "outreach" && (
          <div className="bg-white p-6 rounded-lg shadow-lg border-4 border-[#e9ff70]">
            <h2 className="text-2xl font-bold mb-4" style={{color: "#242424"}}>Find Clients & Job Posters</h2>
            <p className="mb-6 text-gray-700 italic">
              *Use these strategies to find more clients and attract job posters to your platform. 
              Building a strong local network is key to growing your service marketplace.*
            </p>

            <div className="space-y-6">
              {/* Local Outreach Section */}
              <div className="border-4 border-[#70d6ff] rounded-lg p-4">
                <h3 className="text-xl font-bold mb-3" style={{color: "#242424"}}>1. Local Outreach & Listings</h3>
                
                <div className="mb-4">
                  <h4 className="font-medium mb-2" style={{color: "#242424"}}>Social Media Groups</h4>
                  <p className="text-gray-700 mb-2">
                    Join and engage with neighborhood groups on:
                  </p>
                  <ul className="list-disc pl-5 mb-2 text-gray-700">
                    <li>Facebook Groups</li>
                    <li>WhatsApp neighborhood chats</li>
                    <li>Telegram local channels</li>
                    <li>NextDoor</li>
                  </ul>
                  <p className="text-gray-700">
                    Post about your platform and invite users to try posting jobs.
                  </p>
                </div>
                
                <div className="mb-3">
                  <h4 className="font-medium mb-2" style={{color: "#242424"}}>Existing Classifieds Sites</h4>
                  <p className="text-gray-700 mb-2">
                    Review and reach out to posters on:
                  </p>
                  <ul className="list-disc pl-5 text-gray-700">
                    <li>OLX</li>
                    <li>Justdial</li>
                    <li>Craigslist</li>
                    <li>Facebook Marketplace</li>
                  </ul>
                </div>
                
                <div className="bg-[#e9ff70] p-3 rounded mt-4">
                  <p className="text-gray-700 font-medium">
                    <strong>🧠 Pro Tip:</strong> Start with a few demo job posts you create yourself to make the platform look active. 
                    Use the "Demo Data" button to quickly populate your platform.
                  </p>
                </div>
              </div>

              {/* Business Partnerships */}
              <div className="border-4 border-[#70d6ff] rounded-lg p-4">
                <h3 className="text-xl font-bold mb-3" style={{color: "#242424"}}>2. Business Partnerships</h3>
                
                <p className="text-gray-700 mb-3">
                  Partner with local businesses that serve as hubs for service seekers:
                </p>
                
                <ul className="list-disc pl-5 mb-4 text-gray-700">
                  <li>Hardware stores</li>
                  <li>Tutoring centers</li>
                  <li>Internet cafes</li>
                  <li>Community centers</li>
                  <li>Local shops</li>
                </ul>
                
                <p className="text-gray-700">
                  Offer free promotion in exchange for cross-posting or referrals. Create simple flyers
                  with QR codes linking to your platform that these businesses can display.
                </p>
              </div>

              {/* Marketing Channels */}
              <div className="border-4 border-[#70d6ff] rounded-lg p-4">
                <h3 className="text-xl font-bold mb-3" style={{color: "#242424"}}>3. Marketing Channels</h3>
                
                <ul className="list-disc pl-5 mb-4 text-gray-700 space-y-2">
                  <li>
                    <span className="font-medium">Print Materials:</span> Distribute flyers and posters in residential areas, 
                    hostels, markets, and community bulletin boards.
                  </li>
                  <li>
                    <span className="font-medium">Local SEO:</span> Create a Google Business Profile and optimize for local
                    searches like "post a local job [your city]".
                  </li>
                  <li>
                    <span className="font-medium">Low-Cost Ads:</span> Run targeted Instagram and Facebook ads with a small
                    budget, focused on your local area.
                  </li>
                  <li>
                    <span className="font-medium">Local Events:</span> Set up booths at community events and offer on-the-spot
                    job posting assistance.
                  </li>
                </ul>
              </div>
              
              {/* Styled call to action */}
              <div className="mt-8 text-center">
                <p className="text-lg font-bold mb-4" style={{color: "#242424"}}>Ready to start finding clients?</p>
                <button
                  onClick={() => setActiveTab("post")}
                  className="px-8 py-3 bg-[#ff70a6] text-white font-bold rounded-lg hover:bg-[#ff9770] transition-colors"
                >
                  Create Your First Job Post
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobPosterApp;