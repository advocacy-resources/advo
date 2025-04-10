# Testing Guide for Advo

This document outlines the testing strategy and provides instructions for running tests in the Advo application.

## Testing Strategy

The application uses a comprehensive testing approach with multiple layers:

1. **Unit Tests**: Testing individual functions and components in isolation
2. **Integration Tests**: Testing interactions between components
3. **End-to-End Tests**: Testing complete user flows through the application

## Test Tools

- **Jest**: JavaScript testing framework for unit and integration tests
- **React Testing Library**: For testing React components
- **Cypress**: For end-to-end testing

## Setup and Installation

Before running tests, make sure all testing dependencies are installed:

```bash
npm install --save-dev babel-jest cypress jest-environment-jsdom --legacy-peer-deps
```

## Running Tests

### Unit and Integration Tests with Jest

To run all Jest tests:

```bash
npm test
```

To run tests in watch mode (recommended during development):

```bash
npm run test:watch
```

To generate a coverage report:

```bash
npm run test:coverage
```

### End-to-End Tests with Cypress

First, make sure Cypress is installed:

```bash
npx cypress install
```

To open the Cypress Test Runner:

```bash
npx cypress open
```

To run Cypress tests headlessly:

```bash
npx cypress run
```

## Test Structure

### Unit and Integration Tests

Unit and integration tests are located next to the files they test in `__tests__` directories:

- `src/lib/__tests__/`: Tests for utility functions
- `src/components/**/__tests__/`: Tests for React components

### End-to-End Tests

End-to-end tests are located in the `cypress/e2e/` directory:

- `cypress/e2e/home.cy.ts`: Tests for the home page
- `cypress/e2e/auth.cy.ts`: Tests for authentication flows

## Writing Tests

### Unit Tests

Unit tests should focus on testing a single function or component in isolation. Mock any dependencies.

Example:

```typescript
import { myFunction } from '../myModule';

describe('myFunction', () => {
  test('should return expected result', () => {
    expect(myFunction(input)).toBe(expectedOutput);
  });
});
```

### Component Tests

Component tests should verify that components render correctly and respond to user interactions.

Example:

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import MyComponent from '../MyComponent';

describe('MyComponent', () => {
  test('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  test('should respond to user interaction', () => {
    render(<MyComponent />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText('New Text')).toBeInTheDocument();
  });
});
```

### End-to-End Tests

End-to-end tests should test complete user flows through the application.

Example:

```typescript
describe('User Authentication', () => {
  it('should allow a user to sign in', () => {
    cy.visit('/auth/signin');
    cy.get('input[name="email"]').type('user@example.com');
    cy.get('input[name="password"]').type('password123');
    cy.get('form').submit();
    cy.url().should('eq', Cypress.config().baseUrl + '/');
  });
});
```

## Best Practices

1. **Test Behavior, Not Implementation**: Focus on what the code does, not how it does it.
2. **Keep Tests Independent**: Each test should be able to run independently of others.
3. **Use Descriptive Test Names**: Test names should clearly describe what is being tested.
4. **Follow the AAA Pattern**: Arrange, Act, Assert.
5. **Mock External Dependencies**: Use mocks for API calls, databases, etc.
6. **Test Edge Cases**: Test boundary conditions and error cases.
7. **Maintain Test Coverage**: Aim for high test coverage, especially for critical paths.

## Continuous Integration

Tests are automatically run in the CI pipeline on every pull request and push to the main branch.