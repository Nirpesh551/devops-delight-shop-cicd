// src/test/ProductCard.test.tsx
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import ProductCard from "@/components/ProductCard";
import { toast } from "sonner";

// --------------------
// Mocks
// --------------------
const addItemMock = vi.fn();

vi.mock("@/contexts/CartContext", () => ({
  useCart: () => ({
    addItem: addItemMock,
    totalItems: 0,
    items: [],
    removeItem: vi.fn(),
    updateQuantity: vi.fn(),
    clearCart: vi.fn(),
    subtotal: 0,
  }),
}));

vi.mock("@/lib/product-images", () => ({
  getProductImage: () => "/mock-image.png",
}));

// ✅ Vitest-safe: define the mock fn inside factory (because vi.mock is hoisted)
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
  },
}));

// ✅ Framer-motion mock so motion.div doesn't break tests
vi.mock("framer-motion", () => ({
  motion: {
    div: (props: any) => <div {...props} />,
    span: (props: any) => <span {...props} />,
  },
}));

// Helper to access mocked toast.success
const toastSuccessMock = vi.mocked(toast.success);

// --------------------
// Test helper
// --------------------
function renderProductCard(overrides?: Partial<React.ComponentProps<typeof ProductCard>>) {
  const props: React.ComponentProps<typeof ProductCard> = {
    id: "p1",
    name: "Kubernetes Hoodie",
    shortDescription: "Warm hoodie for cloud-native engineers.",
    price: 19.99,
    ...overrides,
  };

  return render(
    <MemoryRouter>
      <ProductCard {...props} />
    </MemoryRouter>
  );
}

// --------------------
// Tests
// --------------------
describe("ProductCard", () => {
  beforeEach(() => {
    addItemMock.mockClear();
    toastSuccessMock.mockClear();
  });

  it("renders name, description, image and formatted price", () => {
    renderProductCard({
      name: "Docker T-Shirt",
      shortDescription: "A comfy Docker tee",
      price: 12.5,
    });

    expect(screen.getByText("Docker T-Shirt")).toBeInTheDocument();
    expect(screen.getByText("A comfy Docker tee")).toBeInTheDocument();

    // price is formatted with toFixed(2)
    expect(screen.getByText("$12.50")).toBeInTheDocument();

    // image from mocked getProductImage()
    const img = screen.getByRole("img", { name: "Docker T-Shirt" });
    expect(img).toHaveAttribute("src", "/mock-image.png");
  });

  it("navigates using Link to /product/:id", () => {
    renderProductCard({ id: "abc123", name: "Terraform Mug" });

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/product/abc123");
  });

  it("clicking Add calls addItem with correct payload and shows toast", async () => {
    const user = userEvent.setup();

    renderProductCard({
      id: "p9",
      name: "Helm Cap",
      price: 29,
    });

    const addBtn = screen.getByRole("button", { name: /add/i });
    await user.click(addBtn);

    expect(addItemMock).toHaveBeenCalledTimes(1);
    expect(addItemMock).toHaveBeenCalledWith({
      id: "p9",
      name: "Helm Cap",
      price: 29,
      image: "/mock-image.png",
    });

    expect(toastSuccessMock).toHaveBeenCalledTimes(1);
    expect(toastSuccessMock).toHaveBeenCalledWith("Helm Cap added to cart");
  });
});
