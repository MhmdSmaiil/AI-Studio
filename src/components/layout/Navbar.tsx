import { Link, useLocation } from "react-router-dom";
import { Monitor, ShoppingBag, Settings, User, Menu, X, Globe, LogOut, LayoutDashboard } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuGroup,
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { AuthDialog } from "@/components/auth/AuthDialog";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const [lang, setLang] = useState<"en" | "ar">("en");
  const { user, logout } = useAuth();
  const isAdmin = user?.email === "mhmd.smaiil2@gmail.com";

  const toggleLang = () => {
    const newLang = lang === "en" ? "ar" : "en";
    setLang(newLang);
    document.documentElement.dir = newLang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = newLang;
  };

  const navItems = [
    { name: lang === "en" ? "Home" : "الرئيسية", path: "/", icon: Monitor },
    { name: lang === "en" ? "Store" : "المتجر", path: "/store", icon: ShoppingBag },
    { name: lang === "en" ? "Repair Status" : "حالة الإصلاح", path: "/repair-status", icon: Settings },
    ...(isAdmin ? [{ name: lang === "en" ? "Dashboard" : "لوحة التحكم", path: "/admin", icon: LayoutDashboard }] : []),
  ];

  return (
    <header className="glass-header">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 transition-transform group-hover:scale-110">
            <Monitor className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">
            TechFix<span className="text-primary">Pro</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                location.pathname === item.path ? "text-primary" : "text-foreground/70"
              )}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleLang}
            className="touch-target text-foreground/70 hover:text-primary"
          >
            <Globe className="w-5 h-5" />
          </Button>
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="ghost" size="icon" className="rounded-full border border-border w-10 h-10">
                    {user.photoURL ? (
                      <img 
                        src={user.photoURL} 
                        alt={user.displayName || "User"} 
                        className="w-full h-full rounded-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <User className="w-5 h-5" />
                    )}
                  </Button>
                }
              />
              <DropdownMenuContent align="end" className="w-56 bg-card border-border">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.displayName || "User"}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                {isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem render={<Link to="/admin" className="cursor-pointer" />}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive focus:text-destructive cursor-pointer" onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <AuthDialog 
              trigger={
                <Button className="hidden md:flex bg-primary hover:bg-primary/90 text-white rounded-full px-6 shadow-lg shadow-primary/20">
                  {lang === "en" ? "Get Started" : "ابدأ الآن"}
                </Button>
              }
            />
          )}

          {/* Mobile Nav */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" className="touch-target md:hidden">
                  <Menu className="w-6 h-6" />
                </Button>
              }
            />
            <SheetContent side={lang === "ar" ? "right" : "left"} className="bg-card border-border p-0 w-[300px]">
              <div className="sr-only">
                <SheetHeader>
                  <SheetTitle>Navigation Menu</SheetTitle>
                </SheetHeader>
              </div>
              <div className="flex flex-col h-full">
                {/* Brand/Header Section */}
                <div className="p-6 border-b border-border bg-primary/5">
                  <Link to="/" onClick={() => setIsOpen(false)} className="flex items-center gap-2 group">
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                      <Monitor className="text-white w-5 h-5" />
                    </div>
                    <span className="text-lg font-bold tracking-tight text-foreground">
                      TechFix<span className="text-primary">Pro</span>
                    </span>
                  </Link>
                </div>

                {/* Nav Items Section */}
                <div className="flex-1 py-6 px-3">
                  <div className="flex flex-col gap-1">
                    <AnimatePresence>
                      {navItems.map((item, index) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                          <motion.div
                            key={item.path}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <Link
                              to={item.path}
                              onClick={() => setIsOpen(false)}
                              className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all group",
                                isActive 
                                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/10" 
                                  : "text-foreground/70 hover:bg-primary/5 hover:text-primary"
                              )}
                            >
                              <Icon className={cn("w-5 h-5", isActive ? "text-primary-foreground" : "group-hover:text-primary")} />
                              {item.name}
                            </Link>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Account Section */}
                <div className="p-6 border-t border-border bg-muted/30 mt-auto">
                  {user ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full border border-border bg-card flex items-center justify-center overflow-hidden">
                          {user.photoURL ? (
                            <img 
                              src={user.photoURL} 
                              alt={user.displayName || "User"} 
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <User className="w-5 h-5 text-foreground/40" />
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold truncate max-w-[150px]">{user.displayName || "Account"}</span>
                          <span className="text-[10px] text-foreground/40 truncate max-w-[150px] font-mono">{user.email}</span>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/5 rounded-xl font-bold h-11" 
                        onClick={() => {
                          logout();
                          setIsOpen(false);
                        }}
                      >
                        <LogOut className="mr-3 h-4 w-4" />
                        {lang === "en" ? "Sign Out" : "تسجيل الخروج"}
                      </Button>
                    </div>
                  ) : (
                    <AuthDialog 
                      trigger={
                        <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl w-full h-11 font-bold shadow-lg shadow-primary/20">
                          {lang === "en" ? "Get Started" : "ابدأ الآن"}
                        </Button>
                      }
                    />
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
