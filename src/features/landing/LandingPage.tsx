import * as React from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { Button } from "@/components/ui/button";
import { Monitor, Shield, Zap, Clock, ChevronRight, Star, Laptop, Cpu, HardDrive } from "lucide-react";
import { Link } from "react-router-dom";

function PerspectiveCard({ children, className, ...props }: { children: React.ReactNode; className?: string; [key: string]: any }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["17.5deg", "-17.5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-17.5deg", "17.5deg"]);

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
      }}
      className={className}
    >
      <div style={{ transform: "translateZ(50px)", transformStyle: "preserve-3d" }}>
        {children}
      </div>
    </motion.div>
  );
}

export function LandingPage() {
  return (
    <div className="flex flex-col overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full" />
          <div className="absolute bottom-[10%] right-[-10%] w-[30%] h-[30%] bg-accent/10 blur-[100px] rounded-full" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 text-left">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium"
              >
                <Zap className="w-4 h-4" />
                <span>Next-Gen Repair Solutions</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-5xl md:text-7xl font-bold tracking-tight leading-tight"
              >
                Your Computer's <span className="text-primary">Best Friend</span> in the Digital Age
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-xl text-foreground/60 max-w-2xl"
              >
                Professional repair services, high-end hardware shop, and real-time tracking. 
                We bring your tech back to life with precision and care.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-col sm:flex-row items-center gap-4"
              >
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-white rounded-full px-8 h-14 text-lg shadow-xl shadow-primary/20 w-full sm:w-auto">
                  Book a Repair
                  <ChevronRight className="ml-2 w-5 h-5" />
                </Button>
                <Button size="lg" variant="outline" className="border-border hover:bg-card rounded-full px-8 h-14 text-lg w-full sm:w-auto">
                  Browse Shop
                </Button>
              </motion.div>
            </div>

            {/* 3D Floating Element */}
            <div className="hidden lg:block relative h-[500px]">
              <motion.div
                animate={{
                  y: [0, -20, 0],
                  rotateY: [0, 10, 0],
                  rotateX: [0, -10, 0],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="relative w-80 h-80">
                  {/* Floating Tech Icons */}
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 border-2 border-dashed border-primary/20 rounded-full"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-48 h-48 bg-primary/20 rounded-3xl blur-3xl animate-pulse" />
                    <Laptop className="w-32 h-32 text-primary relative z-10 drop-shadow-[0_0_30px_rgba(0,191,165,0.5)]" />
                  </div>
                  
                  <motion.div 
                    animate={{ y: [0, 15, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-0 right-0 w-16 h-16 bg-card border border-border rounded-2xl flex items-center justify-center shadow-xl"
                  >
                    <Cpu className="text-accent w-8 h-8" />
                  </motion.div>
                  
                  <motion.div 
                    animate={{ y: [0, -15, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute bottom-10 left-0 w-20 h-20 bg-card border border-border rounded-2xl flex items-center justify-center shadow-xl"
                  >
                    <HardDrive className="text-primary w-10 h-10" />
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid with 3D Cards */}
      <section className="py-24 bg-card/30 border-y border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Monitor,
                title: "Expert Diagnostics",
                desc: "Advanced tools to pinpoint hardware and software issues accurately.",
                color: "text-primary"
              },
              {
                icon: Clock,
                title: "Fast Turnaround",
                desc: "Most repairs completed within 24-48 hours. Express service available.",
                color: "text-accent"
              },
              {
                icon: Shield,
                title: "Certified Warranty",
                desc: "All repairs come with a 90-day comprehensive warranty for peace of mind.",
                color: "text-primary"
              }
            ].map((feature, i) => (
              <PerspectiveCard key={i} className="h-full">
                <div className="soft-card p-8 space-y-4 h-full">
                  <div className={`w-12 h-12 rounded-2xl bg-background flex items-center justify-center border border-border ${feature.color}`}>
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold">{feature.title}</h3>
                  <p className="text-foreground/60 leading-relaxed">{feature.desc}</p>
                </div>
              </PerspectiveCard>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { label: "Repairs Done", value: "12k+" },
              { label: "Happy Clients", value: "99%" },
              { label: "Expert Techs", value: "25+" },
              { label: "Years Exp", value: "15+" }
            ].map((stat, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="space-y-2"
              >
                <div className="text-4xl md:text-5xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm uppercase tracking-widest text-foreground/40 font-semibold">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
