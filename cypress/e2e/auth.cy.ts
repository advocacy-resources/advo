describe("Authentication", () => {
  beforeEach(() => {
    // Clear cookies and local storage before each test
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  it("should navigate to the sign-in page", () => {
    // Visit the home page
    cy.visit("/");

    // Find and click the sign-in link
    cy.contains("a", /sign in/i).click();

    // Verify we navigated to the sign-in page
    cy.url().should("include", "/auth/signin");
    cy.contains("Sign in to your account").should("exist");
  });

  it("should show validation errors for empty form submission", () => {
    // Visit the sign-in page directly
    cy.visit("/auth/signin");

    // Submit the form without entering any data
    cy.get("form").submit();

    // Verify validation errors are displayed
    cy.contains("Email is required").should("exist");
    cy.contains("Password is required").should("exist");
  });

  it("should show error for invalid credentials", () => {
    // Visit the sign-in page
    cy.visit("/auth/signin");

    // Enter invalid credentials
    cy.get('input[name="email"]').type("invalid@example.com");
    cy.get('input[name="password"]').type("wrongpassword");

    // Submit the form
    cy.get("form").submit();

    // Verify error message is displayed
    cy.contains("Invalid email or password").should("exist");
  });

  it("should navigate to the registration page", () => {
    // Visit the sign-in page
    cy.visit("/auth/signin");

    // Find and click the register link
    cy.contains("a", /register/i).click();

    // Verify we navigated to the registration page
    cy.url().should("include", "/auth/register");
    cy.contains("Create an account").should("exist");
  });

  // This test would require a test user or mocking
  it.skip("should successfully sign in with valid credentials", () => {
    // Visit the sign-in page
    cy.visit("/auth/signin");

    // Enter valid credentials (would need a test user or mock)
    cy.get('input[name="email"]').type("test@example.com");
    cy.get('input[name="password"]').type("password123");

    // Submit the form
    cy.get("form").submit();

    // Verify successful sign-in (redirect to home or dashboard)
    cy.url().should("eq", Cypress.config().baseUrl + "/");

    // Verify user is signed in (e.g., profile link is visible)
    cy.contains("a", /profile/i).should("exist");
  });
});
