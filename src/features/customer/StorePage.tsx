import * as React from "react";
import { useState } from "react";
import { Search, ShoppingCart, Filter, Star, Cpu, Monitor, Smartphone, MousePointer2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";

function PerspectiveCard({ children, className, ...props }: { children: React.ReactNode; className?: string; [key: string]: any }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

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
      <div style={{ transform: "translateZ(30px)", transformStyle: "preserve-3d" }}>
        {children}
      </div>
    </motion.div>
  );
}

const PRODUCTS = [
  { id: 1, name: "NVIDIA RTX 4090", category: "GPU", price: 1599, rating: 4.9, image: "https://picsum.photos/seed/gpu/400/300" },
  { id: 2, name: "AMD Ryzen 9 7950X", category: "CPU", price: 699, rating: 4.8, image: "https://picsum.photos/seed/cpu/400/300" },
  { id: 3, name: "Samsung 990 Pro 2TB", category: "Storage", price: 189, rating: 4.9, image: "https://picsum.photos/seed/ssd/400/300" },
  { id: 4, name: "ASUS ROG Swift 32\"", category: "Monitor", price: 899, rating: 4.7, image: "https://picsum.photos/seed/monitor/400/300" },
  { id: 5, name: "Logitech G Pro X", category: "Peripherals", price: 149, rating: 4.8, image: "https://picsum.photos/seed/mouse/400/300" },
  { id: 6, name: "Corsair Dominator 32GB", category: "RAM", price: 219, rating: 4.6, image: "https://picsum.photos/seed/ram/400/300" },
];

export function StorePage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", "GPU", "CPU", "Storage", "Monitor", "Peripherals", "RAM"];

  const filteredProducts = PRODUCTS.filter(p => 
    (selectedCategory === "All" || p.category === selectedCategory) &&
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Tech <span className="text-primary">Shop</span></h1>
          <p className="text-foreground/60">Premium hardware and accessories for your build.</p>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
            <Input 
              placeholder="Search products..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-card border-border rounded-full h-12"
            />
          </div>
          <Button className="bg-primary hover:bg-primary/90 text-white rounded-full h-12 px-6">
            <ShoppingCart className="w-5 h-5 mr-2" />
            Cart (0)
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Filters */}
        <aside className="w-full lg:w-64 space-y-8">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-foreground/40 mb-4">Categories</h3>
            <div className="flex flex-wrap lg:flex-col gap-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all text-left ${
                    selectedCategory === cat 
                      ? "bg-primary text-white shadow-lg shadow-primary/20" 
                      : "bg-card text-foreground/60 hover:bg-primary/5 hover:text-primary"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-accent/10 border border-accent/20 space-y-4">
            <h4 className="font-bold text-accent">Special Offer</h4>
            <p className="text-sm text-foreground/70">Get 10% off on all GPU repairs when you buy a new card.</p>
            <Button variant="link" className="text-accent p-0 h-auto font-bold">Learn More →</Button>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredProducts.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <PerspectiveCard>
                  <Card className="soft-card overflow-hidden group border-none h-full">
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-background/80 backdrop-blur-md text-foreground border-none font-bold">
                          {product.category}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-1 text-accent mb-2">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-sm font-bold">{product.rating}</span>
                      </div>
                      <h3 className="text-xl font-bold mb-1 group-hover:text-primary transition-colors">{product.name}</h3>
                      <p className="text-2xl font-bold text-primary">${product.price}</p>
                    </CardContent>
                    <CardFooter className="p-6 pt-0">
                      <Button className="w-full bg-primary hover:bg-primary/90 text-white rounded-xl h-12 font-bold">
                        Add to Cart
                      </Button>
                    </CardFooter>
                  </Card>
                </PerspectiveCard>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
