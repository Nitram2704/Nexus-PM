import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'
import GlobalCommandDrawer from '../intel/GlobalCommandDrawer'

export function MainLayout() {
  return (
    <div className="flex flex-col h-screen bg-black text-slate-100 font-sans overflow-hidden">
      <Navbar />
      <div className="flex-1 flex overflow-hidden relative">
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <Outlet />
        </main>
        <GlobalCommandDrawer />
      </div>
    </div>
  )
}
