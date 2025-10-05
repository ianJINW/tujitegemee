import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import Contact from "./pages/Contacts";
import Navbar from "./components/Navbar";
import Partners from "./pages/Partners";
import Stories from "./pages/Stories";
import Us from "./pages/Us";
import Login, { Logout, Register } from "./pages/createAdmin";

function App() {
	return (
		<main className="w-full min-h-screen p-4">
			<BrowserRouter>
				<Navbar />

				<Routes>
					<Route path="/us" element={<Us />} />
					<Route path="/login" element={<Login />} />
					<Route path="/logout" element={<Logout />} />
					<Route path="/register" element={<Register />} />
					<Route path="/contact" element={<Contact />} />
					<Route path="/stories" element={<Stories />} />
					<Route path="/partners" element={<Partners />} />
					<Route path="/admin" element={<Login />} />
				</Routes>
			</BrowserRouter>
		</main>
	);
}

export default App;
