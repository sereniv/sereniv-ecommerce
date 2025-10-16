"use client";

import { useState, useEffect } from "react";
import AddProductForm from "@/components/admin/add-prouct-form";

export default function AdminAddProductPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="container px-4 py-6 mx-auto">
      <AddProductForm />
    </div>
  );
}
