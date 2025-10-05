import { NavLink, useNavigate } from "react-router-dom";
import logo from "../assets/logo_tujitegemee.jpeg";
import {
	Book,
	Contact,
	Handshake,
	LogInIcon,
	LogOutIcon,
	PersonStandingIcon,
} from "lucide-react";
import useAdminStore from "../stores/admin.stores";

const Navbar: React.FC = () => {
	const isAuthenticated = useAdminStore((state) => state.isAuthenticated);
	const logout = useAdminStore((state) => state.logout);
	const navigate = useNavigate();

	const handleLogout = () => {
		logout();
		navigate("/login");
	};

	return (
		<header className="site-container shadow-md">
			<div className="flex flex-row gap-2 mb-4 w-full" style={{ alignItems: 'center' }}>
				<span style={{ fontWeight: 700, color: 'var(--color-primary)', fontSize: '1.3rem', letterSpacing: '0.03em', marginRight: '2rem' }}>
					TUJITEGEMEE
				</span>
					<div className="flex flex-col md:flex-row gap-2 md:gap-6">
						<p>tel: +250788123456</p>
						<p>
						email: <a href="mailto:tujitegemee@gm.com" className="nav-link">tujitegemee@gm.com</a>
						</p>
					</div>
				<div className="ml-auto flex flex-col gap-2">
					<a
						href="https://www.facebook.com/tujitegemee"
						target="_blank"
						rel="noopener noreferrer"
						className="nav-link nav-link--icon"
						aria-label="Facebook"
					>
						Facebook
					</a>
					<a
						href="https://www.twitter.com/tujitegemee"
						target="_blank"
						rel="noopener noreferrer"
						className="nav-link nav-link--icon"
						aria-label="Twitter"
					>
						Twitter
					</a>
					<a
						href="https://www.instagram.com/tujitegemee"
						target="_blank"
						rel="noopener noreferrer"
						className="nav-link nav-link--icon"
						aria-label="Instagram"
					>
						Instagram
					</a>
					<a
						href="https://www.linkedin.com/company/tujitegemee"
						target="_blank"
						rel="noopener noreferrer"
						className="nav-link nav-link--icon"
						aria-label="LinkedIn"
					>
						LinkedIn
					</a>
				</div>
			</div>

			<section className="flex flex-row justify-between items-center w-full px-4 py-2">
				<div className="flex items-center mr-6">
					<img
						src={logo}
						alt="Tujitegemee logo"
						className="h-10 w-10 md:h-12 md:w-12 rounded-full"
					/>
				</div>
				<nav className="flex space-x-4 flex-col md:flex-row md:items-center" aria-label="Main navigation">
					{
				/* Helper to keep NavLink class concise and consistent */
					}
					{([
						{ to: '/us', icon: <PersonStandingIcon />, label: 'This is us' },
						{ to: '/stories', icon: <Book />, label: 'Stories' },
						{ to: '/partners', icon: <Handshake />, label: 'Our Partners' },
						{ to: '/contact', icon: <Contact />, label: 'Contact Us' },
					]).map((item) => (
						<NavLink
							key={item.to}
							to={item.to}
							className={({ isActive }) =>
								`nav-link ${isActive ? 'nav-link--active' : ''}`
							}
							style={{ display: 'flex', alignItems: 'center', gap: '0.4em' }}
						>
							{item.icon} {item.label}
						</NavLink>
					))}

					{!isAuthenticated ? (
						<NavLink to="/login" className={({ isActive }) => `btn btn-outline ${isActive ? 'nav-link--active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '0.4em' }}>
							<LogInIcon /> Log in
						</NavLink>
					) : (
							<button onClick={handleLogout} className="btn" style={{ display: 'flex', alignItems: 'center', gap: '0.4em' }}>
								<LogOutIcon /> Log out
							</button>
					)}
				</nav>
			</section>
		</header>
	);
};

export default Navbar;
