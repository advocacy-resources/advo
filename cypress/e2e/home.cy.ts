describe("Home Page", () => {
  beforeEach(() => {
    // Visit the home page before each test
    cy.visit("/");
  });

  it("should display the main navigation", () => {
    // Check if the navigation bar exists
    cy.get("nav").should("exist");
  });

  it("should have a working link to resources page", () => {
    // Find and click the resources link
    cy.contains("a", /resources/i).click();

    // Verify we navigated to the resources page
    cy.url().should("include", "/resources");
  });

  it("should display resource cards on the home page", () => {
    // Check if resource cards are displayed
    cy.get('[data-testid="resource-card"]').should("exist");
  });

  it("should allow searching for resources", () => {
    // Type in the search box - use a specific ID to avoid selecting multiple elements
    cy.get("#desktop-search-input").type("health");

    // Submit the search
    cy.get("#desktop-search-form").submit();

    // Verify search results are displayed
    cy.contains("Search Results").should("exist");
  });
});
