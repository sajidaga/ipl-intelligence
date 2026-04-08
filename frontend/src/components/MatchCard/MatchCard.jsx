import React from 'react';

const MatchCard = ({ match }) => {
  return (
    <div className="match-card">
      <h3>{match?.team1} vs {match?.team2}</h3>
      <p>{match?.venue}</p>
      <p>{match?.date}</p>
    </div>
  );
};

export default MatchCard;
