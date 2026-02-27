# PERSIST: World Models with Persistent 3D State

This repository contains the project website for "PERSIST: World Models with Persistent 3D State", an academic research project.

## About the Project

PERSIST is a new paradigm of world model which simulates the evolution of a latent 3D scene: environment, camera, and renderer. This allows the synthesis of new frames with persistent spatial memory and consistent geometry. The project's goal is to achieve substantial improvements in spatial memory, 3D consistency, and long-horizon video generation quality over existing methods.

The website is a static page built with HTML, CSS (Bulma framework), and JavaScript. It serves as a public presentation of the research paper, including the abstract, methodology, results, and author information.

## Repository Structure

- `index.html`: The main and only HTML file for the website.
- `static/`: This directory contains all the assets for the website.
  - `css/`: Contains stylesheets, including the Bulma CSS framework and custom styles.
  - `images/`: Contains all images used on the website, including diagrams and qualitative results.
  - `js/`: Contains JavaScript files, including Bulma extensions and custom scripts.
  - `videos/`: Contains all videos and animations demonstrating the project's results.
- `old/`: This directory appears to contain older or unused assets. It should probably not be modified unless explicitly requested.
- `README.md`: The README file for this repository.
- `gemini.md`: This file, containing instructions for Gemini.

## Making Changes to the Website

- **Content:** All text content is located directly in `index.html`. To change text, you will need to edit this file.
- **Styling:** Most styling is controlled by the Bulma CSS framework. Custom styles are in `static/css/index.css`.
- **Assets:** New images or videos should be placed in the appropriate subdirectories within `static/`.
- **Structure:** The website is a single page. Changes to the layout should be made by editing the HTML structure in `index.html`.
- **Dependencies:** The site uses Google Fonts, Font Awesome, and Academicons, which are linked in the `<head>` of `index.html`. The CSS and JS for Bulma are local in `static/css` and `static/js`.

When asked to make changes, you should primarily focus on modifying `index.html` and the files within the `static/` directory. Be careful when editing the HTML to maintain the existing structure and class names, as these are tied to the Bulma styling.
