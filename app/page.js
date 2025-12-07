'use client';

import { useState } from 'react';
import confetti from 'canvas-confetti';

export default function Home() {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Step 1: Login
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Step 2: Count
    const [count, setCount] = useState(0);

    // Step 3: Emails & Names
    const [participants, setParticipants] = useState([]);

    // Step 4: Success
    const [successMessage, setSuccessMessage] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        setError('');
        if (email === 'yohoho@santa.com' && password === 'kiosksamosa') {
            setStep(2);
        } else {
            setError('Invalid credentials! Are you really Santa?');
        }
    };

    const handleCountSubmit = (e) => {
        e.preventDefault();
        const num = parseInt(count);
        if (num < 3) {
            setError('You need at least 3 people for Secret Santa!');
            return;
        }
        setError('');
        // Initialize participants array with objects
        setParticipants(Array(num).fill().map(() => ({ name: '', email: '' })));
        setStep(3);
    };

    const handleParticipantChange = (index, field, value) => {
        const newParticipants = [...participants];
        newParticipants[index] = {
            ...newParticipants[index],
            [field]: value
        };
        setParticipants(newParticipants);
    };

    const handleAssign = async () => {
        // Validate that all fields have values
        if (participants.some(p => !p.name.trim() || !p.email.trim() || !p.email.includes('@'))) {
            setError('Please enter valid names and emails for all elves.');
            return;
        }
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/assign', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ participants }),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.message || 'Something went wrong');

            setStep(4);
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main>
            <div className="card">
                <h1 className="title">Secret Santa 🎅</h1>

                {error && <div className="error">{error}</div>}

                {step === 1 && (
                    <form onSubmit={handleLogin}>
                        <h2>Elf Login</h2>
                        <input
                            type="email"
                            placeholder="Santa's Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <input
                            type="password"
                            placeholder="Secret Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <button type="submit">Unlock the Workshop</button>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={handleCountSubmit}>
                        <h2>How many elves are playing?</h2>
                        <input
                            type="number"
                            min="3"
                            placeholder="Number of participants"
                            value={count}
                            onChange={(e) => setCount(e.target.value)}
                            required
                        />
                        <button type="submit">Next</button>
                    </form>
                )}

                {step === 3 && (
                    <div>
                        <h2>Who is playing?</h2>
                        <p style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>Enter details below:</p>
                        <div style={{ maxHeight: '400px', overflowY: 'auto', marginBottom: '1rem', paddingRight: '5px' }}>
                            {participants.map((p, i) => (
                                <div key={i} style={{ marginBottom: '15px', background: 'rgba(255,255,255,0.1)', padding: '10px', borderRadius: '10px' }}>
                                    <p style={{ fontSize: '0.8rem', color: '#F8B229', marginBottom: '5px' }}>Elf #{i + 1}</p>
                                    <input
                                        type="text"
                                        placeholder="Name"
                                        value={p.name}
                                        onChange={(e) => handleParticipantChange(i, 'name', e.target.value)}
                                        style={{ marginBottom: '8px', marginTop: '0' }}
                                    />
                                    <input
                                        type="email"
                                        placeholder="Email"
                                        value={p.email}
                                        onChange={(e) => handleParticipantChange(i, 'email', e.target.value)}
                                        style={{ marginBottom: '0', marginTop: '0' }}
                                    />
                                </div>
                            ))}
                        </div>
                        <button onClick={handleAssign} disabled={loading}>
                            {loading ? 'Consulting the Reindeer...' : 'Assign & Send Emails 🎁'}
                        </button>
                    </div>
                )}

                {step === 4 && (
                    <div style={{ textAlign: 'center' }}>
                        <h2 style={{ fontSize: '2rem' }}>Ho Ho Ho! 🎄</h2>
                        <p>Emails have been sent to all Santas!</p>
                        <p>The secret matches are safe with me.</p>
                        <button onClick={() => window.location.reload()} style={{ marginTop: '2rem' }}>
                            Start Over
                        </button>
                    </div>
                )}
            </div>
        </main>
    );
}
