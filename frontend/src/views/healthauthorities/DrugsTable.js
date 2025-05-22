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

const DrugsTable = () => {
  const [drugs, setDrugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const listId = params.get('listId');
    const url = listId
      ? `http://localhost:8081/drugs?drug_list_id=${listId}`
      : 'http://localhost:8081/drugs';

    setLoading(true);
    setError(null);
    console.log('Fetching drugs from:', url);

    fetch(url)
      .then((res) => {
        console.log('GET /drugs response status:', res.status);
        if (!res.ok) throw new Error(`Failed to fetch drugs: ${res.statusText}`);
        return res.json();
      })
      .then((data) => {
        console.log('GET /drugs data:', data);
        if (data.data) {
          setDrugs(data.data);
        } else {
          setDrugs([]);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching drugs:', error);
        setError(error.message || 'Failed to load drugs');
        setLoading(false);
      });
  }, [location.search]);

  const handleViewDrug = (id) => {
    console.log('Navigating to drug details with ID:', id);
    navigate(`/drugs/${id}`);
  };

  const handleDeleteDrug = (id) => {
    if (!window.confirm('Are you sure you want to delete this drug?')) return;

    console.log('Deleting drug with ID:', id);
    fetch(`http://localhost:8081/drugs/${id}`, {
      method: 'DELETE',
    })
      .then((res) => {
        console.log('DELETE /drugs response status:', res.status);
        if (!res.ok) {
          return res.json().then((errorData) => {
            throw new Error(errorData.error || `Failed to delete drug: ${res.statusText}`);
          });
        }
        setDrugs(drugs.filter((drug) => drug.id !== id));
        return res.json();
      })
      .catch((error) => {
        console.error('Error deleting drug:', error);
        setError(error.message || 'Failed to delete drug');
      });
  };

  return (
    <CCol xs={12}>
      <CCard className="mb-4">
        <CCardHeader>
          <strong>Drugs</strong>
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
                  <CTableHeaderCell scope="col">NDC Drug Code</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Dispensed Quantity</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Days of Supply</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Instructions</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Actions</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {drugs.length === 0 ? (
                  <CTableRow>
                    <CTableDataCell colSpan="5" className="text-center">
                      No drugs found
                    </CTableDataCell>
                  </CTableRow>
                ) : (
                  drugs.map((item) => (
                    <CTableRow key={item.id}>
                      <CTableDataCell>{item.ndc_drug_code || 'N/A'}</CTableDataCell>
                      <CTableDataCell>{item.dispensed_quantity || 'N/A'}</CTableDataCell>
                      <CTableDataCell>{item.days_of_supply || 'N/A'}</CTableDataCell>
                      <CTableDataCell>{item.instructions || 'N/A'}</CTableDataCell>
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
                            <CDropdownItem onClick={() => handleViewDrug(item.id)}>
                              View Drug
                            </CDropdownItem>
                            <CDropdownItem href={`/drugs/${item.id}/edit`}>
                              Update Drug
                            </CDropdownItem>
                            <CDropdownItem onClick={() => handleDeleteDrug(item.id)}>
                              Delete Drug
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

export default DrugsTable;