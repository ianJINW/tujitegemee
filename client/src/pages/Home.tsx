import type React from "react";
import founder from '../assets/founder.jpeg'

const Home: React.FC = () => {
  return (
    <main className="backg" >
      <h2>Tetea Jamii</h2>
      
      <section>
        <h4>Our C.E.O</h4>

        <article>
          <img className="" src={founder} alt="CEO Lilian" />

          <p>
            
          </p>
          
        </article>
      </section>
    </main>
  )
}

export default Home;