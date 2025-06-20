# Baby Steps - Baby Tracker Web App

A modern, clean pregnancy tracking web application built with React and Supabase. Features include budget planning, baby items tracking, gift wishlists, hospital bag management, and comprehensive editing capabilities.

## 🌟 Features

- 👶 **Dashboard** - Overview with due date countdown and pregnancy week tracking
- 💰 **Budget Planning** - Track and categorise baby purchases with running totals and visual progress
- 🛒 **Shopping List** - Comprehensive shopping management with budget integration, priorities, and mobile shopping mode
- 🎁 **Gift Wishlist** - Shareable wishlist with automatic image extraction from product URLs
- 🏥 **Hospital Bag Tracker** - Comprehensive checklist for mum, baby, and partner with editing capabilities
- 💕 **Baby Names** - Suggest, edit, and vote on baby names with your partner
- 👫 **Family Accounts** - Share all lists with partners and family members
- ✏️ **Full Editing** - Edit any item across all features (Shopping List, Baby Names, Hospital Bag)
- 🎨 **Visual Wishlist** - Automatic product image extraction from URLs
- 📱 **Responsive Design** - Works beautifully on mobile and desktop
- 📊 **CSV Export** - Export your budget data for external analysis

## 🛠 Tech Stack

- **Frontend**: React 18 with React Router
- **Authentication & Database**: Supabase (PostgreSQL)
- **Styling**: Custom CSS with pastel theme
- **Icons**: Lucide React
- **Hosting**: Cloudflare Pages
- **Additional Libraries**: 
  - date-fns for date handling
  - react-csv for data export

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Supabase account
- GitHub account
- Cloudflare account (for deployment)

## 🚀 Setup Instructions

### 1. Clone the repository:
```bash
git clone https://github.com/agrwood1066/BabyTracker.git
cd BabyTracker
```

### 2. Install dependencies:
```bash
npm install
```

### 3. Set up Supabase:
- Create a new Supabase project
- Run the database schema from `/supabase/schema.sql`
- See `SUPABASE_SETUP.md` for detailed instructions

### 4. Configure environment variables:
Create a `.env` file in the root directory:
```
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
REACT_APP_LINKPREVIEW_API_KEY=your_linkpreview_api_key
```

**Note**: For wishlist image extraction, get a free API key from [LinkPreview.net](https://linkpreview.net) (1000 requests/month free).

### 5. Run the development server:
```bash
npm start
```

The app will open at `http://localhost:3000`

## 📊 Database Schema

The app uses Supabase with the following main tables:
- `profiles` - User profiles and family relationships
- `family_members` - Family account relationships
- `budget_categories` - Budget categories with expected amounts
- `baby_items` - Shopping list items with budget integration, priorities, and full editing
- `wishlist_items` - Gift wishlist items with image extraction
- `wishlist_shares` - Shareable wishlist links
- `hospital_bag_items` - Hospital bag checklist with full editing capabilities
- `baby_names` - Baby name suggestions with editing support
- `baby_name_votes` - Voting on baby names

## ✨ Latest Features

### **Enhanced Shopping List:**
- **Budget Integration** - Items link directly to budget categories
- **Shopping Mode** - Mobile-optimized view for in-store shopping
- **Edit Capabilities** - Full editing of all item details
- **Multiple Links** - Add alternative purchase links and prices
- **Priority System** - High/Medium/Low priority with visual indicators
- **Needed By** - Timeline planning for when items are required

### **Visual Wishlist:**
- **Automatic Images** - Product images extracted from URLs using LinkPreview.net
- **Professional Cards** - Beautiful product card layout
- **Enhanced Form** - All Shopping List fields available when adding
- **Dual Creation** - Items added to both Shopping List and Wishlist

### **Comprehensive Editing:**
- **Baby Names** - Edit name, gender, and notes (original suggester only)
- **Hospital Bag** - Edit all item details including category and quantity
- **Shopping List** - Edit all fields including budget category and links
- **Consistent UI** - Blue edit buttons with intuitive workflows

## 🌐 Deployment

The app is configured for deployment on Cloudflare Pages:
1. Push to the main branch to trigger automatic deployment
2. See `CLOUDFLARE_DEPLOYMENT.md` for setup instructions

## 🧪 Testing

```bash
npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📱 Screenshots

[Add screenshots here]

## 🔒 Security

- All data is stored securely in Supabase with Row Level Security
- Authentication is handled by Supabase Auth
- API keys are stored as environment variables
- Family data is isolated and only accessible to family members

## 📄 License

Private project - all rights reserved

## 👏 Acknowledgments

- Icons by Lucide React
- Hosting by Cloudflare Pages
- Database by Supabase
