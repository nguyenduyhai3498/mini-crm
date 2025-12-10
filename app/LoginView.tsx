import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Icon } from '../components/atoms/Icon/icons';

export const LoginView = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!email || !password) {
            setError('Vui lòng nhập đầy đủ thông tin');
            return;
        }

        setIsLoading(true);

        try {
            await login(email, password);
            // Login successful - AuthContext will update and App will redirect
        } catch (err) {
            const error = err as Error;
            setError(error.message || 'Tên đăng nhập hoặc mật khẩu không đúng');
            setPassword('');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <Icon name="logo" />
                    <h1>Đăng nhập</h1>
                    <p>Chào mừng bạn trở lại với Mini CRM</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <div className="input-wrapper">
                            <Icon name="user" />
                            <input
                                id="email"
                                type="text"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Nhập email"
                                autoComplete="username"
                                autoFocus
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Mật khẩu</label>
                        <div className="input-wrapper">
                            <Icon name="lock" />
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Nhập mật khẩu"
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                className="toggle-password"
                                onClick={() => setShowPassword(!showPassword)}
                                tabIndex={-1}
                            >
                                <Icon name={showPassword ? 'eyeOff' : 'eye'} />
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="error-message">
                            <Icon name="alertCircle" />
                            <span>{error}</span>
                        </div>
                    )}

                    <button type="submit" className="login-button" disabled={isLoading}>
                        {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                    </button>
                </form>
            </div>
        </div>
    );
};

