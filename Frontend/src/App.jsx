import AdminLayout from "./view/admin/AdminLayout";
import AdminDashboard from "./view/admin/Dashboard"; // sesuaikan path-nya
import { Route, Routes } from 'react-router-dom'

function App() {
  return (
    <>
      <Routes>
        {/* ADMIN */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboard />} />
        </Route>
      </Routes>
    </>
  )
}

export default App