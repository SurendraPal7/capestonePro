import { useState, useEffect, useRef, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { FaRobot, FaTimes, FaPaperPlane, FaLeaf, FaLightbulb } from 'react-icons/fa';
import './FarmingChatbot.css';

const FarmingChatbot = () => {
    const { user } = useContext(AuthContext);
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(true);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchSuggestions = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get('/api/chatbot/suggestions', config);
            setSuggestions(data.suggestions);
        } catch (error) {
            console.error('Error fetching suggestions:', error);
        }
    };

    const sendMessage = async (messageText = inputMessage) => {
        if (!messageText.trim()) return;

        const userMessage = {
            role: 'user',
            content: messageText,
            timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsLoading(true);
        setShowSuggestions(false);

        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            
            console.log('🤖 Sending message to chatbot API...');
            console.log('Message:', messageText);
            console.log('Token exists:', !!token);
            
            const { data } = await axios.post('/api/chatbot/chat', {
                message: messageText,
                conversationHistory: messages
            }, config);

            console.log('✅ Received response:', data);

            const botMessage = {
                role: 'assistant',
                content: data.message,
                timestamp: data.timestamp
            };

            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error('❌ Error sending message:', error);
            console.error('Error response:', error.response?.data);
            console.error('Error status:', error.response?.status);
            console.error('Error message:', error.message);
            console.error('Full error:', JSON.stringify(error, null, 2));
            
            const errorMessage = {
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please try again.',
                timestamp: new Date().toISOString()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSuggestionClick = (suggestion) => {
        sendMessage(suggestion);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        sendMessage();
    };

    const toggleChat = () => {
        setIsOpen(!isOpen);
    };

    const clearChat = () => {
        setMessages([]);
        setShowSuggestions(true);
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (isOpen && suggestions.length === 0 && user && user.role === 'farmer') {
            fetchSuggestions();
        }
    }, [isOpen, user]);

    // Debug logging
    useEffect(() => {
        console.log('=== CHATBOT DEBUG ===');
        console.log('User object:', user);
        console.log('User role:', user?.role);
        console.log('Is farmer?:', user?.role === 'farmer');
        console.log('====================');
    }, [user]);

    // Only show chatbot for farmers
    if (!user || user.role !== 'farmer') {
        console.log('FarmingChatbot - Not showing (user role:', user?.role, ')');
        return null;
    }

    console.log('FarmingChatbot - Rendering chatbot button');

    return (
        <>
            {/* Floating Chat Button */}
            {!isOpen && (
                <button className='chatbot-float-btn' onClick={toggleChat}>
                    <FaRobot />
                    <span className='chatbot-badge'>AI</span>
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className='chatbot-window'>
                    {/* Header */}
                    <div className='chatbot-header'>
                        <div className='chatbot-header-info'>
                            <div className='chatbot-avatar'>
                                <FaLeaf />
                            </div>
                            <div>
                                <h3>Farming Assistant</h3>
                                <p>Organic Farming Expert</p>
                            </div>
                        </div>
                        <div className='chatbot-header-actions'>
                            {messages.length > 0 && (
                                <button className='chatbot-clear-btn' onClick={clearChat} title='Clear chat'>
                                    Clear
                                </button>
                            )}
                            <button className='chatbot-close-btn' onClick={toggleChat}>
                                <FaTimes />
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className='chatbot-messages'>
                        {messages.length === 0 && (
                            <div className='chatbot-welcome'>
                                <div className='welcome-icon'>
                                    <FaLeaf />
                                </div>
                                <h4>Welcome to Your Farming Assistant!</h4>
                                <p>I'm here to help you with organic farming strategies, crop recommendations, and best practices.</p>
                            </div>
                        )}

                        {messages.map((msg, index) => (
                            <div key={index} className={`chatbot-message ${msg.role}`}>
                                <div className='message-content'>
                                    {msg.content}
                                </div>
                                <div className='message-time'>
                                    {new Date(msg.timestamp).toLocaleTimeString([], { 
                                        hour: '2-digit', 
                                        minute: '2-digit' 
                                    })}
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className='chatbot-message assistant'>
                                <div className='message-content'>
                                    <div className='typing-indicator'>
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Suggestions */}
                    {showSuggestions && messages.length === 0 && suggestions.length > 0 && (
                        <div className='chatbot-suggestions'>
                            <div className='suggestions-header'>
                                <FaLightbulb />
                                <span>Suggested Questions:</span>
                            </div>
                            <div className='suggestions-list'>
                                {suggestions.slice(0, 4).map((suggestion, index) => (
                                    <button
                                        key={index}
                                        className='suggestion-btn'
                                        onClick={() => handleSuggestionClick(suggestion)}
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Input */}
                    <form className='chatbot-input-form' onSubmit={handleSubmit}>
                        <input
                            type='text'
                            className='chatbot-input'
                            placeholder='Ask about organic farming...'
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            disabled={isLoading}
                        />
                        <button 
                            type='submit' 
                            className='chatbot-send-btn'
                            disabled={isLoading || !inputMessage.trim()}
                        >
                            <FaPaperPlane />
                        </button>
                    </form>
                </div>
            )}
        </>
    );
};

export default FarmingChatbot;
