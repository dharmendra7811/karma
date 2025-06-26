import React, { useState } from 'react';
import LoginScreen from '../screens/auth/LoginScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';

const AuthNavigator: React.FC = () => {
  const [showSignUp, setShowSignUp] = useState(false);

  const navigation = {
    navigate: (screen: string) => {
      if (screen === 'SignUp') {
        setShowSignUp(true);
      } else if (screen === 'Login') {
        setShowSignUp(false);
      }
    },
  };

  return showSignUp ? (
    <SignUpScreen navigation={navigation} />
  ) : (
    <LoginScreen navigation={navigation} />
  );
};

export default AuthNavigator;
