import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import Contact from "./pages/Contacts";
import { Toast } from "./components/Toast";
import Navbar from "./components/Navbar";
import Partners from "./pages/Partners";
import Stories from "./pages/Stories";
import Us from "./pages/Us";
import Login, { Logout, Register } from "./pages/createAdmin";
import Story from "./pages/Story";

function App() {
	return (
		<main className="w-full p-4 m-0 ">
			<BrowserRouter>
				<Navbar />
				<Toast />

				<Routes>
					<Route path="/" element={<Us />} />
					<Route path="/us" element={<Us />} />
					<Route path="/login" element={<Login />} />
					<Route path="/logout" element={<Logout />} />
					<Route path="/register" element={<Register />} />
					<Route path="/contact" element={<Contact />} />
					<Route path="/stories" element={<Stories />} />
					<Route path="/stories/:id" element={<Story />} />
					<Route path="/partners" element={<Partners />} />
					<Route path="/admin" element={<Login />} />
				</Routes>
			</BrowserRouter>
		</main>
	);
}

export default App;
