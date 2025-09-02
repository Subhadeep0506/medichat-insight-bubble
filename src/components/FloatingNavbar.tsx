/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User, Sun, Moon, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "next-themes";
import { useAuthStore } from "@/store/auth";
import { useState } from "react";

export function FloatingNavbar() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const { logout } = useAuthStore();

  const handleLogout = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await logout();
      toast({ title: "Logout Successful", description: "Goodbye! Visit Again" });
      navigate("/");
    } catch (err: any) {
      const desc = err.data.detail;
      toast({ title: "Logout Failed", description: desc, variant: "destructive" });
      navigate("/");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed top-2 left-0 right-0 z-50 px-4">
      <div className="bg-background/80 backdrop-blur-md rounded-xl border border-border/200 shadow-lg px-6 py-2 max-w-full">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-foreground">MediCase</h1>
          </div>
          <div className="flex items-center">
            <Button
              onClick={() => navigate("/new-patient")}
              size="sm"
              className="rounded-full mr-4"
            >
              <Plus className="w-3 h-3 mr-1" />
              New Patient
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="h-10 w-10 mr-4"
            >
              {theme === 'dark' ? <Sun className="h-10 w-10" /> : <Moon className="h-10 w-10" />}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FloatingNavbar;