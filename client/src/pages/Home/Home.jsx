// src/pages/Home/Home.jsx

import Navbar from "../../components/layout/Navbar/Navbar"
import Hero from "../../components/sections/Hero/Hero"
import Modules from "../../components/sections/Modules/Modules"

import "./Home.css"

export default function Home() {
  return (
    <>
      <Navbar />

      <main className="home">
        <Hero />
        <Modules />
      </main>
    </>
  )
}