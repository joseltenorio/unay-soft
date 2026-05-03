// src/pages/Home/Home.jsx
import Navbar from '../../components/layout/Navbar/Navbar'
import Hero from '../../components/sections/Hero/Hero'
import Steps from '../../components/common/Steps/Steps'
import AccountAccess from '../../components/sections/AccountAccess/AccountAccess'
import Demo from '../../components/sections/Demo/Demo'
import Footer from '../../components/layout/Footer/Footer'

import './Home.css'

export default function Home() {
  return (
    <>
      <Navbar />

      <main className="home">
        <Hero />
        <Steps />
        <AccountAccess />
        <Demo />
      </main>

      <Footer />
    </>
  )
}