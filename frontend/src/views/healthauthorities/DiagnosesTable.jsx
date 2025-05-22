import React, { useEffect, useState } from 'react';
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
  CAlert,
} from '@coreui/react';
import { useNavigate, useLocation } from 'react-router-dom';

const DiagnosesTable = () => {
  const [diagnoses, setDiagnoses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const listId = params.get('listId');
    const url = listId
      ? `http://localhost:8081/diagnoses?diagnosis_list_id=${listId}`
      : 'http://localhost:8081/diagnoses';

    setLoading(true);
    setError(null);

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch diagnoses');
        return res.json();
      })
      .then((data) => {
        if (data.data) {
          setDiagnoses(data.data);
        } else {
          setDiagnoses([]);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setError(error.message);
        setLoading(false);
      });
  }, [location.search]);

  const handleViewDiagnosis = (id) => {
    navigate(`/diagnoses/${id}`);
  };

  return (
    <CCol xs={12}>
      <CCard className="mb-4">
        <CCardHeader>
          <strong>Diagnoses</strong>
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
                  <CTableHeaderCell scope="col">ICD Code</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Diagnosis Code</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Description</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Primary</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Actions</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {diagnoses.length === 0 ? (
                  <CTableRow>
                    <CTableDataCell colSpan="5" className="text-center">
                      No diagnoses found
                    </CTableDataCell>
                  </CTableRow>
                ) : (
                  diagnoses.map((item) => (
                    <CTableRow key={item.id}>
                      <CTableDataCell>{item.icd_code}</CTableDataCell>
                      <CTableDataCell>{item.diagnosis_code}</CTableDataCell>
                      <CTableDataCell>{item.description}</CTableDataCell>
                      <CTableDataCell>{item.is_primary ? 'Yes' : 'No'}</CTableDataCell>
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
                            <CDropdownItem onClick={() => handleViewDiagnosis(item.id)}>
                              View Diagnosis
                            </CDropdownItem>
                            <CDropdownItem href={`/diagnoses/${item.id}/edit`}>
                              Update Diagnosis
                            </CDropdownItem>
                            <CDropdownItem
                              onClick={() => {
                                if (window.confirm('Are you sure you want to delete this diagnosis?')) {
                                  fetch(`http://localhost:8081/diagnosis/${item.id}`, {
                                    method: 'DELETE',
                                  })
                                    .then((res) => {
                                      if (!res.ok) throw new Error('Failed to delete diagnosis');
                                      setDiagnoses(diagnoses.filter((diag) => diag.id !== item.id));
                                    })
                                    .catch((error) => {
                                      console.error(error);
                                      setError('Failed to delete diagnosis');
                                    });
                                }
                              }}
                            >
                              Delete Diagnosis
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
        </CCardBody>
      </CCard>
    </CCol>
  );
};

export default DiagnosesTable;