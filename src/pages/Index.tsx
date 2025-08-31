import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const supportCategories = [
  {
    title: "Young People",
    description: "Resources and guidance for young people to manage their wellbeing.",
    placeholder: "image-placeholder-1",
    image: "assets/Teenager-amico.png"
  },
  {
    title: "Faith & Belief Communities",
    description: "Support options reflecting a variety of backgrounds.",
    placeholder: "image-placeholder-2",
    image: "assets/Community-amico.png"
  },
  {
    title: "Parents & Carers",
    description: "Dedicated help for those caring for loved ones.",
    placeholder: "image-placeholder-3",
    image: "assets/Medical care-pana.png"
  },
  {
    title: "Employers & Employees",
    description: "Wellbeing resources tailored for workplace situations.",
    placeholder: "image-placeholder-4",
    image: "assets/New employee-amico.png"
  },
];

const selfAssessments = [
  {
    title: "Anxiety",
    description: "Feeling anxious, can't switch off?",
    placeholder: "assessment-image-1",
    image: "assets/Anxiety-rafiki.png"
  },
  {
    title: "Sleep",
    description: "Trouble sleeping or insomnia?",
    placeholder: "assessment-image-2",
    image: "assets/Sleep analysis-amico.png"
  },
  {
    title: "Depression",
    description: "Feeling low and without motivation?",
    placeholder: "assessment-image-3",
    image: "assets/Feeling Blue-amico.png"
  },
  {
    title: "Stress",
    description: "Feeling stressed or pressured?",
    placeholder: "assessment-image-4",
    image: "assets/Stress-amico.png"
  },
];

const Navbar = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`backdrop-blur-md fixed top-0 left-0 w-full z-30 transition-all duration-300 ${scrolled ? "bg-[#f7f6f4] shadow-sm" : "bg-transparent"
        }`}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between py-4 px-6">
        <span className="text-2xl font-bold text-[#312c51] tracking-tight">
          MindfulCare
        </span>
        <div className="flex gap-3 items-center">
          <Button
            size="sm"
            className="bg-[#37a36c] text-white rounded-full px-6 font-semibold transition hover:bg-[#319c63]"
            onClick={() => navigate("/register")}
          >
            Get Started
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-[#37a36c] text-[#37a36c] rounded-full px-6 font-semibold bg-white transition hover:bg-[#d6eddc]"
            onClick={() => navigate("/login")}
          >
            Login
          </Button>
        </div>
      </div>
    </nav>
  );
};

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-green-100 to-green-200 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 relative overflow-hidden">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 pt-28 pb-6">
        {/* Hero section */}
        <div className="flex flex-col md:flex-row gap-4 items-center mb-10">
          <div className="bg-[#e0dcf9] rounded-xl w-full md:w-1/2 flex items-center justify-center mb-6 md:mb-0">
            <img src="assets/Person with medical mask-pana.png"></img>
          </div>
          <div className="md:w-1/2 flex flex-col justify-center">
            <h1 className="text-3xl md:text-5xl font-bold text-[#312c51] mb-4">
              Mental Health & Wellbeing
            </h1>
            <p className="text-lg text-[#524e66] mb-3">
              Chat about mental health, create and track patient cases, and access wellbeing resources all in one supportive space.
            </p>
            <Button
              size="lg"
              className="bg-[#37a36c] text-white rounded-full px-8 font-semibold w-max"
              onClick={() => navigate("/register")}
            >
              Get Started
            </Button>
          </div>
        </div>

        {/* Support Categories */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-[#312c51] mb-4">
            I'm looking for support for...
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {supportCategories.map((cat, idx) => (
              <div key={idx} className="bg-[#f7f6f4] rounded-lg p-4 flex gap-4 items-center shadow-sm">
                <div className="bg-[#ffe7c8] rounded-lg flex items-center justify-center">
                  <img src={cat.image}></img>
                </div>
                <div>
                  <div className="font-semibold text-[#312c51]">{cat.title}</div>
                  <div className="text-sm text-[#524e66]">{cat.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Assessments Section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-[#312c51] mb-4">
            Choose self-assessment
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {selfAssessments.map((sa, idx) => (
              <div key={idx} className="bg-[#f7f6f4] rounded-xl p-4 flex flex-col items-center shadow-sm">
                <div className="bg-[#d7f0fa] rounded-lg mb-3 flex items-center justify-center">
                  <img src={sa.image}></img>
                </div>
                <div className="font-semibold text-[#312c51] mb-1">{sa.title}</div>
                <div className="text-sm text-[#524e66]">{sa.description}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
