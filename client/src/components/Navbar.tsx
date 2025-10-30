import React, { useCallback, useMemo } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import logo from "../assets/logo_tujitegemee.jpeg";
import {
	Book,
	Contact,
	DockIcon,
	Handshake,
	Home,
	LogInIcon,
	LogOutIcon,
	PersonStandingIcon,
} from "lucide-react";
import useAdminStore from "../stores/admin.stores";

type MenuItem = { to: string; Icon: React.ReactElement; label: string };

const NavItem = React.memo(function NavItem({
	item,
	onClick,
}: {
	item: MenuItem;
	onClick?: () => void;
}) {
	return (
		<li>
			<NavLink
				to={item.to}
				onClick={onClick}
				className={({ isActive }) =>
					`nav-link flex items-center gap-2 ${isActive ? "nav-link--active" : ""}`
				}
				aria-current="page"
			>
				{item.Icon}
				<span>{item.label}</span>
			</NavLink>
		</li>
	);
});

const ExternalLink: React.FC<{ href: string; label: string; Icon?: React.ReactElement }> = ({
	href,
	label,
	Icon,
}) => (
	<a
		href={href}
		target="_blank"
		rel="noopener noreferrer"
		className="nav-link nav-link--icon flex items-center gap-2"
		aria-label={label}
	>
		{Icon}
		<span>{label}</span>
	</a>
);

const Navbar: React.FC = () => {
	const isAuthenticated = useAdminStore((s) => s.isAuthenticated);
	const logout = useAdminStore((s) => s.logout);
	const navigate = useNavigate();

	const handleLogout = useCallback(() => {
		logout();
		navigate("/login");
	}, [logout, navigate]);

	const menu = useMemo<MenuItem[]>(
		() => [
			{ to: "/", Icon: <Home />, label: "Welcome Home" },
			{ to: "/us", Icon: <PersonStandingIcon />, label: "This is us" },
			{ to: "/stories", Icon: <Book />, label: "Stories" },
			{ to: "/docs", Icon: <DockIcon />, label: "What we do" },
			{ to: "/partners", Icon: <Handshake />, label: "Our Partners" },
			{ to: "/contact", Icon: <Contact />, label: "Contact Us" },
		],
		[]
	);

	return (
		<header className="w-full bg-white shadow-lg sticky top-0 z-50 nav-bar" role="banner">
			<div className="container-fluid mx-auto py-3">
				<div className="flex flex-col md:flex-row items-start md:items-center gap-4">
					<div className="flex items-center gap-4 w-full md:w-auto">
						<img
							src={logo}
							alt="Tujitegemee — community support logo"
							className="h-10 w-10 md:h-12 md:w-12 rounded-full object-cover"
						/>
						<div>
							<h1 className="text-lg font-bold text-primary">TETEA JAMII</h1>
							<div className="sr-only">Community support organisation</div>
						</div>
					</div>

					<div className="flex-1 flex flex-col md:flex-row md:items-center gap-3 w-full md:w-auto justify-between">
						<div className="text-sm text-muted">
							<div>
								Tel:{" "}
								<a className="nav-link" href="tel:+250788123456" aria-label="Telephone">
									+250 788 123 456
								</a>
							</div>
							<div>
								Email:{" "}
								<a className="nav-link ml-1" href="mailto:tujitegemee@gm.com" aria-label="Email">
									tujitegemee@gm.com
								</a>
							</div>
						</div>

						<div className="ml-auto flex items-center gap-3 flex-wrap flex-col md:gap-1 gap-2">
							<ExternalLink href="https://www.facebook.com/tujitegemee" label="Facebook" />
							<ExternalLink href="https://www.twitter.com/tujitegemee" label="Twitter" />
							<ExternalLink href="https://www.instagram.com/tujitegemee" label="Instagram" />
							<ExternalLink href="https://www.linkedin.com/company/tujitegemee" label="LinkedIn" />
						</div>
					</div>
				</div>

				<nav aria-label="Main navigation" role="navigation" className="w-full border-t pt-3">
					<div className="flex items-center justify-between">
						<ul className="flex flex-col md:flex-row items-start md:items-center gap-3 list-none p-0 m-0">
							{menu.map((item) => (
								<NavItem key={item.to} item={item} />
							))}

							{!isAuthenticated ? (
								<li>
									<NavLink
										to="/login"
										className={({ isActive }) =>
											`btn btn-outline flex items-center gap-2 ${isActive ? "nav-link--active" : ""}`
										}
									>
										<LogInIcon /> <span>Log in</span>
									</NavLink>
								</li>
							) : (
									<li>
										<button
											type="button"
											onClick={handleLogout}
											className="btn flex items-center gap-2"
											aria-label="Log out"
										>
											<LogOutIcon /> <span>Log out</span>
										</button>
									</li>
							)}
						</ul>
					</div>
				</nav>
			</div>
		</header>
	);
};

export default Navbar;
