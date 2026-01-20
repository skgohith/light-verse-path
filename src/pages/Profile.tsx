import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { MobileNav } from '@/components/MobileNav';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, LogOut, BookOpen, Star, RotateCcw, Settings } from 'lucide-react';
import { toast } from 'sonner';

export default function Profile() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out successfully');
    navigate('/');
  };

  if (!user) {
    navigate('/auth');
    return null;
  }

  return (
    <div className="min-h-screen bg-background dark flex flex-col">
      <Header />
      <main className="flex-1 py-6 px-4 pb-24">
        <div className="max-w-lg mx-auto">
          {/* Profile Header */}
          <div className="text-center mb-8">
            <Avatar className="w-20 h-20 mx-auto mb-4">
              <AvatarFallback className="bg-primary/20 text-primary text-2xl">
                {user.email?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <h1 className="text-xl font-bold text-foreground">{user.email}</h1>
            <p className="text-sm text-muted-foreground">Member since {new Date(user.created_at).toLocaleDateString()}</p>
          </div>

          {/* Quick Links */}
          <div className="grid gap-3 mb-6">
            <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => navigate('/tasbeeh')}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Star className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Tasbeeh Counter</p>
                  <p className="text-sm text-muted-foreground">Track your dhikr</p>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => navigate('/memorization')}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Memorization Tracker</p>
                  <p className="text-sm text-muted-foreground">Track your hifz progress</p>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => navigate('/bookmarks')}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <RotateCcw className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Bookmarks</p>
                  <p className="text-sm text-muted-foreground">Your saved verses</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sign Out */}
          <Button variant="outline" onClick={handleSignOut} className="w-full gap-2">
            <LogOut className="w-4 h-4" /> Sign Out
          </Button>
        </div>
      </main>
      <MobileNav />
      <Footer className="hidden md:block" />
    </div>
  );
}
