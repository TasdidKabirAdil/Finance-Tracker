import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import './styles/App.module.css'
import Layout from "./components/Layout";
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import Dashboard from "./pages/Dashboard";
import Expenses from "./pages/Expenses";
import Reports from "./pages/Reports";
import Savings from "./pages/Savings"
import SavingGoal from "./pages/SavingGoal";
import ResetPassword from './pages/ResetPassword';
import PrivateRoute from './components/PrivateRoute'

function App() {
  const token = localStorage.getItem('token')
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route element={<PrivateRoute />}>
            <Route path="/profile/:id" element={<Profile />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/savings" element={<Savings />} />
            <Route path="/saving-goal" element={<SavingGoal />} />
            <Route path="/saving-goal/edit" element={<SavingGoal editMode={true}/>} />
          </Route>
        </Route>
      </Routes>
    </Router>
  )
}

export default App
