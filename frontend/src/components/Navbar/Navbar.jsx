import { NavLink } from 'react-router-dom';
import styles from './Navbar.module.css';

const Navbar = () => {
  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>IPL Intelligence</div>
      <ul className={styles.navLinks}>
        <li><NavLink to="/" end>Home</NavLink></li>
        <li><NavLink to="/players">Players</NavLink></li>
        <li><NavLink to="/matches">Matches</NavLink></li>
        <li><NavLink to="/teams">Teams</NavLink></li>
        <li><NavLink to="/predictions">Predictions</NavLink></li>
      </ul>
    </nav>
  );
};

export default Navbar;
