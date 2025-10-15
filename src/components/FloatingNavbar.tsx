import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { LogOut, User, Sun, Moon, Plus, Menu } from "lucide-react";
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
  const user = useAuthStore((s) => s.user);

  const handleLogout = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await logout();
      toast({
        title: "Logout Successful",
        description: "Goodbye! Visit Again",
      });
      navigate("/");
    } catch (err: any) {
      const desc = err.data.detail;
      toast({
        title: "Logout Failed",
        description: desc,
        variant: "destructive",
      });
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
              className="hidden lg:inline-flex rounded-full mr-4"
            >
              <Plus className="w-3 h-3 mr-1" />
              New Patient
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="hidden lg:inline-flex h-10 w-10 mr-4"
            >
              {theme === "dark" ? (
                <Sun className="h-10 w-10" />
              ) : (
                <Moon className="h-10 w-10" />
              )}
            </Button>

            {/* Mobile/Tablet snackbar popover with New Patient + Theme */}
            <Popover>
              <PopoverTrigger asChild>
                <Button className="lg:hidden relative h-10 w-10 rounded-full mr-2">
                  <Menu className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" sideOffset={8} className="w-56">
                <div className="flex flex-col gap-2">
                  <Button
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => {
                      navigate("/new-patient");
                    }}
                  >
                    <Plus className="w-3 h-3 mr-2" /> New Patient
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() =>
                      setTheme(theme === "dark" ? "light" : "dark")
                    }
                  >
                    {theme === "dark" ? (
                      <Sun className="w-4 h-4 mr-2" />
                    ) : (
                      <Moon className="w-4 h-4 mr-2" />
                    )}{" "}
                    Toggle Theme
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64" align="end" forceMount>
                <div className="px-2 py-2">
                  <div className="flex items-center gap-3 px-2 py-1.5">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {user?.name || "User"}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user?.email || ""}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 rounded-lg border border-border bg-background px-3 py-2">
                    <div className="grid grid-cols-3 gap-y-1 text-xs">
                      <span className="text-muted-foreground">Role</span>
                      <span className="col-span-2 text-foreground truncate">
                        {user?.role || "—"}
                      </span>
                      <span className="text-muted-foreground">Phone</span>
                      <span className="col-span-2 text-foreground truncate">
                        {user?.phone || "—"}
                      </span>
                    </div>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} disabled={isLoading}>
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
