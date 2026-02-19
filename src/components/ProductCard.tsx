import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { getProductImage } from "@/lib/product-images";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface ProductCardProps {
  id: string;
  name: string;
  shortDescription: string;
  price: number;
}

const ProductCard = ({ id, name, shortDescription, price }: ProductCardProps) => {
  const { addItem } = useCart();
  const image = getProductImage(name);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({ id, name, price, image });
    toast.success(`${name} added to cart`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
    >
      <Link to={`/product/${id}`} className="block group">
        <div className="glass rounded-xl overflow-hidden hover:glow-primary transition-all duration-300">
          <div className="aspect-square overflow-hidden bg-secondary/30">
            <img
              src={image}
              alt={name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          </div>
          <div className="p-4 space-y-3">
            <h3 className="font-mono font-semibold text-foreground group-hover:text-primary transition-colors truncate">
              {name}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2">{shortDescription}</p>
            <div className="flex items-center justify-between pt-1">
              <span className="font-mono font-bold text-primary text-lg">${price.toFixed(2)}</span>
              <Button
                size="sm"
                onClick={handleAddToCart}
                className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <ShoppingCart className="h-3.5 w-3.5" />
                Add
              </Button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
