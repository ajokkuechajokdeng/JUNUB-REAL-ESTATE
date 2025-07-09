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

intent('Search for $(PROPERTY_TYPE) in $(LOCATION* (.*))', p => {
    p.play(`Searching for ${p.PROPERTY_TYPE.value} in ${p.LOCATION.value}`);
    p.play({command: 'filter_properties', data: {property_type: p.PROPERTY_TYPE.value, search: p.LOCATION.value}});
});

intent('Set minimum price to $(NUMBER)', p => {
    p.play(`Setting minimum price to ${p.NUMBER.value}`);
    p.play({command: 'filter_properties', data: {min_price: p.NUMBER.value}});
});

intent('Set maximum price to $(NUMBER)', p => {
    p.play(`Setting maximum price to ${p.NUMBER.value}`);
    p.play({command: 'filter_properties', data: {max_price: p.NUMBER.value}});
});

intent('Clear filters', p => {
    p.play('Clearing all filters');
    p.play({command: 'clear_filters'});
});

intent('Search properties', p => {
    p.play('Searching properties');
    p.play({command: 'submit_search'});
});

intent('What can you do', 'Help', 'Commands', p => {
    p.play('I can help you navigate the real estate app. You can say things like: Go to home, Show properties, Go to login, Go to dashboard, My profile, My rentals, or search for apartments in Juba.');
});

intent('Hello', 'Hi', 'Hey', p => {
    p.play('Hello! Welcome to the real estate app. How can I help you today?');
});

fallback(p => {
    p.play('Sorry, I didn\'t understand that. Try saying "Help" to see what I can do.');
});

// Conversational registration flow
intent('I want to create an account', 'I want to register', 'Sign me up', p => {
    p.play('Great! What is your full name?');
    p.then(registerNameStep);
});

const registerNameStep = context(() => {
    intent('My name is $(NAME* (.*))', p => {
        p.play(`Thanks, ${p.NAME.value}. What is your email address?`);
        p.then(registerEmailStep, { name: p.NAME.value });
    });
});

const registerEmailStep = context(() => {
    intent('My email is $(EMAIL* (.*))', p => {
        p.play(`Got it. What password would you like to use?`);
        p.then(registerPasswordStep, { name: p.state.name, email: p.EMAIL.value });
    });
});

const registerPasswordStep = context(() => {
    intent('My password is $(PASSWORD* (.*))', p => {
        p.play('Creating your account now.');
        p.play({
            command: 'register_user',
            data: {
                name: p.state.name,
                email: p.state.email,
                password: p.PASSWORD.value
            }
        });
        p.play('Your account has been created! You can now log in.');
    });
});