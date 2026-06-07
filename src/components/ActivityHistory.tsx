import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { History, LogIn, LogOut, UserPlus, AlertTriangle } from "lucide-react";

const ICONS = {
  signup: UserPlus,
  login: LogIn,
  logout: LogOut,
  "failed-login": AlertTriangle,
} as const;

const VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  signup: "default",
  login: "secondary",
  logout: "outline",
  "failed-login": "destructive",
};

export function ActivityHistory() {
  const { history, user } = useAuth();
  const mine = history.filter((h) => h.email === user?.email).slice(0, 15);

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="font-display text-lg flex items-center gap-2">
          <History className="h-5 w-5" /> Account Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {mine.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">No activity yet</p>
        ) : (
          <ul className="space-y-2">
            {mine.map((h) => {
              const Icon = ICONS[h.action];
              return (
                <li
                  key={h.id}
                  className="flex items-center justify-between rounded-lg border bg-card p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                      <Icon className="h-4 w-4 text-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium capitalize">{h.action.replace("-", " ")}</p>
                      {h.detail && <p className="text-xs text-muted-foreground">{h.detail}</p>}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant={VARIANTS[h.action]} className="text-xs">
                      {new Date(h.timestamp).toLocaleDateString()}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(h.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
