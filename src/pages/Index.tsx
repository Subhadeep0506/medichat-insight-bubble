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

        {/* Support Categories - Masonry Layout */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-[#312c51] mb-4">
            I'm looking for support for...
          </h2>
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
            {supportCategories.map((cat, idx) => (
              <div 
                key={idx} 
                className={`bg-[#f7f6f4] rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 break-inside-avoid mb-4 ${
                  idx % 3 === 0 ? 'h-48' : idx % 3 === 1 ? 'h-40' : 'h-44'
                } cursor-pointer hover:scale-[1.02] group`}
              >
                <div className="flex flex-col h-full">
                  <div className="bg-gradient-to-br from-[#ffe7c8] to-[#ffd49e] rounded-xl p-4 mb-4 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                    <img src={cat.image} className="w-16 h-16 object-contain" alt={cat.title} />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-[#312c51] text-lg mb-2">{cat.title}</div>
                    <div className="text-sm text-[#524e66] leading-relaxed">{cat.description}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Assessments Section - Tile Layout */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-[#312c51] mb-4">
            Choose self-assessment
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {selfAssessments.map((sa, idx) => (
              <div 
                key={idx} 
                className={`bg-[#f7f6f4] rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105 group ${
                  idx === 0 ? 'md:col-span-2 md:row-span-2' : 
                  idx === 1 ? 'md:col-span-1' : 
                  idx === 2 ? 'md:col-span-1' : 'md:col-span-2'
                }`}
              >
                <div className={`flex ${idx === 0 ? 'flex-row items-center gap-4' : 'flex-col items-center'} h-full`}>
                  <div className={`bg-gradient-to-br from-[#d7f0fa] to-[#b8e6f7] rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-300 ${
                    idx === 0 ? 'p-6 flex-shrink-0' : 'p-4 mb-3 w-full'
                  }`}>
                    <img 
                      src={sa.image} 
                      className={`object-contain ${idx === 0 ? 'w-20 h-20' : 'w-12 h-12'}`} 
                      alt={sa.title} 
                    />
                  </div>
                  <div className={`${idx === 0 ? 'flex-1' : 'text-center'}`}>
                    <div className={`font-bold text-[#312c51] mb-2 ${idx === 0 ? 'text-xl' : 'text-base'}`}>
                      {sa.title}
                    </div>
                    <div className={`text-[#524e66] leading-relaxed ${idx === 0 ? 'text-base' : 'text-sm'}`}>
                      {sa.description}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
