# Frontend - React LA Interactive Map

This is the React frontend for the LA Interactive Map application.

## 🚀 Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 🛠 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

### Project Structure

```
src/
├── components/          # React components
│   ├── MapView.tsx     # Main map component with Leaflet
│   ├── SearchBar.tsx   # Search input component
│   └── ZoneLegend.tsx  # Zone color legend
├── api/                # API client functions
│   └── mapApi.ts       # Backend API calls
├── types.ts            # TypeScript type definitions
├── App.tsx             # Main app component
└── main.tsx            # Application entry point
```

## 🧩 Customization

### Map Tiles
Edit the `TileLayer` component in `MapView.tsx` to use different map styles:

```tsx
// TODO: Replace with custom tile layer URL
<TileLayer
  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
/>
```

### Zone Colors
Zone colors are defined in the backend `zone_service.py` file.

### Styling
Global styles are in `index.css`. Component-specific styles use CSS classes.

## 📚 Features

- Interactive Leaflet map with LA zones
- Place search using Nominatim API
- Auto-routing from user location to destination
- Drag and zoom functionality
- Responsive design for mobile and desktop
- Real-time location detection
