import React from 'react';

const PlayerCard = ({ player }) => {
  return (
    <div className="player-card">
      <h3>{player?.name}</h3>
      <p>{player?.team}</p>
      <p>{player?.role}</p>
    </div>
  );
};

export default PlayerCard;
