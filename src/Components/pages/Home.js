import React, { useEffect, useRef } from "react";
import "../../App.css";
import Hero from "../HomeSection/Hero";
import HomeAbout from "../HomeSection/HomeAbout";
import MostPopular from "../HomeSection/popular/MostPopular";
import Download from "../HomeSection/Download/Download";
import DownloadAppPage from "../../Common/Navbar/DownloadAppPage";
import Works from "../HomeSection/Works/Works";

const Home = () => {
  // Create refs for sections you want to observe
  const mostPopularRef = useRef(null);
  const homeAboutRef = useRef(null);
  const downloadRef = useRef(null);
  const worksRef = useRef(null);

  useEffect(() => {
    // Callback for intersection
    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Add 'active' class when section is visible
          entry.target.classList.add("active");
        }
      });
    };

    // Options for observer (e.g., when 50% of the element is visible)
    const observerOptions = {
      threshold: 0.5,
    };

    // Create the observer
    const observer = new IntersectionObserver(observerCallback, observerOptions);

    // Observe sections
    if (mostPopularRef.current) observer.observe(mostPopularRef.current);
    if (homeAboutRef.current) observer.observe(homeAboutRef.current);
    if (downloadRef.current) observer.observe(downloadRef.current);
    if (worksRef.current) observer.observe(worksRef.current);

    // Cleanup observer on component unmount
    return () => {
      if (mostPopularRef.current) observer.unobserve(mostPopularRef.current);
      if (homeAboutRef.current) observer.unobserve(homeAboutRef.current);
      if (downloadRef.current) observer.unobserve(downloadRef.current);
      if (worksRef.current) observer.unobserve(worksRef.current);
    };
  }, []);

  // Check for access token in local storage
  const accessToken = localStorage.getItem("accessToken");
  const role = localStorage.getItem("role");

  return (
    <>
      <Hero />
      {accessToken && role === "CUSTOMER" ? (
        <div ref={mostPopularRef} className="hidden-section">
          <MostPopular />
        </div>
      ) : null}
      <div ref={homeAboutRef} className="hidden-section">
        <HomeAbout />
      </div>
      <div ref={downloadRef} className="hidden-section">
        <DownloadAppPage />
      </div>
      <div ref={worksRef} className="hidden-section">
        <Works />
      </div>
    </>
  );
};

export default Home;
