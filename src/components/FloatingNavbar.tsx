import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { LogOut, User, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FloatingNavbar = () => {
  const navigate = useNavigate();
  const [user] = useState({
    name: 'Dr. John Doe',
    email: 'john.doe@medical.com',
    avatar: '/placeholder.svg'
  });

  const handleLogout = () => {
    // Handle logout logic here
    console.log('Logging out...');
  };

  const handleNewPatient = () => {
    navigate('/new-patient');
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
      <div className="bg-background/80 backdrop-blur-md border border-border rounded-full px-6 py-3 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="text-lg font-semibold text-foreground">
            MediCase Pro
          </div>
          
          <div className="flex items-center gap-4">
            <Button onClick={handleNewPatient} className="flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              New Patient
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>
                      <User className="w-5 h-5" />
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuItem className="flex flex-col items-start">
                  <div className="text-sm font-medium">{user.name}</div>
                  <div className="text-xs text-muted-foreground">{user.email}</div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
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
};

export default FloatingNavbar;