# 📅 Planner API Documentation

## Tổng quan

API endpoints cho tính năng Planner (lịch đăng bài social media).

## Base URL

```
{API_BASE_URL}/planner
```

## Endpoints

### 1. Get Scheduled Posts (với filters)

Lấy danh sách bài viết đã lên lịch, có thể filter theo ngày, platform, status.

**Endpoint:** `GET /planner/posts`

**Query Parameters:**

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `startDate` | string | No | Ngày bắt đầu (YYYY-MM-DD) | `2024-01-01` |
| `endDate` | string | No | Ngày kết thúc (YYYY-MM-DD) | `2024-01-31` |
| `platform` | string | No | Platform filter | `Facebook`, `Instagram`, `LinkedIn`, `Generic` |
| `socialPageId` | number/string | No | ID của trang social media | `123` |
| `status` | string | No | Status filter | `Scheduled`, `Posted`, `All` |

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Example Request:**
```bash
GET /api/planner/posts?startDate=2024-12-01&endDate=2024-12-31&platform=Instagram
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200 OK):**
```json
{
  "posts": [
    {
      "id": 1,
      "date": "2024-12-15",
      "title": "Weekend Flash Sale",
      "platform": "Instagram",
      "content": "Don't miss out on our Weekend Flash Sale! Get up to 50% off...",
      "attachment": "https://example.com/images/sale.jpg",
      "status": "Scheduled",
      "socialPageId": 123
    },
    {
      "id": 2,
      "date": "2024-12-20",
      "title": "Holiday Greetings",
      "platform": "Facebook",
      "content": "Wishing everyone a wonderful holiday season!",
      "attachment": null,
      "status": "Scheduled",
      "socialPageId": 456
    }
  ],
  "total": 2
}
```

**Error Response (401 Unauthorized):**
```json
{
  "message": "Token không hợp lệ hoặc đã hết hạn"
}
```

---

### 2. Get Single Post

Lấy chi tiết một bài viết theo ID.

**Endpoint:** `GET /planner/posts/:postId`

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Example Request:**
```bash
GET /api/planner/posts/1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200 OK):**
```json
{
  "id": 1,
  "date": "2024-12-15",
  "title": "Weekend Flash Sale",
  "platform": "Instagram",
  "content": "Don't miss out on our Weekend Flash Sale! Get up to 50% off...",
  "attachment": "https://example.com/images/sale.jpg",
  "status": "Scheduled",
  "socialPageId": 123
}
```

**Error Response (404 Not Found):**
```json
{
  "message": "Không tìm thấy bài viết"
}
```

---

### 3. Create New Post

Tạo bài viết mới.

**Endpoint:** `POST /planner/posts`

**Headers:**
```
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "date": "2024-12-25",
  "title": "Christmas Special",
  "platform": "Facebook",
  "content": "Merry Christmas! Special offers available today only.",
  "attachment": "https://example.com/images/christmas.jpg",
  "status": "Scheduled",
  "socialPageId": 456
}
```

**Success Response (201 Created):**
```json
{
  "id": 3,
  "date": "2024-12-25",
  "title": "Christmas Special",
  "platform": "Facebook",
  "content": "Merry Christmas! Special offers available today only.",
  "attachment": "https://example.com/images/christmas.jpg",
  "status": "Scheduled",
  "socialPageId": 456
}
```

**Error Response (400 Bad Request):**
```json
{
  "message": "Dữ liệu không hợp lệ",
  "errors": {
    "date": ["Date is required"],
    "title": ["Title must not exceed 200 characters"]
  }
}
```

---

### 4. Update Post

Cập nhật thông tin bài viết.

**Endpoint:** `PUT /planner/posts/:postId`

**Headers:**
```
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Request Body (có thể partial update):**
```json
{
  "title": "Updated Title",
  "content": "Updated content...",
  "date": "2024-12-26"
}
```

**Success Response (200 OK):**
```json
{
  "id": 3,
  "date": "2024-12-26",
  "title": "Updated Title",
  "platform": "Facebook",
  "content": "Updated content...",
  "attachment": "https://example.com/images/christmas.jpg",
  "status": "Scheduled",
  "socialPageId": 456
}
```

**Error Response (404 Not Found):**
```json
{
  "message": "Không tìm thấy bài viết"
}
```

---

### 5. Delete Post

Xóa bài viết đã lên lịch.

**Endpoint:** `DELETE /planner/posts/:postId`

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Example Request:**
```bash
DELETE /api/planner/posts/3
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200 OK):**
```json
{
  "message": "Đã xóa bài viết thành công"
}
```

**Error Response (404 Not Found):**
```json
{
  "message": "Không tìm thấy bài viết"
}
```

**Error Response (403 Forbidden):**
```json
{
  "message": "Không thể xóa bài viết đã được đăng"
}
```

---

## Data Models

### ScheduledPost

```typescript
interface ScheduledPost {
  id: number;
  date: string; // YYYY-MM-DD format
  title: string; // Max 200 characters
  platform: 'Facebook' | 'Instagram' | 'LinkedIn' | 'Generic';
  content: string; // Post content/caption
  attachment: string | null; // URL to image/video
  status: 'Scheduled' | 'Posted';
  socialPageId?: string | number; // ID của trang social media
}
```

### Query Filters

```typescript
interface GetPostsParams {
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  platform?: string; // Facebook | Instagram | LinkedIn | Generic
  socialPageId?: string | number;
  status?: 'Scheduled' | 'Posted' | 'All';
}
```

---

## Frontend Integration

PlannerView tự động gọi API khi:

1. **Component mount** - Fetch posts cho tháng hiện tại
2. **Thay đổi view mode** (month/week/list) - Fetch posts cho range mới
3. **Chuyển tháng/tuần** (prev/next buttons) - Fetch posts cho period mới
4. **Filter platform** - Fetch posts với platform filter
5. **Delete post** - Xóa post và refresh list

### Date Range Logic

- **Month View:** Lấy posts từ ngày 1 đến ngày cuối của tháng
- **Week View:** Lấy posts từ Chủ Nhật đến Thứ Bảy của tuần
- **List View:** Lấy posts upcoming (từ hôm nay đến 3 tháng sau)

---

## Backend Implementation Example (Node.js/Express)

### Install dependencies:
```bash
npm install express jsonwebtoken
```

### Example endpoints:

```javascript
const express = require('express');
const router = express.Router();

// Middleware để verify JWT (đã có trong AUTH_DOCUMENTATION.md)
const authenticateToken = require('../middleware/auth');

// GET /planner/posts
router.get('/posts', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate, platform, socialPageId, status } = req.query;
    
    // Build query based on filters
    let query = { userId: req.user.userId };
    
    if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    }
    
    if (platform && platform !== 'All') {
      query.platform = platform;
    }
    
    if (socialPageId) {
      query.socialPageId = socialPageId;
    }
    
    if (status && status !== 'All') {
      query.status = status;
    }
    
    // Fetch from database (example with MongoDB)
    const posts = await ScheduledPost.find(query).sort({ date: 1 });
    
    res.json({
      posts,
      total: posts.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// GET /planner/posts/:id
router.get('/posts/:id', authenticateToken, async (req, res) => {
  try {
    const post = await ScheduledPost.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });
    
    if (!post) {
      return res.status(404).json({ message: 'Không tìm thấy bài viết' });
    }
    
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// POST /planner/posts
router.post('/posts', authenticateToken, async (req, res) => {
  try {
    const postData = {
      ...req.body,
      userId: req.user.userId
    };
    
    const post = new ScheduledPost(postData);
    await post.save();
    
    res.status(201).json(post);
  } catch (error) {
    res.status(400).json({ message: 'Dữ liệu không hợp lệ', error: error.message });
  }
});

// PUT /planner/posts/:id
router.put('/posts/:id', authenticateToken, async (req, res) => {
  try {
    const post = await ScheduledPost.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!post) {
      return res.status(404).json({ message: 'Không tìm thấy bài viết' });
    }
    
    res.json(post);
  } catch (error) {
    res.status(400).json({ message: 'Cập nhật thất bại', error: error.message });
  }
});

// DELETE /planner/posts/:id
router.delete('/posts/:id', authenticateToken, async (req, res) => {
  try {
    const post = await ScheduledPost.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });
    
    if (!post) {
      return res.status(404).json({ message: 'Không tìm thấy bài viết' });
    }
    
    // Don't allow deleting already posted content
    if (post.status === 'Posted') {
      return res.status(403).json({ 
        message: 'Không thể xóa bài viết đã được đăng' 
      });
    }
    
    await post.remove();
    
    res.json({ message: 'Đã xóa bài viết thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Xóa thất bại', error: error.message });
  }
});

module.exports = router;
```

### Database Schema Example (MongoDB/Mongoose):

```javascript
const mongoose = require('mongoose');

const scheduledPostSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: String, // YYYY-MM-DD
    required: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  platform: {
    type: String,
    enum: ['Facebook', 'Instagram', 'LinkedIn', 'Generic'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  attachment: {
    type: String, // URL
    default: null
  },
  status: {
    type: String,
    enum: ['Scheduled', 'Posted'],
    default: 'Scheduled'
  },
  socialPageId: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Index for faster queries
scheduledPostSchema.index({ userId: 1, date: 1 });
scheduledPostSchema.index({ userId: 1, platform: 1 });

module.exports = mongoose.model('ScheduledPost', scheduledPostSchema);
```

---

## Testing

### Sử dụng cURL:

```bash
# Get posts for December 2024, Instagram only
curl -X GET \
  "http://localhost:3000/api/planner/posts?startDate=2024-12-01&endDate=2024-12-31&platform=Instagram" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Create new post
curl -X POST \
  "http://localhost:3000/api/planner/posts" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2024-12-25",
    "title": "Holiday Post",
    "platform": "Facebook",
    "content": "Happy Holidays!",
    "status": "Scheduled"
  }'

# Delete post
curl -X DELETE \
  "http://localhost:3000/api/planner/posts/1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Notes

- Tất cả endpoints yêu cầu JWT authentication
- Date format phải là YYYY-MM-DD
- Platform values: `Facebook`, `Instagram`, `LinkedIn`, `Generic`
- Status values: `Scheduled`, `Posted`
- Không được phép xóa posts đã có status = `Posted`
- Frontend tự động include JWT token trong mọi requests thông qua `apiService`

