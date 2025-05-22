import React, { useState, useEffect } from 'react';
import {
  CCol,
  CCard,
  CCardHeader,
  CCardBody,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CSpinner,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
  CButton,
  CAlert,
  CForm,
  CFormInput,
  CFormSelect,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
} from '@coreui/react';
import { cilPlus } from '@coreui/icons';
import CIcon from '@coreui/icons-react';

const HealthAuthority = () => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [selectedAuthority, setSelectedAuthority] = useState(null);
  const [authorities, setAuthorities] = useState([]);
  const [diagnosisLists, setDiagnosisLists] = useState([]);
  const [drugLists, setDrugLists] = useState([]);
  const [clinicianLists, setClinicianLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    shortName: '',
    contact_email: '',
    status: 'ACTIVE',
    country: '',
    state: '',
    city: '',
  });
  const [settingsForm, setSettingsForm] = useState({
    diagnosisList: '',
    drugList: '',
    clinicianList: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchAuthorities();
    fetchLists();
  }, []);

  useEffect(() => {
    console.log('isCreateDialogOpen changed:', isCreateDialogOpen);
  }, [isCreateDialogOpen]);

  const fetchAuthorities = () => {
    setLoading(true);
    setError(null);
    fetch('http://localhost:8081/api/health-authorities')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch health authorities');
        return res.json();
      })
      .then((data) => {
        if (data.data && Array.isArray(data.data)) {
          const formattedData = data.data.map((authority) => {
            console.log('Authority data:', authority);
            return {
              ...authority,
              health_authority_id: authority.id,
              createdOn: authority.createdAt,
              status: (authority.status || 'INACTIVE').toUpperCase() === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE',
            };
          });
          setAuthorities(formattedData);
        } else {
          throw new Error('Invalid data format received from API');
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching health authorities:', error);
        setError('Failed to load health authorities. Please try again later.');
        setAuthorities([]);
        setLoading(false);
      });
  };

  const fetchAuthorityDetails = (id) => {
    fetch(`http://localhost:8081/api/health-authorities/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch authority details');
        return res.json();
      })
      .then((data) => {
        if (data.data) {
          setSelectedAuthority({ ...selectedAuthority, ...data.data });
        } else {
          throw new Error('Invalid data format received from API');
        }
      })
      .catch((error) => {
        console.error('Error fetching authority details:', error);
        setError('Failed to load authority details. Please try again later.');
      });
  };

  const fetchLists = () => {
    fetch('http://localhost:8081/api/diagnosis-lists')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch diagnosis lists');
        return res.json();
      })
      .then((data) => {
        if (data.data && Array.isArray(data.data)) {
          setDiagnosisLists(data.data);
        } else {
          throw new Error('Invalid diagnosis lists data format');
        }
      })
      .catch((error) => {
        console.error('Error fetching diagnosis lists:', error);
        setError('Failed to load diagnosis lists. Please try again later.');
        setDiagnosisLists([]);
      });

    fetch('http://localhost:8081/api/drug-lists')
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch drug lists: ${res.status} ${res.statusText}`);
        return res.json();
      })
      .then((data) => {
        if (data.data && Array.isArray(data.data)) {
          setDrugLists(data.data);
        } else {
          throw new Error('Invalid drug lists data format');
        }
      })
      .catch((error) => {
        console.error('Error fetching drug lists:', error.message, error.stack);
        setError(`Failed to load drug lists: ${error.message}. Please try again later.`);
        setDrugLists([]);
      });

    fetch('http://localhost:8081/api/clinician-lists')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch clinician lists');
        return res.json();
      })
      .then((data) => {
        if (data.data && Array.isArray(data.data)) {
          setClinicianLists(data.data);
        } else {
          throw new Error('Invalid clinician lists data format');
        }
      })
      .catch((error) => {
        console.error('Error fetching clinician lists:', error);
        setError('Failed to load clinician lists. Please try again later.');
        setClinicianLists([]);
      });
  };

  const handleNameClick = (authority) => {
    setSelectedAuthority(authority);
    fetchAuthorityDetails(authority.health_authority_id);
    setIsDetailsOpen(true);
  };

  const handleDeactivate = (authority) => {
    setSelectedAuthority(authority);
    setIsDialogOpen(true);
  };

  const handleConfirmDeactivate = () => {
    if (!selectedAuthority || !selectedAuthority.health_authority_id) {
      setError('No health authority selected. Please try again.');
      setIsDialogOpen(false);
      return;
    }

    fetch(`http://localhost:8081/api/health-authorities/${selectedAuthority.health_authority_id}/deactivate`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((data) => {
            throw new Error(data.error || 'Failed to deactivate health authority');
          });
        }
        return res.json();
      })
      .then(() => {
        setError('Health authority deactivated successfully.');
        setTimeout(() => setError(null), 3000);
        fetchAuthorities();
        setIsDialogOpen(false);
      })
      .catch((error) => {
        console.error('Error deactivating authority:', error);
        setError(error.message || 'Failed to deactivate health authority. Please try again.');
        setIsDialogOpen(false);
      });
  };

  const handleSettings = (authority) => {
    if (!authority || (!authority.health_authority_id && !authority.id)) {
      console.error('Invalid authority object:', authority);
      setError('Invalid health authority selected. Please try again.');
      return;
    }

    const authorityWithId = {
      ...authority,
      health_authority_id: authority.health_authority_id || authority.id,
    };

    console.log('Selected authority:', authorityWithId);
    setSelectedAuthority(authorityWithId);

    const diagnosisListId = diagnosisLists.find(list => list.name === authority.diagnosisList)?.id || '';
    const drugListId = drugLists.find(list => list.name === authority.drugList)?.drug_list_id || '';
    const clinicianListId = clinicianLists.find(list => list.name === authority.clinicianList)?.id || '';

    setSettingsForm({
      diagnosisList: diagnosisListId,
      drugList: drugListId,
      clinicianList: clinicianListId,
    });
    setIsSettingsDialogOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSettingsInputChange = (e) => {
    const { name, value } = e.target;
    console.log(`Setting ${name} to:`, value);
    setSettingsForm((prev) => ({ ...prev, [name]: value }));
  };

  const validateSettingsForm = () => {
    console.log('diagnosisLists:', diagnosisLists);
    console.log('settingsForm.diagnosisList:', settingsForm.diagnosisList);
    console.log('drugLists:', drugLists);
    console.log('settingsForm.drugList:', settingsForm.drugList);
    console.log('clinicianLists:', clinicianLists);
    console.log('settingsForm.clinicianList:', settingsForm.clinicianList);

    if (settingsForm.diagnosisList && !diagnosisLists.some(list => list.id === settingsForm.diagnosisList)) {
      setError('Selected Diagnosis List is not available.');
      return false;
    }
    if (settingsForm.drugList && !drugLists.some(list => list.drug_list_id === settingsForm.drugList)) {
      setError('Selected Drug List is not available.');
      return false;
    }
    if (settingsForm.clinicianList && !clinicianLists.some(list => list.id === settingsForm.clinicianList)) {
      setError('Selected Clinician List is not available.');
      return false;
    }
    return true;
  };

  const handleUpdateConfigurations = () => {
    if (!selectedAuthority || !selectedAuthority.health_authority_id) {
      setError('No health authority selected. Please try again.');
      return;
    }

    if (!validateSettingsForm()) return;

    setIsSubmitting(true);
    const payload = {
      diagnosis_list_id: settingsForm.diagnosisList || null,
      drug_list_id: settingsForm.drugList || null,
      clinician_list_id: settingsForm.clinicianList || null,
    };

    fetch(`http://localhost:8081/api/health-authorities/${selectedAuthority.health_authority_id}/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((data) => {
            throw new Error(data.error || 'Failed to update configurations');
          });
        }
        return res.json();
      })
      .then(() => {
        setError(null);
        setTimeout(() => setError('Configurations updated successfully.'), 100);
        fetchAuthorities();
        setIsSettingsDialogOpen(false);
      })
      .catch((error) => {
        console.error('Error updating configurations:', error);
        setError(error.message || 'Failed to update configurations. Please try again.');
      })
      .finally(() => setIsSubmitting(false));
  };

  const handleCreateSubmit = () => {
    if (!formData.name || !formData.status) {
      setError('Name and Status are required.');
      return;
    }

    if (formData.contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contact_email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    const payload = {
      health_authorities: [
        {
          name: formData.name,
          shortName: formData.shortName,
          contact_email: formData.contact_email || null,
          status: formData.status,
          country: formData.country || null,
          state: formData.state || null,
          city: formData.city || null,
        },
      ],
    };

    fetch('http://localhost:8081/api/health-authorities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((data) => {
            throw new Error(data.error || data.details || 'Failed to create health authority');
          });
        }
        return res.json();
      })
      .then(() => {
        fetchAuthorities();
        setIsCreateDialogOpen(false);
        resetForm();
        setError('Health authority created successfully.');
        setTimeout(() => setError(null), 3000);
      })
      .catch((error) => {
        console.error('Error creating authority:', error);
        setError(error.message || 'Failed to create health authority. Please try again.');
      })
      .finally(() => setIsSubmitting(false));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      shortName: '',
      contact_email: '',
      status: 'ACTIVE',
      country: '',
      state: '',
      city: '',
    });
    setError(null);
  };

  const openCreateDialog = () => {
    console.log('Opening create dialog');
    resetForm();
    setIsCreateDialogOpen(true);
  };

  return (
    <CCol xs={12}>
      <CCard className="mb-4">
        <CCardHeader>
          <div className="d-flex justify-content-between align-items-center">
            <strong>Health Authorities</strong>
            <CButton color="primary" onClick={openCreateDialog}>
              <CIcon icon={cilPlus} className="me-2" />
              Add Health Authority
            </CButton>
          </div>
        </CCardHeader>
        <CCardBody>
          {error && <CAlert color={error.includes('successfully') ? 'success' : 'danger'}>{error}</CAlert>}
          {loading ? (
            <CSpinner color="primary" />
          ) : authorities.length === 0 ? (
            <p>No health authorities found.</p>
          ) : (
            <CTable hover striped bordered>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Name</CTableHeaderCell>
                  <CTableHeaderCell>Short Name</CTableHeaderCell>
                  <CTableHeaderCell>Created On</CTableHeaderCell>
                  <CTableHeaderCell>Status</CTableHeaderCell>
                  <CTableHeaderCell>Actions</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {authorities.map((authority) => (
                  <CTableRow key={authority.health_authority_id}>
                    <CTableDataCell
                      className="cursor-pointer hover:text-blue-600"
                      onClick={() => handleNameClick(authority)}
                    >
                      {authority.name}
                    </CTableDataCell>
                    <CTableDataCell>{authority.shortName || '-'}</CTableDataCell>
                    <CTableDataCell>
                      {authority.createdOn
                        ? new Date(authority.createdOn).toLocaleString()
                        : '-'}
                    </CTableDataCell>
                    <CTableDataCell>
                      <CButton
                        className={
                          authority.status === 'ACTIVE'
                            ? 'bg-success'
                            : 'bg-danger'
                        }
                        style={{
                          padding: '0.25rem 1rem',
                          fontSize: '0.875rem',
                          borderRadius: '0.5rem',
                          pointerEvents: 'none',
                          color: '#fff',
                        }}
                      >
                        {authority.status || 'UNKNOWN'}
                      </CButton>
                    </CTableDataCell>
                    <CTableDataCell>
                      <CDropdown alignment="end">
                        <CDropdownToggle
                          color="light"
                          caret={false}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#f1f1f1',
                            border: 'none',
                            borderRadius: '6px',
                          }}
                        >
                          <span style={{ fontSize: '24px', cursor: 'pointer' }}>
                            ⋯
                          </span>
                        </CDropdownToggle>
                        <CDropdownMenu>
                          <CDropdownItem onClick={() => handleDeactivate(authority)}>
                            Deactivate
                          </CDropdownItem>
                          <div
                            className="dropdown-separator"
                            style={{ borderTop: '1px solid #ccc', margin: '0.25rem 0' }}
                          ></div>
                          <CDropdownItem onClick={() => handleSettings(authority)}>
                            Settings
                          </CDropdownItem>
                        </CDropdownMenu>
                      </CDropdown>
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          )}

          {isCreateDialogOpen && (
            <>
              <div className="modal-backdrop fade show" style={{ zIndex: 1040 }}></div>
              <div className="modal show" style={{ display: 'block', zIndex: 1050 }} tabIndex="-1">
                <div className="modal-dialog modal-dialog-centered">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title">Add Health Authority</h5>
                      <button
                        type="button"
                        className="btn-close"
                        onClick={() => setIsCreateDialogOpen(false)}
                        aria-label="Close"
                      ></button>
                    </div>
                    <div className="modal-body">
                      <CForm>
                        <div className="mb-3">
                          <label className="form-label">Name</label>
                          <CFormInput
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="Enter health authority name"
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Short Name</label>
                          <CFormInput
                            name="shortName"
                            value={formData.shortName}
                            onChange={handleInputChange}
                            placeholder="Enter short name"
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Contact Email</label>
                          <CFormInput
                            name="contact_email"
                            value={formData.contact_email}
                            onChange={handleInputChange}
                            placeholder="Enter contact email"
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Status</label>
                          <CFormSelect
                            name="status"
                            value={formData.status}
                            onChange={handleSelectChange}
                          >
                            <option value="ACTIVE">ACTIVE</option>
                            <option value="INACTIVE">INACTIVE</option>
                          </CFormSelect>
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Country</label>
                          <CFormInput
                            name="country"
                            value={formData.country}
                            onChange={handleInputChange}
                            placeholder="Enter country"
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">State</label>
                          <CFormInput
                            name="state"
                            value={formData.state}
                            onChange={handleInputChange}
                            placeholder="Enter state"
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">City</label>
                          <CFormInput
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            placeholder="Enter city"
                          />
                        </div>
                      </CForm>
                    </div>
                    <div className="modal-footer">
                      <CButton
                        color="secondary"
                        onClick={() => setIsCreateDialogOpen(false)}
                      >
                        Cancel
                      </CButton>
                      <CButton color="primary" onClick={handleCreateSubmit} disabled={isSubmitting}>
                        {isSubmitting ? 'Creating...' : 'Create Health Authority'}
                      </CButton>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {isSettingsDialogOpen && (
            <div className="modal show" style={{ display: 'block' }} tabIndex="-1">
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Settings of {selectedAuthority?.name}</h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setIsSettingsDialogOpen(false)}
                      aria-label="Close"
                    ></button>
                  </div>
                  <div className="modal-body">
                    <CForm>
                      <div className="mb-3">
                        <label className="form-label">Change Configurations</label>
                        <p className="text-muted">Set configurations like drug lists etc</p>
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Diagnosis List</label>
                        <CFormSelect
                          name="diagnosisList"
                          value={settingsForm.diagnosisList}
                          onChange={handleSettingsInputChange}
                          size={5}
                          style={{ maxHeight: '150px', overflowY: 'auto' }}
                        >
                          <option value="">Select Diagnosis List</option>
                          {diagnosisLists.length === 0 ? (
                            <option disabled>No diagnosis lists available</option>
                          ) : (
                            diagnosisLists.map((list) => (
                              <option key={list.id} value={list.id}>
                                {list.name}
                              </option>
                            ))
                          )}
                        </CFormSelect>
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Drug List</label>
                        <CFormSelect
                          name="drugList"
                          value={settingsForm.drugList}
                          onChange={handleSettingsInputChange}
                          size={5}
                          style={{ maxHeight: '150px', overflowY: 'auto' }}
                        >
                          <option value="">Select Drug List</option>
                          {drugLists.length === 0 ? (
                            <option disabled>No drug lists available</option>
                          ) : (
                            drugLists.map((list) => (
                              <option key={list.drug_list_id} value={list.drug_list_id}>
                                {list.name}
                              </option>
                            ))
                          )}
                        </CFormSelect>
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Clinician List</label>
                        <CFormSelect
                          name="clinicianList"
                          value={settingsForm.clinicianList}
                          onChange={handleSettingsInputChange}
                          size={5}
                          style={{ maxHeight: '150px', overflowY: 'auto' }}
                        >
                          <option value="">Select Clinician List</option>
                          {clinicianLists.length === 0 ? (
                            <option disabled>No clinician lists available</option>
                          ) : (
                            clinicianLists.map((list) => (
                              <option key={list.id} value={list.id}>
                                {list.name}
                              </option>
                            ))
                          )}
                        </CFormSelect>
                      </div>
                    </CForm>
                  </div>
                  <div className="modal-footer">
                    <CButton
                      color="secondary"
                      onClick={() => setIsSettingsDialogOpen(false)}
                    >
                      Cancel
                    </CButton>
                    <CButton
                      color="primary"
                      onClick={handleUpdateConfigurations}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Updating...' : 'Update Configurations'}
                    </CButton>
                  </div>
                </div>
              </div>
            </div>
          )}

          {isDialogOpen && (
            <div className="modal show" style={{ display: 'block' }} tabIndex="-1">
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Confirm Deactivation</h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setIsDialogOpen(false)}
                      aria-label="Close"
                    ></button>
                  </div>
                  <div className="modal-body">
                    <p>Are you sure you want to deactivate "{selectedAuthority?.name}"?</p>
                  </div>
                  <div className="modal-footer">
                    <CButton
                      color="secondary"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancel
                    </CButton>
                    <CButton color="danger" onClick={handleConfirmDeactivate}>
                      Deactivate
                    </CButton>
                  </div>
                </div>
              </div>
            </div>
          )}

          {isDetailsOpen && (
            <CModal visible={isDetailsOpen} onClose={() => setIsDetailsOpen(false)}>
              <CModalHeader>
                <CModalTitle>{selectedAuthority?.name}</CModalTitle>
              </CModalHeader>
              <CModalBody>
                <p><strong>Country:</strong> {selectedAuthority?.country || '-'}</p>
                <p><strong>State:</strong> {selectedAuthority?.state || '-'}</p>
                <p><strong>City:</strong> {selectedAuthority?.city || '-'}</p>
              </CModalBody>
              <CModalFooter>
                <CButton color="secondary" onClick={() => setIsDetailsOpen(false)}>
                  Close
                </CButton>
              </CModalFooter>
            </CModal>
          )}
        </CCardBody>
      </CCard>
    </CCol>
  );
};

export default HealthAuthority;