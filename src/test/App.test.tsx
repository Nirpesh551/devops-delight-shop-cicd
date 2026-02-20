import { render, screen } from "@testing-library/react";
import App from "../App";

test("renders the main heading", () => {
  render(<App />);

  const h1 = screen.getByRole("heading", { level: 1 });
  expect(h1).toHaveTextContent(/devops/i);
  expect(h1).toHaveTextContent(/merch/i);
});

