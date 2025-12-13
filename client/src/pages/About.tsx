import { Link } from 'react-router-dom';
import Footer from '../components/layout/Footer';
import '../styles/pages/Legal.css';
import SEO from '../components/SEO';

const About = () => {
  return (
    <div className="legal-page">
      <SEO 
        title="About Us" 
        description="Learn about TaskPlexus, our mission, and the story behind the minimalist todo app designed for productivity."
      />
      <nav className="legal-navbar">
        <div className="legal-nav-content">
          <Link to="/" className="legal-nav-logo">
            <img src="/TaskPlexus.png" alt="TaskPlexus" width={32} />
            <span>TaskPlexus</span>
          </Link>
          <Link to="/" className="legal-nav-back">← Back to Home</Link>
        </div>
      </nav>

      <main className="legal-container">
        <div className="legal-header">
          <h1>About TaskPlexus</h1>
          <p className="legal-date">Building the future of productivity</p>
        </div>

        <div className="legal-content">
          <section className="legal-section">
            <h2>Our Mission</h2>
            <p>
              TaskPlexus was born from a simple idea: productivity tools should adapt to you, not the other way around.
              We believe that staying organized shouldn't feel like a chore. Our mission is to provide a clean, fast, 
              and intelligent workspace that helps you focus on what truly matters.
            </p>
          </section>

          <section className="legal-section">
            <h2>The Story</h2>
            <p>
              Developed by Navnath, an individual developer based in Mumbai, India, TaskPlexus started as a personal 
              project to solve the complexity of modern project management tools.
            </p>
            <p>
              What began as a simple todo list has evolved into a comprehensive productivity suite featuring AI-powered 
              planning, visual flowcharts, and goal tracking—all while maintaining the simplicity that users love.
            </p>
          </section>

          <section className="legal-section">
            <h2>Why TaskPlexus?</h2>
            <ul className="legal-list">
              <li><strong>Simplicity First:</strong> We fight feature bloat. Every feature is designed to be intuitive and essential.</li>
              <li><strong>Privacy Focused:</strong> Your data belongs to you. We don't sell it, and we protect it with industry-standard security.</li>
              <li><strong>Performance:</strong> We optimize for speed. TaskPlexus loads instantly and works offline.</li>
              <li><strong>Innovation:</strong> We leverage cutting-edge AI to help you plan better and work smarter.</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>Join the Journey</h2>
            <p>
              We are constantly improving and adding new features based on user feedback. Whether you're a student, 
              freelancer, or professional, TaskPlexus is built to help you achieve your goals.
            </p>
            <div style={{ marginTop: '40px', textAlign: 'center' }}>
              <Link to="/signup" style={{ 
                display: 'inline-block',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                padding: '12px 32px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: 'bold',
                fontSize: '16px'
              }}>
                Start Your Journey
              </Link>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default About;
