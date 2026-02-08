import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTheme, THEMES } from '@/hooks/useTheme';
import { useOfflineQuran } from '@/hooks/useOfflineQuran';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, User, LogOut, Palette, Download, Wifi, WifiOff,
  Star, Bookmark, TrendingUp, ChevronRight, BookOpen, Moon
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const menuItems = [
  { path: '/read', icon: BookOpen, label: 'Read Quran' },
  { path: '/tasbeeh', icon: Star, label: 'Tasbeeh Counter' },
  { path: '/memorization', icon: TrendingUp, label: 'Memorization' },
  { path: '/bookmarks', icon: Bookmark, label: 'Bookmarks' },
];

export function SettingsSidebar() {
  const [open, setOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  
  const { 
    isOffline, 
    hasOfflineData, 
    downloading, 
    downloadProgress, 
    downloadForOffline,
    offlineData 
  } = useOfflineQuran();

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out');
    navigate('/');
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="text-muted-foreground">
          <Settings className="w-5 h-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80 overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Settings
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* User Section */}
          <div className="space-y-3">
            {user ? (
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{user.email}</p>
                  <p className="text-xs text-muted-foreground">Signed in</p>
                </div>
              </div>
            ) : (
              <Button 
                onClick={() => { navigate('/auth'); setOpen(false); }} 
                className="w-full gap-2"
              >
                <User className="w-4 h-4" /> Sign In
              </Button>
            )}
          </div>

          <Separator />

          {/* Quick Links */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase">Quick Access</p>
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg transition-colors",
                  location.pathname === item.path 
                    ? "bg-primary/10 text-primary" 
                    : "hover:bg-muted text-foreground"
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-4 h-4" />
                  <span className="text-sm">{item.label}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </Link>
            ))}
          </div>

          <Separator />

          {/* Theme Selection */}
          <div className="space-y-3">
            <p className="text-xs font-medium text-muted-foreground uppercase flex items-center gap-2">
              <Palette className="w-4 h-4" /> Theme
            </p>
            <div className="grid grid-cols-2 gap-2">
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id as any)}
                  className={cn(
                    "flex items-center gap-2 p-3 rounded-lg border transition-all text-left",
                    theme === t.id 
                      ? "border-primary bg-primary/10" 
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <div 
                    className="w-5 h-5 rounded-full flex-shrink-0" 
                    style={{ backgroundColor: t.primary }}
                  />
                  <span className="text-xs font-medium truncate">{t.name}</span>
                </button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Offline Reading */}
          <div className="space-y-3">
            <p className="text-xs font-medium text-muted-foreground uppercase flex items-center gap-2">
              {isOffline ? <WifiOff className="w-4 h-4" /> : <Wifi className="w-4 h-4" />}
              Offline Reading
            </p>
            
            {hasOfflineData ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-primary border-primary/50">
                    <Download className="w-3 h-3 mr-1" />
                    {offlineData.surahs.length} surahs saved
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Last updated: {offlineData.lastUpdated ? new Date(offlineData.lastUpdated).toLocaleDateString() : 'Never'}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No offline data saved</p>
            )}
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={downloadForOffline}
              disabled={downloading}
              className="w-full gap-2"
            >
              <Download className="w-4 h-4" />
              {downloading ? 'Downloading...' : 'Download for Offline'}
            </Button>
            
            {downloading && (
              <Progress value={downloadProgress} className="h-2" />
            )}
          </div>

          <Separator />

          {/* Sign Out */}
          {user && (
            <Button 
              variant="outline" 
              onClick={handleSignOut}
              className="w-full gap-2 text-destructive hover:text-destructive"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
