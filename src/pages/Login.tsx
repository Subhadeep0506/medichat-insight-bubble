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
import { LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/store";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const { login } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(formData.email, formData.password);
      toast({ title: "Login Successful", description: "Welcome back!" });
      navigate("/cases");
    } catch (err: any) {
      const desc = err.data.detail;
      toast({
        title: "Login Failed",
        description: desc,
        variant: "destructive",
      });
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
        {/* Left: form card */}
        <div className="w-full md:w-2/5 flex items-center justify-center bg-transparent dark:bg-slate-900/60 backdrop-blur-lg border-r border-white/10 dark:border-slate-800/40">
          <div className="w-full max-w-md px-6 py-8 bg-transparent">
            {/* Header hidden on mobile */}
            <div className=" md:block w-full p-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-blue-50/80 dark:bg-blue-900/20 rounded-2xl">
                  <LogIn className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">
                Welcome Back
              </h1>
              <p className="text-slate-800 dark:text-slate-300">
                Sign in to your MediCase account
              </p>
            </div>

            {/* Form */}
            <div className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="username"
                    className="text-slate-800 dark:text-slate-300 font-semibold"
                  >
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="text"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="h-10 bg-white/5 dark:bg-white/5 border-slate-800/40 dark:border-slate-400/40 rounded-xl text-slate-800 dark:text-slate-100 placeholder:text-slate-700 dark:placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your email"
                  />
                </div>

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
                    placeholder="Enter your password"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-10 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl transition-all duration-300 hover:scale-[1.02] shadow-lg"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing In..." : "Sign In"}
                </Button>
              </form>

              <div className="mt-8 text-center">
                <span className="text-slate-800 dark:text-slate-400">
                  Don't have an account?{" "}
                </span>
                <button
                  onClick={() => navigate("/register")}
                  className="text-blue-600 hover:text-blue-700 font-semibold underline underline-offset-4 decoration-2 hover:decoration-blue-700 transition-colors"
                >
                  Sign up
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: background image hidden on mobile */}
      </div>
    </div>
  );
};

export default Login;
