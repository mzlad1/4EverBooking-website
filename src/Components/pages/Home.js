import React from "react";
import "../../App.css";
import Hero from "../HomeSection/Hero";
import HomeAbout from "../HomeSection/HomeAbout";
import MostPopular from "../HomeSection/popular/MostPopular";
import Download from "../HomeSection/Download/Download";
import Works from "../HomeSection/Works/Works";

const Home = () => {
  // Check for access token in local storage
  const accessToken = localStorage.getItem("accessToken");

  return (
    <>
      <Hero />
      {accessToken && <MostPopular />}
      <HomeAbout />
      <Download />
      <Works />
    </>
  );
};

export default Home;
