# Card0r Testing Guide

## Manual Testing Checklist

### Prerequisites
- [ ] Node.js 20+ installed
- [ ] OpenAI API key (for full testing)
- [ ] Jamendo API key (for full testing)

### Backend Testing

#### 1. Server Startup
```bash
cd backend
npm run dev
```

**Expected:**
- ✅ Server starts on port 3001
- ✅ Console shows: "🚀 Card0r backend server running on port 3001"
- ✅ Temp and videos directories created

#### 2. Health Check
```bash
curl http://localhost:3001/health
```

**Expected:**
```json
{"status":"ok","timestamp":"2025-..."}
```

#### 3. API Key Validation
```bash
curl -X POST http://localhost:3001/api/validate-keys \
  -H "Content-Type: application/json" \
  -d '{"openai":"sk-test","pixabay":"test-key"}'
```

**Expected:**
```json
{
  "openai": {"valid": false, "error": "..."},
  "pixabay": {"valid": false, "error": "..."}
}
```

#### 4. CSV Upload
Create a test file `test.csv`:
```csv
Name,Message
Test User,Happy holidays
```

```bash
curl -X POST http://localhost:3001/api/upload-csv \
  -F "file=@test.csv"
```

**Expected:**
```json
{
  "recipients": [
    {"id":"...", "name":"Test User", "messageGuidance":"Happy holidays"}
  ],
  "errors": []
}
```

### Frontend Testing

#### 1. App Startup
```bash
cd frontend
npm run dev
```

**Expected:**
- ✅ Dev server starts on port 5173
- ✅ No TypeScript errors
- ✅ Opens browser automatically

#### 2. Splash Screen
- [ ] Animated particles visible
- [ ] "Card0r" title with animation
- [ ] "Click anywhere to enter" appears
- [ ] Clicking enters the app

#### 3. Settings Modal
- [ ] Click settings cog (top-right)
- [ ] Modal opens
- [ ] OpenAI and Jamendo input fields visible
- [ ] Links to API providers work
- [ ] Validation works with test keys
- [ ] Keys persist after page reload

#### 4. Dark Mode Toggle
- [ ] Click moon/sun icon
- [ ] Theme switches immediately
- [ ] All components respect theme
- [ ] Preference persists after reload

#### 5. Recipient Management
**File Upload:**
- [ ] Drag CSV file to upload zone
- [ ] File uploads successfully
- [ ] Recipients appear in table
- [ ] Error messages shown for invalid files

**Manual Entry:**
- [ ] Fill name and message fields
- [ ] Click "Add Recipient"
- [ ] Recipient added to table
- [ ] Form clears after adding

**Table:**
- [ ] All recipients visible
- [ ] Delete button removes recipient
- [ ] Empty state shows when no recipients

#### 6. Holiday Theme Selection
- [ ] All 17 holidays displayed in 4 categories
- [ ] Clicking a theme selects it
- [ ] Selected theme has blue ring
- [ ] Hover effects work

**Verify all themes:**
- [ ] Christmas 🎄
- [ ] New Year 🎉
- [ ] Easter 🐰
- [ ] Valentine's Day 💖
- [ ] Halloween 🎃
- [ ] Thanksgiving 🦃
- [ ] Rosh Hashanah 🍎
- [ ] Hanukkah 🕎
- [ ] Passover 🍷
- [ ] Yom Kippur 🕊️
- [ ] Eid al-Fitr 🌙
- [ ] Eid al-Adha 🕌
- [ ] Ramadan ⭐
- [ ] Chinese New Year 🐉
- [ ] Diwali 🪔
- [ ] Lunar New Year 🏮

#### 7. Format Selection
- [ ] All 4 formats visible (1080p, 4K, Square, Social)
- [ ] Radio buttons work
- [ ] Dimensions shown correctly
- [ ] Default format selected

#### 8. Message Generation
**Prerequisites:** Valid OpenAI key, theme selected, recipients added

- [ ] "Generate Messages with AI" button enabled
- [ ] Click button
- [ ] Loading spinner shows
- [ ] Success toast appears
- [ ] Button changes to "Messages Ready"

#### 9. Video Generation
**Prerequisites:** Messages generated

- [ ] "Generate Videos" button enabled
- [ ] Click button
- [ ] Progress bars appear for each recipient
- [ ] Status updates (pending → processing → completed)
- [ ] Success toast when complete

#### 10. Video Gallery
- [ ] Videos appear in grid
- [ ] Video thumbnails load
- [ ] Click "Preview" opens video player
- [ ] Click "Download" downloads video
- [ ] "Download All" button appears for multiple videos

### Integration Testing

#### End-to-End Test Scenario

1. **Fresh Start:**
   - [ ] Open app in incognito mode
   - [ ] Clear localStorage
   - [ ] Start on splash screen

2. **Setup:**
   - [ ] Enter app
   - [ ] Add API keys in settings
   - [ ] Keys validate successfully

3. **Create Video:**
   - [ ] Add 2 recipients manually
   - [ ] Select Christmas theme
   - [ ] Select 1080p format
   - [ ] Generate messages (should take ~5-10 seconds)
   - [ ] Generate videos (should take ~60-120 seconds)

4. **Verify Output:**
   - [ ] 2 videos appear in gallery
   - [ ] Videos are playable
   - [ ] Videos have correct content:
     - Christmas theme with snow particles
     - Recipient name appears
     - AI-generated message displays
     - 30 seconds duration
   - [ ] Download works

5. **Check Backend:**
   ```bash
   ls backend/videos/
   ```
   - [ ] 2 .mp4 files exist
   - [ ] Files are ~5-10MB each

### Error Handling Tests

#### Invalid API Keys
- [ ] Enter invalid OpenAI key → Error message shown
- [ ] Enter invalid Jamendo key → Error message shown
- [ ] Cannot proceed without valid keys

#### Invalid CSV
- [ ] Upload CSV with missing columns → Error shown
- [ ] Upload non-CSV file → Error shown
- [ ] Upload empty CSV → Error shown

#### Network Errors
- [ ] Stop backend server
- [ ] Try to generate messages → Error toast
- [ ] Try to upload CSV → Error toast

#### Missing Requirements
- [ ] Try to generate messages without theme → Error
- [ ] Try to generate videos without messages → Disabled
- [ ] Try to proceed without recipients → Disabled

### Performance Tests

#### Video Generation Performance
Test with Christmas theme, 1080p format:

| Recipients | Expected Time | Actual Time | Notes |
|-----------|---------------|-------------|-------|
| 1         | 30-40s        |             |       |
| 5         | 150-200s      |             |       |
| 10        | 300-400s      |             |       |

#### Memory Usage
```bash
# Monitor during video generation
top -pid $(pgrep -f "node.*backend")
```

**Expected:**
- Memory stays under 500MB
- CPU spikes during rendering
- No memory leaks after completion

### Browser Compatibility

Test in multiple browsers:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### Responsive Design

Test at different screen sizes:
- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

### Known Limitations

1. **Sequential Processing:** Videos generated one at a time (parallel processing not implemented)
2. **No Progress Persistence:** Refresh loses progress (job storage in memory only)
3. **Limited Music Options:** Jamendo returns 5 tracks per theme
4. **No Video Preview in Gallery:** Thumbnail only, full preview requires click

### Debug Mode

Enable detailed logging:

**Backend:**
```bash
NODE_ENV=development npm run dev
```

**Frontend:**
```javascript
// In browser console
localStorage.debug = 'card0r:*'
```

## Automated Testing (Future)

To be implemented:
- Unit tests with Vitest
- Integration tests with Playwright
- API tests with Supertest
- Component tests with React Testing Library

## Bug Reporting

When reporting bugs, include:
- Steps to reproduce
- Expected vs actual behavior
- Browser/OS information
- Console errors (if any)
- Backend logs (if relevant)
- Screenshots/videos

## Success Criteria

✅ All checklist items pass
✅ No console errors in normal flow
✅ Videos generate successfully
✅ UI is responsive and intuitive
✅ Error messages are clear and helpful
