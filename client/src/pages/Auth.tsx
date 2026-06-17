import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ArrowRight, Loader2, CheckCircle, Mail } from "lucide-react";
import { SiGoogle, SiApple } from "react-icons/si";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import logoImage from "@assets/generated_images/certigo_professional_marketplace_logo.png";

export default function AuthPage() {
  const { login, register, isLoggingIn, isRegistering } = useAuth();
  const [, setLocation] = useLocation();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);

  // Login State
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register State
  const [regEmail, setRegEmail] = useState("");
  const [regName, setRegName] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [regRole, setRegRole] = useState<"customer" | "provider">("customer");
  const [regBio, setRegBio] = useState("");
  const [regCity, setRegCity] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ username: loginEmail, password: loginPassword });
      setLocation("/");
    } catch (e) {}
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (regPassword !== regConfirmPassword) {
      toast({ title: t("auth.passwordMismatch"), variant: "destructive" });
      return;
    }
    try {
      await register({
        username: regEmail,
        password: regPassword,
        name: regName,
        role: regRole,
        bio: regBio,
        city: regCity,
        // Default location: Houston, TX with slight random offset
        lat: 29.7604 + (Math.random() * 0.05 - 0.025),
        lng: -95.3698 + (Math.random() * 0.05 - 0.025),
      });
      setActiveTab("login");
    } catch (e) {}
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    // Simulated — no backend needed yet
    setForgotSent(true);
  };

  const handleSocialLogin = (provider: string) => {
    toast({ title: `${provider} login coming soon!`, description: "We're working on social login." });
  };

  const inputClass = "bg-background border-2 border-border focus:border-primary focus:ring-primary/20 text-foreground placeholder:text-muted-foreground";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 overflow-x-hidden">
      <div className="absolute inset-0 overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-primary/8 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <img src={logoImage} alt="CertiGo Logo" className="w-20 h-20 rounded-xl shadow-lg shadow-primary/30 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-foreground">CertiGo</h1>
          <p className="text-muted-foreground mt-1 text-sm">Find trusted local experts in minutes.</p>
        </div>

        <Card className="border-border shadow-2xl overflow-hidden bg-card">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
            <div className="p-1 mx-6 mt-6 bg-muted rounded-xl">
              <TabsList className="w-full grid grid-cols-2 bg-transparent p-0">
                <TabsTrigger value="login" data-testid="tab-login" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm">
                  {t("auth.login")}
                </TabsTrigger>
                <TabsTrigger value="register" data-testid="tab-register" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm">
                  {t("auth.signup")}
                </TabsTrigger>
              </TabsList>
            </div>

            <CardContent className="pt-6 pb-2">
              {/* LOGIN TAB */}
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">{t("auth.email")}</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="Enter your email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                      className={inputClass}
                      data-testid="input-login-email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">{t("auth.password")}</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                      className={inputClass}
                      data-testid="input-login-password"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-12 text-base font-semibold"
                    disabled={isLoggingIn}
                    data-testid="button-login"
                  >
                    {isLoggingIn ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ArrowRight className="w-4 h-4 mr-2" />}
                    {t("auth.login")}
                  </Button>
                </form>

                <div className="mt-3 text-center">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-sm text-primary hover:underline underline-offset-2"
                    data-testid="button-forgot-password"
                  >
                    {t("auth.forgotPassword")}
                  </button>
                </div>

                <SocialLoginSection onSelect={handleSocialLogin} t={t} />
              </TabsContent>

              {/* REGISTER TAB */}
              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reg-email">{t("auth.email")}</Label>
                    <Input
                      id="reg-email"
                      type="email"
                      placeholder="your@email.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      required
                      className={inputClass}
                      data-testid="input-reg-email"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reg-name">{t("auth.displayName")}</Label>
                    <Input
                      id="reg-name"
                      placeholder="John Doe"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      required
                      className={inputClass}
                      data-testid="input-reg-name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reg-password">{t("auth.password")}</Label>
                    <Input
                      id="reg-password"
                      type="password"
                      placeholder="••••••••"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      required
                      className={inputClass}
                      data-testid="input-reg-password"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reg-confirm-password">{t("auth.confirmPassword")}</Label>
                    <Input
                      id="reg-confirm-password"
                      type="password"
                      placeholder="••••••••"
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      required
                      className={`${inputClass} ${regConfirmPassword && regConfirmPassword !== regPassword ? "border-destructive" : ""}`}
                      data-testid="input-reg-confirm-password"
                    />
                    {regConfirmPassword && regConfirmPassword !== regPassword && (
                      <p className="text-xs text-destructive">{t("auth.passwordMismatch")}</p>
                    )}
                  </div>
                  <div className="space-y-3">
                    <Label>{t("auth.iWantTo")}</Label>
                    <RadioGroup
                      value={regRole}
                      onValueChange={(v) => setRegRole(v as any)}
                      className="grid grid-cols-2 gap-3"
                    >
                      <div>
                        <RadioGroupItem value="customer" id="reg-customer" className="peer sr-only" />
                        <Label
                          htmlFor="reg-customer"
                          className="flex flex-col items-center justify-center rounded-xl border-2 border-border bg-transparent py-4 px-2 hover:bg-muted/30 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all"
                        >
                          <span className="mb-2 text-2xl">🔍</span>
                          <span className="font-semibold text-sm">{t("auth.hireProf")}</span>
                        </Label>
                      </div>
                      <div>
                        <RadioGroupItem value="provider" id="reg-provider" className="peer sr-only" />
                        <Label
                          htmlFor="reg-provider"
                          className="flex flex-col items-center justify-center rounded-xl border-2 border-border bg-transparent py-4 px-2 hover:bg-muted/30 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all"
                        >
                          <span className="mb-2 text-2xl">🛠️</span>
                          <span className="font-semibold text-sm">{t("auth.offerWork")}</span>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {regRole === "provider" && (
                    <div className="space-y-2 animate-fade-in">
                      <Label htmlFor="reg-bio">{t("auth.bio")}</Label>
                      <Textarea
                        id="reg-bio"
                        placeholder="Tell clients about your experience..."
                        value={regBio}
                        onChange={(e) => setRegBio(e.target.value)}
                        className={inputClass}
                        rows={3}
                        data-testid="input-reg-bio"
                      />
                    </div>
                  )}

                                    <div className="space-y-2">
                    <Label htmlFor="reg-city">City</Label>
                    <Input
                      id="reg-city"
                      placeholder="e.g. Houston, TX"
                      value={regCity}
                      onChange={(e) => setRegCity(e.target.value)}
                      data-testid="input-reg-city"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-12 text-base font-semibold"
                    disabled={isRegistering}
                    data-testid="button-create-account"
                  >
                    {isRegistering ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                    {t("auth.createAccount")}
                  </Button>
                </form>

                <SocialLoginSection onSelect={handleSocialLogin} t={t} />
              </TabsContent>
            </CardContent>

            <CardFooter className="justify-center border-t border-border bg-muted/20 py-4 mt-2">
              <p className="text-xs text-muted-foreground text-center">
                By continuing, you agree to our Terms of Service and Privacy Policy.
              </p>
            </CardFooter>
          </Tabs>
        </Card>
      </div>

      {/* Forgot Password Modal */}
      <Dialog open={showForgotPassword} onOpenChange={(open) => {
        setShowForgotPassword(open);
        if (!open) { setForgotSent(false); setForgotEmail(""); }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-primary" />
              {t("auth.forgotPassword")}
            </DialogTitle>
            <DialogDescription>
              {t("auth.forgotPasswordDesc")}
            </DialogDescription>
          </DialogHeader>
          {!forgotSent ? (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <Input
                type="email"
                placeholder="your@email.com"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                required
                className="bg-background border-2 border-border focus:border-primary"
                data-testid="input-forgot-email"
              />
              <DialogFooter>
                <Button type="submit" className="w-full" data-testid="button-send-reset">
                  <Mail className="w-4 h-4 mr-2" />
                  {t("auth.sendReset")}
                </Button>
              </DialogFooter>
            </form>
          ) : (
            <div className="text-center py-4 space-y-3">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <p className="font-semibold text-foreground">Check your inbox!</p>
              <p className="text-sm text-muted-foreground">
                If an account exists for <strong>{forgotEmail}</strong>, we've sent password reset instructions.
              </p>
              <Button variant="outline" onClick={() => setShowForgotPassword(false)} className="w-full">
                {t("common.done")}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SocialLoginSection({ onSelect, t }: { onSelect: (p: string) => void; t: (k: any) => string }) {
  return (
    <div className="mt-5 space-y-3">
      <div className="relative flex items-center">
        <div className="flex-1 border-t border-border" />
        <span className="mx-3 text-xs text-muted-foreground font-medium">{t("auth.orContinueWith")}</span>
        <div className="flex-1 border-t border-border" />
      </div>
      <button
        type="button"
        onClick={() => { window.location.href = "/auth/google"; }}
        data-testid="button-google-login"
        className="w-full flex items-center justify-center gap-3 h-11 rounded-xl border-2 border-border bg-white dark:bg-zinc-900 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors text-sm font-medium text-gray-800 dark:text-gray-200"
      >
        <SiGoogle className="w-4 h-4 text-red-500" />
        {t("auth.continueGoogle")}
      </button>
      <button
        type="button"
        onClick={() => onSelect("Apple")}
        data-testid="button-apple-login"
        className="w-full flex items-center justify-center gap-3 h-11 rounded-xl border-2 border-transparent bg-black hover:bg-zinc-900 transition-colors text-sm font-medium text-white"
      >
        <SiApple className="w-4 h-4" />
        {t("auth.continueApple")}
      </button>
    </div>
  );
}
