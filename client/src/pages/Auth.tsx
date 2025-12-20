import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowRight, Loader2, CheckCircle } from "lucide-react";
import logoImage from "@assets/generated_images/certigo_professional_marketplace_logo.png";

export default function AuthPage() {
  const { login, register, isLoggingIn, isRegistering } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  // Login State
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register State
  const [regUsername, setRegUsername] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regName, setRegName] = useState("");
  const [regRole, setRegRole] = useState<"customer" | "provider">("customer");
  const [regBio, setRegBio] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ username: loginUsername, password: loginPassword });
      setLocation("/");
    } catch (e) {
      // Toast handled in hook
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register({
        username: regUsername,
        password: regPassword,
        name: regName,
        role: regRole,
        bio: regBio,
        lat: 40.7128 + (Math.random() * 0.05 - 0.025), // Mock random location near NY
        lng: -74.0060 + (Math.random() * 0.05 - 0.025)
      });
      // Assuming auto-login or redirect
      setActiveTab("login");
    } catch (e) {
      // Toast handled in hook
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-pink-50 flex items-center justify-center p-4">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
         <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-200/10 rounded-full blur-3xl" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-red-200/15 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <img src={logoImage} alt="CertiGo Logo" className="w-16 h-16 rounded-xl shadow-lg shadow-primary/30 mx-auto mb-4" />
          <h1 className="text-3xl font-display font-bold text-foreground">CertiGo</h1>
          <p className="text-muted-foreground mt-2">Find trusted local experts in minutes.</p>
        </div>

        <Card className="border-border/60 shadow-xl overflow-hidden backdrop-blur-sm bg-white/80">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
            <div className="p-1 mx-6 mt-6 bg-secondary rounded-lg">
              <TabsList className="w-full grid grid-cols-2 bg-transparent p-0">
                <TabsTrigger value="login" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">Log In</TabsTrigger>
                <TabsTrigger value="register" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">Sign Up</TabsTrigger>
              </TabsList>
            </div>

            <CardContent className="pt-6">
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input 
                      id="username" 
                      placeholder="Enter your username"
                      value={loginUsername}
                      onChange={(e) => setLoginUsername(e.target.value)}
                      required
                      className="bg-white border-2 border-red-300 focus:border-red-500 focus:ring-red-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input 
                      id="password" 
                      type="password" 
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                      className="bg-white border-2 border-red-300 focus:border-red-500 focus:ring-red-200"
                    />
                  </div>
                  <Button type="submit" className="w-full mt-2" disabled={isLoggingIn}>
                    {isLoggingIn ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ArrowRight className="w-4 h-4 mr-2" />}
                    Log In
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="reg-username">Username</Label>
                      <Input 
                        id="reg-username" 
                        value={regUsername}
                        onChange={(e) => setRegUsername(e.target.value)}
                        required
                        className="bg-white border-2 border-red-300 focus:border-red-500 focus:ring-red-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-name">Display Name</Label>
                      <Input 
                        id="reg-name" 
                        placeholder="John Doe"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        required
                        className="bg-white border-2 border-red-300 focus:border-red-500 focus:ring-red-200"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="reg-password">Password</Label>
                    <Input 
                      id="reg-password" 
                      type="password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      required
                      className="bg-white border-2 border-red-300 focus:border-red-500 focus:ring-red-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>I want to...</Label>
                    <RadioGroup 
                      defaultValue="customer" 
                      value={regRole} 
                      onValueChange={(v) => setRegRole(v as any)}
                      className="grid grid-cols-2 gap-4"
                    >
                      <div>
                        <RadioGroupItem value="customer" id="customer" className="peer sr-only" />
                        <Label
                          htmlFor="customer"
                          className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-transparent p-4 hover:bg-secondary/50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:text-primary cursor-pointer transition-all"
                        >
                          <span className="mb-2 text-xl">🔍</span>
                          Hire Pros
                        </Label>
                      </div>
                      <div>
                        <RadioGroupItem value="provider" id="provider" className="peer sr-only" />
                        <Label
                          htmlFor="provider"
                          className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-transparent p-4 hover:bg-secondary/50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:text-primary cursor-pointer transition-all"
                        >
                          <span className="mb-2 text-xl">🛠️</span>
                          Offer Work
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {regRole === 'provider' && (
                    <div className="space-y-2 animate-fade-in">
                      <Label htmlFor="bio">Professional Bio</Label>
                      <Textarea 
                        id="bio" 
                        placeholder="Tell clients about your experience..."
                        value={regBio}
                        onChange={(e) => setRegBio(e.target.value)}
                        className="bg-white border-2 border-red-300 focus:border-red-500 focus:ring-red-200"
                      />
                    </div>
                  )}

                  <Button type="submit" className="w-full mt-4" disabled={isRegistering}>
                    {isRegistering ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                    Create Account
                  </Button>
                </form>
              </TabsContent>
            </CardContent>
            <CardFooter className="justify-center border-t bg-muted/20 py-4">
              <p className="text-xs text-muted-foreground text-center">
                By continuing, you agree to our Terms of Service <br/> and Privacy Policy.
              </p>
            </CardFooter>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
