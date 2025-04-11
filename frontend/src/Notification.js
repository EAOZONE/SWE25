import React, { useState } from 'react';
import {useNavigate} from "react-router-dom";

const Notifications = () => {
    const [emailNotifications, setEmailNotifications] = useState(false);
    const [smsNotifications, setSmsNotifications] = useState(false);
    const [pushNotifications, setPushNotifications] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle the submission of notification preferences
        const preferences = {
            email: emailNotifications,
            sms: smsNotifications,
            push: pushNotifications,
        };
        console.log('User  preferences:', preferences);
        // You can also send this data to your backend or store it in state
    };

    return (
        <div>
            <h1>Notification Preferences</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>
                        <input
                            type="checkbox"
                            checked={emailNotifications}
                            onChange={() => setEmailNotifications(!emailNotifications)}
                        />
                        Email Notifications
                    </label>
                </div>
                <div>
                    <label>
                        <input
                            type="checkbox"
                            checked={smsNotifications}
                            onChange={() => setSmsNotifications(!smsNotifications)}
                        />
                        SMS Notifications
                    </label>
                </div>
                <div>
                    <label>
                        <input
                            type="checkbox"
                            checked={pushNotifications}
                            onChange={() => setPushNotifications(!pushNotifications)}
                        />
                        Push Notifications
                    </label>
                </div>
                <button type="submit">Save Preferences</button>
                <button type="home-btn" onClick={() => navigate('/home')}>
                    Home
                </button>
            </form>
        </div>
    );
};

export default Notifications;