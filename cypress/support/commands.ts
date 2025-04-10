// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// -- This is a parent command --
Cypress.Commands.add("login", (email: string, password: string) => {
  cy.session([email, password], () => {
    cy.visit("/auth/signin");
    cy.get('input[name="email"]').type(email);
    cy.get('input[name="password"]').type(password);
    cy.get("form").submit();
    cy.url().should("not.include", "/auth/signin");
  });
});

// -- This is a child command --
Cypress.Commands.add(
  "findByTestId",
  { prevSubject: "element" },
  (subject, testId) => {
    return cy.wrap(subject).find(`[data-testid="${testId}"]`);
  },
);

// -- This is a dual command --
Cypress.Commands.add(
  "getByTestId",
  { prevSubject: "optional" },
  (subject, testId) => {
    if (subject) {
      return cy.wrap(subject).find(`[data-testid="${testId}"]`);
    }
    return cy.get(`[data-testid="${testId}"]`);
  },
);
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
