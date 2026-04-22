import * as React from "react";
import { useState } from "react";
import { Search, Wrench, CheckCircle2, Clock, AlertCircle, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { getDocument, collections } from "@/services/dbService";

function PerspectiveWrapper({ children }: { children: React.ReactNode }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["5deg", "-5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-5deg", "5deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateY,
        rotateX,
        transformStyle: "preserve-3d",
        perspective: "1000px",
      }}
    >
      {children}
    </motion.div>
  );
}

export function RepairStatus() {
  const [ticketId, setTicketId] = useState("");
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!ticketId) return;
    setLoading(true);
    setError("");
    
    try {
      const docId = ticketId.replace("TF-", "").toLowerCase();
      const repairData = await getDocument(collections.REPAIRS, docId) as any;
      
      if (repairData) {
        const steps = [
          { label: "Received", status: "Received", icon: Package },
          { label: "Diagnosing", status: "Diagnosing", icon: Search },
          { label: "Repairing", status: "Repairing", icon: Wrench },
          { label: "Quality Check", status: "Quality Check", icon: AlertCircle },
          { label: "Ready for Pickup", status: "Ready for Pickup", icon: CheckCircle2 },
        ];

        const statusOrder = steps.map(s => s.status);
        const currentIndex = statusOrder.indexOf(repairData.status);

        setStatus({
          ...repairData,
          displaySteps: steps.map((s, i) => ({
            ...s,
            completed: i < currentIndex || repairData.status === "Completed",
            current: i === currentIndex && repairData.status !== "Completed",
            date: i <= currentIndex ? "Updated" : "Estimated"
          }))
        });
      } else {
        setError("Ticket not found. Please check the ID and try again.");
        setStatus(null);
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred while fetching ticket status.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center space-y-4 mb-12">
        <h1 className="text-4xl font-bold tracking-tight">Track Your <span className="text-primary">Repair</span></h1>
        <p className="text-foreground/60">Enter your ticket number to see real-time updates on your device.</p>
      </div>

      <div className="flex gap-4 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
          <Input 
            placeholder="Enter Ticket ID (e.g. Doc ID)" 
            value={ticketId}
            onChange={(e) => setTicketId(e.target.value)}
            className="pl-12 bg-card border-border rounded-2xl h-14 text-lg"
          />
        </div>
        <Button 
          onClick={handleSearch}
          disabled={loading}
          className="bg-primary hover:bg-primary/90 text-white rounded-2xl h-14 px-8 font-bold text-lg shadow-lg shadow-primary/20"
        >
          {loading ? "Searching..." : "Track"}
        </Button>
      </div>
      
      {error && <p className="text-destructive font-bold text-sm mb-8 text-center">{error}</p>}

      {status ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <PerspectiveWrapper>
            <Card className="soft-card border-none overflow-hidden" style={{ transform: "translateZ(50px)" }}>
              <CardHeader className="bg-primary/10 border-b border-primary/20 p-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Ticket #{status.id.slice(0, 8)}</p>
                    <CardTitle className="text-2xl font-bold">{status.deviceModel}</CardTitle>
                  </div>
                  <Badge className="bg-primary text-white px-4 py-1.5 rounded-full text-sm font-bold self-start md:self-center uppercase tracking-wider">
                    {status.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                  <div className="space-y-1 p-4 bg-background/40 rounded-2xl border border-white/5">
                    <p className="text-xs text-foreground/40 font-bold uppercase tracking-wider">Customer</p>
                    <p className="text-lg font-bold">{status.customerName}</p>
                  </div>
                  <div className="space-y-1 p-4 bg-background/40 rounded-2xl border border-white/5">
                    <p className="text-xs text-foreground/40 font-bold uppercase tracking-wider">Estimate</p>
                    <p className="text-lg font-bold text-primary">${status.estimate}</p>
                  </div>
                </div>

                {/* Progress Stepper */}
                <div className="relative pt-4 pb-8">
                  {/* Connector Line */}
                  <div className="absolute left-[19px] top-4 bottom-8 w-1 bg-border/30 md:left-4 md:right-4 md:top-[23px] md:bottom-auto md:w-auto md:h-1">
                    <div className="absolute inset-y-0 left-0 bg-primary/20 md:inset-x-0 md:inset-y-0" />
                  </div>
                  
                  <div className="flex flex-col md:flex-row justify-between gap-10 relative z-10">
                    {status.displaySteps.map((step: any, i: number) => {
                      const StepIcon = step.icon;
                      return (
                        <motion.div 
                          key={i} 
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.1 }}
                          className="flex md:flex-col items-center gap-4 md:text-center group"
                        >
                          <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 shadow-lg",
                            step.completed ? "bg-primary border-primary text-white shadow-primary/20" : 
                            step.current ? "bg-background border-primary text-primary animate-pulse shadow-primary/10" : 
                            "bg-card border-border text-foreground/20"
                          )}>
                            {step.completed ? <CheckCircle2 className="w-5 h-5" /> : <StepIcon className="w-5 h-5" />}
                          </div>
                          <div className="space-y-1">
                            <p className={cn(
                              "text-sm font-bold transition-colors",
                              step.completed || step.current ? "text-foreground" : "text-foreground/40"
                            )}>
                              {step.label}
                            </p>
                            <p className="text-[10px] text-foreground/30 font-bold uppercase tracking-tighter">{step.date}</p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </PerspectiveWrapper>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="soft-card border-none p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-foreground/40 font-medium">Ticket ID</p>
                <p className="font-bold text-xs truncate max-w-[150px]">{status.id}</p>
              </div>
            </Card>
            <Card className="soft-card border-none p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-foreground/40 font-medium">Need Help?</p>
                <p className="font-bold">Contact Technician</p>
              </div>
            </Card>
          </div>
        </motion.div>
      ) : (
        <div className="text-center py-20 bg-card/30 rounded-3xl border border-dashed border-border">
          <Wrench className="w-12 h-12 text-foreground/20 mx-auto mb-4" />
          <p className="text-foreground/40 font-medium">Enter your ticket ID above to see progress.</p>
        </div>
      )}
    </div>
  );
}
