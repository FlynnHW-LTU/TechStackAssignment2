import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { Header } from './components/Header';
import { Home } from './pages/Home';
import { SignUp } from './pages/SignUp';
import { LogIn } from './pages/LogIn';
import { Profile } from './pages/Profile';
import { Categories } from './pages/Categories';
import { CategoryDetail } from './pages/CategoryDetail';
import { ResourceDetail } from './pages/ResourceDetail';
import { AddResource } from './pages/AddResource';
import { SearchResults } from './pages/SearchResults';
import { AboutUs } from './pages/AboutUs';
import { ContactUs } from './pages/ContactUs';
import { AIToolsHub } from './pages/AIToolsHub';
import { NotFound } from './pages/NotFound';

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <DataProvider>
          <div className="min-h-screen bg-gray-50">
            <Header />
            <main>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/login" element={<LogIn />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/categories/:categoryId" element={<CategoryDetail />} />
                <Route path="/resources/:resourceId" element={<ResourceDetail />} />
                <Route path="/add-resource" element={<AddResource />} />
                <Route path="/search" element={<SearchResults />} />
                <Route path="/about" element={<AboutUs />} />
                <Route path="/contact" element={<ContactUs />} />
                <Route path="/ai-tools" element={<AIToolsHub />} />
                <Route path="/404" element={<NotFound />} />
                <Route path="*" element={<Navigate to="/404" replace />} />
              </Routes>
            </main>
          </div>
        </DataProvider>
      </AuthProvider>
    </Router>
  );
}
