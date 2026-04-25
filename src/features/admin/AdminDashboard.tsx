import { useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { 
  LayoutDashboard, 
  Wrench, 
  Package, 
  Users, 
  CreditCard, 
  Settings, 
  Bell, 
  Search,
  Plus,
  MoreVertical,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Download,
  Trash2,
  Edit,
  ShoppingCart,
  DollarSign,
  ShoppingBag,
  Clock,
  AlertCircle,
  UserPlus,
  CheckCircle2,
  XCircle,
  Hash,
  Menu,
  X,
  LogOut,
  User,
  Eye,
  Calendar,
  Phone,
  Mail,
  Info,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuGroup,
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "@/contexts/AuthContext";
import { 
  collections, 
  subscribeToCollection, 
  createDocument, 
  updateDocument,
  deleteDocument 
} from "@/services/dbService";

export function AdminDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [isNewRepairOpen, setIsNewRepairOpen] = useState(false);
  const [isNewInventoryOpen, setIsNewInventoryOpen] = useState(false);
  const [isNewCustomerOpen, setIsNewCustomerOpen] = useState(false);
  const [isEditCustomerOpen, setIsEditCustomerOpen] = useState(false);
  const [isNewTechnicianOpen, setIsNewTechnicianOpen] = useState(false);
  const [isEditTechnicianOpen, setIsEditTechnicianOpen] = useState(false);
  const [isEditRepairOpen, setIsEditRepairOpen] = useState(false);
  const [isViewRepairOpen, setIsViewRepairOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [newTechnician, setNewTechnician] = useState({ 
    name: "", 
    email: "", 
    password: "", 
    specialization: "",
    availability: {
      workingHours: { start: "09:00", end: "17:00" },
      daysOff: [] as string[]
    }
  });
  const [editingTechnician, setEditingTechnician] = useState<any>(null);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  const [editingRepair, setEditingRepair] = useState<any>(null);
  const [viewingRepair, setViewingRepair] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    type: string;
    id: string;
    name: string;
    collection: string;
  }>({ open: false, type: "", id: "", name: "", collection: "" });

  // Data layers
  const [repairs, setRepairs] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);

  const generateInvoice = (repair: any) => {
    const doc = new jsPDF();
    const technicianName = technicians.find(t => t.id === repair.technicianId)?.name || "Unassigned";
    const partsTotal = (repair.items || []).reduce((acc: number, item: any) => acc + (item.price || 0), 0);
    const grandTotal = Number(repair.estimate || 0) + partsTotal;

    // Header
    doc.setFontSize(22);
    doc.setTextColor(33, 150, 243); // Primary color
    doc.text("TechFix Solutions", 14, 22);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("Premium Device Repair Service", 14, 28);
    
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text("INVOICE", 160, 22);
    doc.setFontSize(10);
    doc.text(`ID: TF-${repair.id.slice(0, 8).toUpperCase()}`, 160, 28);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 160, 34);

    // Customer Info
    doc.setDrawColor(240);
    doc.line(14, 45, 196, 45);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("BILL TO:", 14, 55);
    doc.setFont("helvetica", "normal");
    doc.text(repair.customerName, 14, 62);
    doc.text(`Phone: ${repair.customerPhone}`, 14, 68);
    
    doc.setFont("helvetica", "bold");
    doc.text("DEVICE DETAILS:", 110, 55);
    doc.setFont("helvetica", "normal");
    doc.text(`Model: ${repair.deviceModel}`, 110, 62);
    doc.text(`S/N: ${repair.serialNumber || "N/A"}`, 110, 68);
    doc.text(`Tech: ${technicianName}`, 110, 74);

    // Table
    const tableRows = [
      ["Service / Labor Fee", "1", `$${repair.estimate || 0}`, `$${repair.estimate || 0}`],
      ...(repair.items || []).map((item: any) => [
        item.name,
        "1",
        `$${item.price}`,
        `$${item.price}`
      ])
    ];

    autoTable(doc, {
      startY: 85,
      head: [["Description", "Qty", "Unit Price", "Total"]],
      body: tableRows,
      headStyles: { fillColor: [33, 150, 243], textColor: [255, 255, 255] },
      margin: { top: 85 },
      styles: { fontSize: 9 }
    });

    // Summary
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    
    doc.setFont("helvetica", "bold");
    doc.text("Summary:", 140, finalY);
    doc.setFont("helvetica", "normal");
    doc.text(`Parts Total:`, 140, finalY + 7);
    doc.text(`$${partsTotal}`, 180, finalY + 7, { align: "right" });
    doc.text(`Labor Fee:`, 140, finalY + 14);
    doc.text(`$${repair.estimate || 0}`, 180, finalY + 14, { align: "right" });
    
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(33, 150, 243);
    doc.text(`GRAND TOTAL:`, 140, finalY + 25);
    doc.text(`$${grandTotal}`, 180, finalY + 25, { align: "right" });

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.setFont("helvetica", "italic");
    doc.text("Thank you for choosing TechFix Solutions!", 105, 280, { align: "center" });
    doc.text("Warranty: 90 days on all replaced parts.", 105, 285, { align: "center" });

    // Save
    doc.save(`Invoice_TF_${repair.id.slice(0, 8).toUpperCase()}.pdf`);
  };

  // New Repair Form State
  const [newRepair, setNewRepair] = useState({
    customerName: "",
    customerPhone: "",
    deviceModel: "",
    serialNumber: "",
    issueDescription: "",
    customerNote: "",
    estimate: "",
    priority: "Medium",
    technicianId: "",
    items: [] as any[]
  });

  const [newInventory, setNewInventory] = useState({
    name: "",
    category: "",
    price: "",
    stock: ""
  });

  const [newCustomer, setNewCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    password: ""
  });

  const [cart, setCart] = useState<{ id: string; name: string; price: number; quantity: number }[]>([]);

  const sidebarItems = [
    { id: "overview", icon: LayoutDashboard, label: "Overview" },
    { id: "repairs", icon: Wrench, label: "Repairs" },
    { id: "inventory", icon: Package, label: "Inventory" },
    { id: "technicians", icon: UserPlus, label: "Technicians" },
    { id: "customers", icon: Users, label: "Customers" },
    { id: "pos", icon: CreditCard, label: "POS" },
    { id: "settings", icon: Settings, label: "Settings" },
  ];

  // Subscriptions - Guarded by user presence and admin check
  useEffect(() => {
    if (!user || user.email !== "mhmd.smaiil2@gmail.com") return;

    const unsubRepairs = subscribeToCollection(collections.REPAIRS, setRepairs);
    const unsubInventory = subscribeToCollection(collections.INVENTORY, setInventory);
    const unsubCustomers = subscribeToCollection(collections.CUSTOMERS, setCustomers);
    const unsubTechnicians = subscribeToCollection(collections.TECHNICIANS, setTechnicians);
    const unsubTransactions = subscribeToCollection(collections.TRANSACTIONS, setTransactions, "timestamp");

    return () => {
      unsubRepairs();
      unsubInventory();
      unsubCustomers();
      unsubTechnicians();
      unsubTransactions();
    };
  }, [user]);

  const triggerDelete = (type: string, id: string, name: string, collection: string) => {
    setDeleteConfirm({ open: true, type, id, name, collection });
  };

  const handleDelete = async () => {
    if (deleteConfirm.id && deleteConfirm.collection) {
      try {
        await deleteDocument(deleteConfirm.collection, deleteConfirm.id);
      } catch (error) {
        console.error("Delete error:", error);
        alert("Failed to delete. Access denied.");
      }
    }
    setDeleteConfirm(prev => ({ ...prev, open: false }));
  };

  const handleCreateRepair = async () => {
    try {
      console.log("Attempting to create repair document...");
      const repairData = {
        ...newRepair,
        estimate: parseFloat(newRepair.estimate) || 0,
        status: "Received",
      };

      await createDocument(collections.REPAIRS, repairData);
      
      console.log("Attempting to create/update customer document...");
      // Also create/update customer record automatically
      if (newRepair.customerName) {
        await createDocument(collections.CUSTOMERS, {
          name: newRepair.customerName,
          phone: newRepair.customerPhone,
          totalRepairs: 1,
          totalSpent: 0,
          lastVisit: new Date().toISOString()
        });
      }

      setIsNewRepairOpen(false);
      setNewRepair({
        customerName: "",
        customerPhone: "",
        deviceModel: "",
        serialNumber: "",
        issueDescription: "",
        customerNote: "",
        estimate: "",
        priority: "Medium",
        technicianId: "",
        items: []
      });
    } catch (error: any) {
      console.error("Critical error in handleCreateRepair:", error);
      alert(`Error creating repair: ${error.message || "Unknown error"}. Ensure you are logged in as mhmd.smaiil2@gmail.com`);
    }
  };

  const handleCreateInventoryItem = async () => {
    try {
      await createDocument(collections.INVENTORY, {
        name: newInventory.name,
        category: newInventory.category,
        price: parseFloat(newInventory.price) || 0,
        stock: parseInt(newInventory.stock) || 0,
      });

      setIsNewInventoryOpen(false);
      setNewInventory({
        name: "",
        category: "",
        price: "",
        stock: ""
      });
    } catch (error: any) {
      console.error("Error creating inventory item:", error);
      alert(`Error creating inventory item: ${error.message || "Unknown error"}`);
    }
  };

  const handleCreateCustomer = async () => {
    try {
      await createDocument(collections.CUSTOMERS, {
        name: newCustomer.name,
        email: newCustomer.email,
        phone: newCustomer.phone,
        totalRepairs: 0,
        totalSpent: 0,
        lastVisit: null
      });

      setIsNewCustomerOpen(false);
      setNewCustomer({
        name: "",
        email: "",
        phone: "",
        password: ""
      });
    } catch (error: any) {
      console.error("Error creating customer:", error);
      alert(`Error creating customer: ${error.message || "Unknown error"}`);
    }
  };

  const addToCart = (item: any) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { id: item.id, name: item.name, price: item.price, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(i => i.id !== id));
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    try {
      const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
      const tax = subtotal * 0.08;
      const total = subtotal + tax;

      // 1. Process Transaction
      await createDocument(collections.TRANSACTIONS, {
        items: cart,
        subtotal,
        tax,
        total,
        timestamp: new Date().toISOString(),
        status: "Completed"
      });

      // 2. Update Inventory Stock
      const stockUpdates = cart.map(item => {
        const inventoryItem = inventory.find(i => i.id === item.id);
        if (inventoryItem) {
          const newStock = Math.max(0, (parseInt(inventoryItem.stock) || 0) - item.quantity);
          return updateDocument(collections.INVENTORY, item.id, { stock: newStock });
        }
        return Promise.resolve();
      });

      await Promise.all(stockUpdates);
      
      setCart([]);
      alert("Sale processed and inventory updated successfully!");
    } catch (error: any) {
      console.error("Checkout error:", error);
      alert(`Error processing checkout: ${error.message}`);
    }
  };

  const triggerEditRepair = (repair: any) => {
    setEditingRepair({
      ...repair,
      estimate: repair.estimate?.toString() || "",
      items: repair.items || []
    });
    setIsEditRepairOpen(true);
  };

  const triggerViewRepair = (repair: any) => {
    setViewingRepair(repair);
    setIsViewRepairOpen(true);
  };

  const handleUpdateRepair = async () => {
    if (!editingRepair) return;
    try {
      const { id, ...data } = editingRepair;
      await updateDocument(collections.REPAIRS, id, {
        ...data,
        estimate: parseFloat(data.estimate) || 0,
      });
      setIsEditRepairOpen(false);
      setEditingRepair(null);
    } catch (error) {
      console.error("Update error:", error);
      alert("Failed to update repair. Check permissions.");
    }
  };

  const handleCreateTechnician = async () => {
    try {
      await createDocument(collections.TECHNICIANS, {
        ...newTechnician,
        role: "technician",
        active: true,
        createdAt: new Date().toISOString()
      });
      setIsNewTechnicianOpen(false);
      setNewTechnician({ 
        name: "", 
        email: "", 
        password: "", 
        specialization: "",
        availability: {
          workingHours: { start: "09:00", end: "17:00" },
          daysOff: []
        }
      });
    } catch (error) {
      console.error("Error creating technician:", error);
    }
  };

  const handleUpdateTechnician = async () => {
    if (!editingTechnician) return;
    try {
      const { id, ...data } = editingTechnician;
      await updateDocument(collections.TECHNICIANS, id, {
        ...data,
        updatedAt: new Date().toISOString()
      });
      setIsEditTechnicianOpen(false);
      setEditingTechnician(null);
    } catch (error) {
      console.error("Update error:", error);
    }
  };

  const handleUpdateCustomer = async () => {
    if (!editingCustomer) return;
    try {
      const { id, ...data } = editingCustomer;
      await updateDocument(collections.CUSTOMERS, id, {
        ...data,
        updatedAt: new Date().toISOString()
      });
      setIsEditCustomerOpen(false);
      setEditingCustomer(null);
    } catch (error) {
      console.error("Customer update error:", error);
      alert("Failed to update customer.");
    }
  };

  const addItemToRepair = (inventoryItem: any, isEdit = false) => {
    const item = {
      id: inventoryItem.id,
      name: inventoryItem.name,
      price: inventoryItem.price,
      quantity: 1
    };
    
    if (isEdit) {
      setEditingRepair((prev: any) => ({
        ...prev,
        items: [...prev.items, item]
      }));
    } else {
      setNewRepair(prev => ({
        ...prev,
        items: [...prev.items, item]
      }));
    }
  };

  const removeItemFromRepair = (itemId: string, isEdit = false) => {
    if (isEdit) {
      setEditingRepair((prev: any) => ({
        ...prev,
        items: prev.items.filter((i: any) => i.id !== itemId)
      }));
    } else {
      setNewRepair(prev => ({
        ...prev,
        items: prev.items.filter((i: any) => i.id !== itemId)
      }));
    }
  };

  const getTechnicianAvailabilityStatus = (tech: any) => {
    if (tech.active === false) return { status: "Inactive", color: "text-foreground/20" };
    
    if (!tech.availability) return { status: "Available", color: "text-green-500" };
    
    const now = new Date();
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const currentDay = days[now.getDay()];
    
    // Format: HH:MM
    const currentH = now.getHours();
    const currentM = now.getMinutes();
    const currentTimeMinutes = currentH * 60 + currentM;
    
    // Check days off
    if (tech.availability.daysOff?.includes(currentDay)) {
      return { status: "Day Off", color: "text-red-500" };
    }
    
    // Check working hours
    if (tech.availability.workingHours) {
      const { start, end } = tech.availability.workingHours;
      if (start && end) {
        const [startH, startM] = start.split(":").map(Number);
        const [endH, endM] = end.split(":").map(Number);
        const startTimeMinutes = startH * 60 + startM;
        const endTimeMinutes = endH * 60 + endM;
        
        if (currentTimeMinutes < startTimeMinutes || currentTimeMinutes > endTimeMinutes) {
          return { status: "Out of Office", color: "text-amber-500" };
        }
      }
    }
    
    return { status: "Available", color: "text-green-500" };
  };

  const renderOverview = () => {
    const totalRevenue = transactions.reduce((acc, t) => acc + (t.total || 0), 0);
    const activeRepairs = repairs.filter(r => !["Completed", "Cancelled"].includes(r.status));
    const completedToday = repairs.filter(r => r.status === "Completed"); // Simplification
    const customerCount = customers.length;

    return (
      <div className="space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "Total Revenue", value: `$${totalRevenue.toLocaleString()}`, trend: "+12.5%", up: true },
            { label: "Active Repairs", value: activeRepairs.length.toString(), trend: "+5.2%", up: true },
            { label: "Completed Overall", value: completedToday.length.toString(), trend: "-2.4%", up: false },
            { label: "Total Customers", value: customerCount.toString(), trend: "+18.3%", up: true },
          ].map((stat, i) => (
            <Card key={i} className="soft-card border-none">
              <CardContent className="p-6">
                <p className="text-sm font-medium text-foreground/60">{stat.label}</p>
                <div className="flex items-end justify-between mt-2">
                  <h3 className="text-3xl font-bold">{stat.value}</h3>
                  <div className={cn(
                    "flex items-center text-xs font-bold px-2 py-1 rounded-full",
                    stat.up ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                  )}>
                    {stat.up ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                    {stat.trend}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Repairs Table */}
        <Card className="soft-card border-none">
          <CardHeader className="flex flex-row items-center justify-between px-6 py-4 border-b border-border">
            <CardTitle className="text-lg font-bold">Recent Repairs</CardTitle>
            <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80" onClick={() => setActiveTab("repairs")}>View All</Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto overflow-y-hidden">
              <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border">
                  <TableHead className="pl-6">Customer</TableHead>
                  <TableHead>Device</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Technician</TableHead>
                  <TableHead className="text-right pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {repairs.slice(0, 5).map((repair) => (
                  <TableRow key={repair.id} className="border-border hover:bg-primary/5 transition-colors group">
                    <TableCell className="pl-6 font-medium">{repair.customerName}</TableCell>
                    <TableCell className="text-foreground/60">{repair.deviceModel}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn(
                        "rounded-full px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                        repair.status === "Received" && "border-blue-500/50 text-blue-500 bg-blue-500/5",
                        repair.status === "In Progress" && "border-amber-500/50 text-amber-500 bg-amber-500/5",
                        repair.status === "Ready for Pickup" && "border-primary/50 text-primary bg-primary/5",
                        repair.status === "Completed" && "border-green-500/50 text-green-500 bg-green-500/5",
                      )}>
                        {repair.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          repair.priority === "Urgent" && "bg-red-600 animate-pulse",
                          repair.priority === "High" && "bg-red-500",
                          repair.priority === "Medium" && "bg-amber-500",
                          repair.priority === "Low" && "bg-blue-500"
                        )} />
                        <span className="text-xs font-semibold">{repair.priority}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm font-medium text-foreground/60">
                      {technicians.find(t => t.id === repair.technicianId)?.name || "Unassigned"}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-primary"
                          onClick={() => triggerViewRepair(repair)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-foreground/40 hover:text-primary transition-colors"
                          onClick={() => triggerEditRepair(repair)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {repairs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-foreground/40">No recent repairs found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderRepairs = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Repair Tickets</h2>
          <p className="text-foreground/40 font-medium">Manage and track all customer devices</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="rounded-full">
            <Filter className="w-4 h-4 mr-2" /> Filter
          </Button>
          <Button variant="outline" className="rounded-full">
            <Download className="w-4 h-4 mr-2" /> Export
          </Button>
        </div>
      </div>
      
      <Card className="soft-card border-none overflow-hidden">
        <div className="overflow-x-auto overflow-y-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border">
                <TableHead className="pl-6">Ticket ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Device</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Technician</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Received</TableHead>
                <TableHead className="text-right pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
          <TableBody>
            {repairs.map((repair) => (
              <TableRow key={repair.id} className="border-border hover:bg-primary/5 group">
                <TableCell className="pl-6 font-bold text-primary">TF-{repair.id.slice(0, 4).toUpperCase()}</TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{repair.customerName}</p>
                    <p className="text-xs text-foreground/40">{repair.customerPhone}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{repair.deviceModel}</span>
                    {repair.serialNumber && <span className="text-[10px] text-foreground/40 font-mono">SN: {repair.serialNumber}</span>}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={cn(
                    "rounded-full px-2 py-0",
                    repair.status === "Received" && "border-blue-500/50 text-blue-500 bg-blue-500/5",
                    repair.status === "In Progress" && "border-amber-500/50 text-amber-500 bg-amber-500/5",
                    repair.status === "Ready for Pickup" && "border-primary/50 text-primary bg-primary/5",
                    repair.status === "Completed" && "border-green-500/50 text-green-500 bg-green-500/5",
                  )}>{repair.status}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      repair.priority === "Urgent" && "bg-red-600 animate-pulse",
                      repair.priority === "High" && "bg-red-500",
                      repair.priority === "Medium" && "bg-amber-500",
                      repair.priority === "Low" && "bg-blue-500"
                    )} />
                    <span className="text-xs font-semibold">{repair.priority}</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm font-medium text-foreground/60">
                  {technicians.find(t => t.id === repair.technicianId)?.name || "Unassigned"}
                </TableCell>
                <TableCell className="text-sm font-black text-primary">
                  ${(repair.estimate || 0) + (repair.items || []).reduce((acc: number, item: any) => acc + (item.price || 0), 0)}
                </TableCell>
                <TableCell className="text-foreground/40 text-xs">
                  {repair.createdAt ? new Date(repair.createdAt.seconds * 1000).toLocaleDateString() : "Just now"}
                </TableCell>
                <TableCell className="text-right pr-6">
                  <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-primary"
                      onClick={() => triggerViewRepair(repair)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    {repair.status === "Completed" && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                        title="Download Invoice"
                        onClick={() => generateInvoice(repair)}
                      >
                        <FileText className="w-4 h-4" />
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-foreground/40 hover:text-primary transition-colors"
                      onClick={() => triggerEditRepair(repair)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-destructive"
                      onClick={() => triggerDelete("Repair", repair.id, `Ticket for ${repair.customerName}`, collections.REPAIRS)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {repairs.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-20 text-foreground/20 italic">No repair tickets yet.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        </div>
      </Card>
      </div>
    );

  const renderInventory = () => (
    <div className="space-y-6">
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Inventory Management</h2>
          <p className="text-foreground/40 font-medium">Parts, retail items, and stock levels</p>
        </div>
        <Dialog open={isNewInventoryOpen} onOpenChange={setIsNewInventoryOpen}>
          <DialogTrigger render={
            <Button className="bg-primary hover:bg-primary/90 text-white rounded-full">
              <Plus className="w-4 h-4 mr-2" /> Add Item
            </Button>
          } />
          <DialogContent className="max-w-[95vw] sm:max-w-md bg-card border-border p-0 overflow-hidden rounded-3xl">
            <DialogHeader className="p-8 bg-primary/5 border-b border-primary/10">
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                <Package className="w-6 h-6 text-primary" /> Add Inventory Item
              </DialogTitle>
              <DialogDescription className="font-medium text-foreground/40">
                Add a new part or retail product to your stock.
              </DialogDescription>
            </DialogHeader>
            <div className="p-8 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-primary tracking-widest">Item Name</label>
                <Input 
                  placeholder="e.g. iPhone 13 Screen" 
                  value={newInventory.name}
                  onChange={(e) => setNewInventory(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-primary tracking-widest">Category</label>
                <Input 
                  placeholder="e.g. Screens, Batteries, Cables" 
                  value={newInventory.category}
                  onChange={(e) => setNewInventory(prev => ({ ...prev, category: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-primary tracking-widest">Price ($)</label>
                  <Input 
                    type="number"
                    placeholder="25.00" 
                    value={newInventory.price}
                    onChange={(e) => setNewInventory(prev => ({ ...prev, price: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-primary tracking-widest">Initial Stock</label>
                  <Input 
                    type="number"
                    placeholder="10" 
                    value={newInventory.stock}
                    onChange={(e) => setNewInventory(prev => ({ ...prev, stock: e.target.value }))}
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="p-6 bg-card border-t border-border">
              <Button variant="ghost" onClick={() => setIsNewInventoryOpen(false)}>Cancel</Button>
              <Button 
                className="bg-primary text-white rounded-xl px-8" 
                onClick={handleCreateInventoryItem}
                disabled={!newInventory.name || !newInventory.category || !newInventory.price}
              >
                Add Item
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[
          { label: "Low Stock Items", count: "8", color: "text-amber-500", bg: "bg-amber-500/10" },
          { label: "Out of Stock", count: "3", color: "text-red-500", bg: "bg-red-500/10" },
          { label: "Total Categories", count: "14", color: "text-primary", bg: "bg-primary/10" },
        ].map((card, i) => (
          <Card key={i} className="soft-card border-none">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground/60">{card.label}</p>
                <p className="text-2xl font-bold mt-1">{card.count}</p>
              </div>
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", card.bg, card.color)}>
                <Package className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="soft-card border-none overflow-hidden">
        <div className="overflow-x-auto overflow-y-hidden">
          <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border">
              <TableHead className="pl-6">Item Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right pr-6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inventory.map((item) => (
              <TableRow key={item.id} className="border-border hover:bg-primary/5 group">
                <TableCell className="pl-6 font-medium">{item.name}</TableCell>
                <TableCell>
                   <Badge variant="ghost" className="bg-card border-border font-medium">{item.category}</Badge>
                </TableCell>
                <TableCell className="font-bold">${item.price}</TableCell>
                <TableCell>{item.stock} Units</TableCell>
                <TableCell>
                  {item.stock === 0 ? (
                    <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Out of Stock</Badge>
                  ) : item.stock < 5 ? (
                    <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">Low Stock</Badge>
                  ) : (
                    <Badge className="bg-green-500/10 text-green-500 border-green-500/20">In Stock</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right pr-6">
                  <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-primary"><Edit className="w-4 h-4" /></Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-destructive"
                      onClick={() => triggerDelete("Inventory Item", item.id, item.name, collections.INVENTORY)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {inventory.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-20 text-foreground/20 italic">No inventory items found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        </div>
      </Card>
    </div>
  );

  const renderCustomers = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold">Customer Directory</h2>
          <p className="text-sm md:text-base text-foreground/40 font-medium">Manage and view your customer database</p>
        </div>
        <Dialog open={isNewCustomerOpen} onOpenChange={setIsNewCustomerOpen}>
          <DialogTrigger render={
            <Button className="bg-primary hover:bg-primary/90 text-white rounded-full h-10 md:h-12 px-4 md:px-6">
              <Users className="w-4 h-4 md:mr-2" /> <span className="hidden sm:inline">New Customer</span>
            </Button>
          } />
          <DialogContent className="max-w-[95vw] sm:max-w-md bg-card border-border p-0 overflow-hidden rounded-3xl">
            <DialogHeader className="p-8 bg-primary/5 border-b border-primary/10">
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                <Users className="w-6 h-6 text-primary" /> Add New Customer
              </DialogTitle>
              <DialogDescription className="font-medium text-foreground/40">
                Register a new customer to your database.
              </DialogDescription>
            </DialogHeader>
            <div className="p-8 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-primary tracking-widest">Full Name</label>
                <Input 
                  placeholder="e.g. John Doe" 
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-primary tracking-widest">Email Address</label>
                <Input 
                  type="email"
                  placeholder="john@example.com" 
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-primary tracking-widest">Password</label>
                <Input 
                  type="password"
                  placeholder="Set account password" 
                  value={newCustomer.password}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, password: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-primary tracking-widest">Phone Number</label>
                <Input 
                  placeholder="+1 (555) 000-0000" 
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
            </div>
            <DialogFooter className="p-6 bg-card border-t border-border">
              <Button variant="ghost" onClick={() => setIsNewCustomerOpen(false)}>Cancel</Button>
              <Button 
                className="bg-primary text-white rounded-xl px-8" 
                onClick={handleCreateCustomer}
                disabled={!newCustomer.name || !newCustomer.email || !newCustomer.password}
              >
                Add Customer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Customer Dialog */}
        <Dialog open={isEditCustomerOpen} onOpenChange={setIsEditCustomerOpen}>
          <DialogContent className="max-w-[95vw] sm:max-w-md bg-card border-border p-0 overflow-hidden rounded-3xl">
            {editingCustomer && (
              <>
                <DialogHeader className="p-8 bg-primary/5 border-b border-primary/10">
                  <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                    <Edit className="w-6 h-6 text-primary" /> Edit Customer
                  </DialogTitle>
                </DialogHeader>
                <div className="p-8 space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase text-primary tracking-widest">Full Name</label>
                    <Input 
                      value={editingCustomer.name}
                      onChange={(e) => setEditingCustomer((prev: any) => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase text-primary tracking-widest">Email Address</label>
                    <Input 
                      type="email"
                      value={editingCustomer.email}
                      onChange={(e) => setEditingCustomer((prev: any) => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase text-primary tracking-widest">Password</label>
                    <Input 
                      type="password"
                      placeholder="Change password (optional)"
                      value={editingCustomer.password || ""}
                      onChange={(e) => setEditingCustomer((prev: any) => ({ ...prev, password: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase text-primary tracking-widest">Phone Number</label>
                    <Input 
                      value={editingCustomer.phone}
                      onChange={(e) => setEditingCustomer((prev: any) => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                </div>
                <DialogFooter className="p-6 bg-card border-t border-border">
                  <Button variant="ghost" onClick={() => setIsEditCustomerOpen(false)}>Cancel</Button>
                  <Button 
                    className="bg-primary text-white rounded-xl px-8" 
                    onClick={handleUpdateCustomer}
                  >
                    Save Changes
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <Card className="soft-card border-none overflow-hidden">
        <div className="overflow-x-auto overflow-y-hidden">
          <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border">
              <TableHead className="pl-6">Name</TableHead>
              <TableHead>Total Repairs</TableHead>
              <TableHead>Total Spent</TableHead>
              <TableHead>Last Visit</TableHead>
              <TableHead className="text-right pr-6">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.id} className="border-border hover:bg-primary/5 group">
                <TableCell className="pl-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                      {customer.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium">{customer.name}</p>
                      <p className="text-xs text-foreground/40">{customer.email || customer.phone}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{customer.totalRepairs || 0} Repairs</TableCell>
                <TableCell className="font-bold text-primary">${customer.totalSpent || 0}</TableCell>
                <TableCell className="text-foreground/40 text-sm">
                   {customer.lastVisit ? new Date(customer.lastVisit.seconds * 1000).toLocaleDateString() : "New"}
                </TableCell>
                <TableCell className="text-right pr-6">
                  <div className="flex justify-end gap-2 pr-0">
                    <Button variant="ghost" size="sm" className="h-8">View History</Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => {
                        setEditingCustomer(customer);
                        setIsEditCustomerOpen(true);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => triggerDelete("Customer", customer.id, customer.name, collections.CUSTOMERS)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {customers.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-20 text-foreground/20 italic">No customers registered.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        </div>
      </Card>
    </div>
  );

  const renderPOS = () => {
    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const tax = subtotal * 0.08;
    const total = subtotal + tax;

    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Point of Sale</h2>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
              <Input placeholder="Scan or search..." className="pl-10 rounded-full bg-card" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {inventory.length > 0 ? (
              inventory.map((item) => (
                <Card 
                  key={item.id} 
                  className="soft-card border-none hover:border-primary/50 cursor-pointer group active:scale-95 transition-all"
                  onClick={() => addToCart(item)}
                >
                  <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                    <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <Package className="w-6 h-6" />
                    </div>
                    <p className="font-bold text-sm line-clamp-1">{item.name}</p>
                    <p className="text-primary font-bold">${item.price}</p>
                    <Badge variant="ghost" className="text-[10px] uppercase opacity-50">{item.stock} in stock</Badge>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full py-20 text-center text-foreground/20 italic">
                Add items to Inventory to see them here.
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <Card className="soft-card border-none bg-card/80 backdrop-blur-sm h-[600px] flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-primary" /> Current Order
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto space-y-4 px-6">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-sm group">
                  <div className="flex-1">
                    <p className="font-bold">{item.name}</p>
                    <p className="text-foreground/40 text-xs">${item.price} x {item.quantity}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="font-bold">${(item.price * item.quantity).toFixed(2)}</p>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
              {cart.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-foreground/20 gap-2">
                  <ShoppingBag className="w-10 h-10" />
                  <p className="font-medium">Cart is empty</p>
                </div>
              )}
            </CardContent>
            <div className="p-6 border-t border-border space-y-4 bg-primary/5 rounded-b-3xl">
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-foreground/60">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-foreground/60">
                  <span>Tax (8%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xl font-bold pt-2 border-t border-primary/10">
                  <span>Total</span>
                  <span className="text-primary">${total.toFixed(2)}</span>
                </div>
              </div>
              
              <Button 
                className="w-full bg-primary hover:bg-primary/90 text-white h-14 rounded-2xl font-bold text-lg shadow-lg shadow-primary/20"
                disabled={cart.length === 0}
                onClick={handleCheckout}
              >
                <DollarSign className="w-5 h-5 mr-2" /> Checkout
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  };

  const renderTechnicians = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl font-black">Staff Management</h2>
          <p className="text-sm md:text-base text-foreground/40 font-medium">Manage technician accounts and system access.</p>
        </div>
        <Button 
          className="bg-primary text-white rounded-full px-4 md:px-6 h-10 md:h-12 font-bold shadow-none text-xs md:text-sm active:scale-95 transition-all"
          onClick={() => setIsNewTechnicianOpen(true)}
        >
          <UserPlus className="w-4 h-4 md:w-5 md:h-5 md:mr-2" />
          <span className="hidden sm:inline">Add Technician</span>
        </Button>
      </div>

      <Card className="soft-card border-none overflow-hidden">
        <div className="overflow-x-auto overflow-y-hidden">
          <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border bg-primary/5">
              <TableHead className="pl-6 font-bold uppercase text-[10px] tracking-widest text-primary">Name</TableHead>
              <TableHead className="font-bold uppercase text-[10px] tracking-widest text-primary">Email</TableHead>
              <TableHead className="font-bold uppercase text-[10px] tracking-widest text-primary">Specialization</TableHead>
              <TableHead className="font-bold uppercase text-[10px] tracking-widest text-primary">Availability</TableHead>
              <TableHead className="font-bold uppercase text-[10px] tracking-widest text-primary">Status</TableHead>
              <TableHead className="text-right pr-6 font-bold uppercase text-[10px] tracking-widest text-primary">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {technicians.map((tech) => (
              <TableRow key={tech.id} className="border-border hover:bg-primary/5 transition-colors group">
                <TableCell className="pl-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                      {tech.name.charAt(0)}
                    </div>
                    <span className="font-bold">{tech.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-foreground/60 text-sm">{tech.email}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="bg-primary/5 text-primary text-[10px] font-black uppercase">
                    {tech.specialization}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Clock className={cn("w-3 h-3", getTechnicianAvailabilityStatus(tech).color.replace("text-", "fill-"))} />
                    <span className={cn("text-[10px] font-black uppercase tracking-wider", getTechnicianAvailabilityStatus(tech).color)}>
                      {getTechnicianAvailabilityStatus(tech).status}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className={cn("w-2 h-2 rounded-full", tech.active !== false ? "bg-green-500" : "bg-foreground/20")} />
                    <span className="text-xs font-bold">{tech.active !== false ? "Active" : "Inactive"}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right pr-6">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => {
                        setEditingTechnician(tech);
                        setIsEditTechnicianOpen(true);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-destructive"
                      onClick={() => setDeleteConfirm({
                        open: true,
                        type: "Technician",
                        id: tech.id,
                        name: tech.name,
                        collection: collections.TECHNICIANS
                      })}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </div>
      </Card>
    </div>
  );

  const renderSettings = () => (
    <div className="max-w-3xl space-y-8">
      <section className="space-y-4">
        <h3 className="text-lg font-bold">Shop Information</h3>
        <Card className="soft-card border-none p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-foreground/40">Shop Name</label>
              <Input defaultValue="TechFix Pro Downtown" className="bg-background rounded-xl" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-foreground/40">Phone Number</label>
              <Input defaultValue="+1 (555) 000-0000" className="bg-background rounded-xl" />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase text-foreground/40">Address</label>
            <Input defaultValue="123 Silicon Valley Blvd, Suite 100" className="bg-background rounded-xl" />
          </div>
        </Card>
      </section>

      <section className="space-y-4">
        <h3 className="text-lg font-bold">Business Hours</h3>
        <Card className="soft-card border-none p-6 space-y-2">
          {["Mon - Fri", "Saturday", "Sunday"].map((day, i) => (
             <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
               <span className="font-medium">{day}</span>
               <span className={cn("text-sm", day === "Sunday" ? "text-red-500 font-bold" : "text-foreground/60")}>
                 {day === "Sunday" ? "Closed" : "09:00 AM - 06:00 PM"}
               </span>
             </div>
          ))}
        </Card>
      </section>

      <Button className="bg-primary hover:bg-primary/90 text-white px-8 rounded-full">Save Changes</Button>
    </div>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans">
      {/* Mobile Sidebar (Sheet) */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="w-[85vw] p-0 bg-card border-r border-border overflow-y-auto">
          <div className="p-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center">
              <LayoutDashboard className="text-white w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg leading-tight tracking-tight">TechFix</span>
              <span className="text-[10px] text-primary font-black uppercase tracking-widest leading-tight">Admin OS</span>
            </div>
          </div>
          <nav className="px-4 space-y-1.5 mt-4">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-4 px-5 py-4 rounded-3xl text-base font-bold transition-all duration-200",
                  activeTab === item.id 
                    ? "bg-primary text-white shadow-none" 
                    : "text-foreground/40 hover:bg-primary/5 hover:text-primary"
                )}
              >
                <item.icon className="w-6 h-6 transition-transform group-hover:scale-105" />
                {item.label}
              </button>
            ))}
          </nav>
          <div className="mt-8 p-4 border-t border-border mx-4 mb-4">
            <Dialog open={isNewRepairOpen} onOpenChange={setIsNewRepairOpen}>
              <DialogTrigger render={
                <Button className="w-full bg-primary hover:bg-primary/90 text-white rounded-3xl h-14 font-bold shadow-none transition-all active:scale-95 group">
                  <Plus className="w-6 h-6 mr-3 transition-transform group-hover:rotate-90" />
                  New Repair
                </Button>
              } />
              <DialogContent className="max-w-[95vw] sm:max-w-[90vw] lg:max-w-6xl w-full bg-card border-border p-0 overflow-hidden rounded-3xl">
                <DialogHeader className="p-6 md:p-10 bg-primary/5 border-b border-primary/10">
                  <DialogTitle className="text-xl md:text-3xl font-bold flex items-center gap-3">
                    <Wrench className="w-6 h-6 md:w-8 md:h-8 text-primary" /> Create Repair Ticket
                  </DialogTitle>
                  <DialogDescription className="text-sm md:text-lg font-medium text-foreground/40 mt-2">
                    Register a new device, add parts, and assign it to a technician.
                  </DialogDescription>
                </DialogHeader>
                <div className="p-6 md:p-10 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 overflow-y-auto max-h-[80vh]">
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <h4 className="text-xs font-black uppercase text-primary tracking-widest">Customer Info</h4>
                      <Input 
                        placeholder="Customer Name" 
                        value={newRepair.customerName}
                        onChange={(e) => setNewRepair(prev => ({ ...prev, customerName: e.target.value }))}
                      />
                      <Input 
                        placeholder="Phone Number" 
                        value={newRepair.customerPhone}
                        onChange={(e) => setNewRepair(prev => ({ ...prev, customerPhone: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-xs font-black uppercase text-primary tracking-widest">Device & Service</h4>
                      <Input 
                        placeholder="Device Model (e.g. iPhone 15)" 
                        value={newRepair.deviceModel}
                        onChange={(e) => setNewRepair(prev => ({ ...prev, deviceModel: e.target.value }))}
                      />
                      <Input 
                        placeholder="Serial Number (SN)" 
                        value={newRepair.serialNumber}
                        onChange={(e) => setNewRepair(prev => ({ ...prev, serialNumber: e.target.value }))}
                      />
                      <select 
                        className="w-full bg-background border border-input rounded-md h-9 px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                        value={newRepair.priority}
                        onChange={(e) => setNewRepair(prev => ({ ...prev, priority: e.target.value }))}
                      >
                        <option value="Low">Low Priority</option>
                        <option value="Medium">Medium Priority</option>
                        <option value="High">High Priority</option>
                        <option value="Urgent">Urgent</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h4 className="text-xs font-black uppercase text-primary tracking-widest">Work Details</h4>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-foreground/40 uppercase ml-1">Assigned Technician</label>
                        <select 
                          className="w-full bg-background border border-input rounded-md h-9 px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                          value={newRepair.technicianId}
                          onChange={(e) => setNewRepair(prev => ({ ...prev, technicianId: e.target.value }))}
                        >
                          <option value="">Select Technician</option>
                          {technicians.map(t => {
                            const { status } = getTechnicianAvailabilityStatus(t);
                            return (
                              <option key={t.id} value={t.id}>
                                {t.name} - {t.specialization} ({status})
                              </option>
                            );
                          })}
                        </select>
                      </div>
                      <Input 
                        placeholder="Repair Issue" 
                        value={newRepair.issueDescription}
                        onChange={(e) => setNewRepair(prev => ({ ...prev, issueDescription: e.target.value }))}
                      />
                      <textarea 
                        className="w-full bg-background border border-input rounded-md p-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 min-h-[80px]"
                        placeholder="Internal / Customer Note"
                        value={newRepair.customerNote}
                        onChange={(e) => setNewRepair(prev => ({ ...prev, customerNote: e.target.value }))}
                      />
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-primary tracking-widest ml-1">Labor / Service Fee ($)</label>
                        <Input 
                          placeholder="Labor Fee" 
                          type="number"
                          value={newRepair.estimate}
                          onChange={(e) => setNewRepair(prev => ({ ...prev, estimate: Number(e.target.value) }))}
                        />
                      </div>
                      <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 flex items-center justify-between">
                         <div className="flex flex-col">
                           <span className="text-[10px] font-black uppercase tracking-widest text-primary">Parts + Labor</span>
                           <span className="text-xs font-bold text-foreground/40">Grand Total</span>
                         </div>
                         <span className="text-2xl font-black text-primary">
                           ${(newRepair.estimate || 0) + (newRepair.items || []).reduce((acc: number, item: any) => acc + (item.price || 0), 0)}
                         </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <h4 className="text-sm font-black uppercase text-primary tracking-[0.2em]">Parts & Items</h4>
                    <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                       {newRepair.items.length === 0 ? (
                         <div className="flex flex-col items-center justify-center py-8 bg-muted/30 rounded-2xl border border-dashed border-border">
                           <Package className="w-8 h-8 text-foreground/10 mb-2" />
                           <p className="text-xs text-foreground/30 italic">No parts added yet.</p>
                         </div>
                       ) : (
                         newRepair.items.map(item => (
                           <div key={item.id} className="flex items-center justify-between bg-muted/50 p-4 rounded-2xl group border border-transparent hover:border-primary/20 transition-all">
                             <div>
                               <p className="text-sm font-bold">{item.name}</p>
                               <p className="text-xs text-primary font-bold">${item.price}</p>
                             </div>
                             <Button 
                               variant="ghost" 
                               size="icon" 
                               className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                               onClick={() => removeItemFromRepair(item.id)}
                             >
                               <Trash2 className="w-4 h-4" />
                             </Button>
                           </div>
                         ))
                       )}
                    </div>
                    <div className="space-y-4">
                      <p className="text-xs font-black text-foreground/40 uppercase tracking-widest pl-1">Add from Inventory</p>
                      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {inventory.map(item => (
                           <button 
                            key={item.id}
                            className="w-full text-left p-4 rounded-2xl hover:bg-primary/5 text-sm flex items-center justify-between border border-border/50 hover:border-primary/20 transition-all group"
                            onClick={() => addItemToRepair(item)}
                           >
                             <div className="flex flex-col">
                               <span className="font-bold group-hover:text-primary transition-colors">{item.name}</span>
                               <span className="text-[10px] text-foreground/40 font-mono">Stock: {item.stock} | ${item.price}</span>
                             </div>
                             <Plus className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-all" />
                           </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <DialogFooter className="p-8 bg-card border-t border-border flex gap-4">
                  <Button variant="ghost" className="h-12 px-8 rounded-2xl font-bold" onClick={() => setIsNewRepairOpen(false)}>Cancel</Button>
                  <Button 
                    className="bg-primary text-white rounded-full px-12 h-12 font-bold shadow-none active:scale-95 transition-all" 
                    onClick={handleCreateRepair}
                    disabled={!newRepair.customerName || !newRepair.deviceModel}
                  >
                    Create Repair
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside className="w-64 border-r border-border bg-card hidden lg:flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center">
            <LayoutDashboard className="text-white w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg leading-tight tracking-tight">TechFix</span>
            <span className="text-[10px] text-primary font-black uppercase tracking-widest leading-tight">Admin OS</span>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 mt-4">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-5 py-3.5 rounded-3xl text-sm font-bold transition-all duration-200",
                activeTab === item.id 
                  ? "bg-primary text-white shadow-none" 
                  : "text-foreground/40 hover:bg-primary/5 hover:text-primary"
              )}
            >
              <item.icon className="w-5 h-5 transition-transform group-hover:scale-105" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto p-4 border-t border-border mx-4 mb-4">
          <Dialog open={isNewRepairOpen} onOpenChange={setIsNewRepairOpen}>
            <DialogTrigger render={
              <Button className="w-full bg-primary hover:bg-primary/90 text-white rounded-3xl h-14 font-bold shadow-none transition-all active:scale-95 group">
                <Plus className="w-6 h-6 mr-3 transition-transform group-hover:rotate-90" />
                New Repair
              </Button>
            } />
            <DialogContent className="max-w-[95vw] sm:max-w-[90vw] lg:max-w-6xl w-full bg-card border-border p-0 overflow-hidden rounded-3xl">
              <DialogHeader className="p-6 md:p-10 bg-primary/5 border-b border-primary/10">
                <DialogTitle className="text-xl md:text-3xl font-bold flex items-center gap-3">
                  <Wrench className="w-6 h-6 md:w-8 md:h-8 text-primary" /> Create Repair Ticket
                </DialogTitle>
                <DialogDescription className="text-sm md:text-lg font-medium text-foreground/40 mt-2">
                  Register a new device, add parts, and assign it to a technician.
                </DialogDescription>
              </DialogHeader>
              <div className="p-6 md:p-10 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 overflow-y-auto max-h-[80vh]">
                <div className="space-y-8">
                  <div className="space-y-4">
                    <h4 className="text-xs font-black uppercase text-primary tracking-widest">Customer Info</h4>
                    <Input 
                      placeholder="Customer Name" 
                      value={newRepair.customerName}
                      onChange={(e) => setNewRepair(prev => ({ ...prev, customerName: e.target.value }))}
                    />
                    <Input 
                      placeholder="Phone Number" 
                      value={newRepair.customerPhone}
                      onChange={(e) => setNewRepair(prev => ({ ...prev, customerPhone: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-xs font-black uppercase text-primary tracking-widest">Device & Service</h4>
                    <Input 
                      placeholder="Device Model (e.g. iPhone 15)" 
                      value={newRepair.deviceModel}
                      onChange={(e) => setNewRepair(prev => ({ ...prev, deviceModel: e.target.value }))}
                    />
                    <Input 
                      placeholder="Serial Number (SN)" 
                      value={newRepair.serialNumber}
                      onChange={(e) => setNewRepair(prev => ({ ...prev, serialNumber: e.target.value }))}
                    />
                    <select 
                      className="w-full bg-background border border-input rounded-md h-9 px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                      value={newRepair.priority}
                      onChange={(e) => setNewRepair(prev => ({ ...prev, priority: e.target.value }))}
                    >
                      <option value="Low">Low Priority</option>
                      <option value="Medium">Medium Priority</option>
                      <option value="High">High Priority</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-4">
                    <h4 className="text-xs font-black uppercase text-primary tracking-widest">Work Details</h4>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-foreground/40 uppercase ml-1">Assigned Technician</label>
                      <select 
                        className="w-full bg-background border border-input rounded-md h-9 px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                        value={newRepair.technicianId}
                        onChange={(e) => setNewRepair(prev => ({ ...prev, technicianId: e.target.value }))}
                      >
                        <option value="">Select Technician</option>
                        {technicians.map(t => {
                          const { status } = getTechnicianAvailabilityStatus(t);
                          return (
                            <option key={t.id} value={t.id}>
                              {t.name} - {t.specialization} ({status})
                            </option>
                          );
                        })}
                      </select>
                    </div>
                    <Input 
                      placeholder="Repair Issue" 
                      value={newRepair.issueDescription}
                      onChange={(e) => setNewRepair(prev => ({ ...prev, issueDescription: e.target.value }))}
                    />
                    <textarea 
                      className="w-full bg-background border border-input rounded-md p-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 min-h-[80px]"
                      placeholder="Internal / Customer Note"
                      value={newRepair.customerNote}
                      onChange={(e) => setNewRepair(prev => ({ ...prev, customerNote: e.target.value }))}
                    />
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-primary tracking-widest ml-1">Labor / Service Fee ($)</label>
                        <Input 
                          placeholder="Labor Fee" 
                          type="number"
                          value={newRepair.estimate}
                          onChange={(e) => setNewRepair(prev => ({ ...prev, estimate: Number(e.target.value) }))}
                        />
                      </div>
                      <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 flex items-center justify-between">
                         <div className="flex flex-col">
                           <span className="text-[10px] font-black uppercase tracking-widest text-primary">Parts + Labor</span>
                           <span className="text-xs font-bold text-foreground/40">Grand Total</span>
                         </div>
                         <span className="text-2xl font-black text-primary">
                           ${(newRepair.estimate || 0) + (newRepair.items || []).reduce((acc: number, item: any) => acc + (item.price || 0), 0)}
                         </span>
                      </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <h4 className="text-sm font-black uppercase text-primary tracking-[0.2em]">Parts & Items</h4>
                  <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                     {newRepair.items.length === 0 ? (
                       <div className="flex flex-col items-center justify-center py-8 bg-muted/30 rounded-2xl border border-dashed border-border">
                         <Package className="w-8 h-8 text-foreground/10 mb-2" />
                         <p className="text-xs text-foreground/30 italic">No parts added yet.</p>
                       </div>
                     ) : (
                       newRepair.items.map(item => (
                         <div key={item.id} className="flex items-center justify-between bg-muted/50 p-4 rounded-2xl group border border-transparent hover:border-primary/20 transition-all">
                           <div>
                             <p className="text-sm font-bold">{item.name}</p>
                             <p className="text-xs text-primary font-bold">${item.price}</p>
                           </div>
                           <Button 
                             variant="ghost" 
                             size="icon" 
                             className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                             onClick={() => removeItemFromRepair(item.id)}
                           >
                             <Trash2 className="w-4 h-4" />
                           </Button>
                         </div>
                       ))
                     )}
                  </div>
                  <div className="space-y-4">
                    <p className="text-xs font-black text-foreground/40 uppercase tracking-widest pl-1">Add from Inventory</p>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                      {inventory.map(item => (
                         <button 
                          key={item.id}
                          className="w-full text-left p-4 rounded-2xl hover:bg-primary/5 text-sm flex items-center justify-between border border-border/50 hover:border-primary/20 transition-all group"
                          onClick={() => addItemToRepair(item)}
                         >
                           <div className="flex flex-col">
                             <span className="font-bold group-hover:text-primary transition-colors">{item.name}</span>
                             <span className="text-[10px] text-foreground/40 font-mono">Stock: {item.stock} | ${item.price}</span>
                           </div>
                           <Plus className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-all" />
                         </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter className="p-8 bg-card border-t border-border flex gap-4">
                <Button variant="ghost" className="h-12 px-8 rounded-full font-bold" onClick={() => setIsNewRepairOpen(false)}>Cancel</Button>
                <Button 
                  className="bg-primary text-white rounded-full px-12 h-12 font-bold transition-all active:scale-95" 
                  onClick={handleCreateRepair}
                  disabled={!newRepair.customerName || !newRepair.deviceModel}
                >
                  Create Repair
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-20 border-b border-border bg-card/50 backdrop-blur-xl flex items-center justify-between px-4 md:px-10">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            {/* Mobile Logo Container */}
            <div className="lg:hidden w-10 h-10 rounded-2xl bg-primary flex items-center justify-center">
              <LayoutDashboard className="text-white w-6 h-6" />
            </div>
            <div className="relative w-full group hidden sm:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/20 group-focus-within:text-primary transition-colors" />
              <Input 
                placeholder="Search everything..." 
                className="pl-12 bg-secondary/50 border-transparent focus:bg-white focus:border-primary/20 focus-visible:ring-0 h-12 rounded-full transition-all"
              />
            </div>
            {/* Mobile Brand Label */}
            <div className="lg:hidden font-black text-lg tracking-tighter truncate sm:hidden">TechFix</div>
          </div>

          <div className="flex items-center gap-3 md:gap-4">
            <Button variant="ghost" size="icon" className="relative touch-target text-foreground/40 hover:text-primary hover:bg-primary/5 transition-all rounded-full hidden md:flex">
              <Bell className="w-6 h-6" />
              <span className="absolute top-2.5 right-2.5 w-3 h-3 bg-primary rounded-full border-2 border-white" />
            </Button>
            
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button variant="ghost" className="h-10 md:h-12 bg-white border border-border px-3 rounded-full flex items-center gap-3 hover:bg-primary/5 transition-all group">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xs group-hover:scale-105 transition-transform overflow-hidden font-sans">
                        {user.photoURL ? (
                          <img src={user.photoURL} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          user.displayName?.substring(0, 2).toUpperCase() || "AD"
                        )}
                      </div>
                      <div className="hidden md:flex flex-col text-left font-sans">
                        <span className="text-[11px] font-bold leading-tight tracking-tight">{user.displayName || "Admin Account"}</span>
                        <span className="text-[9px] text-primary font-black uppercase tracking-widest leading-tight">Master</span>
                      </div>
                    </Button>
                  }
                />
                <DropdownMenuContent align="end" className="w-64 bg-card border-border p-2 rounded-3xl shadow-none border font-sans mt-2">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="p-4 bg-muted/50 rounded-2xl mb-2">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-bold leading-none">{user.displayName || "Admin Account"}</p>
                        <p className="text-[10px] leading-none text-muted-foreground font-mono truncate">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator className="bg-border/50" />
                  <DropdownMenuItem className="p-3 rounded-2xl focus:bg-destructive/5 cursor-pointer text-destructive focus:text-destructive group" onClick={logout}>
                    <LogOut className="mr-3 h-4 w-4 transition-transform group-hover:scale-110" />
                    <span className="font-bold">Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <Dialog open={isNewTechnicianOpen} onOpenChange={setIsNewTechnicianOpen}>
              <DialogContent className="max-w-[95vw] sm:max-w-md bg-card border-border p-0 overflow-hidden rounded-3xl">
                <DialogHeader className="p-8 bg-primary/5 border-b border-primary/10">
                  <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                    <UserPlus className="w-6 h-6 text-primary" /> Add Staff Member
                  </DialogTitle>
                </DialogHeader>
                <div className="p-8 space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-foreground/40 uppercase ml-1">Basic Info</label>
                      <Input 
                        placeholder="Full Name" 
                        className="h-12 rounded-2xl font-bold"
                        value={newTechnician.name}
                        onChange={(e) => setNewTechnician(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <Input 
                      placeholder="Specialization (e.g. Microsoldering)" 
                      className="h-12 rounded-2xl font-bold"
                      value={newTechnician.specialization}
                      onChange={(e) => setNewTechnician(prev => ({ ...prev, specialization: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-foreground/40 uppercase ml-1">Account Credentials</label>
                      <Input 
                        placeholder="Email Address" 
                        className="h-12 rounded-2xl font-bold"
                        value={newTechnician.email}
                        onChange={(e) => setNewTechnician(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>
                    <Input 
                      placeholder="Password" 
                      type="password"
                      className="h-12 rounded-2xl font-bold"
                      value={newTechnician.password}
                      onChange={(e) => setNewTechnician(prev => ({ ...prev, password: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-4 pt-4 border-t border-border">
                    <label className="text-[10px] font-black uppercase text-primary tracking-[0.2em] block mb-2">Availability</label>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-foreground/40 uppercase ml-1">Start Time</label>
                        <Input 
                          type="time"
                          className="h-12 rounded-2xl font-bold"
                          value={newTechnician.availability?.workingHours?.start || "09:00"}
                          onChange={(e) => setNewTechnician(prev => ({
                            ...prev,
                            availability: {
                              ...prev.availability,
                              workingHours: { ...prev.availability.workingHours, start: e.target.value }
                            }
                          }))}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-foreground/40 uppercase ml-1">End Time</label>
                        <Input 
                          type="time"
                          className="h-12 rounded-2xl font-bold"
                          value={newTechnician.availability?.workingHours?.end || "17:00"}
                          onChange={(e) => setNewTechnician(prev => ({
                            ...prev,
                            availability: {
                              ...prev.availability,
                              workingHours: { ...prev.availability.workingHours, end: e.target.value }
                            }
                          }))}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-foreground/40 uppercase ml-1">Days Off</label>
                      <div className="flex flex-wrap gap-2">
                        {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(day => (
                          <button
                            key={day}
                            type="button"
                            className={cn(
                              "px-3 py-1.5 rounded-full text-[10px] font-bold transition-all border",
                              (newTechnician.availability?.daysOff || []).includes(day)
                                ? "bg-red-500/10 border-red-500 text-red-500"
                                : "bg-muted border-transparent text-foreground/40 hover:border-foreground/20"
                            )}
                            onClick={() => {
                              const daysOff = (newTechnician.availability?.daysOff || []).includes(day)
                                ? newTechnician.availability.daysOff.filter(d => d !== day)
                                : [...(newTechnician.availability?.daysOff || []), day];
                              setNewTechnician(prev => ({
                                ...prev,
                                availability: { ...prev.availability, daysOff }
                              }));
                            }}
                          >
                            {day.slice(0, 3)}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <DialogFooter className="p-8 bg-card border-t border-border flex gap-4">
                  <Button variant="ghost" className="h-12 rounded-2xl font-bold flex-1" onClick={() => setIsNewTechnicianOpen(false)}>Cancel</Button>
                  <Button 
                    className="bg-primary text-white rounded-full h-12 font-bold flex-1 shadow-none active:scale-95 transition-all" 
                    onClick={handleCreateTechnician}
                    disabled={!newTechnician.name || !newTechnician.email || !newTechnician.password}
                  >
                    Save Technician
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={isEditTechnicianOpen} onOpenChange={setIsEditTechnicianOpen}>
              <DialogContent className="max-w-[95vw] sm:max-w-md bg-card border-border p-0 overflow-hidden rounded-3xl">
                {editingTechnician && (
                  <>
                     <DialogHeader className="p-8 bg-primary/5 border-b border-primary/10">
                      <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                        <Edit className="w-6 h-6 text-primary" /> Edit Staff Account
                      </DialogTitle>
                    </DialogHeader>
                    <div className="p-8 space-y-6">
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-foreground/40 uppercase ml-1">Staff Data</label>
                          <Input 
                            placeholder="Full Name" 
                            className="h-12 rounded-2xl font-bold"
                            value={editingTechnician.name}
                            onChange={(e) => setEditingTechnician((prev: any) => ({ ...prev, name: e.target.value }))}
                          />
                        </div>
                        <Input 
                          placeholder="Specialization" 
                          className="h-12 rounded-2xl font-bold"
                          value={editingTechnician.specialization}
                          onChange={(e) => setEditingTechnician((prev: any) => ({ ...prev, specialization: e.target.value }))}
                        />
                        <div className="flex items-center justify-between p-4 bg-primary/5 rounded-2xl border border-primary/10">
                          <span className="text-sm font-bold">Active Status</span>
                          <button 
                            className={cn(
                              "w-12 h-6 rounded-full transition-colors relative",
                              editingTechnician.active !== false ? "bg-primary" : "bg-foreground/10"
                            )}
                            onClick={() => setEditingTechnician((prev: any) => ({ ...prev, active: prev.active === false }))}
                          >
                            <div className={cn(
                              "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                              editingTechnician.active !== false ? "right-1" : "left-1"
                            )} />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-4 pt-4 border-t border-border">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-foreground/40 uppercase ml-1">Update Credentials</label>
                          <Input 
                            placeholder="Email Address" 
                            className="h-12 rounded-2xl font-bold"
                            value={editingTechnician.email}
                            onChange={(e) => setEditingTechnician((prev: any) => ({ ...prev, email: e.target.value }))}
                          />
                        </div>
                        <Input 
                          placeholder="Change Password" 
                          type="password"
                          className="h-12 rounded-2xl font-bold"
                          value={editingTechnician.password}
                          onChange={(e) => setEditingTechnician((prev: any) => ({ ...prev, password: e.target.value }))}
                        />
                      </div>

                      <div className="space-y-4 pt-4 border-t border-border">
                        <label className="text-[10px] font-black uppercase text-primary tracking-[0.2em] block mb-2">Availability Schedule</label>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-foreground/40 uppercase ml-1">Start Time</label>
                            <Input 
                              type="time"
                              className="h-12 rounded-2xl font-bold"
                              value={editingTechnician.availability?.workingHours?.start || "09:00"}
                              onChange={(e) => setEditingTechnician((prev: any) => ({
                                ...prev,
                                availability: {
                                  ...prev.availability,
                                  workingHours: { ...(prev.availability?.workingHours || {}), start: e.target.value }
                                }
                              }))}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-foreground/40 uppercase ml-1">End Time</label>
                            <Input 
                              type="time"
                              className="h-12 rounded-2xl font-bold"
                              value={editingTechnician.availability?.workingHours?.end || "17:00"}
                              onChange={(e) => setEditingTechnician((prev: any) => ({
                                ...prev,
                                availability: {
                                  ...prev.availability,
                                  workingHours: { ...(prev.availability?.workingHours || {}), end: e.target.value }
                                }
                              }))}
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-foreground/40 uppercase ml-1">Days Off</label>
                          <div className="flex flex-wrap gap-2">
                            {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(day => (
                              <button
                                key={day}
                                type="button"
                                className={cn(
                                  "px-3 py-1.5 rounded-full text-[10px] font-bold transition-all border",
                                  (editingTechnician.availability?.daysOff || []).includes(day)
                                    ? "bg-red-500/10 border-red-500 text-red-500"
                                    : "bg-muted border-transparent text-foreground/40 hover:border-foreground/20"
                                )}
                                onClick={() => {
                                  const daysOff = (editingTechnician.availability?.daysOff || []).includes(day)
                                    ? editingTechnician.availability.daysOff.filter((d: string) => d !== day)
                                    : [...(editingTechnician.availability?.daysOff || []), day];
                                  setEditingTechnician((prev: any) => ({
                                    ...prev,
                                    availability: { ...(prev.availability || {}), daysOff }
                                  }));
                                }}
                              >
                                {day.slice(0, 3)}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    <DialogFooter className="p-8 bg-card border-t border-border flex gap-4">
                      <Button variant="ghost" className="h-12 rounded-2xl font-bold flex-1" onClick={() => setIsEditTechnicianOpen(false)}>Cancel</Button>
                      <Button 
                        className="bg-primary text-white rounded-2xl h-12 font-bold flex-1 shadow-xl shadow-primary/20" 
                        onClick={handleUpdateTechnician}
                      >
                        Push Updates
                      </Button>
                    </DialogFooter>
                  </>
                )}
              </DialogContent>
            </Dialog>

            <Dialog open={isEditRepairOpen} onOpenChange={setIsEditRepairOpen}>
              <DialogContent className="max-w-[95vw] sm:max-w-[90vw] lg:max-w-5xl w-full bg-card border-border p-0 overflow-hidden rounded-3xl">
                {editingRepair && (
                  <>
                    <DialogHeader className="p-6 md:p-8 bg-primary/5 border-b border-primary/10">
                      <DialogTitle className="text-xl md:text-2xl font-black flex items-center gap-3">
                        <Edit className="w-5 h-5 md:w-6 md:h-6 text-primary" /> Edit Repair Ticket
                      </DialogTitle>
                      <DialogDescription className="text-xs md:text-sm font-medium text-foreground/40 mt-1">
                        Update status, tech, parts, and billing details.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 overflow-y-auto max-h-[75vh]">
                      <div className="space-y-6">
                        <div className="space-y-4">
                          <h4 className="text-[10px] font-black uppercase text-primary tracking-[0.2em]">Assignment & Status</h4>
                          <div className="grid grid-cols-1 gap-3">
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-foreground/40 uppercase ml-1">Repair Status</label>
                              <select 
                                className="w-full bg-background border border-border rounded-xl h-10 px-3 text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20 appearance-none shadow-sm"
                                value={editingRepair.status}
                                onChange={(e) => setEditingRepair(prev => ({ ...prev, status: e.target.value }))}
                              >
                                <option value="Received">Received</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Waiting for Parts">Waiting for Parts</option>
                                <option value="Ready for Pickup">Ready for Pickup</option>
                                <option value="Completed">Completed</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-foreground/40 uppercase ml-1">Technician</label>
                              <select 
                                className="w-full bg-background border border-border rounded-xl h-10 px-3 text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20 appearance-none shadow-sm"
                                value={editingRepair.technicianId || ""}
                                onChange={(e) => setEditingRepair(prev => ({ ...prev, technicianId: e.target.value }))}
                              >
                                <option value="">Unassigned</option>
                                {technicians.map(t => {
                                  const { status } = getTechnicianAvailabilityStatus(t);
                                  return (
                                    <option key={t.id} value={t.id}>
                                      {t.name} ({status})
                                    </option>
                                  );
                                })}
                              </select>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h4 className="text-[10px] font-black uppercase text-primary tracking-[0.2em]">Device Specs</h4>
                          <div className="space-y-3">
                            <Input 
                              placeholder="Device Model" 
                              className="h-10 rounded-xl font-bold text-xs"
                              value={editingRepair.deviceModel}
                              onChange={(e) => setEditingRepair(prev => ({ ...prev, deviceModel: e.target.value }))}
                            />
                            <Input 
                              placeholder="Serial Number (SN)" 
                              className="h-10 rounded-xl font-bold text-xs"
                              value={editingRepair.serialNumber || ""}
                              onChange={(e) => setEditingRepair(prev => ({ ...prev, serialNumber: e.target.value }))}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="space-y-4">
                           <h4 className="text-[10px] font-black uppercase text-primary tracking-[0.2em]">Work Progress</h4>
                           <textarea 
                            className="w-full bg-background border border-border rounded-xl p-4 text-xs font-medium outline-none focus:ring-2 focus:ring-primary/20 min-h-[100px] shadow-sm"
                            placeholder="Issue & Work Done" 
                            value={editingRepair.issueDescription}
                            onChange={(e) => setEditingRepair(prev => ({ ...prev, issueDescription: e.target.value }))}
                          />
                          <textarea 
                            className="w-full bg-background border border-border rounded-xl p-4 text-xs font-medium outline-none focus:ring-2 focus:ring-primary/20 min-h-[80px] shadow-sm"
                            placeholder="Internal Notes"
                            value={editingRepair.customerNote || ""}
                            onChange={(e) => setEditingRepair(prev => ({ ...prev, customerNote: e.target.value }))}
                          />
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-black uppercase text-primary tracking-widest ml-1">Labor Fee ($)</label>
                              <Input 
                                type="number"
                                className="h-10 rounded-xl font-bold text-xs"
                                value={editingRepair.estimate}
                                onChange={(e) => setEditingRepair(prev => ({ ...prev, estimate: Number(e.target.value) }))}
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-foreground/40 uppercase ml-1">Priority</label>
                              <select 
                                className="w-full bg-background border border-border rounded-xl h-10 px-3 text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20 appearance-none shadow-sm"
                                value={editingRepair.priority}
                                onChange={(e) => setEditingRepair(prev => ({ ...prev, priority: e.target.value }))}
                              >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                                <option value="Urgent">Urgent</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="space-y-4">
                          <h4 className="text-[10px] font-black uppercase text-primary tracking-[0.2em]">Parts & Billing</h4>
                          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
                             {(editingRepair.items || []).length === 0 ? (
                               <div className="flex flex-col items-center justify-center py-6 bg-muted/20 rounded-xl border border-dashed border-border">
                                 <p className="text-[10px] text-foreground/30 italic">No parts attached.</p>
                               </div>
                             ) : (
                               (editingRepair.items || []).map((item: any) => (
                                 <div key={item.id} className="flex items-center justify-between bg-muted/40 p-3 rounded-xl group border border-transparent hover:border-primary/20 transition-all">
                                   <div>
                                     <p className="text-xs font-bold">{item.name}</p>
                                     <p className="text-[10px] text-primary font-black">${item.price}</p>
                                   </div>
                                   <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-7 w-7 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => removeItemFromRepair(item.id, true)}
                                   >
                                     <Trash2 className="w-3.5 h-3.5" />
                                   </Button>
                                 </div>
                               ))
                             )}
                          </div>
                          
                          <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                             <div className="flex items-center justify-between mb-1">
                               <span className="text-[10px] font-black uppercase tracking-widest text-primary">Grand Total</span>
                               <span className="text-xl font-black text-primary">
                                 ${Number(editingRepair.estimate || 0) + (editingRepair.items || []).reduce((acc: number, item: any) => acc + (item.price || 0), 0)}
                               </span>
                             </div>
                             <p className="text-[10px] text-foreground/40 font-bold italic">Parts + Service Fee</p>
                          </div>

                          <div className="space-y-2">
                             <p className="text-[10px] font-black text-foreground/40 uppercase tracking-widest pl-1">Add Inventory</p>
                             <div className="grid grid-cols-1 gap-2 max-h-[150px] overflow-y-auto pr-2 custom-scrollbar">
                               {inventory.map(item => (
                                  <button 
                                   key={item.id}
                                   className="w-full text-left p-3 rounded-xl hover:bg-primary/5 text-xs flex items-center justify-between border border-border hover:border-primary/20 transition-all group"
                                   onClick={() => addItemToRepair(item, true)}
                                  >
                                    <div className="flex flex-col">
                                      <span className="font-bold group-hover:text-primary transition-colors">{item.name}</span>
                                      <span className="text-[9px] text-foreground/40 font-mono">Stock: {item.stock} | ${item.price}</span>
                                    </div>
                                    <Plus className="w-3 h-3 text-primary" />
                                  </button>
                               ))}
                             </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <DialogFooter className="p-6 bg-card border-t border-border flex gap-3">
                      <Button variant="ghost" className="h-11 px-6 rounded-xl font-bold flex-1" onClick={() => setIsEditRepairOpen(false)}>Cancel</Button>
                      {editingRepair.status === "Completed" && (
                        <Button 
                          variant="outline" 
                          className="h-11 px-6 rounded-xl font-bold border-2 border-blue-500 text-blue-500 hover:bg-blue-50 flex-1 flex items-center justify-center gap-2"
                          onClick={() => generateInvoice(editingRepair)}
                        >
                          <FileText className="w-4 h-4" /> Invoice
                        </Button>
                      )}
                      <Button 
                        className="bg-primary text-white rounded-xl h-11 font-bold flex-[2] shadow-lg shadow-primary/10 active:scale-95 transition-all" 
                        onClick={handleUpdateRepair}
                      >
                        Push Changes
                      </Button>
                    </DialogFooter>
                  </>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </header>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-10 bg-background/50">
          <div className="max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === "overview" && renderOverview()}
                {activeTab === "repairs" && renderRepairs()}
                {activeTab === "inventory" && renderInventory()}
                {activeTab === "technicians" && renderTechnicians()}
                {activeTab === "customers" && renderCustomers()}
                {activeTab === "pos" && renderPOS()}
                {activeTab === "settings" && renderSettings()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Global Delete Confirmation Dialog */}
      <Dialog 
        open={deleteConfirm.open} 
        onOpenChange={(open) => setDeleteConfirm(prev => ({ ...prev, open }))}
      >
        <DialogContent className="max-w-[95vw] sm:max-w-md bg-card border-border p-4 md:p-8 rounded-3xl overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-destructive/20">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              className="h-full bg-destructive"
            />
          </div>
          <DialogHeader className="pt-4">
            <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center text-destructive mb-4 shadow-inner">
              <Trash2 className="w-7 h-7" />
            </div>
            <DialogTitle className="text-2xl font-bold">Confirm Deletion</DialogTitle>
            <DialogDescription className="text-base font-medium text-foreground/40 mt-3 leading-relaxed">
              Are you sure you want to delete <span className="text-foreground font-bold">{deleteConfirm.name}</span>? 
              This action is <span className="text-destructive font-bold underline decoration-destructive/30 underline-offset-4">permanent</span> and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-10 flex gap-4">
            <Button 
              variant="secondary" 
              className="flex-1 h-12 rounded-full font-bold bg-secondary/50 hover:bg-secondary text-foreground/60 transition-all"
              onClick={() => setDeleteConfirm(prev => ({ ...prev, open: false }))}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              className="flex-1 h-12 rounded-full font-bold shadow-none active:scale-95 transition-all"
              onClick={handleDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Repair Details Dialog */}
      <Dialog open={isViewRepairOpen} onOpenChange={setIsViewRepairOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-[90vw] lg:max-w-5xl w-full bg-card border-border p-0 overflow-hidden rounded-3xl">
          {viewingRepair && (
            <>
              <DialogHeader className="p-6 md:p-10 bg-primary/5 border-b border-primary/10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                       <span className="text-xs font-black uppercase text-primary tracking-widest px-2 py-1 bg-primary/10 rounded-lg">Ticket ID</span>
                       <span className="text-xl font-mono font-bold tracking-tighter">TF-{viewingRepair.id.slice(0, 8).toUpperCase()}</span>
                    </div>
                    <DialogTitle className="text-2xl md:text-4xl font-black tracking-tight">{viewingRepair.deviceModel}</DialogTitle>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className={cn(
                      "rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider h-fit",
                      viewingRepair.status === "Received" && "border-blue-500 text-blue-500 bg-blue-500/10",
                      viewingRepair.status === "In Progress" && "border-amber-500 text-amber-500 bg-amber-500/10",
                      viewingRepair.status === "Ready for Pickup" && "border-primary text-primary bg-primary/10",
                      viewingRepair.status === "Completed" && "border-green-500 text-green-500 bg-green-500/10",
                    )}>
                      {viewingRepair.status}
                    </Badge>
                    <div className="flex items-center gap-2 px-4 py-1.5 bg-muted rounded-full">
                      <AlertCircle className={cn(
                        "w-4 h-4",
                        viewingRepair.priority === "Urgent" ? "text-red-600 animate-pulse" : "text-foreground/40"
                      )} />
                      <span className="text-xs font-bold uppercase tracking-widest">{viewingRepair.priority}</span>
                    </div>
                  </div>
                </div>
              </DialogHeader>

              <div className="p-6 md:p-10 grid grid-cols-1 md:grid-cols-3 gap-10 overflow-y-auto max-h-[70vh]">
                {/* Section: Customer */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 pb-2 border-b border-border">
                    <Users className="w-5 h-5 text-primary" />
                    <h4 className="text-sm font-black uppercase tracking-widest">Customer Details</h4>
                  </div>
                  <div className="space-y-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black text-foreground/30 uppercase tracking-widest">Full Name</span>
                      <p className="font-bold text-lg">{viewingRepair.customerName}</p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black text-foreground/30 uppercase tracking-widest">Contact Number</span>
                      <div className="flex items-center gap-2 group">
                        <Phone className="w-4 h-4 text-primary" />
                        <p className="font-bold font-mono">{viewingRepair.customerPhone}</p>
                      </div>
                    </div>
                    {viewingRepair.customerNote && (
                      <div className="p-4 bg-muted/30 rounded-2xl border border-border">
                        <span className="text-[10px] font-black text-foreground/30 uppercase tracking-widest block mb-2">Customer Note</span>
                        <p className="text-sm font-medium italic text-foreground/60 leading-relaxed">"{viewingRepair.customerNote}"</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Section: Device */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 pb-2 border-b border-border">
                    <Info className="w-5 h-5 text-primary" />
                    <h4 className="text-sm font-black uppercase tracking-widest">Technical Info</h4>
                  </div>
                  <div className="space-y-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black text-foreground/30 uppercase tracking-widest">Serial / IMEI</span>
                      <p className="font-mono font-bold text-foreground/70">{viewingRepair.serialNumber || "Not Specified"}</p>
                    </div>
                    <div className="flex flex-col gap-1 p-5 bg-background border border-border rounded-2xl shadow-sm">
                      <span className="text-[10px] font-black text-primary uppercase tracking-widest mb-2">Internal Report / Issue</span>
                      <p className="text-sm font-medium leading-relaxed">{viewingRepair.issueDescription}</p>
                    </div>
                  </div>
                </div>

                {/* Section: Timeline & Parts */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 pb-2 border-b border-border">
                    <Wrench className="w-5 h-5 text-primary" />
                    <h4 className="text-sm font-black uppercase tracking-widest">Repair Log</h4>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-bold text-foreground/40">Technician:</span>
                      <div className="flex items-center gap-2">
                         <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                           <User className="w-3 h-3 text-primary" />
                         </div>
                         <span className="font-bold">{technicians.find(t => t.id === viewingRepair.technicianId)?.name || "Unassigned"}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-bold text-foreground/40">Registered:</span>
                      <div className="flex items-center gap-2">
                         <Calendar className="w-4 h-4 text-foreground/20" />
                         <span className="font-bold text-foreground/60">{viewingRepair.createdAt ? new Date(viewingRepair.createdAt.seconds * 1000).toLocaleDateString() : "Snapshot"}</span>
                      </div>
                    </div>
                    <div className="pt-4 space-y-3">
                      <span className="text-[10px] font-black text-foreground/30 uppercase tracking-widest block">Financial Summary</span>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs p-3 bg-muted/30 rounded-xl">
                          <span className="font-bold text-foreground/40 italic">Service/Labor Fee</span>
                          <span className="font-bold">${viewingRepair.estimate || 0}</span>
                        </div>
                        
                        {(viewingRepair.items || []).length > 0 && (
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest pl-3">Parts</span>
                            {(viewingRepair.items || []).map((item: any) => (
                              <div key={item.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-xl border border-border/50">
                                <span className="text-xs font-bold truncate">{item.name}</span>
                                <span className="text-xs font-black text-primary">${item.price}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="pt-4 flex flex-col gap-2 border-t border-border mt-2">
                           <div className="flex items-center justify-between px-3">
                             <span className="text-[10px] font-black uppercase text-foreground/30 tracking-widest">Parts Total</span>
                             <span className="text-sm font-bold">${(viewingRepair.items || []).reduce((acc: number, item: any) => acc + (item.price || 0), 0)}</span>
                           </div>
                           <div className="flex items-center justify-between px-3 py-4 bg-primary/5 rounded-2xl border border-primary/10">
                             <span className="font-black text-xs uppercase tracking-widest text-primary">Grand Total</span>
                             <span className="text-2xl font-black text-primary">
                               ${(viewingRepair.estimate || 0) + (viewingRepair.items || []).reduce((acc: number, item: any) => acc + (item.price || 0), 0)}
                             </span>
                           </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter className="p-8 bg-muted/20 border-t border-border flex flex-col md:flex-row gap-4">
                <Button 
                  variant="secondary" 
                  className="h-14 flex-1 rounded-2xl font-bold bg-white border-2 border-border/50 hover:bg-muted transition-all active:scale-95"
                  onClick={() => setIsViewRepairOpen(false)}
                >
                  Close Details
                </Button>
                {viewingRepair.status === "Completed" && (
                  <Button 
                    variant="outline" 
                    className="h-14 flex-1 rounded-2xl font-bold border-2 border-blue-500 text-blue-500 hover:bg-blue-50 transition-all active:scale-95 flex items-center justify-center gap-3"
                    onClick={() => generateInvoice(viewingRepair)}
                  >
                    <FileText className="w-5 h-5" /> Invoice
                  </Button>
                )}
                <Button 
                  className="h-14 flex-1 rounded-2xl font-bold bg-primary text-white shadow-xl shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-3"
                  onClick={() => {
                    setIsViewRepairOpen(false);
                    triggerEditRepair(viewingRepair);
                  }}
                >
                  <Edit className="w-5 h-5" /> Edit Ticket
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Mobile Bottom Navigation & FAB */}
      <div className="bottom-nav">
        {sidebarItems.slice(0, 5).map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "nav-item-mobile",
              activeTab === item.id ? "text-primary scale-110" : "text-foreground/30"
            )}
          >
            <item.icon className={cn("w-6 h-6", activeTab === item.id ? "fill-primary/10" : "")} />
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      {/* FAB - Mobile Only */}
      <Button
        className="fixed bottom-24 right-6 w-16 h-16 rounded-full bg-primary text-white shadow-2xl shadow-primary/40 lg:hidden z-50 transition-transform active:scale-90"
        onClick={() => setIsNewRepairOpen(true)}
      >
        <Plus className="w-8 h-8" />
      </Button>
    </div>
  );
}
