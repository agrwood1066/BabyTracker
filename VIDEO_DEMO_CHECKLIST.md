# Video Demo Creation Checklist

## 🎬 Recording Your App Demos

### Phase 1: Quick Start (Priority Features)
Start with these 2-3 most important features first:

#### ✅ Shopping List Demo (6-8 seconds)
**Script:**
1. Open shopping list page
2. Click "Add Item" 
3. Type item name (e.g., "Baby monitor")
4. Select budget category from dropdown
5. Set priority to "High"
6. Click save
7. Show item appearing in list with budget category tag

**Key shots to capture:**
- Budget integration working
- Priority indicator
- Clean, intuitive interface

#### ✅ Budget Tracker Demo (5-7 seconds)
**Script:**
1. Open budget overview
2. Show existing categories with progress bars
3. Click on a category (e.g., "Nursery")
4. Add new expense by clicking "+"
5. Watch progress bar update in real-time
6. Show overspend warning if applicable

**Key shots to capture:**
- Visual progress indicators
- Real-time updates
- Professional dashboard look

#### ✅ Wishlist Demo (6-8 seconds)
**Script:**
1. Open wishlist page
2. Click "Add Item"
3. Paste a product URL (prepare a real one)
4. Show automatic image extraction happening
5. Save item
6. Display beautiful product card with image

**Key shots to capture:**
- URL to image magic
- Professional product cards
- Shareable wishlist interface

---

## 📱 Recording Setup

### Before Recording:
- [ ] Clean your browser cache
- [ ] Use demo data (no personal info)
- [ ] Set browser to 1024x768 or 800x600
- [ ] Ensure good lighting on screen
- [ ] Close unnecessary browser tabs
- [ ] Practice the sequence 2-3 times

### Recording Settings:
- [ ] **Duration**: 5-8 seconds each
- [ ] **Frame rate**: 30fps
- [ ] **Quality**: High (you'll compress later)
- [ ] **Audio**: None needed (will be muted)

### Demo Data to Prepare:
- Shopping items: "Baby monitor", "Cot sheets", "Nappies"
- Budget categories: "Nursery", "Clothing", "Feeding"
- Product URLs: Real Amazon/John Lewis baby items
- Baby names: "Oliver", "Emma", "James" (neutral examples)

---

## 🛠 Post-Recording Workflow

### Step 1: Basic Editing
- [ ] Trim to exact length (5-8 seconds)
- [ ] Ensure smooth loop (end should flow to beginning)
- [ ] Remove any personal information
- [ ] Check for smooth cursor movement

### Step 2: Optimization (Choose one method)

#### Option A: FFmpeg (Best compression)
```bash
# Install FFmpeg first
brew install ffmpeg

# Optimize for web (replace 'input.mov' with your recording)
ffmpeg -i shopping-list-raw.mov -vf "scale=800:600" -c:v libx264 -crf 28 -preset slow -movflags +faststart public/videos/shopping-list-demo.mp4

# Create WebM version
ffmpeg -i shopping-list-raw.mov -vf "scale=800:600" -c:v libvpx-vp9 -crf 30 -b:v 0 public/videos/shopping-list-demo.webm
```

#### Option B: Online Tools (Easier)
1. **CloudConvert.com**: Upload → MP4 → Advanced settings
   - Resolution: 800x600
   - Quality: 70-80%
   - Remove audio
2. **Ezgif.com**: For additional compression if needed

### Step 3: File Organization
Place optimized videos in:
```
public/
├── videos/
│   ├── shopping-list-demo.mp4     (Target: 500KB-1MB)
│   ├── shopping-list-demo.webm    (Target: 300KB-800KB)
│   ├── budget-demo.mp4
│   ├── budget-demo.webm
│   └── wishlist-demo.mp4
└── images/
    ├── shopping-list-preview.png   (Fallback screenshot)
    ├── budget-preview.png
    └── wishlist-preview.png
```

---

## 🎯 Phase 2: Additional Features (Later)

Once the first 3 are working well:

#### Hospital Bag Demo (4-5 seconds)
- Check off items quickly
- Show progress updating
- Switch between Mum/Baby/Partner tabs

#### Baby Names Demo (5-6 seconds)
- Add name suggestion
- Show voting interface
- Display family collaboration

---

## ✅ Quality Checklist

Before publishing each video:
- [ ] File size under 1MB
- [ ] Loops smoothly
- [ ] Shows key feature clearly
- [ ] No personal information visible
- [ ] Loads quickly on mobile
- [ ] Has WebM alternative for better compression
- [ ] Fallback image created

---

## 🚀 Testing

1. **Local Testing**: 
   - Run `npm start`
   - Check each video loads and plays
   - Test on mobile device

2. **Performance Testing**:
   - Open DevTools → Network tab
   - Check video load times
   - Aim for under 2 seconds on good connection

3. **Fallback Testing**:
   - Temporarily rename video files to test fallback images
   - Ensure graceful degradation

---

## 💡 Pro Tips

1. **Start Small**: Perfect 2-3 videos before creating all 5
2. **Consistent Style**: Use same timing and transitions
3. **Mobile First**: Test on phone - that's likely where users will see it
4. **Real Content**: Use realistic demo data that users can relate to
5. **Loop Smoothly**: End state should match beginning state

## 📞 Need Help?

If videos aren't loading or need optimization help:
1. Check browser console for errors
2. Verify file paths match exactly
3. Test with different video formats
4. Consider hosting on CDN if files are large

**Remember**: Users will spend 3-5 seconds max looking at each demo, so make them count!
