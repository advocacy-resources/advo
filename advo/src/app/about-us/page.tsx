import React from "react";

import Navbar from "#/navbar/Navbar";
import PageHeading from "#/utils/PageHeading";
import AboutUsRow from "#/about-us/AboutUsRow";

const About: React.FC = () => {
  return (
    <>
      <Navbar />
      <PageHeading
        title={"About Us"}
        description={
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur."
        }
      />
      <AboutUsRow
        imageSrc={"https://via.placeholder.com/300x200"}
        title={"First Section"}
        description={
          "This is the first section description. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua"
        }
      />
      <AboutUsRow
        imageSrc={"https://via.placeholder.com/300x200"}
        title={"Second Section"}
        description={
          "This is the second section description. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua"
        }
        reverse={true}
      />
      <AboutUsRow
        imageSrc={"https://via.placeholder.com/300x200"}
        title={"Third Section"}
        description={
          "This is the third section description. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua"
        }
      />
    </>
  );
};

export default About;
