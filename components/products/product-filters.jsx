"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

// Fetch categories and brands from API (mocked for now)
const categories = ["Electronics", "Clothing", "Home & Kitchen", "Beauty", "Sports", "Books"];
const brands = ["Apple", "Samsung", "Nike", "Adidas", "Sony", "LG", "Dell", "HP"];

export default function ProductFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Extract current filter values from URL
  const currentCategory = searchParams.get("category");
  const currentBrands = searchParams.get("brands")?.split(",") || [];
  const minPrice = Number(searchParams.get("minPrice") || 0);
  const maxPrice = Number(searchParams.get("maxPrice") || 1000);

  // State for filters
  const [priceRange, setPriceRange] = useState([minPrice, maxPrice]);
  const [selectedCategory, setSelectedCategory] = useState(currentCategory || "");
  const [selectedBrands, setSelectedBrands] = useState(currentBrands);

  // Sync state with URL params when they change
  useEffect(() => {
    setPriceRange([minPrice, maxPrice]);
    setSelectedCategory(currentCategory || "");
    setSelectedBrands(currentBrands);
  }, [searchParams]);

  // Handle category selection (single category at a time)
  const handleCategoryChange = (category) => {
    setSelectedCategory(category === selectedCategory ? "" : category);
  };

  // Handle brand selection (multiple brands allowed)
  const handleBrandChange = (brand) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  // Apply filters
  const applyFilters = () => {
    const params = new URLSearchParams();

    if (selectedCategory) {
      params.set("category", selectedCategory);
    }

    if (selectedBrands.length > 0) {
      params.set("brands", selectedBrands.join(","));
    }

    if (priceRange[0] > 0) {
      params.set("minPrice", String(priceRange[0]));
    }

    if (priceRange[1] < 1000) {
      params.set("maxPrice", String(priceRange[1]));
    }

    router.push(`/products?${params.toString()}`);
  };

  // Reset filters
  const resetFilters = () => {
    setSelectedCategory("");
    setSelectedBrands([]);
    setPriceRange([0, 1000]);
    router.push("/products");
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <h2 className="text-lg font-semibold mb-4">Filters</h2>

      <Accordion type="multiple" collapsible='true' className="w-full">
        {/* Price Range Filter */}
        <AccordionItem value="price">
          <AccordionTrigger>Price Range</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 py-2">
              <Slider value={priceRange} min={0} max={1000} step={10} onValueChange={setPriceRange} />
              <div className="flex items-center justify-between text-sm">
                <span>${priceRange[0]}</span>
                <span>${priceRange[1]}</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Categories Filter */}
        <AccordionItem value="categories">
          <AccordionTrigger>Categories</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {categories.map((category) => (
                <div key={category} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category}`}
                    checked={selectedCategory === category}
                    onCheckedChange={() => handleCategoryChange(category)}
                  />
                  <Label htmlFor={`category-${category}`} className="text-sm font-normal cursor-pointer">
                    {category}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Brands Filter */}
        <AccordionItem value="brands">
          <AccordionTrigger>Brands</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {brands.map((brand) => (
                <div key={brand} className="flex items-center space-x-2">
                  <Checkbox
                    id={`brand-${brand}`}
                    checked={selectedBrands.includes(brand)}
                    onCheckedChange={() => handleBrandChange(brand)}
                  />
                  <Label htmlFor={`brand-${brand}`} className="text-sm font-normal cursor-pointer">
                    {brand}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Apply & Reset Buttons */}
      <div className="flex gap-2 mt-6">
        <Button onClick={applyFilters} className="flex-1">
          Apply Filters
        </Button>
        <Button onClick={resetFilters} variant="outline" className="flex-1">
          Reset
        </Button>
      </div>
    </div>
  );
}
