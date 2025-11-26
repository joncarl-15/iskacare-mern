import React from 'react';
import { Activity, Calendar, FileText, UserCheck } from 'lucide-react';
import './Services.css';

const Services = () => {
    const services = [
        {
            icon: <Activity size={40} />,
            title: 'Health Monitoring',
            description: 'Regular health check-ups and monitoring for students and staff to ensure well-being.'
        },
        {
            icon: <Calendar size={40} />,
            title: 'Appointment Scheduling',
            description: 'Easy and convenient online booking system for medical and dental appointments.'
        },
        {
            icon: <FileText size={40} />,
            title: 'Digital Health Records',
            description: 'Secure and accessible digital storage for all your medical history and records.'
        },
        {
            icon: <UserCheck size={40} />,
            title: 'Expert Consultation',
            description: 'Access to qualified medical professionals for consultations and advice.'
        }
    ];

    return (
        <section id="services" className="services-section">
            <div className="container">
                <h2>Our Services</h2>
                <p className="section-subtitle">Comprehensive healthcare solutions tailored for you.</p>
                <div className="services-grid">
                    {services.map((service, index) => (
                        <div key={index} className="service-card">
                            <div className="icon-wrapper">{service.icon}</div>
                            <h3>{service.title}</h3>
                            <p>{service.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Services;
