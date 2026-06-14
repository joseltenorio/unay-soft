// src/pages/Home/Home.jsx

import Navbar from "../../components/layout/Navbar/Navbar"
import Footer from "../../components/layout/Footer/Footer"

import Hero from "../../components/sections/Hero/Hero"
import Modules from "../../components/sections/Modules/Modules"
import Access from "../../components/sections/Access/Access"
import Pricing from "../../components/sections/Pricing/Pricing"
import Demo from "../../components/sections/Demo/Demo"

import "./Home.css"

export default function Home() {
  return (
    <>
      <Navbar />

      <main className="home">
        <Hero />
        <Modules />
        <Access />
        <Pricing />
        <Demo />
      </main>

      <Footer />
    </>
  )
}