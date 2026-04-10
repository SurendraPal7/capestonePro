import { FaQuoteLeft, FaStar } from 'react-icons/fa';
import './Testimonials.css';

const testimonialsData = [
    {
        id: 1,
        name: "Sarah Jenkins",
        role: "Organic Farmer",
        image: "https://randomuser.me/api/portraits/women/44.jpg",
        content: "AgriDirect changed everything for us. We removed the middlemen and now we connect directly with customers who care about organic, fresh produce. Our margins have improved significantly.",
        rating: 5
    },
    {
        id: 2,
        name: "Mark Thompson",
        role: "Restaurant Owner",
        image: "https://randomuser.me/api/portraits/men/32.jpg",
        content: "As a chef, freshness is everything. Sourcing directly from local farms through this platform ensures my kitchen is always stocked with the best seasonal ingredients available.",
        rating: 5
    },
    {
        id: 3,
        name: "Elena Rodriguez",
        role: "Home Cook",
        image: "https://randomuser.me/api/portraits/women/68.jpg",
        content: "I love knowing exactly where my food comes from. The produce is always incredibly fresh, and it feels great to support the local agricultural community directly.",
        rating: 5
    }
];

const Testimonials = () => {
    return (
        <section className="testimonials-section container">
            <div className="testimonials-header">
                <h2>What Our Community Says</h2>
                <p>Don't just take our word for it. Hear from the farmers and buyers who use AgriDirect every day.</p>
            </div>
            
            <div className="testimonials-grid">
                {testimonialsData.map((testimonial) => (
                    <div className="testimonial-card" key={testimonial.id}>
                        <div className="quote-icon">
                            <FaQuoteLeft />
                        </div>
                        <div className="stars">
                            {[...Array(testimonial.rating)].map((_, i) => (
                                <FaStar key={i} />
                            ))}
                        </div>
                        <p className="testimonial-content">"{testimonial.content}"</p>
                        <div className="testimonial-author">
                            <img src={testimonial.image} alt={testimonial.name} />
                            <div className="author-info">
                                <h4>{testimonial.name}</h4>
                                <span>{testimonial.role}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default Testimonials;
