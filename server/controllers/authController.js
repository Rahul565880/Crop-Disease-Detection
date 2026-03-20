const supabase = require('../supabase');
const { hashPassword, comparePassword } = require('../utils/password');
const { generateToken } = require('../utils/jwt');

// Simple session cache
const sessionCache = new Map();
const SESSION_TTL = 3600000; // 1 hour

const register = async (req, res) => {
  try {
    const { name, email, password, language } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }

    const { data: existingUser } = await supabase
      .from('users')
      .select('user_id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const passwordHash = await hashPassword(password);

    const { data: user, error } = await supabase
      .from('users')
      .insert({
        name,
        email,
        password_hash: passwordHash,
        language: language || 'en',
        role: 'user'
      })
      .select('user_id, name, email, role, language, created_at')
      .single();

    if (error) {
      console.error('Register error:', error);
      return res.status(500).json({ error: 'Registration failed' });
    }

    const token = generateToken({ userId: user.user_id, role: user.role });

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        user_id: user.user_id,
        id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
        language: user.language,
        created_at: user.created_at
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Check session cache first
    const cachedSession = sessionCache.get(email);
    if (cachedSession && cachedSession.passwordHash) {
      const isValid = await comparePassword(password, cachedSession.passwordHash);
      if (isValid) {
        return res.json({
          message: 'Login successful',
          token: cachedSession.token,
          user: cachedSession.user
        });
      }
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await comparePassword(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken({ userId: user.user_id, role: user.role });

    const userData = {
      user_id: user.user_id,
      id: user.user_id,
      name: user.name,
      email: user.email,
      role: user.role,
      language: user.language,
      created_at: user.created_at
    };

    // Cache session
    sessionCache.set(email, {
      passwordHash: user.password_hash,
      token,
      user: userData,
      timestamp: Date.now()
    });

    res.json({
      message: 'Login successful',
      token,
      user: userData
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

const getProfile = async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('user_id, name, email, role, language, created_at')
      .eq('user_id', req.userId)
      .single();

    if (error || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, language } = req.body;
    
    const updates = {};
    if (name) updates.name = name;
    if (language) updates.language = language;
    updates.updated_at = new Date().toISOString();

    const { data: user, error } = await supabase
      .from('users')
      .update(updates)
      .eq('user_id', req.userId)
      .select('user_id, name, email, role, language')
      .single();

    if (error || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'Profile updated',
      user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

// Clean expired sessions periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of sessionCache.entries()) {
    if (now - value.timestamp > SESSION_TTL) {
      sessionCache.delete(key);
    }
  }
}, 300000); // Clean every 5 minutes

module.exports = {
  register,
  login,
  getProfile,
  updateProfile
};
