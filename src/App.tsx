import { useEffect } from 'react';
import { useThemeStore } from './theme/themeStore';
import { HomeScreen } from './screens/HomeScreen';
import { AuroraBackground } from './components/AuroraBackground';

function App() {
  const theme = useThemeStore((state) => state.theme);

  // This is the critical part:
  // It connects the Zustand theme state to the DOM
  useEffect(() => {
    // We set the attribute on the *body* element
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <>
      {/* AuroraBackground is now just an empty div 
          to ensure the z-index stacking is correct,
          but the visual is on the body. */}
      <AuroraBackground />
      <HomeScreen />
    </>
  );
}
export default App;