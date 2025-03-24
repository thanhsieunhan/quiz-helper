# Hướng dẫn Deploy Server FastAPI trên DigitalOcean

## Yêu cầu hệ thống
- Python 3.8 trở lên
- pip (Python package manager)
- Git
- Tài khoản DigitalOcean

## Các bước triển khai

### 1. Chuẩn bị Server trên DigitalOcean

1. Đăng nhập vào tài khoản DigitalOcean
2. Tạo Droplet mới:
   - Chọn Ubuntu 22.04 LTS
   - Chọn gói Basic
   - Chọn Regular Intel CPU ($5/month)
   - Chọn datacenter region gần nhất
   - Chọn SSH key hoặc tạo mới
   - Đặt hostname cho server

### 2. Cấu hình Server

1. SSH vào server:
```bash
ssh root@your_server_ip
```

2. Cập nhật hệ thống:
```bash
apt update && apt upgrade -y
```

3. Cài đặt các package cần thiết:
```bash
apt install python3-pip python3-venv nginx -y
```

4. Tạo thư mục cho ứng dụng:
```bash
mkdir /var/www/fastapi_app
cd /var/www/fastapi_app
```

5. Clone repository:
```bash
git clone your_repository_url .
```

6. Tạo và kích hoạt môi trường ảo:
```bash
python3 -m venv venv
source venv/bin/activate
```

7. Cài đặt các dependencies:
```bash
pip install -r requirements.txt
```

### 3. Cấu hình Nginx

1. Tạo file cấu hình Nginx:
```bash
nano /etc/nginx/sites-available/fastapi_app
```

2. Thêm nội dung sau:
```nginx
server {
    listen 80;
    server_name your_domain.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

3. Tạo symbolic link:
```bash
ln -s /etc/nginx/sites-available/fastapi_app /etc/nginx/sites-enabled/
```

4. Kiểm tra cấu hình Nginx:
```bash
nginx -t
```

5. Khởi động lại Nginx:
```bash
systemctl restart nginx
```

### 4. Cấu hình Systemd Service

1. Tạo file service:
```bash
nano /etc/systemd/system/fastapi_app.service
```

2. Thêm nội dung sau:
```ini
[Unit]
Description=FastAPI application
After=network.target

[Service]
User=root
Group=root
WorkingDirectory=/var/www/fastapi_app
Environment="PATH=/var/www/fastapi_app/venv/bin"
ExecStart=/var/www/fastapi_app/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000

[Install]
WantedBy=multi-user.target
```

3. Khởi động service:
```bash
systemctl start fastapi_app
systemctl enable fastapi_app
```

### 5. Cấu hình SSL với Certbot (Tùy chọn)

1. Cài đặt Certbot:
```bash
apt install certbot python3-certbot-nginx -y
```

2. Cấu hình SSL:
```bash
certbot --nginx -d your_domain.com
```

## Kiểm tra và Bảo trì

1. Kiểm tra trạng thái service:
```bash
systemctl status fastapi_app
```

2. Xem logs:
```bash
journalctl -u fastapi_app
```

3. Kiểm tra Nginx logs:
```bash
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

## Cập nhật ứng dụng

1. Pull code mới:
```bash
cd /var/www/fastapi_app
git pull
```

2. Cập nhật dependencies:
```bash
source venv/bin/activate
pip install -r requirements.txt
```

3. Khởi động lại service:
```bash
systemctl restart fastapi_app
```

## Lưu ý bảo mật

1. Cấu hình firewall:
```bash
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 22/tcp
ufw enable
```

2. Thay đổi port SSH (tùy chọn):
```bash
nano /etc/ssh/sshd_config
```
Thay đổi Port 22 thành port khác

3. Cập nhật hệ thống thường xuyên:
```bash
apt update && apt upgrade -y
```

## Xử lý sự cố

1. Nếu service không khởi động:
```bash
systemctl status fastapi_app
journalctl -u fastapi_app
```

2. Nếu Nginx không hoạt động:
```bash
systemctl status nginx
nginx -t
```

3. Kiểm tra logs:
```bash
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log
``` 