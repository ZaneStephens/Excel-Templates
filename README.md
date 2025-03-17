# Excel Mastery - Comprehensive Excel Training Guide

A complete web-based training platform for learning Microsoft Excel, from basics to advanced features. This project provides a structured learning path and comprehensive resources for mastering Excel skills.

## Features

- **Modular Content Structure**: Content is organized into logical modules that load dynamically
- **Learning Path**: Structured learning journey from beginner to advanced level
- **Comprehensive Topics**: Covers Excel basics, formulas, data analysis, visualization, and advanced features
- **Interactive Practice Exercises**: Hands-on exercises for practical skill development
- **Resource Library**: Downloadable templates, cheat sheets, and reference materials
- **Progress Tracking**: Browser-based tracking of completed lessons and achievements
- **Skills Assessment**: Level-based assessments to test and validate Excel knowledge
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Project Structure

```
excel-templates/
│
├── index.html          # Main HTML file with navigation structure
├── script.js           # Main JavaScript for module loading and interactions
├── progress-tracker.js # User progress tracking functionality
├── assessment.js       # Skills assessment system
├── CSS.MD              # Documentation of CSS structure
├── Modules.MD          # Documentation of modules structure
│
├── css/                # CSS files organized in modular structure
│   ├── main.css        # Main CSS file that imports all modules
│   ├── variables.css   # CSS variables and theme definitions
│   ├── layout.css      # Layout and grid system styles
│   ├── topics.css      # Topic container and content styles
│   └── ...             # Additional CSS modules
│
└── modules/            # Content modules loaded dynamically
    ├── home.html       # Homepage content
    ├── learning-path.html  # Structured learning journey
    ├── basics.html     # Excel basics content
    ├── formulas.html   # Formulas and functions content
    ├── dataanalysis.html  # Data analysis content
    ├── visualization.html # Data visualization content
    ├── advanced.html   # Advanced features content
    ├── assessment.html # Assessment system
    └── resources.html  # Resource library content
```

## Detailed Documentation

This project includes detailed documentation for its key components:

- **[CSS Structure](CSS.MD)** - Comprehensive documentation of the CSS architecture
- **[Module System](Modules.MD)** - Detailed explanation of the content module structure

## How It Works

The application uses a modular approach where each content section is stored as a separate HTML file. When a user navigates to a section, the content is loaded dynamically into the main page. This approach offers several benefits:

1. **Easier Maintenance**: Content can be updated independently
2. **Faster Loading**: Only the required content is loaded
3. **Better Organization**: Clear separation of concerns
4. **Simplified Development**: Multiple team members can work on different modules

### Core Systems

- **Dynamic Content Loading**: Content modules loaded via JavaScript
- **Progress Tracking**: Browser localStorage tracks completed lessons and assessments
- **Assessment Engine**: Level-specific knowledge tests with scoring and feedback
- **Learning Path**: Structured progression through Excel topics
- **Achievement System**: Badges and completion tracking for gamification

## Setup Instructions

### Local Development

1. Clone the repository
2. No build process required - this is a static site
3. Open `index.html` in your browser to view the site
4. For local testing with proper module loading, use a local server:
   - With Python: `python -m http.server`
   - With Node.js: `npx serve`

### Deployment

The site can be deployed to any static hosting service:

1. Upload all files maintaining the folder structure
2. Ensure server is configured to serve the proper MIME types
3. No server-side processing is required

## Extending the Platform

### Adding New Content Modules

1. Create a new HTML file in the modules directory
2. Follow the established content structure pattern
3. Add the module to the navigation in index.html
4. Update the moduleDisplayNames object in script.js

### Adding New CSS Components

1. Create a new CSS file in the css directory
2. Import the new CSS file in main.css
3. Follow the established naming conventions and CSS structure

## Future Enhancements

- **Server-Side User Accounts**: Allow users to track progress across devices
- **Advanced Interactive Exercises**: Add Excel-like interactive interface for practice
- **Download Manager**: Implement actual file downloads with tracking
- **Video Tutorials**: Add embedded video content with interactive components
- **Search Functionality**: Allow users to search across all content
- **Mobile App Wrapper**: Package as a progressive web app

## Contribution Guidelines

1. Follow the established code structure and naming conventions
2. Document all new features and components
3. Ensure responsive design across all device sizes
4. Test on multiple browsers before submitting changes
5. Keep accessibility in mind for all new features

## License

This project is available for public use without login requirements.

## Credits

Created by Quorum Systems Pty Ltd