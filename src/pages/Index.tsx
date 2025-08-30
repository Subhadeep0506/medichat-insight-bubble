import { Button } from "@/components/ui/button";
import { ArrowRight, Stethoscope, Shield, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen gradient-animate">
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass-effect rounded-2xl p-8 md:p-12 max-w-4xl w-full text-center shadow-2xl">
          <div className="mb-8">
            <div className="flex justify-center mb-6">
              <div className="p-4 rounded-full bg-white/20 backdrop-blur-sm">
                <Stethoscope className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              MediCase
              <span className="block text-2xl md:text-3xl font-normal mt-2 text-white/90">
                Advanced Medical Case Management
              </span>
            </h1>
            <p className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl mx-auto leading-relaxed">
              Streamline patient care with our comprehensive medical case management system. 
              Organize patients, track cases, and enhance medical workflows with ease.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-10">
            <div className="glass-effect rounded-xl p-6 text-white">
              <Users className="h-8 w-8 mb-4 mx-auto text-white/90" />
              <h3 className="text-lg font-semibold mb-2">Patient Management</h3>
              <p className="text-sm text-white/70">
                Organize and manage patient information efficiently
              </p>
            </div>
            <div className="glass-effect rounded-xl p-6 text-white">
              <Shield className="h-8 w-8 mb-4 mx-auto text-white/90" />
              <h3 className="text-lg font-semibold mb-2">Secure & Private</h3>
              <p className="text-sm text-white/70">
                HIPAA compliant with enterprise-grade security
              </p>
            </div>
            <div className="glass-effect rounded-xl p-6 text-white">
              <Stethoscope className="h-8 w-8 mb-4 mx-auto text-white/90" />
              <h3 className="text-lg font-semibold mb-2">Case Tracking</h3>
              <p className="text-sm text-white/70">
                Track medical cases from diagnosis to resolution
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              className="bg-white text-primary hover:bg-white/90 font-semibold px-8 py-3 rounded-full shadow-lg transition-all duration-300 hover:scale-105"
              onClick={() => navigate("/register")}
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-white/30 text-white hover:bg-white/10 font-semibold px-8 py-3 rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-105"
              onClick={() => navigate("/login")}
            >
              Sign In
            </Button>
          </div>

          <div className="mt-8 text-white/60 text-sm">
            Already have an account? <button 
              onClick={() => navigate("/login")}
              className="text-white hover:text-white/80 underline font-medium"
            >
              Sign in here
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;