# API Integration Documentation

## Tổng quan

Ứng dụng đã được tích hợp với hệ thống xác thực JWT token để kết nối với API backend.

## Cấu hình

### 1. Tạo file `.env` từ `.env.example`

```bash
cp .env.example .env
```

### 2. Cấu hình API URL

Chỉnh sửa file `.env` và thiết lập URL của API server:

```env
REACT_APP_API_URL=http://localhost:3000/api
```

## API Endpoints yêu cầu

Backend cần cung cấp các endpoints sau:

### Authentication

#### POST `/api/auth/login`
Đăng nhập và nhận JWT token

**Request:**
```json
{
  "username": "admin",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "name": "Administrator",
    "email": "admin@example.com"
  }
}
```

#### GET `/api/auth/me`
Lấy thông tin user hiện tại (yêu cầu JWT token)

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "id": 1,
  "username": "admin",
  "name": "Administrator",
  "email": "admin@example.com"
}
```

#### POST `/api/auth/logout`
Đăng xuất (optional - có thể chỉ xóa token ở client)

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

#### POST `/api/auth/refresh`
Làm mới JWT token (optional)

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### GET `/api/auth/verify`
Kiểm tra token có hợp lệ không (optional)

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "valid": true
}
```

## Cách sử dụng API Service

### 1. Sử dụng trực tiếp `apiService`

```typescript
import { apiService } from '../services/api';

// GET request
const contacts = await apiService.get('/contacts');

// POST request
const newContact = await apiService.post('/contacts', {
  name: 'John Doe',
  email: 'john@example.com'
});

// PUT request
const updated = await apiService.put('/contacts/1', {
  name: 'Jane Doe'
});

// DELETE request
await apiService.delete('/contacts/1');
```

### 2. Sử dụng `useApi` hook

```typescript
import { useApi } from '../hooks/useApi';
import { apiService } from '../services/api';

function MyComponent() {
  const { data, loading, error, execute } = useApi();

  const fetchData = async () => {
    await execute(() => apiService.get('/contacts'));
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return <div>{/* render data */}</div>;
}
```

### 3. Sử dụng `useFetch` hook (auto-fetch)

```typescript
import { useFetch } from '../hooks/useApi';

function MyComponent() {
  const { data, loading, error, refetch } = useFetch('/contacts');

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      {/* render data */}
      <button onClick={refetch}>Refresh</button>
    </div>
  );
}
```

## JWT Token Flow

1. **Đăng nhập:**
   - User nhập username/password
   - Frontend gọi `POST /api/auth/login`
   - Backend trả về JWT token và user info
   - Frontend lưu token vào `localStorage` với key `jwt_token`

2. **Authenticated Requests:**
   - Mọi request sau đó tự động bao gồm header:
     ```
     Authorization: Bearer {token}
     ```

3. **Token Expired (401):**
   - Khi backend trả về 401, `apiService` tự động:
     - Xóa token khỏi localStorage
     - Trigger event `unauthorized`
     - AuthContext nghe event và đăng xuất user

4. **Đăng xuất:**
   - User click logout
   - Frontend gọi `POST /api/auth/logout` (optional)
   - Xóa token khỏi localStorage
   - Redirect về trang login

## Error Handling

API Service tự động xử lý lỗi và throw `ApiError`:

```typescript
interface ApiError {
  message: string;
  status?: number;
  errors?: Record<string, string[]>;
}
```

Sử dụng try-catch để xử lý lỗi:

```typescript
try {
  const data = await apiService.get('/contacts');
} catch (error) {
  const apiError = error as ApiError;
  console.error(apiError.message);
  // Handle error
}
```

## Backend Implementation Example (Node.js/Express)

### Install dependencies:
```bash
npm install jsonwebtoken bcrypt
```

### Example login endpoint:

```javascript
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const JWT_SECRET = 'your-secret-key'; // Đặt trong .env

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;

  // Find user in database
  const user = await User.findOne({ username });
  
  if (!user) {
    return res.status(401).json({ 
      message: 'Tên đăng nhập hoặc mật khẩu không đúng' 
    });
  }

  // Verify password
  const validPassword = await bcrypt.compare(password, user.password);
  
  if (!validPassword) {
    return res.status(401).json({ 
      message: 'Tên đăng nhập hoặc mật khẩu không đúng' 
    });
  }

  // Generate JWT token
  const token = jwt.sign(
    { userId: user.id, username: user.username },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email
    }
  });
});
```

### Example middleware để verify JWT:

```javascript
const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: 'Token không được cung cấp' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(401).json({ message: 'Token không hợp lệ' });
    }
    req.user = user;
    next();
  });
}

// Use middleware
app.get('/api/auth/me', authenticateToken, (req, res) => {
  // req.user contains decoded JWT payload
  const user = await User.findById(req.user.userId);
  res.json(user);
});
```

## Testing Without Backend

Để test mà không cần backend thật, có thể sử dụng:

1. **JSON Server với JWT auth**
2. **MockAPI.io**
3. **Tạo mock server với express**

Hoặc tạm thời comment phần API call và sử dụng mock data trong `AuthContext.tsx`.

## Security Best Practices

1. **HTTPS:** Luôn sử dụng HTTPS trong production
2. **Token Expiration:** Set thời gian hết hạn phù hợp (1-24h)
3. **Refresh Tokens:** Implement refresh token cho UX tốt hơn
4. **CORS:** Cấu hình CORS đúng trên backend
5. **HttpOnly Cookies:** Cân nhắc lưu token trong httpOnly cookie thay vì localStorage

