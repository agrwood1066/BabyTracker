import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { 
  Calendar, Clock, MapPin, User, Bell, Plus, Edit2, Trash2, 
  Check, X, AlertCircle, Activity, Repeat, FileText
} from 'lucide-react';
import './AppointmentCalendar.css';

function AppointmentCalendar() {
  const [appointments, setAppointments] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  // Removed calendar view - using list view only
  const [showAddModal, setShowAddModal] = useState(false);
  const [showHealthMetricsModal, setShowHealthMetricsModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [filterStatus, setFilterStatus] = useState('upcoming');
  const [showDueDatePrompt, setShowDueDatePrompt] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [userTimezone, setUserTimezone] = useState('Europe/London');
  const [metricPreferences, setMetricPreferences] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isCreatingPresets, setIsCreatingPresets] = useState(false);
  const [presetsCreated, setPresetsCreated] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    appointment_type: 'custom',
    appointment_date: '',
    appointment_time: '',
    location: '',
    healthcare_provider: '',
    notes: '',
    reminder_enabled: true,
    reminder_days_before: 1,
    recurrence_pattern: null
  });

  const [healthMetrics, setHealthMetrics] = useState({});
  const [recurrenceForm, setRecurrenceForm] = useState({
    enabled: false,
    frequency: 'weekly',
    interval: 1,
    endType: 'occurrences',
    occurrences: 4,
    endDate: ''
  });

  // Preset appointments based on UK NHS schedule
  const presetAppointments = [
    { week: 8, title: "Booking Appointment", description: "Initial midwife appointment with blood tests and screening discussions" },
    { week: 12, title: "12-Week Dating Scan", description: "Dating scan and Down's syndrome screening" },
    { week: 15, title: "Midwife Check-up", description: "Antenatal check and blood tests" },
    { week: 20, title: "20-Week Anomaly Scan", description: "Detailed scan to check baby's development" },
    { week: 24, title: "Midwife Appointment", description: "Antenatal checks and breastfeeding information" },
    { week: 28, title: "28-Week Appointment", description: "Blood tests, Anti-D if needed, glucose test" },
    { week: 31, title: "Midwife Check-up", description: "Growth and position check" },
    { week: 34, title: "34-Week Check", description: "Birth plan discussion" },
    { week: 36, title: "36-Week Appointment", description: "Position check and birth preparation" },
    { week: 38, title: "38-Week Check", description: "Final preparations" },
    { week: 40, title: "Due Date Check", description: "Discussion about prolonged pregnancy" },
    { week: 41, title: "41-Week Appointment", description: "Membrane sweep offer and induction discussion" }
  ];

  useEffect(() => {
    loadData();
    detectTimezone();
    
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Clean up any duplicate preset appointments (run once)
  const cleanupDuplicatePresets = async (familyId) => {
    try {
      // Get all preset appointments
      const { data: allPresets } = await supabase
        .from('appointments')
        .select('*')
        .eq('family_id', familyId)
        .eq('appointment_type', 'preset')
        .order('created_at', { ascending: true });
      
      if (!allPresets || allPresets.length === 0) return;
      
      // Group by preset_week to find duplicates
      const groupedByWeek = allPresets.reduce((acc, appointment) => {
        const week = appointment.preset_week;
        if (!acc[week]) acc[week] = [];
        acc[week].push(appointment);
        return acc;
      }, {});
      
      // Find and delete duplicates (keep the first one)
      const idsToDelete = [];
      Object.values(groupedByWeek).forEach(appointments => {
        if (appointments.length > 1) {
          // Keep the first appointment, delete the rest
          for (let i = 1; i < appointments.length; i++) {
            idsToDelete.push(appointments[i].id);
          }
        }
      });
      
      if (idsToDelete.length > 0) {
        console.log(`Cleaning up ${idsToDelete.length} duplicate preset appointments`);
        await supabase
          .from('appointments')
          .delete()
          .in('id', idsToDelete);
      }
    } catch (error) {
      console.error('Error cleaning up duplicates:', error);
    }
  };

  // Auto-detect timezone
  const detectTimezone = () => {
    try {
      const detectedTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      setUserTimezone(detectedTz);
    } catch (error) {
      console.log('Could not detect timezone, using default');
    }
  };

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Load profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      setProfile(profileData);
      
      // Check if due date exists
      if (!profileData?.due_date) {
        setShowDueDatePrompt(true);
      } else {
        // Clean up any existing duplicates first
        await cleanupDuplicatePresets(profileData.family_id);
        // Load or create preset appointments
        await loadOrCreatePresetAppointments(profileData);
      }
      
      // Load appointments
      const { data: appointmentsData } = await supabase
        .from('appointments')
        .select('*')
        .eq('family_id', profileData.family_id)
        .order('appointment_date', { ascending: true });
      
      setAppointments(appointmentsData || []);
      
      // Load metric preferences
      const { data: prefsData } = await supabase
        .from('user_metric_preferences')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('display_order');
      
      setMetricPreferences(prefsData || []);
      
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadOrCreatePresetAppointments = async (profileData) => {
    if (!profileData.due_date) return;
    
    // Prevent multiple simultaneous calls from creating duplicates
    if (isCreatingPresets || presetsCreated) return;
    
    // Check if preset appointments already exist
    const { data: existingPresets, error: checkError } = await supabase
      .from('appointments')
      .select('id, preset_week')
      .eq('family_id', profileData.family_id)
      .eq('appointment_type', 'preset');
    
    if (checkError) {
      console.error('Error checking existing presets:', checkError);
      return;
    }
    
    // If we already have the correct number of presets, don't create more
    if (existingPresets && existingPresets.length >= presetAppointments.length) {
      setPresetsCreated(true);
      return;
    }
    
    // Get list of preset weeks that already exist
    const existingWeeks = new Set((existingPresets || []).map(p => p.preset_week));
    
    // Filter out appointments that already exist
    const presetsToCreate = presetAppointments
      .filter(preset => !existingWeeks.has(preset.week))
      .map(preset => {
        const dueDate = new Date(profileData.due_date);
        const suggestedDate = calculateDateFromWeek(dueDate, preset.week);
        return {
          family_id: profileData.family_id,
          created_by: profileData.id,
          title: preset.title,
          description: preset.description,
          appointment_type: 'preset',
          preset_week: preset.week,
          appointment_date: suggestedDate,
          is_scheduled: false,
          status: 'upcoming'
        };
      });
    
    if (presetsToCreate.length === 0) {
      setPresetsCreated(true);
      return;
    }
    
    // Set flag to prevent concurrent creation
    setIsCreatingPresets(true);
    
    try {
      // Insert only the presets that don't exist
      const { error: insertError } = await supabase
        .from('appointments')
        .insert(presetsToCreate);
      
      if (insertError) {
        console.error('Error creating preset appointments:', insertError);
      } else {
        setPresetsCreated(true);
      }
    } finally {
      setIsCreatingPresets(false);
    }
  };

  const calculateDateFromWeek = (dueDate, weekNumber) => {
    const date = new Date(dueDate);
    const daysToSubtract = (40 - weekNumber) * 7;
    date.setDate(date.getDate() - daysToSubtract);
    return date.toISOString().split('T')[0];
  };

  const handleSaveDueDate = async (dueDate) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      await supabase
        .from('profiles')
        .update({ 
          due_date: dueDate,
          timezone: userTimezone 
        })
        .eq('id', user.id);
      
      setShowDueDatePrompt(false);
      loadData();
    } catch (error) {
      console.error('Error saving due date:', error);
    }
  };

  const handleSchedulePreset = async (appointment) => {
    setSelectedAppointment(appointment);
    setFormData({
      ...formData,
      title: appointment.title,
      description: appointment.description,
      appointment_type: 'preset',
      appointment_date: appointment.appointment_date,
      appointment_time: '',
      location: '',
      healthcare_provider: '',
      notes: '',
      reminder_enabled: true,
      reminder_days_before: 1
    });
    setShowAddModal(true);
  };

  const handleSubmitAppointment = async (e) => {
    e.preventDefault();
    
    try {
      const appointmentData = {
        ...formData,
        family_id: profile.family_id,
        created_by: profile.id,
        is_scheduled: true,
        status: 'upcoming'
      };
      
      // Handle recurrence
      if (recurrenceForm.enabled) {
        appointmentData.recurrence_pattern = {
          frequency: recurrenceForm.frequency,
          interval: recurrenceForm.interval,
          endType: recurrenceForm.endType,
          occurrences: recurrenceForm.occurrences,
          endDate: recurrenceForm.endDate
        };
        
        // Create recurring appointments
        await createRecurringAppointments(appointmentData);
      } else {
        // Update existing preset or create new
        if (selectedAppointment && selectedAppointment.appointment_type === 'preset') {
          await supabase
            .from('appointments')
            .update(appointmentData)
            .eq('id', selectedAppointment.id);
        } else {
          await supabase
            .from('appointments')
            .insert([appointmentData]);
        }
      }
      
      setShowAddModal(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error saving appointment:', error);
    }
  };

  const createRecurringAppointments = async (baseAppointment) => {
    const appointments = [];
    const startDate = new Date(baseAppointment.appointment_date);
    let currentDate = new Date(startDate);
    
    const { occurrences, endDate, frequency, interval } = baseAppointment.recurrence_pattern;
    const maxOccurrences = occurrences || 52; // Max 1 year of weekly appointments
    
    for (let i = 0; i < maxOccurrences; i++) {
      if (endDate && currentDate > new Date(endDate)) break;
      
      appointments.push({
        ...baseAppointment,
        appointment_date: currentDate.toISOString().split('T')[0],
        recurrence_parent_id: i === 0 ? null : appointments[0].id
      });
      
      // Calculate next date
      switch (frequency) {
        case 'daily':
          currentDate.setDate(currentDate.getDate() + interval);
          break;
        case 'weekly':
          currentDate.setDate(currentDate.getDate() + (7 * interval));
          break;
        case 'monthly':
          currentDate.setMonth(currentDate.getMonth() + interval);
          break;
        default:
          break;
      }
    }
    
    await supabase.from('appointments').insert(appointments);
  };

  const handleDeleteAppointment = async (id) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      await supabase
        .from('appointments')
        .delete()
        .eq('id', id);
      
      loadData();
    }
  };

  const handleMarkComplete = async (appointment) => {
    await supabase
      .from('appointments')
      .update({ status: 'completed' })
      .eq('id', appointment.id);
    
    // Prompt to add health metrics
    setSelectedAppointment(appointment);
    setShowHealthMetricsModal(true);
    loadData();
  };

  const handleSaveHealthMetrics = async () => {
    try {
      const metricsToSave = Object.entries(healthMetrics)
        .filter(([_, data]) => data.enabled && data.reading)
        .map(([type, data]) => ({
          family_id: profile.family_id,
          appointment_id: selectedAppointment.id,
          recorded_by: profile.id,
          metric_type: type,
          reading: data.reading,
          unit: data.unit,
          recorded_date: new Date().toISOString().split('T')[0],
          recorded_time: new Date().toTimeString().split(' ')[0]
        }));
      
      if (metricsToSave.length > 0) {
        await supabase
          .from('health_metrics')
          .insert(metricsToSave);
      }
      
      setShowHealthMetricsModal(false);
      setHealthMetrics({});
    } catch (error) {
      console.error('Error saving health metrics:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      appointment_type: 'custom',
      appointment_date: '',
      appointment_time: '',
      location: '',
      healthcare_provider: '',
      notes: '',
      reminder_enabled: true,
      reminder_days_before: 1,
      recurrence_pattern: null
    });
    setRecurrenceForm({
      enabled: false,
      frequency: 'weekly',
      interval: 1,
      endType: 'occurrences',
      occurrences: 4,
      endDate: ''
    });
    setSelectedAppointment(null);
  };

  const getFilteredAppointments = () => {
    return appointments.filter(apt => {
      if (filterStatus === 'all') return true;
      if (filterStatus === 'upcoming') {
        // For preset appointments that aren't scheduled, always show them as upcoming
        if (apt.appointment_type === 'preset' && !apt.is_scheduled) {
          return true;
        }
        return apt.status === 'upcoming';
      }
      if (filterStatus === 'completed') return apt.status === 'completed';
      return true;
    });
  };

  const formatDateTime = (date, time) => {
    if (!date) return 'Not scheduled';
    const dateObj = new Date(date);
    const formattedDate = dateObj.toLocaleDateString('en-GB', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short',
      year: 'numeric'
    });
    
    if (time) {
      return `${formattedDate} at ${time}`;
    }
    return formattedDate;
  };

  if (loading) {
    return <div className="loading-container"><div className="loading-spinner"></div></div>;
  }

  return (
    <div className="appointment-calendar">
      {/* Due Date Prompt */}
      {showDueDatePrompt && (
        <div className="due-date-prompt">
          <div className="prompt-content">
            <Calendar size={48} className="prompt-icon" />
            <h2>Let's personalise your appointment calendar!</h2>
            <p>Please add your due date to populate your calendar with suggested appointments based on common pregnancy milestones.</p>
            <p className="disclaimer">These are typical appointments - your healthcare provider will confirm what's right for you.</p>
            <input
              type="date"
              className="due-date-input"
              onChange={(e) => handleSaveDueDate(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Main Header */}
      <div className="appointments-header">
        <h1><Calendar /> Appointment Calendar</h1>
        <div className="header-controls">
          <div className="filter-buttons">
            <button 
              className={filterStatus === 'upcoming' ? 'active' : ''}
              onClick={() => setFilterStatus('upcoming')}
            >
              Upcoming
            </button>
            <button 
              className={filterStatus === 'completed' ? 'active' : ''}
              onClick={() => setFilterStatus('completed')}
            >
              Past
            </button>
            <button 
              className={filterStatus === 'all' ? 'active' : ''}
              onClick={() => setFilterStatus('all')}
            >
              All
            </button>
          </div>
          
          
          <button className="btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={20} /> Add Appointment
          </button>
        </div>
      </div>

      {/* Appointments List */}
      <div className="appointments-list">
          {getFilteredAppointments().map(appointment => (
            <div 
              key={appointment.id} 
              className={`appointment-card ${appointment.appointment_type} ${appointment.is_scheduled ? 'scheduled' : 'preset'} ${appointment.status}`}
            >
              <div className="appointment-header">
                <h3>{appointment.title}</h3>
                {appointment.appointment_type === 'preset' && !appointment.is_scheduled && (
                  <span className="preset-badge">Suggested</span>
                )}
                {appointment.status === 'completed' && (
                  <span className="completed-badge"><Check size={16} /> Complete</span>
                )}
              </div>
              
              <div className="appointment-details">
                <div className="detail-row">
                  <Clock size={16} />
                  <span>{formatDateTime(appointment.appointment_date, appointment.appointment_time)}</span>
                </div>
                
                {appointment.location && (
                  <div className="detail-row">
                    <MapPin size={16} />
                    <span>{appointment.location}</span>
                  </div>
                )}
                
                {appointment.healthcare_provider && (
                  <div className="detail-row">
                    <User size={16} />
                    <span>{appointment.healthcare_provider}</span>
                  </div>
                )}
                
                {appointment.reminder_enabled && (
                  <div className="detail-row">
                    <Bell size={16} />
                    <span>Reminder: {appointment.reminder_days_before} day(s) before</span>
                  </div>
                )}
                
                {appointment.recurrence_pattern && (
                  <div className="detail-row">
                    <Repeat size={16} />
                    <span>Recurring {appointment.recurrence_pattern.frequency}</span>
                  </div>
                )}
                
                {appointment.notes && (
                  <div className="detail-row notes">
                    <FileText size={16} />
                    <span>{appointment.notes}</span>
                  </div>
                )}
              </div>
              
              <div className="appointment-actions">
                {appointment.appointment_type === 'preset' && !appointment.is_scheduled ? (
                  <button 
                    className="btn-schedule"
                    onClick={() => handleSchedulePreset(appointment)}
                  >
                    Schedule Appointment
                  </button>
                ) : (
                  <>
                    {appointment.status === 'upcoming' && (
                      <button 
                        className="btn-complete"
                        onClick={() => handleMarkComplete(appointment)}
                      >
                        <Check size={16} /> Mark Complete
                      </button>
                    )}
                    {appointment.status === 'completed' && (
                      <button 
                        className="btn-metrics"
                        onClick={() => {
                          setSelectedAppointment(appointment);
                          setShowHealthMetricsModal(true);
                        }}
                      >
                        <Activity size={16} /> Add Health Metrics
                      </button>
                    )}
                    <button 
                      className="btn-edit"
                      onClick={() => {
                        setSelectedAppointment(appointment);
                        setFormData(appointment);
                        setShowAddModal(true);
                      }}
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      className="btn-delete"
                      onClick={() => handleDeleteAppointment(appointment.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
          
          {getFilteredAppointments().length === 0 && (
            <div className="empty-state">
              <Calendar size={48} />
              <p>No appointments found</p>
              <button className="btn-primary" onClick={() => setShowAddModal(true)}>
                Add your first appointment
              </button>
            </div>
          )}
      </div>

      {/* Add/Edit Appointment Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedAppointment ? 'Edit Appointment' : 'Add Appointment'}</h2>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmitAppointment}>
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows="2"
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Date *</label>
                  <input
                    type="date"
                    value={formData.appointment_date}
                    onChange={(e) => setFormData({...formData, appointment_date: e.target.value})}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Time</label>
                  <input
                    type="time"
                    value={formData.appointment_time}
                    onChange={(e) => setFormData({...formData, appointment_time: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  placeholder="e.g., Royal London Hospital"
                />
              </div>
              
              <div className="form-group">
                <label>Healthcare Provider</label>
                <input
                  type="text"
                  value={formData.healthcare_provider}
                  onChange={(e) => setFormData({...formData, healthcare_provider: e.target.value})}
                  placeholder="e.g., Dr. Smith"
                />
              </div>
              
              <div className="form-group">
                <label>Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  rows="3"
                  placeholder="e.g., Bring maternity notes, full bladder needed"
                />
              </div>
              
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.reminder_enabled}
                    onChange={(e) => setFormData({...formData, reminder_enabled: e.target.checked})}
                  />
                  <span>Enable email reminder</span>
                </label>
                
                {formData.reminder_enabled && (
                  <div className="reminder-days">
                    <label>Remind me</label>
                    <select
                      value={formData.reminder_days_before}
                      onChange={(e) => setFormData({...formData, reminder_days_before: parseInt(e.target.value)})}
                    >
                      <option value="1">1 day before</option>
                      <option value="2">2 days before</option>
                      <option value="3">3 days before</option>
                      <option value="7">1 week before</option>
                    </select>
                  </div>
                )}
              </div>
              
              {/* Recurrence Section */}
              <div className="form-group recurrence-section">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={recurrenceForm.enabled}
                    onChange={(e) => setRecurrenceForm({...recurrenceForm, enabled: e.target.checked})}
                  />
                  <span>Repeat appointment</span>
                </label>
                
                {recurrenceForm.enabled && (
                  <div className="recurrence-options">
                    <div className="form-row">
                      <select
                        value={recurrenceForm.frequency}
                        onChange={(e) => setRecurrenceForm({...recurrenceForm, frequency: e.target.value})}
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                      
                      <input
                        type="number"
                        min="1"
                        max="30"
                        value={recurrenceForm.interval}
                        onChange={(e) => setRecurrenceForm({...recurrenceForm, interval: parseInt(e.target.value)})}
                      />
                      <span>{recurrenceForm.frequency === 'daily' ? 'day(s)' : recurrenceForm.frequency === 'weekly' ? 'week(s)' : 'month(s)'}</span>
                    </div>
                    
                    <div className="form-row">
                      <label>End repeat:</label>
                      <select
                        value={recurrenceForm.endType}
                        onChange={(e) => setRecurrenceForm({...recurrenceForm, endType: e.target.value})}
                      >
                        <option value="occurrences">After occurrences</option>
                        <option value="date">On date</option>
                      </select>
                      
                      {recurrenceForm.endType === 'occurrences' ? (
                        <input
                          type="number"
                          min="1"
                          max="52"
                          value={recurrenceForm.occurrences}
                          onChange={(e) => setRecurrenceForm({...recurrenceForm, occurrences: parseInt(e.target.value)})}
                        />
                      ) : (
                        <input
                          type="date"
                          value={recurrenceForm.endDate}
                          onChange={(e) => setRecurrenceForm({...recurrenceForm, endDate: e.target.value})}
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {selectedAppointment ? 'Update' : 'Add'} Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Health Metrics Modal */}
      {showHealthMetricsModal && (
        <div className="modal-overlay" onClick={() => setShowHealthMetricsModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Record Health Metrics</h2>
              <button className="close-btn" onClick={() => setShowHealthMetricsModal(false)}>
                <X size={24} />
              </button>
            </div>
            
            <div className="metrics-form">
              <p className="metrics-intro">
                {selectedAppointment?.title} - {formatDateTime(selectedAppointment?.appointment_date)}
              </p>
              
              <div className="metrics-list">
                {metricPreferences.map(pref => (
                  <div key={pref.metric_type} className="metric-item">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={healthMetrics[pref.metric_type]?.enabled || false}
                        onChange={(e) => setHealthMetrics({
                          ...healthMetrics,
                          [pref.metric_type]: {
                            ...healthMetrics[pref.metric_type],
                            enabled: e.target.checked
                          }
                        })}
                      />
                      <span>{pref.display_name}</span>
                    </label>
                    
                    {healthMetrics[pref.metric_type]?.enabled && (
                      <div className="metric-inputs">
                        <input
                          type="text"
                          placeholder="Reading"
                          value={healthMetrics[pref.metric_type]?.reading || ''}
                          onChange={(e) => setHealthMetrics({
                            ...healthMetrics,
                            [pref.metric_type]: {
                              ...healthMetrics[pref.metric_type],
                              reading: e.target.value
                            }
                          })}
                        />
                        <input
                          type="text"
                          placeholder={pref.default_unit}
                          value={healthMetrics[pref.metric_type]?.unit || pref.default_unit}
                          onChange={(e) => setHealthMetrics({
                            ...healthMetrics,
                            [pref.metric_type]: {
                              ...healthMetrics[pref.metric_type],
                              unit: e.target.value
                            }
                          })}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="form-group">
                <label>Notes</label>
                <textarea
                  placeholder="Any additional notes..."
                  value={healthMetrics.notes || ''}
                  onChange={(e) => setHealthMetrics({...healthMetrics, notes: e.target.value})}
                  rows="3"
                />
              </div>
              
              <div className="modal-actions">
                <button className="btn-secondary" onClick={() => setShowHealthMetricsModal(false)}>
                  Skip
                </button>
                <button className="btn-primary" onClick={handleSaveHealthMetrics}>
                  Save Selected Metrics
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AppointmentCalendar;
