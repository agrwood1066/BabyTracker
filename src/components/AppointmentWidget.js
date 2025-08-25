import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, AlertCircle, ArrowRight } from 'lucide-react';
import './AppointmentWidget.css';

function AppointmentWidget() {
  const [appointments, setAppointments] = useState([]);
  const [nextAppointment, setNextAppointment] = useState(null);
  const [unscheduledPresets, setUnscheduledPresets] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUpcomingAppointments();
  }, []);

  const loadUpcomingAppointments = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Get profile for family_id
      const { data: profile } = await supabase
        .from('profiles')
        .select('family_id, due_date')
        .eq('id', user.id)
        .single();
      
      if (!profile?.family_id) {
        setLoading(false);
        return;
      }

      // Get upcoming appointments
      const today = new Date().toISOString().split('T')[0];
      const { data: upcomingData } = await supabase
        .from('appointments')
        .select('*')
        .eq('family_id', profile.family_id)
        .eq('status', 'upcoming')
        .gte('appointment_date', today)
        .order('appointment_date', { ascending: true })
        .limit(3);
      
      // Get unscheduled preset count
      const { data: presetsData } = await supabase
        .from('appointments')
        .select('id')
        .eq('family_id', profile.family_id)
        .eq('appointment_type', 'preset')
        .eq('is_scheduled', false);
      
      setAppointments(upcomingData || []);
      setUnscheduledPresets(presetsData?.length || 0);
      
      // Set next appointment
      if (upcomingData && upcomingData.length > 0) {
        setNextAppointment(upcomingData[0]);
      }
      
    } catch (error) {
      console.error('Error loading appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('en-GB', { 
      day: 'numeric', 
      month: 'short'
    });
  };

  const formatTime = (time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    return `${hours}:${minutes}`;
  };

  const getDaysUntil = (date) => {
    if (!date) return null;
    const today = new Date();
    const appointmentDate = new Date(date);
    const diffTime = appointmentDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDaysUntilText = (days) => {
    if (days === null) return '';
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    if (days < 0) return 'Overdue';
    return `In ${days} days`;
  };

  if (loading) {
    return (
      <div className="appointment-widget loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="appointment-widget">
      <div className="widget-header">
        <h3>
          <Calendar size={20} />
          Appointments
        </h3>
        <Link to="/appointments" className="view-all-link">
          View All <ArrowRight size={16} />
        </Link>
      </div>

      {unscheduledPresets > 0 && (
        <div className="unscheduled-alert">
          <AlertCircle size={16} />
          <span>{unscheduledPresets} suggested appointment{unscheduledPresets !== 1 ? 's' : ''} to schedule</span>
        </div>
      )}

      {nextAppointment ? (
        <>
          <div className="next-appointment">
            <div className="appointment-countdown">
              <span className="countdown-number">
                {getDaysUntil(nextAppointment.appointment_date)}
              </span>
              <span className="countdown-text">
                {getDaysUntilText(getDaysUntil(nextAppointment.appointment_date))}
              </span>
            </div>
            
            <div className="appointment-info">
              <h4>{nextAppointment.title}</h4>
              <div className="appointment-meta">
                <div className="meta-item">
                  <Clock size={14} />
                  <span>
                    {formatDate(nextAppointment.appointment_date)}
                    {nextAppointment.appointment_time && ` at ${formatTime(nextAppointment.appointment_time)}`}
                  </span>
                </div>
                {nextAppointment.location && (
                  <div className="meta-item">
                    <MapPin size={14} />
                    <span>{nextAppointment.location}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {appointments.length > 1 && (
            <div className="upcoming-list">
              <div className="upcoming-header">Also coming up:</div>
              {appointments.slice(1).map(apt => (
                <div key={apt.id} className="upcoming-item">
                  <div className="upcoming-date">
                    {formatDate(apt.appointment_date)}
                  </div>
                  <div className="upcoming-title">
                    {apt.title}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="no-appointments">
          <p>No upcoming appointments</p>
          <Link to="/appointments" className="schedule-link">
            Schedule your first appointment
          </Link>
        </div>
      )}
    </div>
  );
}

export default AppointmentWidget;
