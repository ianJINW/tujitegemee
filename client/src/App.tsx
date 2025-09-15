import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import Contact from "./pages/Contacts";
import Navbar from "./components/Navbar";
import Partners from "./pages/Partners";
import Stories from "./pages/Stories";
import Us from "./pages/Us";

function App() {
	return (
		<main className=" box-border p-4 shadow-lg rounded-lg m-4 w-full min-h-screen ">
			<BrowserRouter>
				<Navbar />

				<Routes>
					<Route path="/us" element={<Us />} />
					<Route path="/contact" element={<Contact />} />
					<Route path="/stories" element={<Stories />} />
					<Route path="/partners" element={<Partners />} />
				</Routes>
			</BrowserRouter>
		</main>
	);
}

export default App;
