import Navbar from "../../components/Navbar";
import React from 'react';

const About: React.FC = () => {
 return (
    <>
    <Navbar />
  <div>
   <h1>About Advo</h1>
   <p>Welcome to Advo, your trusted platform for finding quality resources to support your mental, physical, and social well-being. Our mission is to provide vetted resources that you can rely on, tailored to your specific needs.</p>
   <p>Advo is built with the latest technologies to ensure a seamless and efficient experience. Our team is dedicated to continuously improving the platform to serve you better.</p>
   <h2>Our Team</h2>
   <p>We are a diverse group of professionals passionate about health and technology. Meet the team behind Advo:</p>
   <ul>
    <li>Jane Doe - CEO & Founder</li>
    <li>John Smith - Lead Developer</li>
    <li>Mary Johnson - Project Manager</li>
    <li>...and many more dedicated team members!</li>
   </ul>
   <h2>Contact Us</h2>
   <p>If you have any questions or feedback, feel free to reach out to us at contact@advo.com. We would love to hear from you!</p>
  </div>
  </>
 );
};

export default About;