/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    /**
     * Custom command to log in a user
     * @example cy.login('user@example.com', 'password123')
     */
    login(email: string, password: string): Chainable<void>;

    /**
     * Custom command to find an element by data-testid attribute
     * @example cy.get('.container').findByTestId('button')
     */
    findByTestId(testId: string): Chainable<JQuery<HTMLElement>>;

    /**
     * Custom command to get an element by data-testid attribute
     * @example cy.getByTestId('button')
     */
    getByTestId(testId: string): Chainable<JQuery<HTMLElement>>;
  }
}
