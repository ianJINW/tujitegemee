import { NavLink } from "react-router-dom";
import logo from "../assets/logo_tujitegemee.jpeg";
import { Book, Contact, Handshake, PersonStandingIcon } from "lucide-react";

const Navbar: React.FC = () => (
<header className="container shadow-md">
		<fieldset className="flex flexx-row gap-2 mb-4 not-italic w-full font-normal text-gray-700">
			<legend>Tujitegemeee</legend>
			<main className="flex flex-col md:flex-col gap-2 md:gap-6 mr-4 w-full">
				<p> tel: +250788123456</p>{" "}
				<p>
					email: <a href="mailto:tujitegemee@gm.com">tujitegemee@gm.com</a>
				</p>
			</main>
			<section>
				<a
					href="https://www.facebook.com/tujitegemee"
					target="_blank"
					rel="noopener noreferrer"
					className="mr-4 text-gray-800 hover:text-blue-500"
				>
					Facebook
				</a>
				<a
					href="https://www.twitter.com/tujitegemee"
					target="_blank"
					rel="noopener noreferrer"
					className="mr-4 text-gray-800 hover:text-blue-500"
				>
					Twitter
				</a>
				<a
					href="https://www.instagram.com/tujitegemee"
					target="_blank"
					rel="noopener noreferrer"
					className="text-gray-800 hover:text-blue-500"
				>
					Instagram
				</a>
				<a
					href="https://www.linkedin.com/company/tujitegemee"
					target="_blank"
					rel="noopener noreferrer"
					className="ml-4 text-gray-800 hover:text-blue-500"
				>
					LinkedIn
				</a>
			</section>
		</fieldset>
		<section className="flex flex -row justify-between align-center w-full">
			<div className="flex items-center flex-shrink-0 mr-6">
				<img
					src={logo}
					alt="tujitegemee"
					className="h-10 w-10 md:h-12 md:w-12 rounded-full"
				/>
			</div>
  <nav className="card fade-in">
				<NavLink
					to="/us"
					className={({ isActive }) =>
						`flex items-center gap-1 ${
							isActive
								? "font-semibold text-blue-600"
								: "text-gray-800 hover:text-blue-500"
						}`
					}
				>
					<PersonStandingIcon /> This is us
				</NavLink>
				<NavLink
					to="/stories"
					className={({ isActive }) =>
						`flex items-center gap-1 ${
							isActive
								? "font-semibold text-blue-600"
								: "text-gray-800 hover:text-blue-500"
						}`
					}
				>
					<Book /> Stories
				</NavLink>
				<NavLink
					to="/partners"
					className={({ isActive }) =>
						`flex items-center gap-1 ${
							isActive
								? "font-semibold text-blue-600"
								: "text-gray-800 hover:text-blue-500"
						}`
					}
				>
					<Handshake /> Our Partners
				</NavLink>
				<NavLink
					to="/contact"
					className={({ isActive }) =>
						`flex items-center gap-1 ${
							isActive
								? "font-semibold text-blue-600"
								: "text-gray-800 hover:text-blue-500"
						}`
					}
				>
					<Contact /> Contact Us
				</NavLink>
			</nav>
		</section>
	</header>
);

export default Navbar;

