import Header from '../components/layout/Header';
import Hero from '../components/sections/Hero';
import About from '../components/sections/About';
import Process from '../components/sections/Process';
import Projects from '../components/sections/Projects';
import Contact from '../components/sections/Contact';

function Home() {
  return (
    <>
      <Header />
      <Hero />
      <About />
      <Process />
      <Projects />
      <Contact />
    </>
  );
}

export default Home;
