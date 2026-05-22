const express = require('express');
const router = express.Router();
const supabase = require('../supabase');
const { authenticate } = require('../middleware/auth');

router.get('/scans/csv', authenticate, async (req, res) => {
  try {
    const { data: scans } = await supabase
      .from('scans')
      .select('scan_id, disease_name, confidence_score, crop_type, image_url, created_at')
      .eq('user_id', req.userId)
      .order('created_at', { ascending: false });

    if (!scans || scans.length === 0) {
      return res.status(404).json({ error: 'No scans to export' });
    }

    const header = 'ID,Disease,Confidence,Crop,Date\n';
    const rows = scans.map(s =>
      `"${s.scan_id}","${s.disease_name || 'Unknown'}","${(s.confidence_score * 100).toFixed(1)}%","${s.crop_type || 'General'}","${s.created_at}"`
    ).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=scan-history.csv');
    res.send(header + rows);
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Export failed' });
  }
});

module.exports = router;
