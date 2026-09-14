import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Activity, RefreshCw, CheckCircle2, XCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export interface WebhookLog {
  id: string;
  user_id: string;
  event_type: string;
  workflow_name: string;
  trigger: string | null;
  retry_count: number;
  request_payload: any;
  response_payload: any;
  status_code: number;
  outcome: string;
  idempotency_key: string | null;
  created_at: string;
}

export function WebhookStatusLogs() {
  const [selectedLog, setSelectedLog] = useState<WebhookLog | null>(null);

  const { data: logs, isLoading, refetch, isRefetching } = useQuery<WebhookLog[]>({
    queryKey: ["webhook_logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("webhook_logs" as any)
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) {
        console.error("Error fetching webhook logs:", error);
        return [];
      }
      return (data as unknown) as WebhookLog[];
    },
    refetchInterval: 10000,
  });

  const getOutcomeBadge = (outcome: string, statusCode: number) => {
    if (outcome === "success" || (statusCode >= 200 && statusCode < 300 && outcome !== "duplicate")) {
      return (
        <Badge variant="outline" className="bg-success/10 text-success border-success/20 gap-1">
          <CheckCircle2 className="w-3 h-3" /> Success
        </Badge>
      );
    }
    if (outcome === "duplicate") {
      return (
        <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20 gap-1">
          <RefreshCw className="w-3 h-3" /> Duplicate (Ignored)
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 gap-1">
        <XCircle className="w-3 h-3" /> Failed ({statusCode})
      </Badge>
    );
  };

  return (
    <div className="glass-panel p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10">
            <Activity className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Webhook Execution & Retry Logs</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Live status, triggers, retry counts, and outcome details for n8n webhooks (<code className="font-mono text-[11px] text-primary">http://localhost:5678/mcp-server/http</code>)
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isRefetching}
          className="gap-2"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefetching ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {isLoading ? (
        <div className="py-8 text-center text-sm text-muted-foreground">Loading webhook execution logs...</div>
      ) : !logs || logs.length === 0 ? (
        <div className="py-8 text-center text-sm text-muted-foreground border border-dashed rounded-lg">
          No webhook executions logged yet. Trigger your n8n workflows or verification script to see logs.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Workflow / Event</TableHead>
                <TableHead>Trigger</TableHead>
                <TableHead>Retry Count</TableHead>
                <TableHead>Status Code</TableHead>
                <TableHead>Outcome</TableHead>
                <TableHead className="text-right">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-xs whitespace-nowrap">
                    {format(new Date(log.created_at), "MMM d, HH:mm:ss")}
                  </TableCell>
                  <TableCell className="font-medium text-xs">
                    <div>{log.workflow_name}</div>
                    <div className="text-[10px] text-muted-foreground">{log.event_type}</div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {log.trigger || "—"}
                  </TableCell>
                  <TableCell className="text-xs">
                    <Badge variant="secondary" className="font-mono text-[11px]">
                      {log.retry_count} retries
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs font-mono">
                    <span className={log.status_code < 400 ? "text-success font-semibold" : "text-destructive font-semibold"}>
                      {log.status_code}
                    </span>
                  </TableCell>
                  <TableCell>{getOutcomeBadge(log.outcome, log.status_code)}</TableCell>
                  <TableCell className="text-right">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedLog(log)}
                          className="h-7 text-xs gap-1"
                        >
                          <Info className="w-3.5 h-3.5" /> Payload
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-xl">
                        <DialogHeader>
                          <DialogTitle className="text-base font-semibold">
                            Webhook Execution Details
                          </DialogTitle>
                        </DialogHeader>
                        {selectedLog && (
                          <div className="space-y-3 text-xs">
                            <div className="grid grid-cols-2 gap-2 p-3 bg-muted/40 rounded-md">
                              <div>
                                <span className="text-muted-foreground">Workflow:</span>{" "}
                                <span className="font-medium">{selectedLog.workflow_name}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Status:</span>{" "}
                                <span className="font-medium">{selectedLog.status_code} ({selectedLog.outcome})</span>
                              </div>
                              <div className="col-span-2">
                                <span className="text-muted-foreground">Idempotency Key:</span>{" "}
                                <code className="font-mono bg-background px-1 py-0.5 rounded text-[11px]">
                                  {selectedLog.idempotency_key || "None"}
                                </code>
                              </div>
                            </div>

                            <div>
                              <p className="font-semibold text-muted-foreground mb-1">Request Payload:</p>
                              <pre className="p-3 bg-slate-950 text-slate-100 rounded-md overflow-x-auto font-mono text-[11px]">
                                {JSON.stringify(selectedLog.request_payload, null, 2)}
                              </pre>
                            </div>

                            <div>
                              <p className="font-semibold text-muted-foreground mb-1">Response Payload:</p>
                              <pre className="p-3 bg-slate-950 text-slate-100 rounded-md overflow-x-auto font-mono text-[11px]">
                                {JSON.stringify(selectedLog.response_payload, null, 2)}
                              </pre>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
