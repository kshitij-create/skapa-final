```markdown
# skapa-final Development Patterns

> Auto-generated skill from repository analysis

## Overview
This skill provides a comprehensive guide to the development patterns, coding conventions, and workflows used in the `skapa-final` repository. The project is a React application written in TypeScript, with a focus on modular component design, screen-based navigation, and coordinated feature development. This guide will help you contribute effectively by following established conventions and workflows.

## Coding Conventions

**File Naming**
- Use PascalCase for all file and folder names.
  - Example: `UserProfile.tsx`, `MainNavigator.tsx`

**Import Style**
- Use relative imports for all modules.
  - Example:
    ```typescript
    import { UserProfile } from '../components/UserProfile';
    ```

**Export Style**
- Use named exports for all modules.
  - Example:
    ```typescript
    // In src/components/UserProfile.tsx
    export const UserProfile = () => { /* ... */ };
    ```

**Commit Patterns**
- Commit messages are freeform, often with a short summary (~42 characters on average).
  - Example: `Add onboarding flow to registration screen`

## Workflows

### Feature Development Across Screens and Components
**Trigger:** When adding or updating a feature that affects both UI components and screen logic, possibly including navigation and theming.
**Command:** `/feature-flow`

1. Edit or create components in `src/components/`
    - Example: `src/components/OnboardingStep.tsx`
2. Edit or create screens in `src/screens/` and subfolders
    - Example: `src/screens/Onboarding/WelcomeScreen.tsx`
3. Update navigation in `src/navigation/MainNavigator.tsx`
    - Example:
      ```typescript
      import { WelcomeScreen } from '../screens/Onboarding/WelcomeScreen';
      // Add to your navigator stack
      ```
4. Update theming in `src/theme/index.ts` if necessary
    - Example: Add new color or style tokens
5. Optionally update documentation in `memory/PRD.md`
    - Summarize the new feature or changes

**Example:**
```typescript
// src/components/OnboardingStep.tsx
export const OnboardingStep = () => (
  <View>
    <Text>Welcome to Skapa!</Text>
  </View>
);

// src/screens/Onboarding/WelcomeScreen.tsx
import { OnboardingStep } from '../../components/OnboardingStep';

export const WelcomeScreen = () => <OnboardingStep />;
```

---

### Feature or Doc Update with Shared Component
**Trigger:** When enhancing a profile-related feature or shared component and documenting the change.
**Command:** `/component-doc-update`

1. Edit or create a component in `src/components/`
    - Example: `src/components/ProfileAvatar.tsx`
2. Edit or update a screen in `src/screens/`
    - Example: `src/screens/ProfileScreen.tsx`
3. Update documentation in `memory/PRD.md`
    - Describe the enhancement or new feature

**Example:**
```typescript
// src/components/ProfileAvatar.tsx
export const ProfileAvatar = ({ uri }) => (
  <Image source={{ uri }} style={{ borderRadius: 50 }} />
);

// src/screens/ProfileScreen.tsx
import { ProfileAvatar } from '../components/ProfileAvatar';

export const ProfileScreen = () => (
  <View>
    <ProfileAvatar uri="https://example.com/avatar.png" />
  </View>
);
```

## Testing Patterns

- Test files are named with the pattern `*.test.*` (e.g., `UserProfile.test.tsx`).
- The specific testing framework is not detected, but tests are colocated with or near the code they test.

**Example:**
```typescript
// src/components/UserProfile.test.tsx
import { render } from '@testing-library/react-native';
import { UserProfile } from './UserProfile';

test('renders user name', () => {
  const { getByText } = render(<UserProfile name="Alice" />);
  expect(getByText('Alice')).toBeTruthy();
});
```

## Commands

| Command               | Purpose                                                                 |
|-----------------------|-------------------------------------------------------------------------|
| /feature-flow         | Start a feature update across multiple screens and components            |
| /component-doc-update | Update or add a shared component and document the change                 |
```
