import React from 'react';
import { motion } from 'framer-motion';
import { Stethoscope, Activity, User } from 'lucide-react';
import './Hero.css';

const Hero = () => {
    return (
        <section className="hero-section">

            <div className="hero-image">
                {/* Placeholder for a hero image, maybe a vector or a photo */}
                <div className="image-placeholder">
                    <img src="/hello.jpg" alt="Hello PUP" className="hero-image" />
                </div>
            </div>

            <div className="hero-content">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    Your Physical <br />
                    <span className="text-red">Health Matters</span>
                </motion.h1>

                <motion.p
                    className="hero-subtitle"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                >
                    Modern Care for the Modern Iskolar ng Bayan.
                    Providing accessible and quality healthcare services for the PUP community.
                </motion.p>

                <motion.div
                    className="nurse-info-card"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                >
                    <div className="nurse-header">
                        <div className="icon-bg">
                            <User size={24} color="var(--primary-red)" />
                        </div>
                        <div>
                            <h3>Nurse on Duty</h3>
                            <p>Available 8:00 AM - 5:00 PM</p>
                        </div>
                    </div>
                    <div className="nurse-stats">
                        <div className="stat">
                            <Activity size={16} />
                            <span>Emergency Ready</span>
                        </div>
                        <div className="stat">
                            <Stethoscope size={16} />
                            <span>General Checkup</span>
                        </div>
                    </div>
                </motion.div>
            </div>

        </section>
    );
};

export default Hero;
