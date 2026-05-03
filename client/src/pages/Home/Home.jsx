// src/pages/Home/Home.jsx

import Navbar from "../../components/layout/Navbar/Navbar"
import "./Home.css"

export default function Home() {
  return (
    <>
      <Navbar />

      <main className="home" id="inicio">
        <section className="home__placeholder">
          <div className="container">
            <p>Hero pendiente</p>
          </div>
        </section>
      </main>
    </>
  )
}
