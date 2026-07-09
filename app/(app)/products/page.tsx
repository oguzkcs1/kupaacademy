"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search, Package, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useAuthStore } from "@/lib/store";

const mockProducts = [
  {
    id: "p1",
    name: "Espresso",
    description: "Yoğun, konsantre kahve içeceği",
    calories: 5,
    allergens: [],
    photo: "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=400",
    category: "Sıcak İçecekler",
  },
  {
    id: "p2",
    name: "Cappuccino",
    description: "Espresso, buharla ısıtılmış süt ve süt köpüğü",
    calories: 120,
    allergens: ["süt"],
    photo: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400",
    category: "Sıcak İçecekler",
  },
  {
    id: "p3",
    name: "Cold Brew",
    description: "12 saat soğuk demleme süreci ile hazırlanan kahve",
    calories: 15,
    allergens: [],
    photo: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400",
    category: "Soğuk İçecekler",
  },
];

export default function ProductsPage() {
  const { user } = useAuthStore();
  const [search, setSearch] = useState("");

  const isAdmin = user?.role === "admin";

  const filtered = mockProducts.filter(
    (p) => !search || p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Ürünler</h1>
          <p className="text-muted-foreground mt-1">{filtered.length} ürün</p>
        </div>
        {isAdmin && (
          <Button>
            <Plus className="w-4 h-4" />
            Yeni Ürün
          </Button>
        )}
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Ürün ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((product) => (
            <Card key={product.id} className="overflow-hidden hover:shadow-md transition-all group cursor-pointer">
              <div className="h-44 bg-muted overflow-hidden">
                {product.photo ? (
                  <img
                    src={product.photo}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-12 h-12 text-muted-foreground/30" />
                  </div>
                )}
              </div>
              <CardContent className="p-4 space-y-2">
                <div>
                  <h3 className="font-semibold group-hover:text-primary transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
                    {product.description}
                  </p>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <Badge variant="outline" className="text-xs">
                    {product.category}
                  </Badge>
                  <span>{product.calories} kcal</span>
                </div>
                {product.allergens.length > 0 && (
                  <div className="flex items-center gap-1 text-xs text-orange-600">
                    <AlertCircle className="w-3 h-3" />
                    <span>{product.allergens.join(", ")}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">Ürün bulunamadı</p>
        </div>
      )}
    </div>
  );
}
