import { AuthProvider } from './src/utils';
import { Navigation } from './src/navigation';

// ── App with Auth Provider ───────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <Navigation />
    </AuthProvider>
  );
}
