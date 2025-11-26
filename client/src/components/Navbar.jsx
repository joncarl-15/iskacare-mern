import React from 'react';
import { Menu } from 'lucide-react';
import './Navbar.css';

const Navbar = ({ onMenuClick }) => {
    return (
        <nav className="navbar">
            <div className="nav-logo">
                <img src="/pup.png" alt="PUP" className="logo-image" />
                <div>PUP Lopez Medical And Dental Services</div>
            </div>

            <button onClick={onMenuClick} className="menu-btn">
                <Menu size={24} />
            </button>
        </nav>
    );
};

export default Navbar;
