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
} from '@coreui/react';
import { cilPlus } from '@coreui/icons';
import CIcon from '@coreui/icons-react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const ClinicianList = () => {
  const [clinicianLists, setClinicianLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    status: '',
  });
  const [importData, setImportData] = useState({
    file: null,
    password: '',
  });
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchClinicianLists();
  }, []);

  const fetchClinicianLists = () => {
    setLoading(true);
    setError(null);
    console.log('Fetching clinician lists');
    fetch('http://localhost:8081/clinician-lists')
      .then((res) => {
        console.log('GET /clinician-lists response status:', res.status);
        if (!res.ok) throw new Error(`Failed to fetch clinician lists: ${res.statusText}`);
        return res.json();
      })
      .then((data) => {
        console.log('GET /clinician-lists data:', data);
        if (data.data) {
          const formattedData = data.data.map((list) => ({
            ...list,
            status: typeof list.status === 'object' && list.status !== null
              ? (list.status.is_active ? 'ACTIVE' : 'INACTIVE')
              : (list.status || '').toUpperCase() === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE',
          }));
          setClinicianLists(formattedData);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching clinician lists:', error);
        setError(error.message || 'Failed to load clinician lists');
        setLoading(false);
      });
  };

  const openModal = () => {
    console.log('Opening modal');
    setModalOpen(true);
    setError(null);
    setSuccess(null);
    setFormData({
      name: '',
      code: '',
      status: '',
    });
  };

  const closeModal = () => {
    console.log('Closing modal');
    setModalOpen(false);
    setError(null);
    setSuccess(null);
  };

  const openImportModal = () => {
    console.log('Opening import modal');
    setImportModalOpen(true);
    setError(null);
    setSuccess(null);
    setImportData({
      file: null,
      password: '',
    });
  };

  const closeImportModal = () => {
    console.log('Closing import modal');
    setImportModalOpen(false);
    setError(null);
    setSuccess(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImportChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'file') {
      setImportData((prev) => ({ ...prev, file: files[0] }));
    } else {
      setImportData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Submitting form with data:', formData);
    setFormLoading(true);
    setError(null);
    setSuccess(null);

    if (!formData.name || !formData.code || !formData.status) {
      console.log('Validation failed: Name, Code, and Status are required');
      setError('Name, Code, and Status are required');
      setFormLoading(false);
      return;
    }

    const payload = {
      name: formData.name,
      code: formData.code,
      status: formData.status, 
    };
    console.log('POST /clinician-lists payload:', payload);

    fetch('http://localhost:8081/clinician-lists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        console.log('POST /clinician-lists response status:', res.status);
        if (!res.ok) {
          return res.json().then((errorData) => {
            throw new Error(errorData.error || `Failed to add clinician list: ${res.statusText}`);
          });
        }
        return res.json();
      })
      .then((data) => {
        console.log('POST /clinician-lists response:', data);
        setSuccess(data.message || 'Clinician list added successfully');
        setFormLoading(false);
        fetchClinicianLists();
        setTimeout(closeModal, 2000);
        setTimeout(() => setSuccess(null), 5000);
      })
      .catch((error) => {
        console.error('Error adding clinician list:', error);
        setError(error.message || 'Failed to add clinician list');
        setFormLoading(false);
      });
  };

  const handleImportSubmit = (e) => {
    e.preventDefault();
    console.log('Submitting import with data:', importData);
    setFormLoading(true);
    setError(null);
    setSuccess(null);

    if (!importData.file) {
      console.log('Validation failed: File is required');
      setError('Please select a file to import');
      setFormLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('file', importData.file);
    formData.append('password', importData.password);

    fetch('http://localhost:8081/clinicians/import', {
      method: 'POST',
      body: formData,
    })
      .then((res) => {
        console.log('POST /clinicians/import response status:', res.status);
        if (!res.ok) {
          return res.json().then((errorData) => {
            throw new Error(errorData.error || `Failed to import clinicians: ${res.statusText}`);
          });
        }
        return res.json();
      })
      .then((data) => {
        console.log('POST /clinicians/import response:', data);
        setSuccess(data.message || 'Clinicians imported successfully');
        setFormLoading(false);
        fetchClinicianLists();
        setTimeout(closeImportModal, 2000);
        setTimeout(() => setSuccess(null), 5000);
      })
      .catch((error) => {
        console.error('Error importing clinicians:', error);
        setError(error.message || 'Failed to import clinicians');
        setFormLoading(false);
      });
  };

  const handleDelete = (listId) => {
    if (!window.confirm('Are you sure you want to delete this clinician list?')) return;

    console.log('Deleting clinician list with id:', listId);
    fetch(`http://localhost:8081/clinician-lists/${listId}`, {
      method: 'DELETE',
    })
      .then((res) => {
        console.log('DELETE /clinician-lists response status:', res.status);
        if (!res.ok) {
          return res.json().then((errorData) => {
            throw new Error(errorData.error || `Failed to delete clinician list: ${res.statusText}`);
          });
        }
        setClinicianLists(clinicianLists.filter((list) => list.id !== listId));
        setSuccess('Clinician list deleted successfully');
        setTimeout(() => setSuccess(null), 5000);
        return res.json();
      })
      .catch((error) => {
        console.error('Error deleting clinician list:', error);
        setError(error.message || 'Failed to delete clinician list');
        fetchClinicianLists();
      });
  };

  const handleViewClinicians = (listId) => {
    console.log('Navigating to clinicians with listId:', listId);
    navigate(`/clinicians?listId=${listId}`);
  };

  const handleDownloadTemplate = () => {
    console.log('Downloading template');
    window.location.href = 'http://localhost:8081/clinicians/template';
  };

  return (
    <CCol xs={12}>
      <CCard className="mb-4">
        <CCardHeader>
          <div className="d-flex justify-content-between align-items-center w-100">
            <strong>Clinician Lists</strong>
            <div className="d-flex gap-2">
              <CDropdown alignment="start">
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
                  <span style={{ cursor: 'pointer' }}>⋯</span>
                </CDropdownToggle>
                <CDropdownMenu>
                  <CDropdownItem onClick={openImportModal}>
                    Import Clinicians
                  </CDropdownItem>
                  <CDropdownItem onClick={handleDownloadTemplate}>
                    Download Template
                  </CDropdownItem>
                </CDropdownMenu>
              </CDropdown>
              <CButton color="primary" onClick={openModal}>
                <CIcon icon={cilPlus} className="me-2" />
                Add Clinician List
              </CButton>
            </div>
          </div>
          {success && (
            <CAlert
              color="success"
              className="mt-2 py-1 px-3"
              style={{
                fontSize: '0.9rem',
                lineHeight: '1.2',
                border: 'none',
                backgroundColor: '#d4edda',
                color: '#155724',
              }}
            >
              {success}
            </CAlert>
          )}
        </CCardHeader>
        <CCardBody>
          {loading ? (
            <CSpinner color="primary" />
          ) : error ? (
            <CAlert color="danger">{error}</CAlert>
          ) : (
            <CTable hover striped bordered>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Name</CTableHeaderCell>
                  <CTableHeaderCell>Code</CTableHeaderCell>
                  <CTableHeaderCell>Status</CTableHeaderCell>
                  <CTableHeaderCell>Actions</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {clinicianLists.length === 0 ? (
                  <CTableRow>
                    <CTableDataCell colSpan="4" className="text-center">
                      No clinician lists found
                    </CTableDataCell>
                  </CTableRow>
                ) : (
                  clinicianLists.map((item) => (
                    <CTableRow key={item.id}>
                      <CTableDataCell>{item.name}</CTableDataCell>
                      <CTableDataCell>
                        {typeof item.code === 'object' && item.code !== null
                          ? item.code.value || JSON.stringify(item.code)
                          : item.code || '-'}
                      </CTableDataCell>
                      <CTableDataCell>
                        <CButton
                          className={
                            item.status === 'ACTIVE'
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
                          {item.status || 'UNKNOWN'}
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
                            <span style={{ fontSize: '24px', cursor: 'pointer' }}>⋯</span>
                          </CDropdownToggle>
                          <CDropdownMenu>
                            <CDropdownItem onClick={() => handleViewClinicians(item.id)}>
                              View Clinicians
                            </CDropdownItem>
                            <CDropdownItem onClick={() => handleDelete(item.id)}>
                              Delete
                            </CDropdownItem>
                          </CDropdownMenu>
                        </CDropdown>
                      </CTableDataCell>
                    </CTableRow>
                  ))
                )}
              </CTableBody>
            </CTable>
          )}
          {modalOpen && (
            <div className="modal show" style={{ display: 'block' }} tabIndex="-1">
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Add New Clinician List</h5>
                    <button type="button" className="btn-close" onClick={closeModal} aria-label="Close"></button>
                  </div>
                  <div className="modal-body">
                    {error && <CAlert color="danger">{error}</CAlert>}
                    {formLoading && <CSpinner color="primary" />}
                    <CForm onSubmit={handleSubmit}>
                      <div className="mb-3">
                        <label className="form-label fw-bold">Name</label>
                        <CFormInput
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          placeholder="Enter clinician list name"
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label fw-bold">Code</label>
                        <CFormInput
                          type="text"
                          name="code"
                          value={formData.code}
                          onChange={handleChange}
                          required
                          placeholder="Enter clinician list code"
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label fw-bold">Status</label>
                        <CFormSelect
                          name="status"
                          value={formData.status}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Select Status</option>
                          <option value="ACTIVE">ACTIVE</option>
                          <option value="INACTIVE">INACTIVE</option>
                        </CFormSelect>
                      </div>
                    </CForm>
                  </div>
                  <div className="modal-footer">
                    <CButton color="secondary" onClick={closeModal} disabled={formLoading}>
                      Cancel
                    </CButton>
                    <CButton color="primary" onClick={handleSubmit} disabled={formLoading}>
                      Save
                    </CButton>
                  </div>
                </div>
              </div>
            </div>
          )}
          {importModalOpen && (
            <div className="modal show" style={{ display: 'block' }} tabIndex="-1">
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Import Clinicians</h5>
                    <button type="button" className="btn-close" onClick={closeImportModal} aria-label="Close"></button>
                  </div>
                  <div className="modal-body">
                    {error && <CAlert color="danger">{error}</CAlert>}
                    {formLoading && <CSpinner color="primary" />}
                    <p>Choose file to import clinicians to this list. You can select ONLY one file at a time.</p>
                    <CForm onSubmit={handleImportSubmit}>
                      <div className="mb-3">
                        <CFormInput
                          type="file"
                          name="file"
                          onChange={handleImportChange}
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <CFormInput
                          type="password"
                          name="password"
                          value={importData.password}
                          onChange={handleImportChange}
                          placeholder="password"
                        />
                      </div>
                    </CForm>
                  </div>
                  <div className="modal-footer">
                    <CButton color="secondary" onClick={closeImportModal} disabled={formLoading}>
                      Cancel
                    </CButton>
                    <CButton color="primary" onClick={handleImportSubmit} disabled={formLoading}>
                      Import Clinicians
                    </CButton>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CCardBody>
      </CCard>
    </CCol>
  );
};

export default ClinicianList;