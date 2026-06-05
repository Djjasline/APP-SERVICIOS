Filename: README.txt

# React

A modern React-based project utilizing the latest frontend technologies and tools for building responsive web applications.

## 🚀 Features

- **React 18** - React version with improved rendering and concurrent features
- **Vite** - Lightning-fast build tool and development server
- **Redux Toolkit** - State management with simplified Redux setup
- **TailwindCSS** - Utility-first CSS framework with extensive customization
- **React Router v6** - Declarative routing for React applications
- **Data Visualization** - Integrated D3.js and Recharts for powerful data visualization
- **Form Management** - React Hook Form for efficient form handling
- **Animation** - Framer Motion for smooth UI animations
- **Testing** - Jest and React Testing Library setup

## 📋 Prerequisites

- Node.js (v14.x or higher)
- npm or yarn

## 🛠️ Installation

1. Copia el ejemplo de variables y rellénalas:
   cp .env.example .env
   (en Windows PowerShell)
   Copy-Item .env.example .env
   Edita `.env` si necesitas usar otras claves.

2. Instala dependencias:
   npm install
   # o
   yarn install

3. Levanta el servidor en desarrollo:
   npm run dev
   # Nota: este proyecto usa Vite; no hay script `start` por defecto

Configura en Netlify:
- Añade las variables de entorno `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` en Netlify → Site settings → Build & deploy → Environment.
- Después de añadirlas, haz un redeploy del sitio (Netlify inyecta las env vars en tiempo de build y Vite las incorpora al bundle cliente).

## 📁 Project Structure

react_app/
├── public/             # Static assets
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/          # Page components
│   ├── styles/         # Global styles and Tailwind configuration
│   ├── App.jsx         # Main application component
│   ├── Routes.jsx      # Application routes
│   └── index.jsx       # Application entry point
├── .env                # Environment variables
├── index.html          # HTML template
├── package.json        # Project dependencies and scripts
├── tailwind.config.js  # Tailwind CSS configuration
└── vite.config.js      # Vite configuration

## 🧩 Adding Routes

To add new routes to the application, update the `Routes.jsx` file:

import { useRoutes } from "react-router-dom";
import HomePage from "pages/HomePage";
import AboutPage from "pages/AboutPage";

const ProjectRoutes = () => {
  let element = useRoutes([
    { path: "/", element: <HomePage /> },
    { path: "/about", element: <AboutPage /> },
    // Add more routes as needed
  ]);

  return element;
};

## 🎨 Styling

This project uses Tailwind CSS for styling. The configuration includes:
- Forms plugin for form styling
- Typography plugin for text styling
- Aspect ratio utilities and container queries
- Fluid typography and animation utilities

## 📱 Responsive Design

The app is built with responsive design using Tailwind CSS breakpoints.

## 📦 Deployment

Build the application for production:
npm run build

## 🙏 Acknowledgments

- Built with Rocket.new
- Powered by React and Vite
- Styled with Tailwind CSS

Built with ❤️ on Rocket.new
