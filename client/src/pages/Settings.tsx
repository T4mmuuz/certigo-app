import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Globe, Moon, Sun } from "lucide-react";
import { useLanguage, LANGUAGES } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Settings() {
  const { language, setLanguage, t } = useLanguage();
  const [pendingLanguage, setPendingLanguage] = useState(language);
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains("dark"));
  const { toast } = useToast();

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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-3xl font-bold text-foreground mb-8">{t("settings.title")}</h1>

        {/* Appearance */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Moon className="w-5 h-5 text-primary" />
              {t("settings.appearance")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="font-medium">{t("settings.darkMode")}</span>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={handleToggleDark}
                data-testid="button-toggle-dark"
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                {isDark ? "Light Mode" : "Dark Mode"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Language */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Globe className="w-5 h-5 text-primary" />
              {t("settings.language")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ScrollArea className="h-[420px] pr-3">
              <div className="space-y-1.5">
                {LANGUAGES.map((lang) => {
                  const isSelected = pendingLanguage === lang.code;
                  return (
                    <button
                      key={lang.code}
                      data-testid={`button-lang-${lang.code}`}
                      onClick={() => setPendingLanguage(lang.code)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all text-left ${
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/40 hover:bg-muted/30"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{lang.flag}</span>
                        <div>
                          <p className="font-semibold text-foreground">{lang.native}</p>
                          <p className="text-xs text-muted-foreground">{lang.name}</p>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                          <Check className="w-3.5 h-3.5 text-primary-foreground" />
                        </div>
                      )}
                      {language === lang.code && !isSelected && (
                        <Badge variant="outline" className="text-xs">Current</Badge>
                      )}
                    </button>
                  );
                })}
              </div>
            </ScrollArea>

            <Button
              className="w-full h-12 text-base"
              onClick={handleSaveLanguage}
              disabled={pendingLanguage === language}
              data-testid="button-save-language"
            >
              <Check className="w-4 h-4 mr-2" />
              {t("settings.saveLanguage")}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
