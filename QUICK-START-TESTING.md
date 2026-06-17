# Quick Start Guide - Test the Demo

## 🚀 Start in 3 Commands

```bash
# 1. Install dependencies (first time only)
pnpm install

# 2. Start dev server (port 3011)
pnpm dev

# 3. Open browser
# http://localhost:3011
```

## 🎯 Test Idea Submission (Portal Side)

### Step 1: Go to Idea Page
```
URL: http://localhost:3011/portal/y-tuong
```

### Step 2: Create New Idea
1. Click "Tạo ý tưởng mới" (Create new idea)
2. Fill in all required fields:
   - **Tên ý tưởng:** Example: "Tối ưu hóa quy trình cấp phép"
   - **Lĩnh vực:** Example: "Cải cách hành chính"
   - **Mô tả hiện trạng/vấn đề:** Example: "Quy trình cấp phép hiện tại mất 15 ngày"
   - **Nội dung ý tưởng đề xuất:** Example: "Ứng dụng blockchain tự động hóa quy trình"
   - **Mục tiêu:** Example: "Giảm thời gian cấp phép xuống 3 ngày"

### Step 3: Save Draft (Test Persistence)
1. Click "Lưu nháp" (Save draft) button
2. See message: "Bản nháp được lưu lúc: [time]"
3. **Refresh page** (Ctrl+R)
4. Form should recover all data ✓

### Step 4: Continue Workflow
1. Click "Tiếp tục" to step 3
2. Upload a file (optional - just drag or click to simulate)
3. Select officer from dropdown (e.g., "Nguyễn Văn A")
4. Click "Tiếp tục" to step 4

### Step 5: Preview & Submit
1. Review all information shown
2. See yellow warning: "After submission, you cannot edit"
3. Click "Nộp ý tưởng" (Submit idea)
4. Verify success page shows:
   - Ticket code: `YT-{YYMMDDHHmmss}`
   - Green success message
   - Options to create new or return home

✅ **Success!** Idea workflow complete

---

## 👨‍💼 Test Admin Review (Admin Side)

### Step 1: Go to Admin Management
```
URL: http://localhost:3011/admin/y-tuong/
```

### Step 2: View Idea List
- Should see 4 sample ideas:
  - YT-240617001: Tối ưu hóa quy trình (Draft)
  - YT-240616001: Phát triển ứng dụng mobile (Awaiting 1st Review)
  - YT-240615001: Hệ thống quản lý tài liệu (Approved 1st)
  - YT-240614001: Nâng cấp hạ tầng mạng (Recognized)

### Step 3: Search Test
1. Type "tối ưu" in search box
2. Table should filter to show only matching ideas ✓

### Step 4: Filter Test
1. Click Status filter
2. Select "Được công nhận" (Recognized)
3. Table should show only 1 idea (YT-240614001) ✓

### Step 5: View Details
1. Click "Xem" button on any idea
2. Modal opens showing:
   - All idea fields
   - Officer assignment
   - Number of attachments
   - Current status with dropdown
3. Close modal

✅ **Success!** Admin workflow complete

---

## 🧪 Full End-to-End Test Scenario

### Complete Flow (5-10 minutes)

**User: Staff**
1. Visit `/portal/y-tuong`
2. Create idea with:
   - Name: "AI-powered Document Processing"
   - Field: "Information Technology"
   - Problem: "Manual document processing takes too long"
   - Solution: "Use AI to automatically classify documents"
   - Goals: "Reduce processing time by 50%"
3. Save draft (verify it persists on refresh)
4. Continue through all 5 steps
5. Submit idea
6. Note the ticket code displayed

**Admin: Manager**
1. Visit `/admin/y-tuong/`
2. Should see the newly submitted idea in list
3. Search for it by ticket code
4. Click "Xem" to see full details
5. Verify all information matches what was submitted
6. [Future] Change status and save (currently not connected to backend)

**Result:** ✅ Complete workflow from submission to admin review

---

## 🐛 Troubleshooting

### Port 3011 Already In Use
```bash
# Kill existing process
lsof -ti:3011 | xargs kill -9
# Or use different port
pnpm dev -- --port 3012
```

### Cache Issues
```bash
# Clear node modules
rm -rf node_modules
pnpm install

# Clear Vite cache
rm -rf .vite
pnpm dev
```

### localStorage Not Working
- Check browser: F12 → Application → LocalStorage
- Should see key: `ytuong_draft_*`
- If not present: try incognito mode (not private)

### Styles Look Off
```bash
# Rebuild CSS
pnpm build

# Or just restart dev
pnpm dev
```

---

## 📱 Browser DevTools Tips

### Check Draft Data
```javascript
// In browser console (F12)
localStorage.getItem('ytuong_draft')
```

### Clear All Draft Data
```javascript
localStorage.clear()
// Then refresh page
```

### Check Form State
```javascript
// In React DevTools
// Navigate to NopYTuongPage component
// Check state in props
```

---

## 📊 Test Checklist

| Feature | ✓ Works? | Notes |
|---------|----------|-------|
| Portal form displays | | |
| All form fields render | | |
| Save draft button works | | |
| Draft persists on refresh | | |
| File upload UI works | | |
| Officer selection works | | |
| Preview step displays | | |
| Submit generates ticket | | |
| Success page shows | | |
| Admin list shows mock data | | |
| Search filters work | | |
| Status filter works | | |
| Detail modal opens | | |
| Detail modal shows all fields | | |

---

## 🎥 Demo Video Script (3 minutes)

### Scene 1: Portal (1 min)
```
"Welcome to the Idea Management System. I'm going to submit a new innovation idea."

1. Click on "Nộp ý tưởng" menu
2. Fill in idea details
3. Click "Save Draft" - show it persists
4. Continue through steps showing file upload and officer selection
5. Preview before submission
6. Submit and show ticket code
```

### Scene 2: Admin (1 min)
```
"Now let's look at the admin side where managers review submitted ideas."

1. Navigate to admin y-tuong page
2. Show the list of ideas with statuses
3. Search and filter to find an idea
4. Click to view details
5. Show the detail modal with all information
```

### Scene 3: Discussion (1 min)
```
"The system is ready for the next phase which includes:
- Innovation registration workflow
- Multi-level approval process
- Status tracking and automation
- Integration with the main portal"
```

---

## ✅ Success Criteria

After testing, you should be able to:

- [ ] Submit an idea through the complete 5-step workflow
- [ ] See draft saved to localStorage and persist on refresh
- [ ] View the ticket code generated after submission
- [ ] Login as admin and see submitted ideas in the management page
- [ ] Search ideas by code or name
- [ ] Filter ideas by status
- [ ] Click to view full idea details
- [ ] See all 4 sample ideas in admin list

If all ✓, then **Phase 1 Demo is ready!**

---

## 📚 Full Documentation

For more detailed information, see:

- **[DEMO-SETUP-GUIDE.md](DEMO-SETUP-GUIDE.md)** - Complete setup guide (420 lines)
- **[ADMIN-PAGES-DOCUMENTATION.md](ADMIN-PAGES-DOCUMENTATION.md)** - Feature details (450 lines)
- **[IMPLEMENTATION-SUMMARY.md](IMPLEMENTATION-SUMMARY.md)** - Roadmap & next steps (300 lines)
- **[KE-HOACH-DEMO-SANG-KIEN.md](KE-HOACH-DEMO-SANG-KIEN.md)** - Master demo plan

---

## 🚀 Next Steps

Once testing is complete:

1. **Backend Integration** - Connect to real API
2. **Demo Data** - Load sample ideas from database
3. **User Accounts** - Create demo accounts
4. **Phase 2** - Start innovation workflow
5. **Live Demo** - Showcase to stakeholders

---

**Ready?** Start with `pnpm dev` and visit `http://localhost:3011/portal/y-tuong`

Happy testing! 🎉
