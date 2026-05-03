// src/pages/Home/Home.jsx

import Navbar from "../../components/layout/Navbar/Navbar"
import Hero from "../../components/sections/Hero/Hero"

import "./Home.css"

export default function Home() {
  return (
    <>
      <Navbar />

      <main className="home">
        <Hero />

        <section className="home__modules-preview" id="modulos">
          <div className="container">
            <div className="home__section-heading">
              <p>
                Sections pendiente
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}