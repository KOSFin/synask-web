import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import './Registration.css';

const supabaseClient = createClient('https://cnicyffiqvdhgyzkogtl.supabase.co', 'your_supabase_key');

const RegistrationForm = () => {
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [captchaToken, setCaptchaToken] = useState('');
  const [isPhoneUsed, setIsPhoneUsed] = useState(false);
  const [isEmailUsed, setIsEmailUsed] = useState(false);
  const [passwordHints, setPasswordHints] = useState([]);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [captchaRendered, setCaptchaRendered] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const emailParam = urlParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, []);

  const showPopup = (message, imagePath = 'https://imgur.com/aHcCPrp.jpg', displayTime = 5000) => {
    const popupContainer = document.createElement('div');
    popupContainer.className = 'popup-container';

    const popupContent = document.createElement('div');
    popupContent.className = 'popup-content';

    const popupImage = document.createElement('img');
    popupImage.src = imagePath;
    popupImage.alt = 'Image';
    popupImage.className = 'popup-image';

    const popupText = document.createElement('span');
    popupText.className = 'popup-text';
    popupText.textContent = message;

    popupContent.appendChild(popupImage);
    popupContent.appendChild(popupText);
    popupContainer.appendChild(popupContent);
    document.body.appendChild(popupContainer);

    setTimeout(() => {
      popupContainer.style.top = '50px';
      popupContainer.style.opacity = '1';
    }, 500);

    setTimeout(() => {
      popupContainer.style.top = '-100px';
      popupContainer.style.opacity = '0';
    }, displayTime);
  };

  const formatPhoneNumber = (phone) => {
    let formattedPhoneNumber = '';
    const digits = phone.replace(/[^\d]/g, '');
    if (digits.length > 0) formattedPhoneNumber += `+${digits.slice(0, 1)} `;
    if (digits.length > 1) formattedPhoneNumber += `${digits.slice(1, 4)} `;
    if (digits.length > 4) formattedPhoneNumber += `${digits.slice(4, 7)} `;
    if (digits.length > 7) formattedPhoneNumber += `${digits.slice(7)}`;
    return formattedPhoneNumber;
  };

  const updatePasswordHints = (password) => {
    const conditions = [
      { regex: /.{14,}/, hint: 'Password must be at least 14 characters long' },
      { regex: /[a-zа-я]/, hint: 'Add lowercase letters' },
      { regex: /[A-ZА-Я]/, hint: 'Add uppercase letters' },
      { regex: /\d/, hint: 'Include at least one digit' },
      { regex: /[$@#&!%^]/, hint: 'Use special characters' }
    ];

    const hints = conditions.map(condition => ({
      hint: condition.hint,
      fulfilled: condition.regex.test(password)
    }));

    setPasswordHints(hints);
    const strength = hints.filter(hint => hint.fulfilled).length;
    setPasswordStrength((strength / conditions.length) * 100);
  };

  const checkPasswordStrength = (e) => {
    const pwd = e.target.value;
    setPassword(pwd);
    updatePasswordHints(pwd);
  };

  const togglePasswordVisibility = (id) => {
    const field = document.getElementById(id);
    field.type = field.type === 'password' ? 'text' : 'password';
  };

  const handleServerResponse = async (data) => {
    setIsPhoneUsed(data.phone_used);
    setIsEmailUsed(data.email_used);
    if (data.phone_used || data.email_used) {
      showPopup(data.message);
    } else {
      showPopup('Registration successful!');
      replaceFormFields();
    }
  };

  const replaceFormFields = () => {
    document.getElementById('loginForm').innerHTML = `
      <h2>Welcome!</h2>
      <p>Please complete the form to continue.</p>
      <input type="text" id="firstName" name="firstName" placeholder="First Name" required />
      <input type="text" id="lastName" name="lastName" placeholder="Last Name" required />
      <input type="text" id="nickname" name="nickname" placeholder="Nickname" required />
      <select id="gender" name="gender" required>
        <option value="0" disabled selected>Select Gender</option>
        <option value="1">Male</option>
        <option value="2">Female</option>
      </select>
      <input type="date" id="birthdate" name="birthdate" required />
      <div id="turnstile-container"></div>
      <button type="button" id="registerButton" onClick={saveProfile}>Register</button>
    `;
  };

  const saveProfile = async () => {
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const birthdate = document.getElementById('birthdate').value;
    const gender = document.getElementById('gender').value;
    const nickname = document.getElementById('nickname').value;

    if (!firstName || !lastName || !birthdate || !nickname) {
      showPopup('Please fill all fields.');
      return;
    }

    try {
      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          captchaToken,
          data: {
            phone,
            firstName,
            lastName,
            birthday: birthdate,
            gender,
            nickname
          }
        }
      });

      if (error) {
        console.error('Registration error:', error.message);
        showPopup('Registration failed.');
        return;
      }

      showPopup('User registered successfully!');
    } catch (error) {
      console.error('Error during registration:', error.message);
      showPopup('Registration failed.');
    }
  };

  const register = async () => {
    const formattedPhone = phone.replace(/\s/g, '');

    showPopup('Please wait...');
    try {
      const response = await fetch('https://synask-server.vercel.app/check_info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, phone_number: formattedPhone })
      });

      const data = await response.json();
      if (response.ok) {
        await handleServerResponse(data);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error checking info:', error);
      showPopup('Error checking info. Please try again.');
    }
  };

  return (
    <div className="container">
      <div className="right-side">
        <form className="login-form" id="loginForm">
          <div className="form-title">Registration</div>
          <div className="form-subtitle">Create a unique sYn account</div>
          <input
            type="text"
            id="phone-num"
            name="phone"
            placeholder="Your Phone Number"
            value={phone}
            onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
          />
          <input
            type="text"
            id="email"
            name="email"
            placeholder="Your Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <div className="password-container">
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Create Password"
              value={password}
              onChange={checkPasswordStrength}
              autoComplete="new-password"
            />
            <span className="eye-icon" onClick={() => togglePasswordVisibility('password')}>&#128065;</span>
          </div>
          <div className="password-container">
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
            />
            <span className="eye-icon" onClick={() => togglePasswordVisibility('confirmPassword')}>&#128065;</span>
          </div>
          <div className="password-hints">
            {passwordHints.map((hint, index) => (
              <div key={index} className={`password-hint ${hint.fulfilled ? 'fulfilled' : ''}`}>
                {hint.hint}
              </div>
            ))}
          </div>
          <div className="password-strength-bar" style={{ width: `${passwordStrength}%` }}></div>
          <div id="turnstile-container"></div>
          <button type="button" onClick={register}>Register</button>
        </form>
      </div>
    </div>
  );
};

export default RegistrationForm;
