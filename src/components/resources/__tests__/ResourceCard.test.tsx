import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import "@testing-library/jest-dom"; // Import jest-dom for the matchers
import ResourceCard from "../ResourceCard";
import { Rating } from "@/enums/rating.enum";
import { useSession } from "next-auth/react";

// Mock next/image
jest.mock("next/image", () => ({
  __esModule: true,
  default: (
    props: React.ImgHTMLAttributes<HTMLImageElement> & {
      unoptimized?: boolean;
    },
  ) => {
    // Remove unoptimized prop as it's not valid for img element
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { unoptimized, ...imgProps } = props;
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...imgProps} alt={props.alt || ""} />;
  },
}));

// Mock next/link
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

// Mock fetch API
global.fetch = jest.fn();

describe("ResourceCard Component", () => {
  const mockProps = {
    id: "123",
    name: "Test Resource",
    description: "This is a test resource",
    category: "Test Category",
    type: ["Type 1", "Type 2"],
    rating: Rating.NULL,
    favored: false,
    profilePhoto: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock successful fetch responses
    (global.fetch as jest.Mock).mockImplementation((url) => {
      if (url.includes("/rating")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              userRating: Rating.NULL,
              approvalPercentage: 75,
              totalVotes: 20,
              upvotes: 15,
              downvotes: 5,
            }),
        });
      }
      if (url.includes("/favorite")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ isFavorited: false }),
        });
      }
      return Promise.reject(new Error("Not found"));
    });
  });

  test("renders loading state initially", () => {
    // Mock unauthenticated session
    (useSession as jest.Mock).mockReturnValue({
      data: null,
      status: "unauthenticated",
    });

    act(() => {
      render(<ResourceCard {...mockProps} />);
    });
    expect(screen.getByText("Loading resource...")).toBeInTheDocument();
  });

  test("renders resource card with correct information", async () => {
    // Mock unauthenticated session
    (useSession as jest.Mock).mockReturnValue({
      data: null,
      status: "unauthenticated",
    });

    act(() => {
      render(<ResourceCard {...mockProps} />);
    });

    // Wait for loading to complete and all async operations to finish
    await waitFor(() => {
      // First check that loading is gone
      expect(screen.queryByText("Loading resource...")).not.toBeInTheDocument();

      // Then check that content is rendered
      expect(screen.getByText("Test Resource")).toBeInTheDocument();
      expect(screen.getByText("This is a test resource")).toBeInTheDocument();
      expect(screen.getByText(/Category: Test Category/)).toBeInTheDocument();
      expect(screen.getByText(/Type: Type 1, Type 2/)).toBeInTheDocument();

      // Check approval rating
      expect(screen.getByText("75%")).toBeInTheDocument();
      expect(screen.getByText("20 votes")).toBeInTheDocument();
    });
  });

  test("buttons are disabled when user is not authenticated", async () => {
    // Mock unauthenticated session
    (useSession as jest.Mock).mockReturnValue({
      data: null,
      status: "unauthenticated",
    });

    act(() => {
      render(<ResourceCard {...mockProps} />);
    });

    // Wait for loading to complete and check buttons
    await waitFor(() => {
      expect(screen.queryByText("Loading resource...")).not.toBeInTheDocument();

      // Check if buttons are disabled
      const upButton = screen.getByTitle("Sign in to rate up");
      const downButton = screen.getByTitle("Sign in to rate down");
      const favoriteButton = screen.getByTitle("Sign in to favorite");

      expect(upButton).toBeDisabled();
      expect(downButton).toBeDisabled();
      expect(favoriteButton).toBeDisabled();
    });
  });

  test("buttons are enabled when user is authenticated", async () => {
    // Mock authenticated session
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { id: "user1" } },
      status: "authenticated",
    });

    act(() => {
      render(<ResourceCard {...mockProps} />);
    });

    // Wait for loading to complete and check buttons
    await waitFor(() => {
      expect(screen.queryByText("Loading resource...")).not.toBeInTheDocument();

      // Check if buttons are enabled
      const upButton = screen.getByTitle("Rate up");
      const downButton = screen.getByTitle("Rate down");
      const favoriteButton = screen.getByTitle("Favorite");

      expect(upButton).not.toBeDisabled();
      expect(downButton).not.toBeDisabled();
      expect(favoriteButton).not.toBeDisabled();
    });
  });

  test("clicking upvote button calls API with correct parameters", async () => {
    // Mock authenticated session
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { id: "user1" } },
      status: "authenticated",
    });

    render(<ResourceCard {...mockProps} />);

    // Wait for loading to complete, click button, and verify API call
    await waitFor(() => {
      expect(screen.queryByText("Loading resource...")).not.toBeInTheDocument();
    });

    // Get the upvote button
    const upButton = screen.getByTitle("Rate up");

    // Click the button
    act(() => {
      fireEvent.click(upButton);
    });

    // Verify API call in a separate waitFor to ensure it happens after the click
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/v1/resources/123/rating",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ rating: Rating.UP }),
        }),
      );
    });
  });
});
