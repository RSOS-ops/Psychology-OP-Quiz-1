# Psychology OP Quiz 1

A comprehensive interactive study companion designed for Psychology 1 students at Pierce College. This application combines gamified quizzes and digital flashcards to help students master course material in an engaging, immersive environment.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=flat&logo=react&logoColor=%2361DAFB)
![Tailwind CSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=flat&logo=tailwind-css&logoColor=white)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=flat&logo=vite&logoColor=white)

## 🌟 Features

-   **Interactive Quizzes**: Multiple-choice assessments covering Chapters 1-16 (excluding 12 & 13).
-   **Flashcard Mode**: A dedicated study tool with 3D flip animations for reviewing terms and definitions.
-   **State Persistence**: The app automatically saves your progress (current question, score, selected chapter) to local storage, allowing you to refresh or close the browser and pick up exactly where you left off.
-   **Responsive Cyberpunk UI**: A neon-styled, dark-mode interface optimized for both desktop and mobile devices.
-   **Instant Feedback**: Real-time scoring, correct/incorrect indicators, and "Hint" functionality to remove wrong answers.
-   **Immersive Visuals**: Features animated backgrounds, glow effects, and smooth transitions.

## 🛠️ Tech Stack

-   **Frontend Framework**: [React 18](https://react.dev/)
-   **Build Tool**: [Vite](https://vitejs.dev/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/) & Custom CSS
-   **Deployment**: [GitHub Pages](https://pages.github.com/)
-   **Icons**: FontAwesome (via CDN)

## 🚀 Getting Started

Follow these instructions to set up the project locally on your machine.

### Prerequisites

-   Node.js (v14 or higher)
-   npm (v6 or higher)

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/RSOS-ops/Psychology-OP-Quiz-1.git
    cd Psychology-OP-Quiz-1
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Start the development server**
    ```bash
    npm run dev
    ```
    The app should now be running at `http://localhost:5173`.

## 📦 Building & Deployment

This project is configured to deploy to GitHub Pages using the `gh-pages` package.

1.  **Build the project**
    ```bash
    npm run build
    ```

2.  **Deploy to GitHub Pages**
    ```bash
    npm run deploy
    ```
    This command builds the project and pushes the `dist` folder to the `gh-pages` branch.

## 📂 Project Structure

```
Psychology-OP-Quiz-1/
├── public/              # Static assets (images, videos, data files)
├── src/
│   ├── assets/          # Source assets
│   ├── components/      # Reusable UI components (GlowButton, CrossfadeLoop)
│   ├── App.jsx          # Main application logic (Quiz state, routing)
│   ├── FlashCards.jsx   # Flashcard feature logic
│   ├── index.css        # Global styles and Tailwind directives
│   └── main.jsx         # Entry point
├── Chapters/            # Quiz data files (organized by chapter)
├── index.html           # HTML entry point
├── package.json         # Dependencies and scripts
├── tailwind.config.js   # Tailwind configuration
└── vite.config.js       # Vite configuration
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1.  Fork the project
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).