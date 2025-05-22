import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import CIcon from '@coreui/icons-react';
import { cilPlus } from '@coreui/icons';

const Payers = () => {
  const [payerList, setPayerList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [selectedPayer, setSelectedPayer] = useState(null);
  const [formData, setFormData] = useState({
    payer_name: '',
    email: '',
    address: '',
    contact_info: '',
    status: '',
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPayers();
  }, []);

  const fetchPayers = () => {
    setLoading(true);
    setError('');
    console.log('Fetching payers from http://localhost:8081/payer...');
    fetch('http://localhost:8081/payer')
      .then((res) => {
        console.log('Response status:', res.status, res.statusText);
        if (!res.ok) {
          return res.json().then((errorData) => {
            console.log('Error response body:', errorData);
            throw new Error(`Failed to fetch payers: ${res.status} ${res.statusText} - ${JSON.stringify(errorData)}`);
          });
        }
        return res.json();
      })
      .then((data) => {
        console.log('Success response body:', data);
        if (data.success && data.data.payers) {
          const formattedData = data.data.payers.map((payer) => ({
            ...payer,
            status: (payer.status || 'active').toLowerCase(),
          }));
          setPayerList(formattedData);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching payers:', error);
        setError(error.message || 'Failed to fetch payers');
        setLoading(false);
      });
  };

  const openModal = () => {
    setModalOpen(true);
    setFormError(null);
    setSuccess(null);
    setFormData({
      payer_name: '',
      email: '',
      address: '',
      contact_info: '',
      status: '',
    });
  };

  const openUpdateModal = (payer) => {
    setSelectedPayer(payer);
    setUpdateModalOpen(true);
    setFormError(null);
    setSuccess(null);
    setFormData({
      payer_name: payer.payer_name,
      email: payer.email,
      address: payer.address || '',
      contact_info: payer.contact_info || '',
      status: payer.status,
    });
  };

  const closeModal = () => {
    setModalOpen(false);
    setUpdateModalOpen(false);
    setSelectedPayer(null);
    setFormError(null);
    setSuccess(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);
    setSuccess(null);

    if (!formData.payer_name || !formData.email || !formData.status) {
      setFormError('Payer Name, Email, and Status are required');
      setFormLoading(false);
      return;
    }

    const payload = {
      payer_name: formData.payer_name,
      email: formData.email,
      address: formData.address || undefined,
      contact_info: formData.contact_info || undefined,
      status: formData.status,
    };

    fetch('http://localhost:8081/payer/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((errorData) => {
            throw new Error(errorData.message || 'Failed to add payer');
          });
        }
        return res.json();
      })
      .then((data) => {
        setSuccess(data.message || 'Payer added successfully');
        setFormLoading(false);
        fetchPayers();
        setTimeout(closeModal, 2000);
        setTimeout(() => setSuccess(null), 5000);
      })
      .catch((error) => {
        console.error('Error adding payer:', error);
        setFormError(error.message || 'Failed to add payer');
        setFormLoading(false);
      });
  };

  const handleUpdateSubmit = (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);
    setSuccess(null);

    if (!formData.payer_name || !formData.email || !formData.status) {
      setFormError('Payer Name, Email, and Status are required');
      setFormLoading(false);
      return;
    }

    const payload = {
      payer_name: formData.payer_name,
      email: formData.email,
      address: formData.address || undefined,
      contact_info: formData.contact_info || undefined,
      status: formData.status,
    };

    fetch(`http://localhost:8081/payer/${selectedPayer.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((errorData) => {
            throw new Error(errorData.message || 'Failed to update payer');
          });
        }
        return res.json();
      })
      .then((data) => {
        setSuccess(data.message || 'Payer updated successfully');
        setFormLoading(false);
        fetchPayers();
        setTimeout(closeModal, 2000);
        setTimeout(() => setSuccess(null), 5000);
      })
      .catch((error) => {
        console.error('Error updating payer:', error);
        setFormError(error.message || 'Failed to update payer');
        setFormLoading(false);
      });
  };

  const viewHACredential = (payerId) => {
    navigate(`/payers/${payerId}/ha-credential`);
  };

  return (
    <CCol xs={12}>
      <CCard className="mb-4">
        <CCardHeader>
          <div className="d-flex justify-content-between align-items-center">
            <strong>Payers List</strong>
            <CButton color="primary" onClick={openModal}>
              <CIcon icon={cilPlus} className="me-2" />
              Add Payer
            </CButton>
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
                {payerList.length === 0 ? (
                  <CTableRow>
                    <CTableDataCell colSpan="4" className="text-center">
                      No payers found
                    </CTableDataCell>
                  </CTableRow>
                ) : (
                  payerList.map((payer) => (
                    <CTableRow key={payer.id}>
                      <CTableDataCell>{payer.payer_name}</CTableDataCell>
                      <CTableDataCell>{payer.contact_info || '-'}</CTableDataCell>
                      <CTableDataCell>
                        <CButton
                          className={
                            payer.status === 'active'
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
                          {(payer.status || 'unknown').toUpperCase()}
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
                            <CDropdownItem onClick={() => viewHACredential(payer.id)}>View HA Credential</CDropdownItem>
                            <CDropdownItem onClick={() => openUpdateModal(payer)}>Update Payer</CDropdownItem>
                          </CDropdownMenu>
                        </CDropdown>
                      </CTableDataCell>
                    </CTableRow>
                  ))
                )}
              </CTableBody>
            </CTable>
          )}
          {/* Modal for Adding Payer */}
          {modalOpen && (
            <div className="modal show" style={{ display: 'block' }} tabIndex="-1">
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Add New Payer</h5>
                    <button type="button" className="btn-close" onClick={closeModal} aria-label="Close"></button>
                  </div>
                  <div className="modal-body">
                    {formError && <CAlert color="danger">{formError}</CAlert>}
                    {formLoading && <CSpinner color="primary" />}
                    <CForm onSubmit={handleSubmit}>
                      <div className="mb-3">
                        <label className="form-label fw-bold">Payer Name</label>
                        <CFormInput
                          type="text"
                          name="payer_name"
                          value={formData.payer_name}
                          onChange={handleChange}
                          required
                          placeholder="Enter payer name"
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label fw-bold">Email</label>
                        <CFormInput
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          placeholder="Enter email"
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label fw-bold">Address</label>
                        <CFormInput
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          required
                          placeholder="Enter address"
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label fw-bold">Contact Info</label>
                        <CFormInput
                          type="text"
                          name="contact_info"
                          value={formData.contact_info}
                          onChange={handleChange}
                          required
                          placeholder="Enter contact info"
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
                          <option value="active">ACTIVE</option>
                          <option value="inactive">INACTIVE</option>
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
          {/* Modal for Updating Payer */}
          {updateModalOpen && (
            <div className="modal show" style={{ display: 'block' }} tabIndex="-1">
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Update Payer</h5>
                    <button type="button" className="btn-close" onClick={closeModal} aria-label="Close"></button>
                  </div>
                  <div className="modal-body">
                    {formError && <CAlert color="danger">{formError}</CAlert>}
                    {formLoading && <CSpinner color="primary" />}
                    <CForm onSubmit={handleUpdateSubmit}>
                      <div className="mb-3">
                        <label className="form-label fw-bold">Payer Name</label>
                        <CFormInput
                          type="text"
                          name="payer_name"
                          value={formData.payer_name}
                          onChange={handleChange}
                          required
                          placeholder="Enter payer name"
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label fw-bold">Email</label>
                        <CFormInput
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          placeholder="Enter email"
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label fw-bold">Address</label>
                        <CFormInput
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          required
                          placeholder="Enter address"
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label fw-bold">Contact Info</label>
                        <CFormInput
                          type="text"
                          name="contact_info"
                          value={formData.contact_info}
                          onChange={handleChange}
                          required
                          placeholder="Enter contact info"
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
                          <option value="active">ACTIVE</option>
                          <option value="inactive">INACTIVE</option>
                        </CFormSelect>
                      </div>
                    </CForm>
                  </div>
                  <div className="modal-footer">
                    <CButton color="secondary" onClick={closeModal} disabled={formLoading}>
                      Cancel
                    </CButton>
                    <CButton color="primary" onClick={handleUpdateSubmit} disabled={formLoading}>
                      Update
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

export default Payers;