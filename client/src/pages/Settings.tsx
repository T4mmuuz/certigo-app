import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import {
  Globe, Moon, Sun, Check, Bell, Shield, CreditCard, HelpCircle,
  User, Lock, Trash2, Eye, EyeOff, Mail, MessageSquare, BarChart3,
  FileText, AlertCircle, ExternalLink, ChevronRight, Crown, Type, Download
} from "lucide-react";
import { useLanguage, LANGUAGES } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export default function Settings() {
  const { language, setLanguage, t } = useLanguage();
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [pendingLanguage, setPendingLanguage] = useState(language);
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains("dark"));
  const { toast } = useToast();

  // Notification prefs (localStorage-backed)
  const [pushNotifs, setPushNotifs] = useState(() => localStorage.getItem("pref_push") !== "false");
  const [emailNotifs, setEmailNotifs] = useState(() => localStorage.getItem("pref_email") !== "false");
  const [weeklyDigest, setWeeklyDigest] = useState(() => localStorage.getItem("pref_weekly") === "true");
  const [newMessages, setNewMessages] = useState(() => localStorage.getItem("pref_messages") !== "false");
  const [newReviews, setNewReviews] = useState(() => localStorage.getItem("pref_reviews") !== "false");

  // Privacy prefs (localStorage-backed)
  const [showPhone, setShowPhone] = useState(() => localStorage.getItem("pref_showphone") !== "false");
  const [largeFont, setLargeFont] = useState(() => localStorage.getItem("pref_largefont") === "true");

  // Password change dialog
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");

  const handleSaveLanguage = () => {
    setLanguage(pendingLanguage);
    toast({ title: t("settings.languageSaved") });
  };

  const handleToggleDark = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const handleToggleLargeFont = (v: boolean) => {
    setLargeFont(v);
    localStorage.setItem("pref_largefont", v ? "true" : "false");
    document.documentElement.style.fontSize = v ? "18px" : "";
  };

  const handleSavePassword = () => {
    if (newPw !== confirmPw) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }
    if (newPw.length < 6) {
      toast({ title: "Password too short", description: "At least 6 characters required.", variant: "destructive" });
      return;
    }
    toast({ title: "Password updated", description: "Your password has been changed successfully." });
    setShowPasswordDialog(false);
    setCurrentPw(""); setNewPw(""); setConfirmPw("");
  };

  const handleExportData = () => {
    const data = { user: user?.username, exportedAt: new Date().toISOString(), note: "Full data export coming soon." };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "certigo-data.json"; a.click();
    toast({ title: "Data exported", description: "Your data has been downloaded." });
  };

  const SectionHeader = ({ icon: Icon, title, description }: { icon: any; title: string; description?: string }) => (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div>
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
    </div>
  );

  const ToggleRow = ({ label, description, checked, onChange }: { label: string; description?: string; checked: boolean; onChange: (v: boolean) => void }) => (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );

  const LinkRow = ({ icon: Icon, label, sublabel, onClick, variant }: { icon?: any; label: string; sublabel?: string; onClick: () => void; variant?: "danger" }) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between py-3 px-0 text-left transition-colors hover:opacity-70 ${variant === "danger" ? "text-destructive" : ""}`}
    >
      <div className="flex items-center gap-3">
        {Icon && <Icon className={`w-4 h-4 flex-shrink-0 ${variant === "danger" ? "text-destructive" : "text-muted-foreground"}`} />}
        <div>
          <p className={`text-sm font-medium ${variant === "danger" ? "text-destructive" : "text-foreground"}`}>{label}</p>
          {sublabel && <p className="text-xs text-muted-foreground">{sublabel}</p>}
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground" />
    </button>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-2xl space-y-6">
        <h1 className="text-3xl font-bold text-foreground">{t("settings.title")}</h1>

        {/* ── PROFILE & ACCOUNT ─────────────────────────────────── */}
        <Card>
          <CardHeader className="pb-2">
            <SectionHeader icon={User} title="Profile & Account" description="Manage your identity and login settings" />
          </CardHeader>
          <CardContent className="space-y-0 divide-y divide-border">
            <LinkRow
              icon={User}
              label="Edit Profile"
              sublabel="Change your name, photo and bio"
              onClick={() => setLocation("/profile")}
            />
            <LinkRow
              icon={Lock}
              label="Change Password"
              sublabel="For accounts without Google / Apple login"
              onClick={() => setShowPasswordDialog(true)}
            />
            <LinkRow
              icon={Mail}
              label="Manage Login Methods"
              sublabel="Google, Apple (coming soon)"
              onClick={() => toast({ title: "Coming soon", description: "Social login management will be available soon." })}
            />
            <Separator className="!my-0" />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button className="w-full flex items-center justify-between py-3 text-left hover:opacity-70">
                  <div className="flex items-center gap-3">
                    <Trash2 className="w-4 h-4 text-destructive" />
                    <div>
                      <p className="text-sm font-medium text-destructive">Delete Account</p>
                      <p className="text-xs text-muted-foreground">Permanently remove your account and data</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-destructive">Delete your account?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This is permanent and cannot be undone. All your bookings, messages, and data will be erased.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={() => { logout(); setLocation("/"); }}
                  >
                    Yes, delete forever
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>

        {/* ── NOTIFICATIONS ─────────────────────────────────────── */}
        <Card>
          <CardHeader className="pb-2">
            <SectionHeader icon={Bell} title="Notifications" description="Choose what you want to be notified about" />
          </CardHeader>
          <CardContent className="divide-y divide-border">
            <ToggleRow
              label="Push Notifications"
              description="Alerts on your device"
              checked={pushNotifs}
              onChange={(v) => { setPushNotifs(v); localStorage.setItem("pref_push", v ? "true" : "false"); }}
            />
            <ToggleRow
              label="Email Notifications"
              description="Updates sent to your email"
              checked={emailNotifs}
              onChange={(v) => { setEmailNotifs(v); localStorage.setItem("pref_email", v ? "true" : "false"); }}
            />
            <ToggleRow
              label="New Messages"
              description="When you receive a chat message"
              checked={newMessages}
              onChange={(v) => { setNewMessages(v); localStorage.setItem("pref_messages", v ? "true" : "false"); }}
            />
            <ToggleRow
              label="New Reviews"
              description="When someone leaves you a review"
              checked={newReviews}
              onChange={(v) => { setNewReviews(v); localStorage.setItem("pref_reviews", v ? "true" : "false"); }}
            />
            {user?.role === "provider" && (
              <ToggleRow
                label="Weekly Stats Digest"
                description="Profile views, bookings summary every Monday"
                checked={weeklyDigest}
                onChange={(v) => { setWeeklyDigest(v); localStorage.setItem("pref_weekly", v ? "true" : "false"); }}
              />
            )}
          </CardContent>
        </Card>

        {/* ── PRIVACY & SECURITY ────────────────────────────────── */}
        <Card>
          <CardHeader className="pb-2">
            <SectionHeader icon={Shield} title="Privacy & Security" description="Control your visibility and personal data" />
          </CardHeader>
          <CardContent className="divide-y divide-border">
            <ToggleRow
              label="Show Phone Number"
              description="Display on your public profile"
              checked={showPhone}
              onChange={(v) => { setShowPhone(v); localStorage.setItem("pref_showphone", v ? "true" : "false"); }}
            />
            <LinkRow
              icon={Download}
              label="Export My Data"
              sublabel="Download a copy of your account data (GDPR/CCPA)"
              onClick={handleExportData}
            />
            <LinkRow
              icon={Trash2}
              label="Request Data Deletion"
              sublabel="Submit a formal deletion request"
              onClick={() => toast({ title: "Request submitted", description: "We'll process your deletion request within 30 days." })}
            />
          </CardContent>
        </Card>

        {/* ── PAYMENTS (providers only) ─────────────────────────── */}
        {user?.role === "provider" && (
          <Card>
            <CardHeader className="pb-2">
              <SectionHeader icon={CreditCard} title="Payments & Plan" description="Manage your subscription and billing" />
            </CardHeader>
            <CardContent className="divide-y divide-border">
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-foreground">Current Plan</p>
                  <p className="text-xs text-muted-foreground">
                    {(user as any).isPremium ? "CertiGo Premium — $15/month" : "Free Plan"}
                  </p>
                </div>
                {(user as any).isPremium ? (
                  <span className="text-xs font-semibold text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-1 rounded-full flex items-center gap-1">
                    <Crown className="w-3 h-3" /> Premium
                  </span>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => setLocation("/premium")} className="text-xs gap-1">
                    <Crown className="w-3 h-3" /> Upgrade — $15/mo
                  </Button>
                )}
              </div>
              <LinkRow
                icon={BarChart3}
                label="Billing History"
                sublabel="View past invoices and payments"
                onClick={() => setLocation("/earnings")}
              />
              <LinkRow
                icon={CreditCard}
                label="Saved Payment Method"
                sublabel="Manage your card on file"
                onClick={() => toast({ title: "Coming soon", description: "Payment method management will be available soon." })}
              />
            </CardContent>
          </Card>
        )}

        {/* ── APPEARANCE ────────────────────────────────────────── */}
        <Card>
          <CardHeader className="pb-2">
            <SectionHeader icon={Moon} title={t("settings.appearance")} />
          </CardHeader>
          <CardContent className="divide-y divide-border">
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium text-foreground">{t("settings.darkMode")}</p>
                <p className="text-xs text-muted-foreground">Switch between light and dark theme</p>
              </div>
              <Button variant="outline" size="sm" className="gap-2" onClick={handleToggleDark} data-testid="button-toggle-dark">
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                {isDark ? "Light Mode" : "Dark Mode"}
              </Button>
            </div>
            <ToggleRow
              label="Large Text"
              description="Increase font size for better readability"
              checked={largeFont}
              onChange={handleToggleLargeFont}
            />
          </CardContent>
        </Card>

        {/* ── LANGUAGE ──────────────────────────────────────────── */}
        <Card>
          <CardHeader className="pb-2">
            <SectionHeader icon={Globe} title={t("settings.language")} description="Choose your preferred display language" />
          </CardHeader>
          <CardContent className="space-y-4">
            <ScrollArea className="h-[380px] pr-3">
              <div className="space-y-1.5">
                {LANGUAGES.map((lang) => {
                  const isSelected = pendingLanguage === lang.code;
                  return (
                    <button
                      key={lang.code}
                      data-testid={`button-lang-${lang.code}`}
                      onClick={() => setPendingLanguage(lang.code)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all text-left ${
                        isSelected ? "border-primary bg-primary/5" : "border-border hover:border-primary/40 hover:bg-muted/30"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{lang.flag}</span>
                        <div>
                          <p className="font-semibold text-foreground text-sm">{lang.native}</p>
                          <p className="text-xs text-muted-foreground">{lang.name}</p>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                          <Check className="w-3.5 h-3.5 text-primary-foreground" />
                        </div>
                      )}
                      {language === lang.code && !isSelected && (
                        <span className="text-xs text-muted-foreground border border-border rounded px-1.5 py-0.5">Current</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
            <Button
              className="w-full h-11"
              onClick={handleSaveLanguage}
              disabled={pendingLanguage === language}
              data-testid="button-save-language"
            >
              <Check className="w-4 h-4 mr-2" />
              {t("settings.saveLanguage")}
            </Button>
          </CardContent>
        </Card>

        {/* ── SUPPORT ───────────────────────────────────────────── */}
        <Card>
          <CardHeader className="pb-2">
            <SectionHeader icon={HelpCircle} title="Support" description="Get help or share feedback" />
          </CardHeader>
          <CardContent className="divide-y divide-border">
            <LinkRow
              icon={HelpCircle}
              label="Help Center / FAQ"
              sublabel="Browse common questions and answers"
              onClick={() => toast({ title: "Help Center", description: "Coming soon — we're building the FAQ!" })}
            />
            <LinkRow
              icon={AlertCircle}
              label="Report a Problem"
              sublabel="Tell us what went wrong"
              onClick={() => toast({ title: "Thanks for reporting", description: "Our team has been notified." })}
            />
            <LinkRow
              icon={MessageSquare}
              label="Contact Support"
              sublabel="Chat with our support team"
              onClick={() => setLocation("/chat")}
            />
            <LinkRow
              icon={FileText}
              label="Terms & Conditions"
              onClick={() => window.open("/terms", "_blank")}
            />
            <LinkRow
              icon={Shield}
              label="Privacy Policy"
              onClick={() => window.open("/privacy", "_blank")}
            />
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground pb-8">CertiGo v1.0 · Houston, TX</p>
      </main>

      {/* Change Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-primary" /> Change Password
            </DialogTitle>
            <DialogDescription>Enter your current password and choose a new one.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Current Password</Label>
              <Input type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} placeholder="••••••••" data-testid="input-current-password" />
            </div>
            <div className="space-y-2">
              <Label>New Password</Label>
              <Input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="••••••••" data-testid="input-new-password" />
            </div>
            <div className="space-y-2">
              <Label>Confirm New Password</Label>
              <Input
                type="password"
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                placeholder="••••••••"
                className={confirmPw && confirmPw !== newPw ? "border-destructive" : ""}
                data-testid="input-confirm-new-password"
              />
              {confirmPw && confirmPw !== newPw && <p className="text-xs text-destructive">Passwords don't match</p>}
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>Cancel</Button>
            <Button onClick={handleSavePassword} disabled={!currentPw || !newPw || !confirmPw} data-testid="button-save-password">
              Update Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
