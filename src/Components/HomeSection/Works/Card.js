import React from "react";

const Card = (props) => {
  return (
    <>
      <div className="works-unique-card">
        <div className="works-unique-card-img">
          <img src={props.cover} alt={props.title} />
        </div>
        <div className="works-unique-card-details">
          <h2>{props.title}</h2>
          <p>{props.desc}</p>
        </div>
      </div>
    </>
  );
};

export default Card;
