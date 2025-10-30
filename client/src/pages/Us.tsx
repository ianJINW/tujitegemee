import Contact from "./Contacts";
import Docs from "./docx";
import Partners from "./Partners";
import Stories from "./Stories";
const Us: React.FC = () => {
	return (
		<>
			<main className="bg-urbanist-blue min-h-screen flex flex-col items-center justify-center text-white ">
				<Stories />
				<Partners />
				<Contact />
				<Docs />
			</main>
		</>
	);
};

export default Us;
