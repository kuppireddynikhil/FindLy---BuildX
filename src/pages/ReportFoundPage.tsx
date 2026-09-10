import { useState, type FormEvent, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Tag, MapPin, Calendar, Phone, Type, Upload } from 'lucide-react';
import { Input, Select, Textarea } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useToast } from '../components/ui/Toast';
import { ITEM_CATEGORIES, CAMPUS_LOCATIONS } from '../types/database';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import './ReportFoundPage.css';

export function ReportFoundPage() {
  const { addToast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const categoryOptions = ITEM_CATEGORIES.map((c) => ({ value: c, label: c }));
  const locationOptions = CAMPUS_LOCATIONS.map((l) => ({ value: l, label: l }));

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = 'Item title is required';
    if (!category) newErrors.category = 'Category is required';
    if (!location) newErrors.location = 'Found location is required';
    if (!date) newErrors.date = 'Date found is required';
    if (!contactInfo.trim()) newErrors.contactInfo = 'Contact/collection info is required';
    if (!description.trim()) newErrors.description = 'A description is required';
    if (!imageFile) newErrors.image = 'Please upload an image';
    if (imageFile && !imageFile.type.startsWith('image/')) newErrors.image = 'Please upload a valid image file';
    if (imageFile && imageFile.size > 5 * 1024 * 1024) newErrors.image = 'Image must be smaller than 5 MB';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (!user || !imageFile) return;
    setLoading(true);
    try {
      const filePath = `${user.id}/${crypto.randomUUID()}-${imageFile.name}`;
      const upload = await supabase.storage.from('item-images').upload(filePath, imageFile, { upsert: false });
      if (upload.error) throw upload.error;
      const image = supabase.storage.from('item-images').getPublicUrl(filePath);
      const { error } = await supabase.from('items').insert({
        user_id: user.id,
        type: 'found',
        title: title.trim(),
        description: description.trim(),
        category,
        location,
        date,
        image_url: image.data.publicUrl,
        contact_info: contactInfo.trim(),
      });
      if (error) throw error;
      addToast('Found item report submitted successfully!', 'success');
      navigate('/my-reports');
    } catch (err) {
      console.error(err);
      addToast('Could not submit the report. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="report-found-page page-container">
      <div className="container container--narrow animate-fade-in-up">
        <div className="report-found-page__header">
          <div className="report-found-page__icon-wrapper">
            <CheckCircle2 size={28} />
          </div>
          <div>
            <h1 className="report-found-page__title">Report a Found Item</h1>
            <p className="report-found-page__subtitle">
              Provide detail to help campus staff and fellow students match this item to their lost reports.
            </p>
          </div>
        </div>

        <div className="glass-card report-found-page__card">
          <form onSubmit={handleSubmit} className="report-found-page__form">
            <Input
              label="Item Title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Red iPhone 13 with clear case"
              error={errors.title}
              icon={<Type size={18} />}
              required
            />

            <div className="report-found-page__form-row">
              <Select
                label="Category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                options={categoryOptions}
                error={errors.category}
                icon={<Tag size={18} />}
                required
              />

              <Select
                label="Where Did You Find It?"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                options={locationOptions}
                error={errors.location}
                icon={<MapPin size={18} />}
                required
              />
            </div>

            <div className="report-found-page__form-row">
              <Input
                label="Date Found"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                error={errors.date}
                icon={<Calendar size={18} />}
                required
              />

              <Input
                label="Collection Desk / Contact Info"
                type="text"
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
                placeholder="e.g. Science block reception Desk B"
                error={errors.contactInfo}
                icon={<Phone size={18} />}
                required
              />
            </div>

            <Textarea
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              error={errors.description}
              placeholder="Describe any distinguishing marks, brands, or color details. Avoid listing ALL contents/passcodes to verify owners."
              rows={4}
            />

            <div className="report-found-page__upload">
              <span className="report-found-page__upload-label">Upload Image</span>
              <label className="report-found-page__upload-area">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  aria-invalid={errors.image ? 'true' : undefined}
                  className="report-found-page__file-input"
                />
                {imagePreview ? (
                  <div className="report-found-page__preview">
                    <img src={imagePreview} alt="Preview" />
                    <span className="report-found-page__preview-change">Click to change image</span>
                  </div>
                ) : (
                  <div className="report-found-page__upload-prompt">
                    <Upload size={32} className="report-found-page__upload-icon" />
                    <span>Drag & drop an image or click to browse</span>
                    <span className="report-found-page__upload-hint">Supports PNG, JPG, or JPEG</span>
                  </div>
                )}
              </label>
              {errors.image && <span className="input-group__error" role="alert">{errors.image}</span>}
            </div>

            <Button
              type="submit"
              variant="primary"
              className="report-found-page__submit"
              loading={loading}
            >
              Submit Report
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
