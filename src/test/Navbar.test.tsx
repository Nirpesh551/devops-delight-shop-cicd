import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Navbar from "@/components/Navbar";

const signOutMock = vi.fn();

// mock framer-motion badge animation wrapper
vi.mock("framer-motion", () => ({
  motion: {
    span: (props: any) => <span {...props} />,
  },
}));

// mock useCart
vi.mock("@/contexts/CartContext", () => ({
  useCart: () => ({ totalItems: 3 }),
}));

// mock useAuth (default: logged out)
let authState: any = { user: null, signOut: signOutMock };
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => authState,
}));

const renderNavbar = () =>
  render(
    <MemoryRouter>
      <Navbar />
    </MemoryRouter>
  );

describe("Navbar", () => {
  beforeEach(() => {
    signOutMock.mockClear();
    authState = { user: null, signOut: signOutMock };
  });

  it("shows brand and Sign In when logged out", () => {
    renderNavbar();

    expect(screen.getByText("devops.shop")).toBeInTheDocument();
    expect(screen.getByText(/sign in/i)).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("shows email and signout button when logged in", async () => {
    authState = {
      user: { email: "nirpesh@test.com" },
      signOut: signOutMock,
    };

    const user = userEvent.setup();
    renderNavbar();

    expect(screen.getByText("nirpesh@test.com")).toBeInTheDocument();

    // icon button has no accessible name → click first button
    const buttons = screen.getAllByRole("button");
    await user.click(buttons[0]);

    expect(signOutMock).toHaveBeenCalledTimes(1);
  });
});
