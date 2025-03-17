# Excel Templates - CSS Structure Documentation

## Overview
The CSS structure follows a modular approach where styles are separated into logical components. The main entry point is `main.css`, which imports all other CSS modules. This organization provides better maintainability and clearer separation of concerns.

## File Structure

```
css/
├── main.css                 # Main CSS file that imports all modules
├── variables.css            # CSS variables and theme definitions
├── reset.css                # CSS reset and base styles
├── layout.css               # Layout and grid system styles
├── header.css               # Header and navigation styles
├── footer.css               # Footer styles
├── buttons.css              # Button and control styles
├── cards.css                # Card component styles
├── topics.css               # Topic container and content styles
├── typography.css           # Typography and text styles
├── forms.css                # Form elements and input styles
├── tables.css               # Table styles
├── assessment.css           # Assessment-related styles
├── formula.css              # Formula-specific styles and components
├── animations.css           # Animation definitions
├── utilities.css            # Utility classes
└── responsive.css           # Media queries and responsive design
```

## Module Descriptions

### main.css
The main entry point that imports all other CSS files in the correct cascade order. This allows proper application of the CSS specificity rules.

### variables.css
Contains CSS custom properties (variables) for consistent theming across the application:
- Color variables (primary, secondary, accent colors)
- Typography variables (font families, sizes)
- Spacing and sizing variables
- Animation duration variables
- Shadow definitions

### reset.css
Normalizes browser default styles and provides consistent base styling:
- CSS reset to normalize browser differences
- Base element styling
- Box-sizing rules
- Basic typography defaults

### layout.css
Provides page structure and layout components:
- Container definitions
- Grid system
- Section layouts
- Spacing utilities

### header.css
Styles for the site header and navigation components:
- Header container
- Logo styling
- Navigation menu
- Mobile menu toggle
- Search components

### footer.css
Styles for the site footer:
- Footer layout
- Footer content sections
- Footer navigation
- Copyright section

### buttons.css
Styles for buttons and interactive controls:
- Primary/secondary/tertiary buttons
- Action buttons
- Icon buttons
- Button states (hover, active, disabled)
- Button groups

### cards.css
Card component styling used throughout the site:
- Basic card styles
- Card variants (topic cards, resource cards)
- Card headers and footers
- Card interactions and hover states

### topics.css
Specialized styling for topic content sections:
- Topic containers
- Topic headers
- Content layouts
- Topic navigation
- Code blocks and examples

### typography.css
Text styling and typography rules:
- Heading styles
- Paragraph styles
- List formatting
- Text emphasis and highlights
- Code and pre-formatted text

### forms.css
Form-related element styling:
- Input fields
- Select dropdowns
- Checkboxes and radio buttons
- Form layouts
- Validation styles

### tables.css
Table styling used for data presentation:
- Basic table structure
- Formula example tables
- Data tables
- Table headers and captions
- Responsive table behavior

### assessment.css
Styles specific to assessment functionality:
- Quiz containers
- Question styling
- Option selection
- Progress indicators
- Results display
- Review screens

### formula.css
Specialized styles for formula displays and interactions:
- Formula highlighting
- Formula examples
- Formula builder components
- Code syntax highlighting

### animations.css
Animation definitions used throughout the site:
- Keyframe animations
- Transition definitions
- Animation utility classes
- Loading indicators

### utilities.css
General-purpose utility classes:
- Spacing utilities
- Text alignment
- Display properties
- Flexbox utilities
- Color utilities

### responsive.css
Media queries for responsive layout adjustments:
- Breakpoint definitions
- Mobile-specific adaptations
- Tablet-specific adaptations
- Print styles

## Usage Guidelines

1. **Adding New Styles**:
   - Place styles in the appropriate module based on their purpose
   - Add new modules for distinct components if needed
   - Import new modules in main.css

2. **CSS Variables**:
   - Use CSS variables from variables.css for consistency
   - Define new variables in variables.css if needed

3. **Responsive Design**:
   - Use mobile-first approach
   - Place media queries in responsive.css
   - Use relative units (rem, em, %) when possible

4. **Naming Convention**:
   - Use kebab-case for class names (e.g., `.topic-card`)
   - Use descriptive class names that indicate purpose
   - Avoid overly-specific selectors
```

## Modular Structure Benefits

- **Maintainability**: Changes to specific components only require editing specific files
- **Readability**: Easier to locate styles for specific components
- **Performance**: Can be optimized through bundling/minification for production
- **Collaboration**: Multiple developers can work on different modules simultaneously
