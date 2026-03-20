const supabase = require('../supabase');

// Simple in-memory cache
const cache = new Map();
const CACHE_TTL = 60000; // 1 minute

const getCache = (key) => {
  const item = cache.get(key);
  if (item && Date.now() - item.timestamp < CACHE_TTL) {
    return item.data;
  }
  cache.delete(key);
  return null;
};

const setCache = (key, data) => {
  cache.set(key, { data, timestamp: Date.now() });
};

const getAllDiseases = async (req, res) => {
  try {
    // Check cache first
    const cached = getCache('diseases');
    if (cached) {
      return res.json({ diseases: cached });
    }

    const { data: diseases, error } = await supabase
      .from('diseases')
      .select('*, treatment:treatments(*)')
      .order('disease_name', { ascending: true });

    if (error) {
      console.error('Get all diseases error:', error);
      return res.status(500).json({ error: 'Failed to get diseases' });
    }

    // Cache the result
    setCache('diseases', diseases || []);

    res.json({ diseases: diseases || [] });
  } catch (error) {
    console.error('Get all diseases error:', error);
    res.status(500).json({ error: 'Failed to get diseases' });
  }
};

const getDiseaseById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: disease, error } = await supabase
      .from('diseases')
      .select('*, treatment:treatments(*)')
      .eq('disease_id', id)
      .single();

    if (error || !disease) {
      return res.status(404).json({ error: 'Disease not found' });
    }

    res.json({ disease });
  } catch (error) {
    console.error('Get disease error:', error);
    res.status(500).json({ error: 'Failed to get disease' });
  }
};

const getDiseaseByCode = async (req, res) => {
  try {
    const { code } = req.params;

    const { data: disease, error } = await supabase
      .from('diseases')
      .select('*, treatment:treatments(*)')
      .eq('disease_code', code)
      .single();

    if (error || !disease) {
      return res.status(404).json({ error: 'Disease not found' });
    }

    res.json({ disease });
  } catch (error) {
    console.error('Get disease error:', error);
    res.status(500).json({ error: 'Failed to get disease' });
  }
};

module.exports = {
  getAllDiseases,
  getDiseaseById,
  getDiseaseByCode
};
