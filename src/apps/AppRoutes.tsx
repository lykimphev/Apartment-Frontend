import { BrowserRouter, Routes, Route } from "react-router-dom";
import Mainlayout from "../layouts/Mainlayout";
import AboutPage from "../pages/AboutPage";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import NotFoundPage from "../pages/NotFoundPage";
import PrivacyPage from "../pages/PrivacyPage";
import ProtectedRoute from "./ProtectedRoute";
import BuildingPage from "../pages/BuildingPage";
import FloorPage from "../pages/FloorPage";
import GuestPage from "../pages/GuestPage";
import UserPage from "../pages/UserPage";
import RolePage from "../pages/RolePage";
import UserRolePage from "../pages/UserRolePage";
import PermissionPage from "../pages/PermissionPage";
import RoomPage from "../pages/RoomPage";
import ItemPage from "../pages/ItemPage";
import ExchangePage from "../pages/ExchangePage";
import BookingPage from "../pages/BookingPage";
import StaffPage from "../pages/StaffPage";
import PositionPage from "../pages/PositionPage";
import SalaryPage from "../pages/SalaryPage";
import PaySlipPage from "../pages/PaySlipPage";
import ExpenseTypePage from "../pages/ExpenseTypePage";
import OtherExpensePage from "../pages/OtherExpensePage";

export default function AppRoutes(){
    return(
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                {/*Layout Route*/}
                <Route element={<ProtectedRoute />}>
                    <Route path="/" element={<Mainlayout />} >
                        {/* Child Routes */}
                        <Route index element={<HomePage />} />
                        <Route path="/about" element={<AboutPage />} />
                        <Route path="/privacy" element={<PrivacyPage />} />
                        <Route path="/building" element={<BuildingPage/>} />
                        <Route path="/floor" element={<FloorPage/>} />
                        <Route path="/room" element={<RoomPage />} />
                        <Route path="/item" element={<ItemPage />} />
                        <Route path="/exchange" element={<ExchangePage />} />
                        <Route path="/booking" element={<BookingPage />} />
                        <Route path="/guest" element={<GuestPage/>} />
                        <Route path="/staff" element={<StaffPage />} />
                        <Route path="/position" element={<PositionPage />} />
                        <Route path="/salary" element={<SalaryPage />} />
                        <Route path="/payslip" element={<PaySlipPage />} />
                        <Route path="/user" element={<UserPage/>} />
                        <Route path="/role" element={<RolePage/>} />
                        <Route path="/user-role" element={<UserRolePage/>} />
                        <Route path="/permission" element={<PermissionPage/>} />
                        <Route path="/expense-type" element={<ExpenseTypePage />} />
                        <Route path="/expense" element={<OtherExpensePage />} />
                    </Route>
                </Route>
                {/* Erro 404 */}
                <Route path="*" element={<NotFoundPage/>}></Route>
            </Routes>
        </BrowserRouter>
    );
}