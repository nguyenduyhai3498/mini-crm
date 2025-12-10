# 🔐 Setup Xác thực JWT

## Cấu hình API URL

### Tạo file `.env` trong thư mục root:

```env
REACT_APP_API_URL=http://localhost:3000/api
```

**Lưu ý:** Sau khi tạo/sửa file `.env`, cần restart dev server.

## Tài khoản mặc định API cần cung cấp

Backend của bạn cần implement các endpoint authentication. Xem chi tiết trong file `API_DOCUMENTATION.md`.

### Endpoints bắt buộc:

- `POST /api/auth/login` - Đăng nhập, trả về JWT token
- `GET /api/auth/me` - Lấy thông tin user (với JWT token)

### Endpoints optional:

- `POST /api/auth/logout` - Đăng xuất
- `POST /api/auth/refresh` - Refresh token
- `GET /api/auth/verify` - Verify token

## Format Response từ API

### Login Response:
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

## Test nhanh với Mock Server

Nếu chưa có backend, tạo file `mock-server.js`:

```javascript
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

const SECRET = 'test-secret';
const USERS = [
  { id: 1, username: 'admin', password: 'admin123', name: 'Administrator', email: 'admin@test.com' },
  { id: 2, username: 'user', password: 'user123', name: 'User Demo', email: 'user@test.com' }
];

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const user = USERS.find(u => u.username === username && u.password === password);
  
  if (!user) {
    return res.status(401).json({ message: 'Tên đăng nhập hoặc mật khẩu không đúng' });
  }
  
  const token = jwt.sign({ userId: user.id }, SECRET, { expiresIn: '24h' });
  const { password: _, ...userWithoutPassword } = user;
  
  res.json({ token, user: userWithoutPassword });
});

app.get('/api/auth/me', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Token không được cung cấp' });
  }
  
  try {
    const decoded = jwt.verify(token, SECRET);
    const user = USERS.find(u => u.id === decoded.userId);
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (err) {
    res.status(401).json({ message: 'Token không hợp lệ' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  res.json({ message: 'Đăng xuất thành công' });
});

app.listen(3000, () => {
  console.log('Mock API server running on http://localhost:3000');
});
```

Chạy mock server:
```bash
npm install express cors jsonwebtoken
node mock-server.js
```

## Sử dụng API trong code

### Gọi API với `apiService`:

```typescript
import { apiService } from './services/api';

// Tự động bao gồm JWT token
const contacts = await apiService.get('/contacts');
const newContact = await apiService.post('/contacts', { name: 'John' });
```

### Sử dụng `useApi` hook:

```typescript
import { useApi, apiService } from './hooks/useApi';

function MyComponent() {
  const { data, loading, error, execute } = useApi();
  
  const loadData = () => {
    execute(() => apiService.get('/contacts'));
  };
  
  return (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {data && <div>{JSON.stringify(data)}</div>}
      <button onClick={loadData}>Load</button>
    </div>
  );
}
```

## Troubleshooting

### CORS Error
Đảm bảo backend enable CORS:
```javascript
app.use(cors({
  origin: 'http://localhost:3001', // Frontend URL
  credentials: true
}));
```

### Token không gửi kèm request
Kiểm tra trong DevTools > Network > Headers xem có `Authorization: Bearer ...` không.

### 401 Unauthorized
- Kiểm tra token có đúng format không
- Kiểm tra token có expired không
- Kiểm tra SECRET key giữa frontend và backend có khớp không

