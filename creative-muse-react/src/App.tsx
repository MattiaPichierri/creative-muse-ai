import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './App.css';
import Header from './components/Layout/Header';
import { AppProvider } from './context/AppContext';
import './index.css';
import About from './pages/About';
import Home from './pages/Home';
import IdeaDetail from './pages/IdeaDetail';
import Ideas from './pages/Ideas';
import Stats from './pages/Stats';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
            <Header />
            <main>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/ideas" element={<Ideas />} />
                <Route path="/ideas/:id" element={<IdeaDetail />} />
                <Route path="/stats" element={<Stats />} />
                <Route path="/about" element={<About />} />
              </Routes>
            </main>
          </div>
        </Router>
      </AppProvider>
    </QueryClientProvider>
  );
}

export default App;
