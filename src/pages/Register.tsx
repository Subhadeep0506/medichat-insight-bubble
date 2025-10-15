import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/store";

const Register = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const { register: registerUser } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      const message = await registerUser(
        formData.fullName,
        formData.email,
        formData.password,
        formData.phone
      );
      toast({
        title: "Registration Successful",
        description: message || "Your account has been created successfully!",
      });
      navigate("/login");
    } catch (err: any) {
      const desc = err.data.detail;
      toast({ title: "Error", description: desc, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="h-screen overflow-hidden relative">
      <div className="absolute inset-0 -z-20">
        <div className="absolute inset-0 bg-[url('/assets/banner-auth.png')] bg-cover bg-center"></div>
        <div className="absolute inset-0 bg-gray-700/40 dark:bg-black/40"></div>
      </div>
      <div className="h-full w-full flex">
        {/* Left: form card (visible on all sizes) */}
        <div className="w-full md:w-2/5 flex items-center justify-center bg-transparent dark:bg-slate-900/60 backdrop-blur-lg border-r border-white/10 dark:border-slate-800/40">
          <div className="w-full max-w-md px-6 py-8 bg-transparent">
            {/* Header - hidden on small (mobile) to keep only the form */}
            <div className=" md:block w-full p-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-green-50/80 dark:bg-green-900/20 rounded-2xl">
                  <UserPlus className="h-10 w-10 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">
                Create Account
              </h1>
              <p className="text-slate-800 dark:text-slate-300">
                Join MediCase to start managing medical cases
              </p>
            </div>

            {/* Form */}
            <div className="p-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="fullName"
                      className="text-slate-800 dark:text-slate-300 font-semibold"
                    >
                      Full Name
                    </Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="h-10 bg-white/5 dark:bg-white/5 border-slate-800/40 dark:border-slate-400/40 rounded-xl text-slate-800 dark:text-slate-100 placeholder:text-slate-700 dark:placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="phone"
                      className="text-slate-800 dark:text-slate-300 font-semibold"
                    >
                      Phone
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="text"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="h-10 bg-white/5 dark:bg-white/5 border-slate-800/40 dark:border-slate-400/40 rounded-xl text-slate-800 dark:text-slate-100 placeholder:text-slate-700 dark:placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Phone number"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-slate-800 dark:text-slate-300 font-semibold"
                  >
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="h-10 bg-white/5 dark:bg-white/5 border-slate-800/40 dark:border-slate-400/40 rounded-xl text-slate-800 dark:text-slate-100 placeholder:text-slate-700 dark:placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your email"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="password"
                      className="text-slate-800 dark:text-slate-300 font-semibold"
                    >
                      Password
                    </Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      className="h-10 bg-white/5 dark:bg-white/5 border-slate-800/40 dark:border-slate-400/40 rounded-xl text-slate-800 dark:text-slate-100 placeholder:text-slate-700 dark:placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Create password"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="confirmPassword"
                      className="text-slate-800 dark:text-slate-300 font-semibold"
                    >
                      Confirm Password
                    </Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      required
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="h-10 bg-white/5 dark:bg-white/5 border-slate-800/40 dark:border-slate-400/40 rounded-xl text-slate-800 dark:text-slate-100 placeholder:text-slate-700 dark:placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Confirm password"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-10 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold rounded-xl transition-all duration-300 hover:scale-[1.02] shadow-lg mt-6"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>
              </form>

              <div className="mt-8 text-center">
                <span className="text-slate-800 dark:text-slate-400">
                  Already have an account?{" "}
                </span>
                <button
                  onClick={() => navigate("/login")}
                  className="text-green-600 hover:text-green-700 font-semibold underline underline-offset-4 decoration-2 hover:decoration-green-700 transition-colors"
                >
                  Sign in
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: background image - hidden on mobile */}
      </div>
    </div>
  );
};

export default Register;
