import React, { useState, useEffect } from 'react';
import { getAppointments, createAppointment, updateAppointment } from '../api/client';
import LoadingSpinner from '../components/LoadingSpinner';
import './ListPages.css';

const AppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({ doctor: '', appointment_datetime: '', notes: '' });

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAppointments();
      setAppointments(data);
    } catch (err) {
      setError('Failed to fetch appointments. ' + (err.response?.data?.detail || ''));
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await createAppointment(formData);
      setFormData({ doctor: '', appointment_datetime: '', notes: '' });
      fetchAppointments();
    } catch (err) {
      setError('Failed to create appointment. ' + (err.response?.data?.detail || ''));
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="list-page-container">
      <h1>Appointments</h1>
      <form onSubmit={handleCreate} className="create-form">
        <h2>Create New Appointment</h2>
        <div className="form-group">
          <label htmlFor="doctor">Doctor ID</label>
          <input
            type="number"
            id="doctor"
            name="doctor"
            value={formData.doctor}
            onChange={(e) => setFormData({ ...formData, doctor: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="appointment_datetime">Date & Time</label>
          <input
            type="datetime-local"
            id="appointment_datetime"
            name="appointment_datetime"
            value={formData.appointment_datetime}
            onChange={(e) => setFormData({ ...formData, appointment_datetime: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="notes">Notes</label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />
        </div>
        <button type="submit">Create</button>
      </form>

      <div className="list-container">
        {appointments.length > 0 ? (
          appointments.map(appt => (
            <div key={appt.id} className="list-item">
              <h3>Appointment ID: {appt.id}</h3>
              <p><strong>Doctor:</strong> {appt.doctor}</p>
              <p><strong>Date:</strong> {new Date(appt.appointment_datetime).toLocaleString()}</p>
              <p><strong>Status:</strong> {appt.status}</p>
              <p><strong>Notes:</strong> {appt.notes}</p>
            </div>
          ))
        ) : (
          <p>No appointments found.</p>
        )}
      </div>
    </div>
  );
};

export default AppointmentsPage;