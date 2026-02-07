import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTheme, THEMES } from '@/hooks/useTheme';
import { usePrayerNotifications } from '@/hooks/usePrayerNotifications';
import { useDailyVerseNotification } from '@/hooks/useDailyVerseNotification';
import { useExpandedNotifications } from '@/hooks/useExpandedNotifications';
import { useOfflineQuran } from '@/hooks/useOfflineQuran';
import { usePrayerTimes } from '@/hooks/usePrayerTimes';
import { CALCULATION_METHODS } from '@/hooks/usePrayerCalculationMethod';
import { useNativePushNotifications } from '@/hooks/useNativePushNotifications';
import { useLocalPrayerNotifications } from '@/hooks/useLocalPrayerNotifications';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, User, LogOut, Bell, Palette, Download, Wifi, WifiOff,
  Star, Bookmark, TrendingUp, ChevronRight, Send, Smartphone,
  Target, Calculator, CheckCircle2, XCircle, Clock
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const menuItems = [
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
    settings: notifSettings, 
    toggleNotifications, 
    togglePrayer, 
    setMinutesBefore,
    supported: notifSupported 
  } = usePrayerNotifications();
  
  const { 
    isOffline, 
    hasOfflineData, 
    downloading, 
    downloadProgress, 
    downloadForOffline,
    offlineData 
  } = useOfflineQuran();

  const {
    calculationMethod,
    setCalculationMethod
  } = usePrayerTimes();

  const {
    settings: nativeSettings,
    isNative,
    enableNotifications: enableNativeNotifications,
    disableNotifications: disableNativeNotifications,
  } = useNativePushNotifications();

  const {
    settings: localPrayerSettings,
    isNative: isLocalNative,
    permissionGranted: localPermissionGranted,
    enableNotifications: enableLocalPrayerNotifications,
    disableNotifications: disableLocalPrayerNotifications,
    togglePrayer: toggleLocalPrayer,
    setMinutesBefore: setLocalMinutesBefore,
  } = useLocalPrayerNotifications();

  const {
    settings: verseSettings,
    toggleNotifications: toggleVerseNotifications,
    setScheduledTime,
    sendVerseNotification,
    supported: verseNotifSupported
  } = useDailyVerseNotification();

  const {
    settings: expandedSettings,
    toggleReadingGoal,
    setDailyGoal,
    setReadingReminderTime,
    sendReadingReminder,
    supported: expandedNotifSupported
  } = useExpandedNotifications();

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

          {/* Theme */}
          <div className="space-y-3">
            <p className="text-xs font-medium text-muted-foreground uppercase flex items-center gap-2">
              <Palette className="w-4 h-4" /> Appearance
            </p>
            <Select value={theme} onValueChange={(v) => setTheme(v as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                {THEMES.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: t.primary }}
                      />
                      {t.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Prayer Calculation Method */}
          <div className="space-y-3">
            <p className="text-xs font-medium text-muted-foreground uppercase flex items-center gap-2">
              <Calculator className="w-4 h-4" /> Calculation Method
            </p>
            <Select 
              value={calculationMethod.toString()} 
              onValueChange={(v) => setCalculationMethod(parseInt(v))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent className="max-h-64">
                {CALCULATION_METHODS.map((m) => (
                  <SelectItem key={m.id} value={m.id.toString()}>
                    <div className="flex flex-col">
                      <span className="text-sm">{m.name}</span>
                      <span className="text-xs text-muted-foreground">{m.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Native Push Notifications */}
          <div className="space-y-3">
            <p className="text-xs font-medium text-muted-foreground uppercase flex items-center gap-2">
              <Smartphone className="w-4 h-4" /> Native Notifications
            </p>
            
            {isNative ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Push Notifications</span>
                    {nativeSettings.enabled ? (
                      <Badge variant="outline" className="text-primary border-primary/50 gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Enabled
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground gap-1">
                        <XCircle className="w-3 h-3" /> Disabled
                      </Badge>
                    )}
                  </div>
                  <Switch
                    checked={nativeSettings.enabled}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        enableNativeNotifications().then((success) => {
                          if (success) {
                            toast.success('Push notifications enabled');
                          } else {
                            toast.error('Failed to enable notifications');
                          }
                        });
                      } else {
                        disableNativeNotifications();
                        toast.info('Push notifications disabled');
                      }
                    }}
                  />
                </div>
                
                {nativeSettings.enabled && nativeSettings.token && (
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">Device Token</p>
                    <p className="text-xs font-mono text-foreground truncate">
                      {nativeSettings.token.substring(0, 30)}...
                    </p>
                  </div>
                )}
                
                <p className="text-xs text-muted-foreground">
                  Receive prayer reminders and daily verses as push notifications
                </p>
              </div>
            ) : (
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-sm text-muted-foreground">
                  Native push notifications are only available in the mobile app
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Install the app on your device to receive push notifications
                </p>
              </div>
            )}
          </div>

          <Separator />

          {/* Local Prayer Notifications (Native Only) */}
          {isLocalNative && (
            <>
              <div className="space-y-3">
                <p className="text-xs font-medium text-muted-foreground uppercase flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Prayer Alerts
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Prayer Time Alerts</span>
                    {localPrayerSettings.enabled ? (
                      <Badge variant="outline" className="text-primary border-primary/50 gap-1">
                        <CheckCircle2 className="w-3 h-3" /> On
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground gap-1">
                        <XCircle className="w-3 h-3" /> Off
                      </Badge>
                    )}
                  </div>
                  <Switch
                    checked={localPrayerSettings.enabled}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        enableLocalPrayerNotifications().then((success) => {
                          if (success) {
                            toast.success('Prayer alerts enabled');
                          } else {
                            toast.error('Permission denied for notifications');
                          }
                        });
                      } else {
                        disableLocalPrayerNotifications();
                        toast.info('Prayer alerts disabled');
                      }
                    }}
                  />
                </div>

                {localPrayerSettings.enabled && (
                  <>
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground">Notify before prayer:</p>
                      <Select 
                        value={localPrayerSettings.minutesBefore.toString()} 
                        onValueChange={(v) => setLocalMinutesBefore(parseInt(v))}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">5 minutes</SelectItem>
                          <SelectItem value="10">10 minutes</SelectItem>
                          <SelectItem value="15">15 minutes</SelectItem>
                          <SelectItem value="30">30 minutes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      {(['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const).map((prayer) => (
                        <div key={prayer} className="flex items-center justify-between">
                          <span className="text-sm">{prayer}</span>
                          <Switch
                            checked={localPrayerSettings.prayers[prayer]}
                            onCheckedChange={() => toggleLocalPrayer(prayer)}
                          />
                        </div>
                      ))}
                    </div>
                  </>
                )}

                <p className="text-xs text-muted-foreground">
                  Get notified before each prayer time directly on your device
                </p>
              </div>

              <Separator />
            </>
          )}

          {/* Prayer Notifications */}
          <div className="space-y-3">
            <p className="text-xs font-medium text-muted-foreground uppercase flex items-center gap-2">
              <Bell className="w-4 h-4" /> Web Notifications
            </p>
            
            {notifSupported && !isNative ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Enable Notifications</span>
                  <Switch
                    checked={notifSettings.enabled}
                    onCheckedChange={toggleNotifications}
                  />
                </div>

                {notifSettings.enabled && (
                  <>
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground">Notify before prayer:</p>
                      <Select 
                        value={notifSettings.minutesBefore.toString()} 
                        onValueChange={(v) => setMinutesBefore(parseInt(v))}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">5 minutes</SelectItem>
                          <SelectItem value="10">10 minutes</SelectItem>
                          <SelectItem value="15">15 minutes</SelectItem>
                          <SelectItem value="30">30 minutes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      {(['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const).map((prayer) => (
                        <div key={prayer} className="flex items-center justify-between">
                          <span className="text-sm">{prayer}</span>
                          <Switch
                            checked={notifSettings.prayers[prayer]}
                            onCheckedChange={() => togglePrayer(prayer)}
                          />
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                {isNative ? 'Use Native Notifications above instead' : 'Notifications not supported on this device'}
              </p>
            )}
          </div>

          <Separator />

          {/* Daily Verse Notification */}
          <div className="space-y-3">
            <p className="text-xs font-medium text-muted-foreground uppercase flex items-center gap-2">
              <Send className="w-4 h-4" /> Daily Verse
            </p>
            
            {verseNotifSupported ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Enable Daily Verse</span>
                  <Switch
                    checked={verseSettings.enabled}
                    onCheckedChange={toggleVerseNotifications}
                  />
                </div>

                {verseSettings.enabled && (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground">Time to receive verse:</p>
                      <Input
                        type="time"
                        value={verseSettings.scheduledTime}
                        onChange={(e) => setScheduledTime(e.target.value)}
                        className="h-9"
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={sendVerseNotification}
                      className="w-full gap-2"
                    >
                      <Send className="w-4 h-4" />
                      Send Test Verse
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Notifications not supported on this device
              </p>
            )}
          </div>

          <Separator />

          {/* Reading Goals */}
          {expandedNotifSupported && (
            <>
              <div className="space-y-3">
                <p className="text-xs font-medium text-muted-foreground uppercase flex items-center gap-2">
                  <Target className="w-4 h-4" /> Reading Goals
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Daily Reading Reminder</span>
                  <Switch
                    checked={expandedSettings.readingGoal.enabled}
                    onCheckedChange={toggleReadingGoal}
                  />
                </div>

                {expandedSettings.readingGoal.enabled && (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground">Daily goal (pages):</p>
                      <Select 
                        value={expandedSettings.readingGoal.dailyGoal.toString()} 
                        onValueChange={(v) => setDailyGoal(parseInt(v))}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 page</SelectItem>
                          <SelectItem value="3">3 pages</SelectItem>
                          <SelectItem value="5">5 pages</SelectItem>
                          <SelectItem value="10">10 pages</SelectItem>
                          <SelectItem value="20">20 pages (1 Juz)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground">Reminder time:</p>
                      <Input
                        type="time"
                        value={expandedSettings.readingGoal.reminderTime}
                        onChange={(e) => setReadingReminderTime(e.target.value)}
                        className="h-8"
                      />
                    </div>
                    <Button variant="outline" size="sm" onClick={sendReadingReminder} className="w-full text-xs">
                      Test Reading Reminder
                    </Button>
                  </div>
                )}
              </div>

              <Separator />
            </>
          )}

          {/* Offline Reading */}
          <div className="space-y-3">
            <p className="text-xs font-medium text-muted-foreground uppercase flex items-center gap-2">
              {isOffline ? <WifiOff className="w-4 h-4" /> : <Wifi className="w-4 h-4" />}
              Offline Reading
            </p>
            
            {hasOfflineData ? (
              <div className="space-y-2">
                <p className="text-sm text-primary flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  {offlineData.surahs.length} surahs available offline
                </p>
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
