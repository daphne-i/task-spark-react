import { useThemeStore } from './theme/themeStore';
import { HomeScreen } from './screens/HomeScreen';

import { AuroraBackground } from './components/AuroraBackground';
import { useEffect } from 'react';

function App() {
  const theme = useThemeStore((state) => state.theme);

  // This connects the Zustand theme state to the DOM
  useEffect(() => {
    document.body.dataset.theme = theme;
  }, [theme]);

  return (
    <>
      <AuroraBackground />
      <HomeScreen />
    </>
  );
}
export default App;