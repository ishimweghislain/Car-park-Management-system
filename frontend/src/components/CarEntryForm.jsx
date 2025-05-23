import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, MapPin, User, Phone, Palette, ArrowLeft } from 'lucide-react';
import { parkingRecordsAPI, parkingSlotsAPI } from '../services/api';

const CarEntryForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [formData, setFormData] = useState({
    plateNumber: '',
    driverName: '',
    phoneNumber: '',
    slotNumber: '',
    carModel: '',
    carColor: '',
    notes: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchAvailableSlots();
  }, []);

  const fetchAvailableSlots = async () => {
    try {
      const response = await parkingSlotsAPI.getAll({ status: 'available', limit: 100 });
      setAvailableSlots(response.data.slots);
    } catch (error) {
      console.error('Error fetching available slots:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.plateNumber.trim()) {
      newErrors.plateNumber = 'Plate number is required';
    }

    if (!formData.driverName.trim()) {
      newErrors.driverName = 'Driver name is required';
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^\+?[\d\s-()]+$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }

    if (!formData.slotNumber) {
      newErrors.slotNumber = 'Please select a parking slot';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await parkingRecordsAPI.create({
        plateNumber: formData.plateNumber.toUpperCase(),
        driverName: formData.driverName,
        phoneNumber: formData.phoneNumber,
        slotNumber: formData.slotNumber,
        carModel: formData.carModel || undefined,
        carColor: formData.carColor || undefined,
        notes: formData.notes || undefined
      });

      // Success - redirect to parking records
      navigate('/parking-records', { 
        state: { message: 'Car entry recorded successfully!' }
      });
    } catch (error) {
      console.error('Error creating parking record:', error);
      const errorMessage = error.response?.data?.message || 'Failed to record car entry';
      setErrors({ submit: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <button
          onClick={() => navigate('/parking-records')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Parking Records
        </button>
        
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center mr-4">
            <Car className="h-5 w-5 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">New Car Entry</h1>
            <p className="text-sm text-gray-500">Record a new car entering the parking area</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Car Information */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium flex items-center">
                <Car className="h-5 w-5 mr-2" />
                Car Information
              </h3>
            </div>
            <div className="card-content space-y-4">
              <div>
                <label htmlFor="plateNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Plate Number *
                </label>
                <input
                  type="text"
                  id="plateNumber"
                  name="plateNumber"
                  value={formData.plateNumber}
                  onChange={handleChange}
                  className={`input ${errors.plateNumber ? 'border-danger-300' : ''}`}
                  placeholder="e.g., RAD 123A"
                  style={{ textTransform: 'uppercase' }}
                />
                {errors.plateNumber && (
                  <p className="mt-1 text-sm text-danger-600">{errors.plateNumber}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="carModel" className="block text-sm font-medium text-gray-700 mb-1">
                    Car Model
                  </label>
                  <input
                    type="text"
                    id="carModel"
                    name="carModel"
                    value={formData.carModel}
                    onChange={handleChange}
                    className="input"
                    placeholder="e.g., Toyota Corolla"
                  />
                </div>

                <div>
                  <label htmlFor="carColor" className="block text-sm font-medium text-gray-700 mb-1">
                    Car Color
                  </label>
                  <select
                    id="carColor"
                    name="carColor"
                    value={formData.carColor}
                    onChange={handleChange}
                    className="input"
                  >
                    <option value="">Select color</option>
                    <option value="white">White</option>
                    <option value="black">Black</option>
                    <option value="silver">Silver</option>
                    <option value="gray">Gray</option>
                    <option value="red">Red</option>
                    <option value="blue">Blue</option>
                    <option value="green">Green</option>
                    <option value="yellow">Yellow</option>
                    <option value="brown">Brown</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Driver Information */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium flex items-center">
                <User className="h-5 w-5 mr-2" />
                Driver Information
              </h3>
            </div>
            <div className="card-content space-y-4">
              <div>
                <label htmlFor="driverName" className="block text-sm font-medium text-gray-700 mb-1">
                  Driver Name *
                </label>
                <input
                  type="text"
                  id="driverName"
                  name="driverName"
                  value={formData.driverName}
                  onChange={handleChange}
                  className={`input ${errors.driverName ? 'border-danger-300' : ''}`}
                  placeholder="Enter driver's full name"
                />
                {errors.driverName && (
                  <p className="mt-1 text-sm text-danger-600">{errors.driverName}</p>
                )}
              </div>

              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className={`input ${errors.phoneNumber ? 'border-danger-300' : ''}`}
                  placeholder="e.g., +250 788 123 456"
                />
                {errors.phoneNumber && (
                  <p className="mt-1 text-sm text-danger-600">{errors.phoneNumber}</p>
                )}
              </div>
            </div>
          </div>

          {/* Parking Information */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Parking Information
              </h3>
            </div>
            <div className="card-content space-y-4">
              <div>
                <label htmlFor="slotNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Parking Slot *
                </label>
                <select
                  id="slotNumber"
                  name="slotNumber"
                  value={formData.slotNumber}
                  onChange={handleChange}
                  className={`input ${errors.slotNumber ? 'border-danger-300' : ''}`}
                >
                  <option value="">Select an available slot</option>
                  {availableSlots.map((slot) => (
                    <option key={slot._id} value={slot.slotNumber}>
                      {slot.slotNumber} {slot.location && `- ${slot.location}`}
                    </option>
                  ))}
                </select>
                {errors.slotNumber && (
                  <p className="mt-1 text-sm text-danger-600">{errors.slotNumber}</p>
                )}
                <p className="mt-1 text-sm text-gray-500">
                  {availableSlots.length} slots available
                </p>
              </div>

              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  className="input"
                  placeholder="Any additional notes about this parking entry..."
                />
              </div>
            </div>
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="rounded-md bg-danger-50 p-4">
              <div className="text-sm text-danger-700">{errors.submit}</div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/parking-records')}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Recording Entry...
                </div>
              ) : (
                'Record Car Entry'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CarEntryForm;
