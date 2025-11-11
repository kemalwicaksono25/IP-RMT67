import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import { Menu } from 'lucide-react';
import { useUIStore } from '../store/ui.store';

export default function RootLayout() {
  const { toggleSidebar } = useUIStore();

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      <Navbar />
      <div className="flex flex-1 pt-[73px] overflow-hidden">
        <Sidebar />
        <main className="flex-1 lg:ml-0 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 pt-12">
            <button
              onClick={toggleSidebar}
              className="lg:hidden mb-4 p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
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

