import mongoose from 'mongoose';

const CardSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true 
  },
  price: { 
    type: Number, 
    required: true,
    min: 0 
  },
  category: { 
    type: String, 
    required: true,
    trim: true 
  },
  image: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    default: '' 
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Hero product fields
  isHeroProduct: { 
    type: Boolean, 
    default: false, 
    index: true 
  },
  heroTitle: { 
    type: String, 
    default: '' 
  },
  heroSubtitle: { 
    type: String, 
    default: '' 
  },
  heroButtonText: { 
    type: String, 
    default: 'Discover Now' 
  },
  heroImage: { 
    type: String, 
    default: '' 
  },
  heroTheme: { 
    type: String, 
    enum: ['Luxury', 'Vintage', 'Minimal', 'Dark'],
    default: 'Luxury' 
  },
  heroAlignment: { 
    type: String, 
    enum: ['Left', 'Center', 'Right'],
    default: 'Center' 
  },
  heroOverlayOpacity: { 
    type: Number, 
    default: 0.3,
    min: 0,
    max: 1 
  },
}, { timestamps: true });

export default mongoose.models.Card || mongoose.model('Card', CardSchema);
