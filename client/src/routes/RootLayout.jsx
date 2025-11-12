import { Outlet } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useState, useEffect } from 'react';
import { toggleSidebar } from '../store/uiSlice';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import { Menu } from 'lucide-react';

export default function RootLayout() {
  const dispatch = useDispatch();
  const [navbarHeight, setNavbarHeight] = useState(80);

  useEffect(() => {
    const updateNavbarHeight = () => {
      const navbar = document.querySelector('nav');
      if (navbar) {
        setNavbarHeight(navbar.offsetHeight + 1);
      }
    };

    const timer = setTimeout(updateNavbarHeight, 100);
    updateNavbarHeight();
    
    window.addEventListener('resize', updateNavbarHeight);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateNavbarHeight);
    };
  }, []);

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      <Navbar />
      <div className="flex flex-1 overflow-hidden" style={{ paddingTop: `${navbarHeight}px` }}>
        <Sidebar />
        <main className="flex-1 lg:ml-64 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 pt-12">
            <button
              onClick={() => dispatch(toggleSidebar())}
              className="lg:hidden mb-3 sm:mb-4 p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>
            <Outlet />
            <Footer />
          </div>
        </main>
      </div>
    </div>
  );
}

