import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { adminService } from '../services/api';

const Admin = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [diseases, setDiseases] = useState([]);
  const [activeTab, setActiveTab] = useState('stats');
  const [loading, setLoading] = useState(true);
  const [showDiseaseForm, setShowDiseaseForm] = useState(false);
  const [editingDisease, setEditingDisease] = useState(null);
  const [diseaseForm, setDiseaseForm] = useState({
    disease_name: '',
    disease_code: '',
    crop_type: '',
    description: '',
    symptoms: '',
    severity: 'medium',
    chemical_solution: '',
    organic_solution: '',
    prevention_methods: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, diseasesRes] = await Promise.all([
        adminService.getStats(),
        fetch('http://localhost:5000/api/diseases').then(r => r.json()).catch(() => ({ diseases: [] }))
      ]);
      setStats(statsRes.data.stats);
      setDiseases(diseasesRes.diseases || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async (page = 1) => {
    try {
      const response = await adminService.getUsers(page);
      setUsers(response.data.users);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await adminService.deleteUser(userId);
      fetchUsers();
    } catch (error) {
      alert('Failed to delete user');
    }
  };

  const handleSubmitDisease = async (e) => {
    e.preventDefault();
    
    try {
      if (editingDisease) {
        await adminService.updateDisease(editingDisease.disease_id, diseaseForm);
      } else {
        await adminService.createDisease(diseaseForm);
      }
      
      setShowDiseaseForm(false);
      setEditingDisease(null);
      setDiseaseForm({
        disease_name: '',
        disease_code: '',
        crop_type: '',
        description: '',
        symptoms: '',
        severity: 'medium',
        chemical_solution: '',
        organic_solution: '',
        prevention_methods: ''
      });
      fetchData();
    } catch (error) {
      alert('Failed to save disease');
    }
  };

  const handleEditDisease = (disease) => {
    setEditingDisease(disease);
    setDiseaseForm({
      disease_name: disease.disease_name,
      disease_code: disease.disease_code,
      crop_type: disease.crop_type,
      description: disease.description || '',
      symptoms: disease.symptoms || '',
      severity: disease.severity || 'medium',
      chemical_solution: disease.treatment?.chemical_solution || '',
      organic_solution: disease.treatment?.organic_solution || '',
      prevention_methods: disease.treatment?.prevention_methods || ''
    });
    setShowDiseaseForm(true);
  };

  const handleDeleteDisease = async (diseaseId) => {
    if (!window.confirm('Are you sure you want to delete this disease?')) return;
    
    try {
      await adminService.deleteDisease(diseaseId);
      fetchData();
    } catch (error) {
      alert('Failed to delete disease');
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading-screen">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem 20px' }}>
      <h1 className="page-title">{t('admin.title')}</h1>

      <div className="admin-stats">
        <div className="stat-card">
          <div className="stat-value">{stats?.totalUsers || 0}</div>
          <div className="stat-label">{t('admin.totalUsers')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats?.totalScans || 0}</div>
          <div className="stat-label">{t('admin.totalScans')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats?.totalDiseases || 0}</div>
          <div className="stat-label">{t('admin.totalDiseases')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats?.scansToday || 0}</div>
          <div className="stat-label">{t('admin.scansToday')}</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <button 
          className={`btn ${activeTab === 'stats' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('stats')}
        >
          {t('admin.statistics')}
        </button>
        <button 
          className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => { setActiveTab('users'); fetchUsers(); }}
        >
          {t('admin.users')}
        </button>
        <button 
          className={`btn ${activeTab === 'diseases' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('diseases')}
        >
          {t('admin.diseases')}
        </button>
      </div>

      {activeTab === 'users' && (
        <div className="card">
          <h2>{t('admin.manageUsers')}</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                  <th style={{ textAlign: 'left', padding: '0.75rem' }}>ID</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem' }}>Name</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem' }}>Email</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem' }}>Role</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem' }}>Joined</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.user_id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.75rem' }}>{user.user_id}</td>
                    <td style={{ padding: '0.75rem' }}>{user.name}</td>
                    <td style={{ padding: '0.75rem' }}>{user.email}</td>
                    <td style={{ padding: '0.75rem' }}>{user.role}</td>
                    <td style={{ padding: '0.75rem' }}>{new Date(user.created_at).toLocaleDateString()}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <button 
                        className="btn btn-danger btn-small"
                        onClick={() => handleDeleteUser(user.user_id)}
                      >
                        {t('common.delete')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'diseases' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2>{t('admin.manageDiseases')}</h2>
            <button 
              className="btn btn-primary"
              onClick={() => { setShowDiseaseForm(true); setEditingDisease(null); }}
            >
              {t('admin.addDisease')}
            </button>
          </div>

          {showDiseaseForm && (
            <div className="card" style={{ backgroundColor: '#f9f9f9' }}>
              <h3>{editingDisease ? t('admin.editDisease') : t('admin.addDisease')}</h3>
              <form onSubmit={handleSubmitDisease}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">{t('disease.diseaseName')}</label>
                    <input
                      type="text"
                      className="form-input"
                      value={diseaseForm.disease_name}
                      onChange={(e) => setDiseaseForm({ ...diseaseForm, disease_name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('disease.diseaseCode')}</label>
                    <input
                      type="text"
                      className="form-input"
                      value={diseaseForm.disease_code}
                      onChange={(e) => setDiseaseForm({ ...diseaseForm, disease_code: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('disease.cropType')}</label>
                    <input
                      type="text"
                      className="form-input"
                      value={diseaseForm.crop_type}
                      onChange={(e) => setDiseaseForm({ ...diseaseForm, crop_type: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('disease.severity')}</label>
                    <select
                      className="form-select"
                      value={diseaseForm.severity}
                      onChange={(e) => setDiseaseForm({ ...diseaseForm, severity: e.target.value })}
                    >
                      <option value="low">{t('disease.low')}</option>
                      <option value="medium">{t('disease.medium')}</option>
                      <option value="high">{t('disease.high')}</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">{t('disease.description')}</label>
                  <textarea
                    className="form-input"
                    rows="2"
                    value={diseaseForm.description}
                    onChange={(e) => setDiseaseForm({ ...diseaseForm, description: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">{t('disease.symptoms')}</label>
                  <textarea
                    className="form-input"
                    rows="2"
                    value={diseaseForm.symptoms}
                    onChange={(e) => setDiseaseForm({ ...diseaseForm, symptoms: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">{t('result.chemicalSolution')}</label>
                  <textarea
                    className="form-input"
                    rows="2"
                    value={diseaseForm.chemical_solution}
                    onChange={(e) => setDiseaseForm({ ...diseaseForm, chemical_solution: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">{t('result.organicSolution')}</label>
                  <textarea
                    className="form-input"
                    rows="2"
                    value={diseaseForm.organic_solution}
                    onChange={(e) => setDiseaseForm({ ...diseaseForm, organic_solution: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">{t('result.prevention')}</label>
                  <textarea
                    className="form-input"
                    rows="2"
                    value={diseaseForm.prevention_methods}
                    onChange={(e) => setDiseaseForm({ ...diseaseForm, prevention_methods: e.target.value })}
                  />
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button type="submit" className="btn btn-primary">
                    {t('common.save')}
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-outline"
                    onClick={() => { setShowDiseaseForm(false); setEditingDisease(null); }}
                  >
                    {t('common.cancel')}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div style={{ marginTop: '1rem' }}>
            {diseases.map((disease) => (
              <div 
                key={disease.disease_id} 
                style={{ 
                  padding: '1rem', 
                  border: '1px solid var(--border-color)', 
                  borderRadius: '4px',
                  marginBottom: '0.5rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <strong>{disease.disease_name}</strong>
                  <span style={{ marginLeft: '1rem', color: 'var(--text-secondary)' }}>
                    {disease.crop_type}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    className="btn btn-outline btn-small"
                    onClick={() => handleEditDisease(disease)}
                  >
                    {t('common.edit')}
                  </button>
                  <button 
                    className="btn btn-danger btn-small"
                    onClick={() => handleDeleteDisease(disease.disease_id)}
                  >
                    {t('common.delete')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
