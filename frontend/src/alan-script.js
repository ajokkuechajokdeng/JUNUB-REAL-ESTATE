// Alan AI Voice Script for Real Estate App

// Project configuration - Voice only mode
project.name = 'Real Estate Voice Assistant';
project.type = 'voice';
project.chatMode = false;
project.voiceMode = true;

// Navigation commands
intent('Go to home', 'Take me home', 'Home page', p => {
    p.play('Going to home page');
    p.play({command: 'navigate', data: {route: '/'}});
});

intent('Show properties', 'Search properties', 'View properties', 'Properties', p => {
    p.play('Showing available properties');
    p.play({command: 'search_properties'});
});

intent('Go to login', 'Login page', 'Sign in', p => {
    p.play('Opening login page');
    p.play({command: 'login'});
});

intent('Go to register', 'Register page', 'Sign up', 'Create account', p => {
    p.play('Opening registration page');
    p.play({command: 'register'});
});

intent('Go to dashboard', 'Dashboard', 'My dashboard', p => {
    p.play('Opening your dashboard');
    p.play({command: 'dashboard'});
});

intent('Go to profile', 'Profile page', 'My profile', p => {
    p.play('Opening your profile');
    p.play({command: 'profile'});
});

intent('My rentals', 'Show my rentals', 'View my rentals', p => {
    p.play('Showing your rentals');
    p.play({command: 'my_rentals'});
});

// General help
intent('What can you do', 'Help', 'Commands', p => {
    p.play('I can help you navigate the real estate app. You can say things like: Go to home, Show properties, Go to login, Go to dashboard, My profile, or My rentals.');
});

// Greeting
intent('Hello', 'Hi', 'Hey', p => {
    p.play('Hello! Welcome to the real estate app. How can I help you today?');
});

// Fallback
fallback(p => {
    p.play('Sorry, I didn\'t understand that. Try saying "Help" to see what I can do.');
});