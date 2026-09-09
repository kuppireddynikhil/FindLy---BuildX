import { useState, type FormEvent, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Tag, MapPin, Calendar, Phone, Type, Upload } from 'lucide-react';
import { Input, Select, Textarea } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useToast } from '../components/ui/Toast';
import { ITEM_CATEGORIES, CAMPUS_LOCATIONS } from '../types/database';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import './ReportLostPage.css';

export function ReportLostPage() {
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
    if (!location) newErrors.location = 'Last seen location is required';
    if (!date) newErrors.date = 'Date lost is required';
    if (!contactInfo.trim()) newErrors.contactInfo = 'Contact info is required';
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
        type: 'lost',
        title: title.trim(),
        description: description.trim(),
        category,
        location,
        date,
        image_url: image.data.publicUrl,
        contact_info: contactInfo.trim(),
      });
      if (error) throw error;
      addToast('Lost item report submitted successfully!', 'success');
      navigate('/my-reports');
    } catch (err) {
      console.error(err);
      addToast('Could not submit the report. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="report-lost-page page-container">
      <div className="container container--narrow animate-fade-in-up">
        <div className="report-lost-page__header">
          <div className="report-lost-page__icon-wrapper">
            <AlertTriangle size={28} />
          </div>
          <div>
            <h1 className="report-lost-page__title">Report a Lost Item</h1>
            <p className="report-lost-page__subtitle">
              Provide detail to help campus staff and fellow students identify your item.
            </p>
          </div>
        </div>

        <div className="glass-card report-lost-page__card">
          <form onSubmit={handleSubmit} className="report-lost-page__form">
            <Input
              label="Item Title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Black Leather Wallet"
              error={errors.title}
              icon={<Type size={18} />}
              required
            />

            <div className="report-lost-page__form-row">
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
                label="Last Seen Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                options={locationOptions}
                error={errors.location}
                icon={<MapPin size={18} />}
                required
              />
            </div>

            <div className="report-lost-page__form-row">
              <Input
                label="Date Lost"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                error={errors.date}
                icon={<Calendar size={18} />}
                required
              />

              <Input
                label="Contact Information"
                type="text"
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
                placeholder="Phone or email"
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
              placeholder="Describe any distinguishing marks, brands, sticker designs, case color, or contents..."
              rows={4}
            />

            <div className="report-lost-page__upload">
              <span className="report-lost-page__upload-label">Upload Image</span>
              <label className="report-lost-page__upload-area">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  aria-invalid={errors.image ? 'true' : undefined}
                  className="report-lost-page__file-input"
                />
                {imagePreview ? (
                  <div className="report-lost-page__preview">
                    <img src={imagePreview} alt="Preview" />
                    <span className="report-lost-page__preview-change">Click to change image</span>
                  </div>
                ) : (
                  <div className="report-lost-page__upload-prompt">
                    <Upload size={32} className="report-lost-page__upload-icon" />
                    <span>Drag & drop an image or click to browse</span>
                    <span className="report-lost-page__upload-hint">Supports PNG, JPG, or JPEG</span>
                  </div>
                )}
              </label>
              {errors.image && <span className="input-group__error" role="alert">{errors.image}</span>}
            </div>

            <Button
              type="submit"
              variant="primary"
              className="report-lost-page__submit"
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
