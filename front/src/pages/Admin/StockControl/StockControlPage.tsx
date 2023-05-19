import { useEffect, useState } from "react";
import { ProductTable } from "../AddProduct/ProductTable";
import { StockInfoCard } from "./StockInfoCard";
import { Product } from "../../../interfaces/ProductInterface";
import { getProducts } from "../../../api/product/product.service";

export function StockControlPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [totalValue, setTotalValue] = useState<number>(0);

  const fecthProducts = async () => {
    await getProducts().then((data) => setProducts(data));
  };

  useEffect(() => {
    fecthProducts();
    calculateTotalValue();
  }, []);

  const calculateTotalValue = () => {
    const total = products.reduce(
      (accumulator, product) => accumulator + Number(product.price),
      0
    );
    setTotalValue(total);
  };

  return (
    <div className="h-full flex flex-col items-center">
      <div className="w-[70%]">
        <div className="mb-4">
          <div className="text-zinc-700 text-sm font-semibold rounded flex justify-between">
            <StockInfoCard
              title="Items in stock"
              value={products.length}
              color="#1a1a1a"
            />
            <StockInfoCard
              title="Stock total value"
              value={totalValue}
              color="#1a1a1a"
            />
            <StockInfoCard
              title="Items in stock"
              value={3000}
              color="#1a1a1a"
            />
          </div>
        </div>

        <ProductTable />
      </div>
    </div>
  );
}
