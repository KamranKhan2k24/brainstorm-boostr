import { Zap, LogOut, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AppHeaderProps {
  user: { email?: string } | null;
  onLogout: () => void;
  onLogin: () => void;
}

export default function AppHeader({ user, onLogout, onLogin }: AppHeaderProps) {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
            <Zap size={18} className="text-primary-foreground" />
          </div>
          <span className="font-bold text-foreground text-lg">IdeaForge</span>
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="text-sm text-muted-foreground hidden sm:inline">{user.email}</span>
              <Button variant="ghost" size="sm" onClick={onLogout}>
                <LogOut size={16} /> <span className="hidden sm:inline">Logout</span>
              </Button>
            </>
          ) : (
            <Button variant="subtle" size="sm" onClick={onLogin}>
              <LogIn size={16} /> Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
