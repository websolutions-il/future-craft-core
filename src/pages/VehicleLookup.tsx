import { useState } from "react";
import { Search, Car, ArrowRight, Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface VehicleResult {
  [key: string]: string | number;
}

// Local frontend cache
const lookupCache = new Map<string, { data: VehicleResult; ts: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000;

export default function VehicleLookup() {
  const [plate, setPlate] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VehicleResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLookup = async () => {
    const clean = plate.replace(/[-\s]/g, "");
    if (!clean || clean.length < 5) {
      toast.error("יש להזין מספר רכב תקין (לפחות 5 ספרות)");
      return;
    }

    // Check frontend cache
    const cached = lookupCache.get(clean);
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
      setResult(cached.data);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/vehicle-lookup?plate=${clean}`,
        {
          headers: {
            Authorization: `Bearer ${anonKey}`,
            apikey: anonKey,
          },
        }
      );

      const json = await res.json();

      if (!res.ok) {
        setError(json.error || "שגיאה בחיבור למשרד התחבורה");
        return;
      }

      setResult(json.data);
      lookupCache.set(clean, { data: json.data, ts: Date.now() });
    } catch (err) {
      console.error(err);
      setError("שגיאה בחיבור למשרד התחבורה");
    } finally {
      setLoading(false);
    }
  };

  const fieldIcons: Record<string, string> = {
    "מספר רכב": "🔢",
    "יצרן": "🏭",
    "דגם": "📋",
    "כינוי מסחרי": "🏷️",
    "שנת ייצור": "📅",
    "סוג בעלות": "👤",
    "סוג דלק": "⛽",
    "צבע": "🎨",
    "תוקף רישוי": "📄",
    "טסט אחרון": "🔧",
    "מספר שלדה": "🔩",
    "רמת גימור": "⭐",
    "דגם מנוע": "⚙️",
    "צמיג קדמי": "🛞",
    "צמיג אחורי": "🛞",
    "עלייה לכביש": "🛣️",
  };

  return (
    <div className="p-4 max-w-2xl mx-auto" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Car className="h-7 w-7 text-primary" />
          בדיקת מספר רכב
        </h1>
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          חזרה <ArrowRight className="h-4 w-4 mr-1" />
        </Button>
      </div>

      {/* Search Section */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Input
              placeholder="הזן מספר רכב..."
              value={plate}
              onChange={(e) => setPlate(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLookup()}
              className="text-lg text-center font-mono tracking-wider"
              maxLength={10}
            />
            <Button onClick={handleLookup} disabled={loading} className="min-w-[100px]">
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Search className="h-4 w-4 ml-2" />
                  בדוק
                </>
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            נתונים ממאגר משרד התחבורה • data.gov.il
          </p>
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <Card className="mb-6 border-destructive/50 bg-destructive/5">
          <CardContent className="pt-6 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
            <p className="text-destructive font-medium">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Result */}
      {result && (
        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-xl">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              🚗 פרטי רכב
              {result["יצרן"] && (
                <Badge variant="secondary" className="text-sm font-normal mr-auto">
                  {String(result["יצרן"])} {result["דגם"] ? `- ${result["דגם"]}` : ""}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(result).map(([key, val]) => (
                <div
                  key={key}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border/50"
                >
                  <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <span>{fieldIcons[key] || "📌"}</span>
                    {key}
                  </span>
                  <span className="font-medium text-sm text-foreground">{String(val)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
