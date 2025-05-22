import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  CCol,
  CCard,
  CCardHeader,
  CCardBody,
  CSpinner,
  CAlert,
  CButton,
} from '@coreui/react'

const PayerHACredential = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [credential, setCredential] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchCredential()
  }, [id])

  const fetchCredential = async () => {
    if (!id || !/^[0-9a-fA-F-]{36}$/.test(id)) {
      console.error('Invalid or missing Payer ID:', id)
      setError('Payer ID is missing or not a valid UUID')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError('')
      const response = await fetch(`http://localhost:8081/payer/${id}/ha-credential`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch HA credential')
      }

      if (result.success && result.data && result.data.user_name !== 'default_user') {
        setCredential(result.data)
      } else {
        setError(result.message || 'No HA credential found.')
      }
    } catch (err) {
      console.error('Fetch error:', err)
      setError(err.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    navigate('/healthauthorities/payers')
  }

  const handleRegister = () => {
    navigate('/health-authority/register', { state: { payer_id: id } })
  }

  const formatDate = (date) => {
    return date
      ? new Date(date).toLocaleString('en-US', { timeZone: 'Asia/Karachi' })
      : '-'
  }

  return (
    <CCol xs={12}>
      <CCard className="mb-4">
        <CCardHeader>
          <div className="d-flex justify-content-between align-items-center">
            <strong>Health Authority Credential Details</strong>
            <CButton color="secondary" onClick={handleBack}>
              Back to Payers List
            </CButton>
          </div>
        </CCardHeader>

        <CCardBody>
          {loading && <CSpinner color="primary" />}
          {!loading && error && (
            <>
              <CAlert color="danger">{error}</CAlert>
              {!credential && (
                <CButton color="primary" onClick={handleRegister}>
                  Register HA Credential
                </CButton>
              )}
            </>
          )}
          {!loading && credential && (
            <div className="table-responsive">
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>User Name</th>
                    <th>Code</th>
                    <th>Password</th>
                    <th>Status</th>
                    <th>Created At</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{credential.user_name || '-'}</td>
                    <td>{credential.code || '-'}</td>
                    <td>{credential.password || '-'}</td>
                    <td>
                      <span
                        className={`badge ${
                          credential.status === 'active' ? 'bg-success' : 'bg-danger'
                        }`}
                        style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                      >
                        {(credential.status || 'unknown').toUpperCase()}
                      </span>
                    </td>
                    <td>{formatDate(credential.createdAt)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
          {!loading && !error && !credential && (
            <CAlert color="warning">Health Authority credential not found</CAlert>
          )}
        </CCardBody>
      </CCard>
    </CCol>
  )
}

export default PayerHACredential
