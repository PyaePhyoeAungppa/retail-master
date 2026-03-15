
import { ProductGrid } from "@/components/pos/product-grid";
import { CartSidebar } from "@/components/pos/cart-sidebar";

export default function POSPage() {
  return (
    <div className="flex h-full overflow-hidden">
      <div className="flex-1 overflow-auto h-full">
        <ProductGrid />
      </div>
      <div className="h-full border-l overflow-hidden">
        <CartSidebar />
      </div>
    </div>
  );
}
