# Baby Steps - Baby Tracker Web App

A modern, clean pregnancy tracking web application built with React and Supabase. Features include budget planning, baby items tracking, gift wishlists, and hospital bag management.

## 🌟 Features

- 👶 **Dashboard** - Overview with due date countdown and pregnancy week tracking
- 💰 **Budget Planning** - Track and categorise baby purchases with running totals
- 📝 **Baby Items List** - Keep track of what you need to buy with priority levels
- 🎁 **Gift Wishlist** - Shareable wishlist for baby shower with purchase tracking
- 🏥 **Hospital Bag Tracker** - Checklist for mum, baby, and partner
- 💕 **Baby Names** - Suggest and vote on baby names with your partner
- 👫 **Family Accounts** - Share all lists with partners and family members
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
```

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
- `budget_items` - Budget tracking for baby purchases
- `baby_items` - Essential baby items checklist
- `wishlist_items` - Gift wishlist items
- `wishlist_shares` - Shareable wishlist links
- `hospital_bag_items` - Hospital bag checklist
- `baby_names` - Baby name suggestions
- `baby_name_votes` - Voting on baby names

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
